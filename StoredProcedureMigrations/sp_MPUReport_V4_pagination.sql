SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
CREATE OR ALTER PROCEDURE [dbo].[sp_MPUReport_V4_pagination]
    @FromDate datetime,
    @ToDate datetime,
    @FormType nvarchar(200),
    @PaymentType nvarchar(200),
    @SortColumn nvarchar(128) = NULL,
    @SortOrder nvarchar(4) = NULL,
    @PageIndex int = NULL,
    @PageSize int = NULL,
    @IncludeTotalCount bit = 1
AS
BEGIN
    SET NOCOUNT ON;

    -- Keep the payment and voucher rules in sync with sp_MPUReport_V3_pagination.
    -- How far a payment may sit from the card charge it belongs to. 2 days is double the
    -- widest gap seen on any correctly-paired PROD row, and a thirtieth of the median gap
    -- on the mispaired ones, so the two populations do not overlap anywhere near it.
    DECLARE @PairingToleranceDays int = 2;

    DECLARE @ps int = CASE
        WHEN ISNULL(@PageSize, 0) <= 0 THEN 2147483647
        WHEN @IncludeTotalCount = 0 THEN @PageSize + 1
        ELSE @PageSize END;
    DECLARE @off int = CASE WHEN ISNULL(@PageSize, 0) <= 0 THEN 0 ELSE ISNULL(@PageIndex, 0) * @PageSize END;
    DECLARE @dir nvarchar(4) = CASE WHEN UPPER(ISNULL(@SortOrder, 'ASC')) = 'DESC' THEN 'DESC' ELSE 'ASC' END;

    DECLARE @ob nvarchar(400);
    IF @SortColumn IS NOT NULL AND @SortColumn IN (
        N'Id', N'Sakhan', N'TransactionDateTime', N'CompanyName', N'CompanyRegistrationNo',
        N'ApplicationNo', N'LicenceApplicationNo', N'MerchantId', N'AccountNo', N'InvoiceNo', N'ApprovalCode',
        N'TransactionRefNo', N'TransactionAmount', N'MOCAmount', N'IMAmount', N'MPUAmount',
        N'AmountDiff', N'FormType', N'ApplyType', N'VoucherNo', N'TotalAmount', N'PaymentDate')
        SET @ob = QUOTENAME(@SortColumn) + N' ' + @dir
            + CASE WHEN @SortColumn = N'TransactionId' THEN N'' ELSE N', [TransactionId] ASC' END
            + CASE WHEN @SortColumn = N'TransactionDateTime' THEN N'' ELSE N', [TransactionDateTime] ASC' END
            + CASE WHEN @SortColumn = N'Id' THEN N'' ELSE N', [Id] ASC' END;
    ELSE
        SET @ob = N'[TransactionId] ASC, [TransactionDateTime] ASC, [Id] ASC';

    -- A payment-sorted page can start with a bounded prefix of payment candidates.
    -- Pair every selected application using its whole history, then keep only the
    -- candidate rows. If there are too few matches, retry once with the full range.
    DECLARE @needed bigint = CAST(@off AS bigint) + @ps;
    DECLARE @candidateLimit int = CASE WHEN @IncludeTotalCount = 0 AND @PageSize > 0
        AND @needed BETWEEN 1 AND 128
        AND (@SortColumn IS NULL OR @SortColumn IN (
            N'Id', N'Sakhan', N'TransactionDateTime', N'ApplicationNo', N'FormType', N'ApplyType',
            N'MerchantId', N'AccountNo', N'InvoiceNo', N'ApprovalCode', N'TransactionRefNo', N'MOCAmount', N'IMAmount'))
        THEN CAST(@needed * 8 AS int) END;

    SELECT TOP (0) m.Id + 0 AS Id, m.TransactionId
    INTO #reportPayments FROM dbo.MPUPaymentTransaction m;
    CREATE UNIQUE CLUSTERED INDEX IX_reportPayments_Id ON #reportPayments(Id);

    SELECT TOP (0) m.TransactionId INTO #ids FROM dbo.MPUPaymentTransaction m;

    DECLARE @selectPayments nvarchar(max) = N' Id, TransactionId
        FROM dbo.MPUPaymentTransaction m
        WHERE m.TransactionDateTime >= @FromDate AND m.TransactionDateTime <= @ToDate
            AND m.ResponseCode = N''00''
            AND m.TransactionId IS NOT NULL
            AND m.FormType IS NOT NULL
            AND m.FormType LIKE (CASE WHEN @FormType = N'''' THEN m.FormType + N''%'' ELSE @FormType + N''%'' END)
            AND (@PaymentType = N'''' OR m.PaymentType = @PaymentType
                OR (@PaymentType = N''CitizenPay''
                    AND REPLACE(REPLACE(REPLACE(LOWER(ISNULL(m.PaymentType, N'''')), N'' '', N''''), N''-'', N''''), N''_'', N'''')
                        IN (N''citizenpay'', N''citizen'', N''cp'')))';

    IF @candidateLimit IS NOT NULL
    BEGIN
        DECLARE @candidateSql nvarchar(max) = N'INSERT INTO #reportPayments(Id, TransactionId) SELECT TOP (@limit)'
            + @selectPayments + N' ORDER BY ' + @ob + N' OPTION (RECOMPILE);';
        EXEC sys.sp_executesql @candidateSql,
            N'@FromDate datetime, @ToDate datetime, @FormType nvarchar(200), @PaymentType nvarchar(200), @limit int',
            @FromDate, @ToDate, @FormType, @PaymentType, @candidateLimit;
    END;

    WHILE 1 = 1
    BEGIN
        -- MPUPaymentTransaction has no foreign key to AccountTransaction: the only link is
        -- the shared application id, one-to-many on both sides, so the voucher is found by
        -- pairing the Nth successful card charge with the Nth payment record. Two rules keep
        -- that pairing honest, and breaking either is what the 2026-09-17 ငွေစာရင်း complaint
        -- ("MPU Report V3 မှာ ပြနေတဲ့ voucher no တွေက မှားနေပါတယ်") was reporting:
        --
        --   1. Both sequences must be numbered over the SAME universe the pairing assumes —
        --      successful charges against payment vouchers — or the two ordinals mean
        --      different things.
        --   2. Neither may be numbered over the REPORT'S filtered rows. Numbering after the
        --      date window made a row's voucher depend on the range the user picked: the same
        --      charge read U01... over one week and U02... over two months (measured on PROD,
        --      2025-02, 8 of 112 rows), and 5-7% of rows showed a voucher from a different
        --      month entirely -- a February charge printing an April 2024 voucher.
        --
        -- So: pick the applications the filters select, number their WHOLE history, and only
        -- then narrow to the rows the report shows.
        IF @candidateLimit IS NOT NULL
            INSERT INTO #ids(TransactionId) SELECT DISTINCT TransactionId FROM #reportPayments;
        ELSE
        BEGIN
            INSERT INTO #ids(TransactionId)
            SELECT DISTINCT m.TransactionId
            FROM dbo.MPUPaymentTransaction m
            WHERE m.TransactionDateTime >= @FromDate
                AND m.TransactionDateTime <= @ToDate
                AND m.ResponseCode = '00'
                AND m.FormType IS NOT NULL
                AND m.FormType LIKE (CASE WHEN @FormType = '' THEN m.FormType + '%' ELSE @FormType + '%' END)
                AND (@PaymentType = ''
                    OR m.PaymentType = @PaymentType
                    OR (@PaymentType = 'CitizenPay'
                        AND REPLACE(REPLACE(REPLACE(LOWER(ISNULL(m.PaymentType, '')), ' ', ''), '-', ''), '_', '')
                            IN ('citizenpay', 'citizen', 'cp')));

        END;

        CREATE INDEX IX_ids_TransactionId ON #ids(TransactionId);

        -- Every successful charge of those applications, whenever it happened. A failed
        -- attempt creates no AccountTransaction, so it must not consume an ordinal.
        SELECT
            m.*,
            ROW_NUMBER() OVER (
                PARTITION BY m.TransactionId
                ORDER BY m.TransactionDateTime, m.Id
            ) AS rn
        INTO #mpuAll
        FROM dbo.MPUPaymentTransaction m
        WHERE m.ResponseCode = '00'
            AND EXISTS (SELECT 1 FROM #ids i WHERE i.TransactionId = m.TransactionId);

        CREATE INDEX IX_mpuAll_TransactionId_rn ON #mpuAll(TransactionId, rn);

        -- Now, and only now, the report's own filters.
        SELECT *
        INTO #mpu
        FROM #mpuAll m
        WHERE m.TransactionDateTime >= @FromDate
            AND m.TransactionDateTime <= @ToDate
            AND m.FormType IS NOT NULL
            AND m.FormType LIKE (CASE WHEN @FormType = '' THEN m.FormType + '%' ELSE @FormType + '%' END)
            AND (@PaymentType = ''
                OR m.PaymentType = @PaymentType
                OR (@PaymentType = 'CitizenPay'
                    AND REPLACE(REPLACE(REPLACE(LOWER(ISNULL(m.PaymentType, '')), ' ', ''), '-', ''), '_', '')
                        IN ('citizenpay', 'citizen', 'cp')))
            AND (@candidateLimit IS NULL OR EXISTS (SELECT 1 FROM #reportPayments p WHERE p.Id = m.Id))
        OPTION (RECOMPILE);

        CREATE INDEX IX_mpu_TransactionId_rn ON #mpu(TransactionId, rn);
        CREATE INDEX IX_mpu_Order ON #mpu(TransactionId, TransactionDateTime, Id);

        -- The candidates are exactly the rows Account Summary itself can display: a payment
        -- carrying a voucher (sp_AccountSummaryReport_pagination.sql:58). Anything else --
        -- a provisional or non-payment record -- holds a voucher number this report must
        -- never print, because Account Summary never will.
        --
        -- They are narrowed once more, to the payments that actually belong to a card charge.
        -- An application's fees are not all paid by card, and a payment made at the counter
        -- still creates an AccountTransaction with a voucher; left in, it takes an ordinal
        -- and pushes every later charge onto the wrong voucher. Time separates the two
        -- cleanly -- measured over 1,000 PROD rows for 2025-02:
        --
        --     voucher month == charge month (950 rows):  100.0% paid within 1 day, median 0.00
        --     voucher month != charge month ( 50 rows):    0.0% paid within 1 day, median 42.3
        --
        -- so a payment more than @PairingToleranceDays from every one of the application's
        -- charges is not a card payment, and is not a candidate.
        SELECT
            a.TransactionId,
            a.VoucherNo,
            a.TotalAmount,
            a.PaymentDate,
            ROW_NUMBER() OVER (
                PARTITION BY a.TransactionId
                ORDER BY a.CreatedDate, a.Id
            ) AS rn
        INTO #acc
        FROM dbo.AccountTransaction a
        WHERE a.IsPayment = 1
            AND a.VoucherNo IS NOT NULL
            AND EXISTS (SELECT 1 FROM #ids i WHERE i.TransactionId = a.TransactionId)
            AND EXISTS (
                SELECT 1
                FROM #mpuAll m
                WHERE m.TransactionId = a.TransactionId
                    AND m.TransactionDateTime IS NOT NULL
                    AND ABS(DATEDIFF(day, ISNULL(a.PaymentDate, a.CreatedDate), m.TransactionDateTime))
                        <= @PairingToleranceDays);

        CREATE INDEX IX_acc_TransactionId_rn ON #acc(TransactionId, rn);

        SELECT
            m.Id,
            m.Sakhan,
            m.TransactionDateTime,
            ISNULL((
                SELECT TOP 1 p.CompanyName
                FROM dbo.PaThaKa p
                WHERE p.PaThaKaNo = m.PaThaKaNo
                   OR p.CompanyRegistrationNo = m.PaThaKaNo
            ), '') AS CompanyName,
            m.PaThaKaNo AS CompanyRegistrationNo,
            m.ApplicationNo,
            m.MerchantId,
            m.AccountNo,
            m.InvoiceNo,
            m.ApprovalCode,
            m.TransactionRefNo,
            CONVERT(nvarchar(50), CONVERT(decimal(18, 2), ISNULL(TRY_CONVERT(decimal(18, 2),
                CASE
                    WHEN LEN(ISNULL(m.TransactionAmount, '')) > 2 THEN LEFT(m.TransactionAmount, LEN(m.TransactionAmount) - 2) + '.' + RIGHT(m.TransactionAmount, 2)
                    WHEN LEN(ISNULL(m.TransactionAmount, '')) > 0 THEN '0.' + RIGHT('00' + m.TransactionAmount, 2)
                    ELSE '0'
                END), 0))) AS TransactionAmount,
            m.MOCAmount,
            m.IMAmount,
            CONVERT(nvarchar(50), ISNULL(TRY_CONVERT(decimal(18, 2),
                CASE
                    WHEN LEN(ISNULL(m.TransactionAmount, '')) > 2 THEN LEFT(m.TransactionAmount, LEN(m.TransactionAmount) - 2) + '.' + RIGHT(m.TransactionAmount, 2)
                    WHEN LEN(ISNULL(m.TransactionAmount, '')) > 0 THEN '0.' + RIGHT('00' + m.TransactionAmount, 2)
                    ELSE '0'
                END), 0)
                - ISNULL(TRY_CONVERT(decimal(18, 2), m.MOCAmount), 0)
                - ISNULL(TRY_CONVERT(decimal(18, 2), m.IMAmount), 0)) AS MPUAmount,
            CONVERT(nvarchar(50), ISNULL(TRY_CONVERT(decimal(18, 2),
                CASE
                    WHEN LEN(ISNULL(m.TransactionAmount, '')) > 2 THEN LEFT(m.TransactionAmount, LEN(m.TransactionAmount) - 2) + '.' + RIGHT(m.TransactionAmount, 2)
                    WHEN LEN(ISNULL(m.TransactionAmount, '')) > 0 THEN '0.' + RIGHT('00' + m.TransactionAmount, 2)
                    ELSE '0'
                END), 0)
                - ISNULL(TRY_CONVERT(decimal(18, 2), m.MOCAmount), 0)) AS AmountDiff,
            m.FormType,
            m.ApplyType,
            a.VoucherNo,
            a.TotalAmount,
            a.PaymentDate,
            m.TransactionId
        INTO #rows
        FROM #mpu m
        INNER JOIN #acc a
            ON m.TransactionId = a.TransactionId
           AND m.rn = a.rn;

        -- If the prefix is exhausted without enough matched vouchers, run once
        -- over the full range. A short candidate list already covers the range.
        IF @candidateLimit IS NULL OR @@ROWCOUNT >= @needed
            OR (SELECT COUNT(*) FROM #reportPayments) < @candidateLimit
            BREAK;

        SET @candidateLimit = NULL;
        DROP TABLE #rows, #acc, #mpu, #mpuAll;
        DROP INDEX IX_ids_TransactionId ON #ids;
        TRUNCATE TABLE #ids;
    END;

    CREATE INDEX IX_rows_Order ON #rows(TransactionId, TransactionDateTime, Id);

    DECLARE @total int = CASE WHEN @IncludeTotalCount = 1 THEN (SELECT COUNT(*) FROM #rows) ELSE NULL END;
    -- Both licence IDs are unique, so the lookup cannot drop or duplicate a V3 row.
    -- On ordinary reads, page V3 rows first. Sorting by the new field needs the
    -- resolved number on every candidate before the requested page can be selected.
    DECLARE @lookup nvarchar(max) = N'
        LEFT JOIN dbo.ImportLicence overseas
            ON r.FormType = N''Import Licence'' AND overseas.Id = r.TransactionId
        LEFT JOIN dbo.BorderImportLicence border
            ON r.FormType = N''Border Import Licence'' AND border.Id = r.TransactionId';
    DECLARE @enriched nvarchar(max) = N'SELECT r.*,
        COALESCE(overseas.ApplicationNo, border.ApplicationNo, N'''') AS LicenceApplicationNo
        FROM ';
    DECLARE @paging nvarchar(800) = N' ORDER BY ' + @ob
        + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY';
    DECLARE @sql nvarchar(max);
    IF @SortColumn = N'LicenceApplicationNo'
        SET @sql = N'WITH reportRows AS (' + @enriched + N'#rows r' + @lookup + N'),
            reportPage AS (SELECT * FROM reportRows' + @paging + N')';
    ELSE
        SET @sql = N'WITH pageRows AS (SELECT * FROM #rows' + @paging + N'),
            reportPage AS (' + @enriched + N'pageRows r' + @lookup + N')';

    SET @sql += N'
        SELECT
            Id,
            Sakhan,
            TransactionDateTime,
            CompanyName,
            CompanyRegistrationNo,
            ApplicationNo,
            LicenceApplicationNo,
            MerchantId,
            AccountNo,
            InvoiceNo,
            ApprovalCode,
            TransactionRefNo,
            TransactionAmount,
            MOCAmount,
            IMAmount,
            MPUAmount,
            AmountDiff,
            FormType,
            ApplyType,
            VoucherNo,
            TotalAmount,
            PaymentDate,
            @total AS TotalCount
        FROM reportPage ORDER BY ' + @ob + N';';

    EXEC sp_executesql @sql,
        N'@off int, @ps int, @total int',
        @off = @off,
        @ps = @ps,
        @total = @total;
END
