-- The OUTER APPLYs below read the materialized (indexed) per-currency views WITH (NOEXPAND).
-- Indexed-view access requires the procedure to be CREATED with QUOTED_IDENTIFIER ON and
-- ANSI_NULLS ON (both are captured at create time and reapplied on every execution, overriding
-- the connection). Deploying without this header bakes in QUOTED_IDENTIFIER OFF and every call
-- then fails with: Msg 1934 "SELECT failed because the following SET options have incorrect
-- settings: 'QUOTED_IDENTIFIER' ... for use with indexed views". Keep these batches.
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
CREATE OR ALTER PROCEDURE [dbo].[sp_VoucherReport_pagination]
    @FormType nvarchar(50) = N'',
    @FromDate datetime = NULL,
    @ToDate datetime = NULL,
    @ExportImportSectionId int = 0,
    @PaymentType nvarchar(50) = N'',
    @ApplyType nvarchar(20) = N'',
    @CompanyRegistrationNo nvarchar(50) = N'',
    @SakhanId int = 0,
    @SortColumn nvarchar(128) = NULL,
    @SortOrder nvarchar(4) = NULL,
    @PageIndex int = NULL,
    @PageSize int = NULL,
    @IncludeTotalCount bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    -- Indexed-view access via WITH (NOEXPAND) also requires ARITHABORT ON at execution time.
    -- Unlike QUOTED_IDENTIFIER/ANSI_NULLS this is NOT captured at create time, and .NET SqlClient
    -- connects with ARITHABORT OFF, so set it here for the dynamic SQL EXEC below.
    SET ARITHABORT ON;

    DECLARE @ps bigint = CASE
        WHEN ISNULL(@PageSize,0) <= 0 THEN 9223372036854775807
        WHEN @IncludeTotalCount = 0 THEN @PageSize + 1
        ELSE @PageSize END;
    DECLARE @off bigint = CASE WHEN ISNULL(@PageSize,0) <= 0 THEN 0 ELSE ISNULL(@PageIndex,0) * CAST(@PageSize AS bigint) END;
    DECLARE @dir nvarchar(4) = CASE WHEN UPPER(ISNULL(@SortOrder,'ASC')) = 'DESC' THEN 'DESC' ELSE 'ASC' END;

    DECLARE @ob nvarchar(400);
    IF @SortColumn IS NOT NULL AND @SortColumn IN (N'TradeMethod', N'ApplicationNo', N'ApplicationDate', N'ApprovedUser', N'Date', N'sDate', N'SectionCode', N'ApplyType', N'OldLicenceNo', N'LicenceNo', N'LicenceDate', N'sLicenceDate', N'CompanyRegistrationNo', N'CompanyName', N'VoucherNo', N'VoucherDate', N'sVoucherDate', N'Amount', N'PaymentType', N'CommodityType', N'ExchangeRate', N'TotalCIF')
        SET @ob = QUOTENAME(@SortColumn) + N' ' + @dir
            + CASE WHEN @SortColumn = N'ApplicationNo' THEN N'' ELSE N', [ApplicationNo] ASC' END
            + CASE WHEN @SortColumn = N'LicenceNo' THEN N'' ELSE N', [LicenceNo] ASC' END;
    ELSE
        SET @ob = N'[ApplicationNo] ASC, [LicenceNo] ASC';

    DECLARE @cntpart nvarchar(max);
    DECLARE @sql nvarchar(max);
    DECLARE @ComputedTotal int = NULL;

    -- Page-first: page the base query, then resolve Currency/TotalAmount on the ~PageSize rows only
    -- via a lateral join to the materialized per-currency totals view (index seek, no re-aggregation).
    -- WITH (NOEXPAND) forces the materialized index to be used (required outside Enterprise edition).
    IF @FormType = N'Import Permit'
    BEGIN
        -- TotalCount only when requested, computed over the UN-paged base (no subqueries) as a separate scalar.
        SET @cntpart = CASE WHEN @IncludeTotalCount = 1
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM ImportPermit
		INNER JOIN AccountTransaction ON ImportPermit.Id=AccountTransaction.TransactionId
		INNER JOIN PaThaKa ON ImportPermit.PaThaKaId=PaThaKa.Id
		INNER JOIN ExportImportSection section ON ImportPermit.ExportImportSectionId = section.Id
		INNER JOIN Users ON Users.Id = ImportPermit.ApproveUserId
		WHERE IsPayment=1
		AND AccountTransaction.TransactionFormType=''Import Permit''
		AND (AccountTransaction.PaymentDate>=@FromDate AND AccountTransaction.PaymentDate<=@ToDate)
		AND ImportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ImportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND AccountTransaction.PaymentType=(CASE WHEN @PaymentType='''' then AccountTransaction.PaymentType ELSE @PaymentType END)
		AND ApplyType=@ApplyType AND ImportPermit.Status=''Approved''
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END) OPTION (RECOMPILE, LOOP JOIN); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        -- The original sp_VoucherReport selects only CommodityType for Import Permit;
        -- emit ExchangeRate/TotalCIF as NULL so the result set still matches sp_VoucherReportRow.
        SET @sql = @cntpart + N'SELECT pg.*, cur.Code AS Currency, amt.TotalAmount AS TotalAmount, CAST(NULL AS int) SakhanId, CAST(NULL AS nvarchar(50)) SakhanCode, CAST(NULL AS nvarchar(200)) SakhanName, @__total AS TotalCount
    FROM (
        SELECT ImportPermit.ApplicationNo,
ImportPermit.ApplicationDate,
Users.FullName as ApprovedUser,
AccountTransaction.PaymentDate Date,
CONVERT(varchar,AccountTransaction.PaymentDate,103) sDate,
section.Code SectionCode,
ApplyType,
OldImportPermitNo OldLicenceNo,
ImportPermitNo LicenceNo,
ImportPermit.CreatedDate LicenceDate,
CONVERT(varchar,ImportPermit.CreatedDate,103) sLicenceDate,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
VoucherNo,
VoucherDate,
CONVERT(varchar,AccountTransaction.VoucherDate,103) sVoucherDate,
CAST(AccountTransaction.TotalAmount AS decimal(38,6)) Amount,
PaymentType,
ImportPermit.CommodityType,
CAST(ImportPermit.ExchangeRate AS decimal(38,6)) ExchangeRate,
-- Must be decimal(38,6) to match the C# sp_VoucherReportRow.TotalCIF (decimal?) and all
-- other branch casts. AS float made EF GetDecimal throw InvalidCastException (Double to
-- Decimal), returning HTTP 500 for the whole Import Permit Voucher report (no data).
CAST(ImportPermit.TotalCIF AS decimal(38,6)) TotalCIF,
CAST(NULL AS nvarchar(200)) AS TradeMethod,
ImportPermit.Id AS __k_Id
        FROM ImportPermit
		INNER JOIN AccountTransaction ON ImportPermit.Id=AccountTransaction.TransactionId
		INNER JOIN PaThaKa ON ImportPermit.PaThaKaId=PaThaKa.Id
		INNER JOIN ExportImportSection section ON ImportPermit.ExportImportSectionId = section.Id
		INNER JOIN Users ON Users.Id = ImportPermit.ApproveUserId
		WHERE IsPayment=1
		AND AccountTransaction.TransactionFormType=''Import Permit''
		AND (AccountTransaction.PaymentDate>=@FromDate AND AccountTransaction.PaymentDate<=@ToDate)
		AND ImportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ImportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND AccountTransaction.PaymentType=(CASE WHEN @PaymentType='''' then AccountTransaction.PaymentType ELSE @PaymentType END)
		AND ApplyType=@ApplyType AND ImportPermit.Status=''Approved''
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
        ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
    ) pg
    OUTER APPLY (
        SELECT SUM(v.TotalAmount) AS TotalAmount
        FROM dbo.vw_ImportPermitItemTotalByCurrency AS v WITH (NOEXPAND)
        WHERE v.ImportPermitId = pg.__k_Id
    ) amt
    OUTER APPLY (
        SELECT TOP 1 currency.Code
        FROM dbo.vw_ImportPermitItemTotalByCurrency AS v WITH (NOEXPAND)
        INNER JOIN Currency currency ON v.CurrencyId = currency.Id
        WHERE v.ImportPermitId = pg.__k_Id
    ) cur
    ORDER BY ' + @ob + N'
    OPTION (RECOMPILE);';
    END
    ELSE IF @FormType = N'Export Permit'
    BEGIN
        -- TotalCount only when requested, computed over the UN-paged base (no subqueries) as a separate scalar.
        SET @cntpart = CASE WHEN @IncludeTotalCount = 1
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM ExportPermit
		INNER JOIN AccountTransaction ON ExportPermit.Id=AccountTransaction.TransactionId
		INNER JOIN PaThaKa ON ExportPermit.PaThaKaId=PaThaKa.Id
		INNER JOIN ExportImportSection section ON ExportPermit.ExportImportSectionId = section.Id
		INNER JOIN Users ON Users.Id = ExportPermit.ApproveUserId
		WHERE IsPayment=1
		AND AccountTransaction.TransactionFormType=''Export Permit''
		AND (AccountTransaction.PaymentDate>=@FromDate AND AccountTransaction.PaymentDate<=@ToDate)
		AND ExportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ExportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND AccountTransaction.PaymentType=(CASE WHEN @PaymentType='''' then AccountTransaction.PaymentType ELSE @PaymentType END)
		AND ApplyType=@ApplyType AND ExportPermit.Status=''Approved''
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END) OPTION (RECOMPILE, LOOP JOIN); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        -- The original sp_VoucherReport selects only CommodityType for Export Permit: the
        -- ExportPermit table has no ExchangeRate / TotalCIF column at all. The old app's
        -- Reports.cs Export-Permit branch never assigns those two non-nullable decimals, so
        -- production's VoucherReport.rdlc prints a literal 0 in both -- emit 0, not NULL, so
        -- the grid and the .xlsx read the same way.
        SET @sql = @cntpart + N'SELECT pg.*, cur.Code AS Currency, amt.TotalAmount AS TotalAmount, CAST(NULL AS int) SakhanId, CAST(NULL AS nvarchar(50)) SakhanCode, CAST(NULL AS nvarchar(200)) SakhanName, @__total AS TotalCount
    FROM (
        SELECT ExportPermit.ApplicationNo,
ExportPermit.ApplicationDate,
Users.FullName as ApprovedUser,
AccountTransaction.PaymentDate Date,
CONVERT(varchar,AccountTransaction.PaymentDate,103) sDate,
section.Code SectionCode,
ApplyType,
OldExportPermitNo OldLicenceNo,
ExportPermitNo LicenceNo,
ExportPermit.CreatedDate LicenceDate,
CONVERT(varchar,ExportPermit.CreatedDate,103) sLicenceDate,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
VoucherNo,
VoucherDate,
CONVERT(varchar,AccountTransaction.VoucherDate,103) sVoucherDate,
CAST(AccountTransaction.TotalAmount AS decimal(38,6)) Amount,
PaymentType,
ExportPermit.CommodityType,
CAST(0 AS decimal(38,6)) ExchangeRate,
CAST(0 AS decimal(38,6)) TotalCIF,
CAST(NULL AS nvarchar(200)) AS TradeMethod,
ExportPermit.Id AS __k_Id
        FROM ExportPermit
		INNER JOIN AccountTransaction ON ExportPermit.Id=AccountTransaction.TransactionId
		INNER JOIN PaThaKa ON ExportPermit.PaThaKaId=PaThaKa.Id
		INNER JOIN ExportImportSection section ON ExportPermit.ExportImportSectionId = section.Id
		INNER JOIN Users ON Users.Id = ExportPermit.ApproveUserId
		WHERE IsPayment=1
		AND AccountTransaction.TransactionFormType=''Export Permit''
		AND (AccountTransaction.PaymentDate>=@FromDate AND AccountTransaction.PaymentDate<=@ToDate)
		AND ExportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ExportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND AccountTransaction.PaymentType=(CASE WHEN @PaymentType='''' then AccountTransaction.PaymentType ELSE @PaymentType END)
		AND ApplyType=@ApplyType AND ExportPermit.Status=''Approved''
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
        ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
    ) pg
    OUTER APPLY (
        SELECT SUM(v.TotalAmount) AS TotalAmount
        FROM dbo.vw_ExportPermitItemTotalByCurrency AS v WITH (NOEXPAND)
        WHERE v.ExportPermitId = pg.__k_Id
    ) amt
    OUTER APPLY (
        SELECT TOP 1 currency.Code
        FROM dbo.vw_ExportPermitItemTotalByCurrency AS v WITH (NOEXPAND)
        INNER JOIN Currency currency ON v.CurrencyId = currency.Id
        WHERE v.ExportPermitId = pg.__k_Id
    ) cur
    ORDER BY ' + @ob + N'
    OPTION (RECOMPILE);';
    END
    ELSE IF @FormType = N'Export Licence'
    BEGIN
        -- TotalCount only when requested, computed over the UN-paged base (no subqueries) as a separate scalar.
        SET @cntpart = CASE WHEN @IncludeTotalCount = 1
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM ExportLicence
		INNER JOIN AccountTransaction WITH (INDEX([IX_AccountTransaction_ExportLicenceVoucher])) ON ExportLicence.Id=AccountTransaction.TransactionId
		INNER JOIN PaThaKa ON ExportLicence.PaThaKaId=PaThaKa.Id
		INNER JOIN ExportImportSection section ON ExportLicence.ExportImportSectionId = section.Id
		INNER JOIN Users ON Users.Id = ExportLicence.ApproveUserId
		WHERE IsPayment=1
		AND AccountTransaction.TransactionFormType=''Export Licence''
		AND ((@FromDate IS NULL) OR AccountTransaction.PaymentDate >= @FromDate)
		AND ((@ToDate IS NULL) OR AccountTransaction.PaymentDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND ExportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ExportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND AccountTransaction.PaymentType=(CASE WHEN @PaymentType='''' then AccountTransaction.PaymentType ELSE @PaymentType END)
		AND (@ApplyType='''' OR ApplyType=@ApplyType) AND ExportLicence.Status=''Approved''
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END) OPTION (RECOMPILE, MAXDOP 1); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        -- Resolve item values after paging so the report shows data without scanning item totals for every matching licence.
        SET @sql = @cntpart + N'SELECT pg.*, itemCurrency.Currency, itemTotal.TotalAmount, CAST(NULL AS int) SakhanId, CAST(NULL AS nvarchar(50)) SakhanCode, CAST(NULL AS nvarchar(200)) SakhanName, @__total AS TotalCount
    FROM (
        SELECT ExportLicence.ApplicationNo,
ExportLicence.ApplicationDate,
Users.FullName as ApprovedUser,
AccountTransaction.PaymentDate Date,
CONVERT(varchar,AccountTransaction.PaymentDate,103) sDate,
section.Code SectionCode,
ApplyType,
OldExportLicenceNo OldLicenceNo,
ExportLicenceNo LicenceNo,
ExportLicence.CreatedDate LicenceDate,
CONVERT(varchar,ExportLicence.CreatedDate,103) sLicenceDate,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
VoucherNo,
VoucherDate,
CONVERT(varchar,AccountTransaction.VoucherDate,103) sVoucherDate,
CAST(AccountTransaction.TotalAmount AS decimal(38,6)) Amount,
PaymentType,
ExportLicence.CommodityType,
CAST(NULL AS decimal(38,6)) ExchangeRate,
CAST(NULL AS decimal(38,6)) TotalCIF,
(SELECT method.Name FROM dbo.ExportImportMethod AS method WHERE method.Id = ExportLicence.ExportImportMethodId) AS TradeMethod,
ExportLicence.Id AS __k_Id
        FROM ExportLicence
		INNER JOIN AccountTransaction WITH (INDEX([IX_AccountTransaction_ExportLicenceVoucher])) ON ExportLicence.Id=AccountTransaction.TransactionId
		INNER JOIN PaThaKa ON ExportLicence.PaThaKaId=PaThaKa.Id
		INNER JOIN ExportImportSection section ON ExportLicence.ExportImportSectionId = section.Id
		INNER JOIN Users ON Users.Id = ExportLicence.ApproveUserId
		WHERE IsPayment=1
		AND AccountTransaction.TransactionFormType=''Export Licence''
		AND ((@FromDate IS NULL) OR AccountTransaction.PaymentDate >= @FromDate)
		AND ((@ToDate IS NULL) OR AccountTransaction.PaymentDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND ExportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ExportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND AccountTransaction.PaymentType=(CASE WHEN @PaymentType='''' then AccountTransaction.PaymentType ELSE @PaymentType END)
		AND (@ApplyType='''' OR ApplyType=@ApplyType) AND ExportLicence.Status=''Approved''
        AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
        ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
    ) pg
    OUTER APPLY (
        SELECT TOP 1 currency.Code AS Currency
        FROM ExportLicenceItem
        INNER JOIN Currency currency ON ExportLicenceItem.CurrencyId = currency.Id
        WHERE ExportLicenceItem.ExportLicenceId = pg.__k_Id
    ) itemCurrency
    OUTER APPLY (
        SELECT SUM(CAST(ExportLicenceItem.Amount AS decimal(38,6))) AS TotalAmount
        FROM ExportLicenceItem
        WHERE ExportLicenceItem.ExportLicenceId = pg.__k_Id
    ) itemTotal
    ORDER BY ' + @ob + N'
    OPTION (RECOMPILE, MAXDOP 1);';
    END
    ELSE IF @FormType = N'Border Export Licence'
    BEGIN
        SET @cntpart = CASE WHEN @IncludeTotalCount = 1
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM (
		SELECT BorderExportLicence.Id FROM BorderExportLicence
		INNER JOIN AccountTransaction ON BorderExportLicence.Id=AccountTransaction.TransactionId
		INNER JOIN PaThaKa ON BorderExportLicence.PaThaKaId=PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderExportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderExportLicence.SakhanId = sakhan.Id
		INNER JOIN Users ON Users.Id = BorderExportLicence.ApproveUserId
		WHERE IsPayment=1
		AND (AccountTransaction.PaymentDate>=@FromDate AND AccountTransaction.PaymentDate<=@ToDate)
		AND BorderExportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderExportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND AccountTransaction.PaymentType=(CASE WHEN @PaymentType='''' then AccountTransaction.PaymentType ELSE @PaymentType END)
		AND ApplyType=@ApplyType AND BorderExportLicence.Status=''Approved'' AND BorderExportLicence.CardType=''Pa Tha Ka''
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderExportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderExportLicence.SakhanId ELSE @SakhanId END)
		UNION ALL
		SELECT BorderExportLicence.Id FROM BorderExportLicence
		INNER JOIN AccountTransaction ON BorderExportLicence.Id=AccountTransaction.TransactionId
		INNER JOIN IndividualTrading ON BorderExportLicence.IndividualTradingId=IndividualTrading.Id
		INNER JOIN ExportImportSection section ON BorderExportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderExportLicence.SakhanId = sakhan.Id
		INNER JOIN Users ON Users.Id = BorderExportLicence.ApproveUserId
		WHERE IsPayment=1
		AND (AccountTransaction.PaymentDate>=@FromDate AND AccountTransaction.PaymentDate<=@ToDate)
		AND BorderExportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderExportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND AccountTransaction.PaymentType=(CASE WHEN @PaymentType='''' then AccountTransaction.PaymentType ELSE @PaymentType END)
		AND ApplyType=@ApplyType AND BorderExportLicence.Status=''Approved'' AND BorderExportLicence.CardType=''Individual Trading''
		AND IndividualTrading.TINNo=(CASE WHEN @CompanyRegistrationNo='''' then IndividualTrading.TINNo ELSE @CompanyRegistrationNo END)
		AND BorderExportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderExportLicence.SakhanId ELSE @SakhanId END)
	) tmp OPTION (RECOMPILE); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        SET @sql = @cntpart + N'SELECT pg.*,
        (SELECT top 1 currency.Code FROM BorderExportLicenceItem
		INNER JOIN Currency currency ON BorderExportLicenceItem.CurrencyId = currency.Id
		WHERE BorderExportLicenceItem.BorderExportLicenceId=pg.__k_Id) Currency,
        (SELECT SUM(BorderExportLicenceItem.Amount) FROM BorderExportLicenceItem
		WHERE BorderExportLicenceItem.BorderExportLicenceId=pg.__k_Id) TotalAmount, @__total AS TotalCount
    FROM (
        SELECT * FROM (
        SELECT BorderExportLicence.ApplicationNo,
BorderExportLicence.ApplicationDate,
Users.FullName as ApprovedUser,
AccountTransaction.PaymentDate Date,
CONVERT(varchar,AccountTransaction.PaymentDate,103) sDate,
section.Code SectionCode,
ApplyType,
OldExportLicenceNo OldLicenceNo,
ExportLicenceNo LicenceNo,
BorderExportLicence.CreatedDate LicenceDate,
CONVERT(varchar,BorderExportLicence.CreatedDate,103) sLicenceDate,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
VoucherNo,
VoucherDate,
CONVERT(varchar,AccountTransaction.VoucherDate,103) sVoucherDate,
CAST(AccountTransaction.TotalAmount AS decimal(38,6)) Amount,
PaymentType,
BorderExportLicence.CommodityType,
CAST(NULL AS decimal(38,6)) ExchangeRate,
CAST(NULL AS decimal(38,6)) TotalCIF,
sakhan.Id SakhanId,
sakhan.Code SakhanCode,
sakhan.Name SakhanName,
(SELECT method.Name FROM dbo.ExportImportMethod AS method WHERE method.Id = BorderExportLicence.ExportImportMethodId) AS TradeMethod,
BorderExportLicence.Id AS __k_Id
        FROM BorderExportLicence
		INNER JOIN AccountTransaction ON BorderExportLicence.Id=AccountTransaction.TransactionId
		INNER JOIN PaThaKa ON BorderExportLicence.PaThaKaId=PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderExportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderExportLicence.SakhanId = sakhan.Id
		INNER JOIN Users ON Users.Id = BorderExportLicence.ApproveUserId
		WHERE IsPayment=1
		AND (AccountTransaction.PaymentDate>=@FromDate AND AccountTransaction.PaymentDate<=@ToDate)
		AND BorderExportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderExportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND AccountTransaction.PaymentType=(CASE WHEN @PaymentType='''' then AccountTransaction.PaymentType ELSE @PaymentType END)
		AND ApplyType=@ApplyType AND BorderExportLicence.Status=''Approved'' AND BorderExportLicence.CardType=''Pa Tha Ka''
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderExportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderExportLicence.SakhanId ELSE @SakhanId END)
		UNION ALL
        SELECT BorderExportLicence.ApplicationNo,
BorderExportLicence.ApplicationDate,
Users.FullName as ApprovedUser,
AccountTransaction.PaymentDate Date,
CONVERT(varchar,AccountTransaction.PaymentDate,103) sDate,
section.Code SectionCode,
ApplyType,
OldExportLicenceNo OldLicenceNo,
ExportLicenceNo LicenceNo,
BorderExportLicence.CreatedDate LicenceDate,
CONVERT(varchar,BorderExportLicence.CreatedDate,103) sLicenceDate,
IndividualTrading.TINNo CompanyRegistrationNo,
IndividualTrading.Name CompanyName,
VoucherNo,
VoucherDate,
CONVERT(varchar,AccountTransaction.VoucherDate,103) sVoucherDate,
CAST(AccountTransaction.TotalAmount AS decimal(38,6)) Amount,
PaymentType,
BorderExportLicence.CommodityType,
CAST(NULL AS decimal(38,6)) ExchangeRate,
CAST(NULL AS decimal(38,6)) TotalCIF,
sakhan.Id SakhanId,
sakhan.Code SakhanCode,
sakhan.Name SakhanName,
(SELECT method.Name FROM dbo.ExportImportMethod AS method WHERE method.Id = BorderExportLicence.ExportImportMethodId) AS TradeMethod,
BorderExportLicence.Id AS __k_Id
        FROM BorderExportLicence
		INNER JOIN AccountTransaction ON BorderExportLicence.Id=AccountTransaction.TransactionId
		INNER JOIN IndividualTrading ON BorderExportLicence.IndividualTradingId=IndividualTrading.Id
		INNER JOIN ExportImportSection section ON BorderExportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderExportLicence.SakhanId = sakhan.Id
		INNER JOIN Users ON Users.Id = BorderExportLicence.ApproveUserId
		WHERE IsPayment=1
		AND (AccountTransaction.PaymentDate>=@FromDate AND AccountTransaction.PaymentDate<=@ToDate)
		AND BorderExportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderExportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND AccountTransaction.PaymentType=(CASE WHEN @PaymentType='''' then AccountTransaction.PaymentType ELSE @PaymentType END)
		AND ApplyType=@ApplyType AND BorderExportLicence.Status=''Approved'' AND BorderExportLicence.CardType=''Individual Trading''
		AND IndividualTrading.TINNo=(CASE WHEN @CompanyRegistrationNo='''' then IndividualTrading.TINNo ELSE @CompanyRegistrationNo END)
		AND BorderExportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderExportLicence.SakhanId ELSE @SakhanId END)
        ) u
        ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
    ) pg
    ORDER BY ' + @ob + N'
    OPTION (RECOMPILE);';
    END
	ELSE IF @FormType = N'Border Import Licence'
    BEGIN
        IF @IncludeTotalCount = 1
        BEGIN
            SELECT @ComputedTotal = COUNT(*) FROM (
                SELECT BorderImportLicence.Id FROM AccountTransaction WITH (INDEX([IX_AccountTransaction_BorderImportLicenceVoucher]))
                INNER JOIN BorderImportLicence ON BorderImportLicence.Id=AccountTransaction.TransactionId
                INNER JOIN PaThaKa ON BorderImportLicence.PaThaKaId=PaThaKa.Id
                WHERE AccountTransaction.IsPayment=1
                AND AccountTransaction.TransactionFormType='Border Import Licence'
                AND ((@FromDate IS NULL) OR AccountTransaction.PaymentDate >= @FromDate)
                AND ((@ToDate IS NULL) OR AccountTransaction.PaymentDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
                AND BorderImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
                AND (@PaymentType='' OR AccountTransaction.PaymentType=@PaymentType)
                AND BorderImportLicence.ApplyType=@ApplyType AND BorderImportLicence.Status='Approved' AND BorderImportLicence.CardType='Pa Tha Ka'
                AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
                AND BorderImportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderImportLicence.SakhanId ELSE @SakhanId END)
                UNION ALL
                SELECT BorderImportLicence.Id FROM AccountTransaction WITH (INDEX([IX_AccountTransaction_BorderImportLicenceVoucher]))
                INNER JOIN BorderImportLicence ON BorderImportLicence.Id=AccountTransaction.TransactionId
                INNER JOIN IndividualTrading ON BorderImportLicence.IndividualTradingId=IndividualTrading.Id
                WHERE AccountTransaction.IsPayment=1
                AND AccountTransaction.TransactionFormType='Border Import Licence'
                AND ((@FromDate IS NULL) OR AccountTransaction.PaymentDate >= @FromDate)
                AND ((@ToDate IS NULL) OR AccountTransaction.PaymentDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
                AND BorderImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
                AND (@PaymentType='' OR AccountTransaction.PaymentType=@PaymentType)
                AND BorderImportLicence.ApplyType=@ApplyType AND BorderImportLicence.Status='Approved' AND BorderImportLicence.CardType='Individual Trading'
                AND IndividualTrading.TINNo=(CASE WHEN @CompanyRegistrationNo='' then IndividualTrading.TINNo ELSE @CompanyRegistrationNo END)
                AND BorderImportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderImportLicence.SakhanId ELSE @SakhanId END)
            ) tmp OPTION (RECOMPILE, MAXDOP 1);
        END

        SET @cntpart = N'DECLARE @__total int = @ComputedTotal; ';

        SET @sql = @cntpart + N'SELECT pg.*, itemAgg.Currency, itemAgg.TotalAmount, @__total AS TotalCount
    FROM (
        SELECT * FROM (
        SELECT BorderImportLicence.ApplicationNo,
BorderImportLicence.ApplicationDate,
Users.FullName as ApprovedUser,
AccountTransaction.PaymentDate Date,
CONVERT(varchar,AccountTransaction.PaymentDate,103) sDate,
section.Code SectionCode,
ApplyType,
OldImportLicenceNo OldLicenceNo,
ImportLicenceNo LicenceNo,
BorderImportLicence.CreatedDate LicenceDate,
CONVERT(varchar,BorderImportLicence.CreatedDate,103) sLicenceDate,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
VoucherNo,
VoucherDate,
CONVERT(varchar,AccountTransaction.VoucherDate,103) sVoucherDate,
CAST(AccountTransaction.TotalAmount AS decimal(38,6)) Amount,
PaymentType,
BorderImportLicence.CommodityType,
BorderImportLicence.ExchangeRate,
CAST(BorderImportLicence.TotalCIF AS decimal(38,6)) TotalCIF,
sakhan.Id SakhanId,
sakhan.Code SakhanCode,
sakhan.Name SakhanName,
(SELECT method.Name FROM dbo.ExportImportMethod AS method WHERE method.Id = BorderImportLicence.ExportImportMethodId) AS TradeMethod,
BorderImportLicence.Id AS __k_Id
        FROM BorderImportLicence
		INNER JOIN AccountTransaction WITH (INDEX([IX_AccountTransaction_BorderImportLicenceVoucher])) ON BorderImportLicence.Id=AccountTransaction.TransactionId
		INNER JOIN PaThaKa ON BorderImportLicence.PaThaKaId=PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderImportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderImportLicence.SakhanId = sakhan.Id
		INNER JOIN Users ON Users.Id = BorderImportLicence.ApproveUserId
		WHERE IsPayment=1
		AND AccountTransaction.TransactionFormType=''Border Import Licence''
		AND ((@FromDate IS NULL) OR AccountTransaction.PaymentDate >= @FromDate)
		AND ((@ToDate IS NULL) OR AccountTransaction.PaymentDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND AccountTransaction.PaymentType=(CASE WHEN @PaymentType='''' then AccountTransaction.PaymentType ELSE @PaymentType END)
		AND BorderImportLicence.ApplyType=@ApplyType AND BorderImportLicence.Status=''Approved'' AND BorderImportLicence.CardType=''Pa Tha Ka''
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderImportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderImportLicence.SakhanId ELSE @SakhanId END)
		UNION ALL
        SELECT BorderImportLicence.ApplicationNo,
BorderImportLicence.ApplicationDate,
Users.FullName as ApprovedUser,
AccountTransaction.PaymentDate Date,
CONVERT(varchar,AccountTransaction.PaymentDate,103) sDate,
section.Code SectionCode,
ApplyType,
OldImportLicenceNo OldLicenceNo,
ImportLicenceNo LicenceNo,
BorderImportLicence.CreatedDate LicenceDate,
CONVERT(varchar,BorderImportLicence.CreatedDate,103) sLicenceDate,
IndividualTrading.TINNo CompanyRegistrationNo,
IndividualTrading.Name CompanyName,
VoucherNo,
VoucherDate,
CONVERT(varchar,AccountTransaction.VoucherDate,103) sVoucherDate,
CAST(AccountTransaction.TotalAmount AS decimal(38,6)) Amount,
PaymentType,
BorderImportLicence.CommodityType,
BorderImportLicence.ExchangeRate,
CAST(BorderImportLicence.TotalCIF AS decimal(38,6)) TotalCIF,
sakhan.Id SakhanId,
sakhan.Code SakhanCode,
sakhan.Name SakhanName,
(SELECT method.Name FROM dbo.ExportImportMethod AS method WHERE method.Id = BorderImportLicence.ExportImportMethodId) AS TradeMethod,
BorderImportLicence.Id AS __k_Id
        FROM BorderImportLicence
		INNER JOIN AccountTransaction WITH (INDEX([IX_AccountTransaction_BorderImportLicenceVoucher])) ON BorderImportLicence.Id=AccountTransaction.TransactionId
		INNER JOIN IndividualTrading ON BorderImportLicence.IndividualTradingId=IndividualTrading.Id
		INNER JOIN ExportImportSection section ON BorderImportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderImportLicence.SakhanId = sakhan.Id
		INNER JOIN Users ON Users.Id = BorderImportLicence.ApproveUserId
		WHERE IsPayment=1
		AND AccountTransaction.TransactionFormType=''Border Import Licence''
		AND ((@FromDate IS NULL) OR AccountTransaction.PaymentDate >= @FromDate)
		AND ((@ToDate IS NULL) OR AccountTransaction.PaymentDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND AccountTransaction.PaymentType=(CASE WHEN @PaymentType='''' then AccountTransaction.PaymentType ELSE @PaymentType END)
		AND BorderImportLicence.ApplyType=@ApplyType AND BorderImportLicence.Status=''Approved'' AND BorderImportLicence.CardType=''Individual Trading''
		AND IndividualTrading.TINNo=(CASE WHEN @CompanyRegistrationNo='''' then IndividualTrading.TINNo ELSE @CompanyRegistrationNo END)
		AND BorderImportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderImportLicence.SakhanId ELSE @SakhanId END)
        ) u
        ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
    ) pg
    OUTER APPLY (
        SELECT
            MIN(currency.Code) AS Currency,
            SUM(item.Amount) AS TotalAmount
        FROM BorderImportLicenceItem item WITH (INDEX([IX_BorderImportLicenceItem_VoucherReport]))
        INNER JOIN Currency currency ON item.CurrencyId = currency.Id
        WHERE item.BorderImportLicenceId = pg.__k_Id
    ) itemAgg
    ORDER BY ' + @ob + N'
    OPTION (RECOMPILE, MAXDOP 1);';
    END
    ELSE IF @FormType = N'Border Export Permit'
    BEGIN
        SET @cntpart = CASE WHEN @IncludeTotalCount = 1
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM BorderExportPermit
		INNER JOIN AccountTransaction ON BorderExportPermit.Id=AccountTransaction.TransactionId
		INNER JOIN PaThaKa ON BorderExportPermit.PaThaKaId=PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderExportPermit.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderExportPermit.SakhanId = sakhan.Id
		INNER JOIN Users ON Users.Id = BorderExportPermit.ApproveUserId
		WHERE IsPayment=1
		AND AccountTransaction.TransactionFormType=''Border Export Permit''
		AND ((@FromDate IS NULL) OR AccountTransaction.PaymentDate>=@FromDate)
		AND ((@ToDate IS NULL) OR AccountTransaction.PaymentDate<DATEADD(day, 1, @ToDate))
		AND BorderExportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderExportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND AccountTransaction.PaymentType=(CASE WHEN @PaymentType='''' then AccountTransaction.PaymentType ELSE @PaymentType END)
		AND ApplyType=@ApplyType AND BorderExportPermit.Status=''Approved''
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderExportPermit.SakhanId=(CASE WHEN @SakhanId=0 then BorderExportPermit.SakhanId ELSE @SakhanId END) OPTION (RECOMPILE, LOOP JOIN); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        SET @sql = @cntpart + N'SELECT pg.*,
        (SELECT top 1 currency.Code FROM BorderExportPermitItem
		INNER JOIN Currency currency ON BorderExportPermitItem.CurrencyId = currency.Id
		WHERE BorderExportPermitItem.BorderExportPermitId=pg.__k_Id) Currency,
        (SELECT SUM(BorderExportPermitItem.Amount) FROM BorderExportPermitItem
		WHERE BorderExportPermitItem.BorderExportPermitId=pg.__k_Id) TotalAmount, @__total AS TotalCount
    FROM (
        SELECT BorderExportPermit.ApplicationNo,
BorderExportPermit.ApplicationDate,
Users.FullName as ApprovedUser,
AccountTransaction.PaymentDate Date,
CONVERT(varchar,AccountTransaction.PaymentDate,103) sDate,
section.Code SectionCode,
ApplyType,
OldExportPermitNo OldLicenceNo,
ExportPermitNo LicenceNo,
BorderExportPermit.CreatedDate LicenceDate,
CONVERT(varchar,BorderExportPermit.CreatedDate,103) sLicenceDate,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
VoucherNo,
VoucherDate,
CONVERT(varchar,AccountTransaction.VoucherDate,103) sVoucherDate,
CAST(AccountTransaction.TotalAmount AS decimal(38,6)) Amount,
PaymentType,
BorderExportPermit.CommodityType,
CAST(NULL AS decimal(38,6)) ExchangeRate,
CAST(NULL AS decimal(38,6)) TotalCIF,
sakhan.Id SakhanId,
sakhan.Code SakhanCode,
sakhan.Name SakhanName,
CAST(NULL AS nvarchar(200)) AS TradeMethod,
BorderExportPermit.Id AS __k_Id
        FROM BorderExportPermit
		INNER JOIN AccountTransaction ON BorderExportPermit.Id=AccountTransaction.TransactionId
		INNER JOIN PaThaKa ON BorderExportPermit.PaThaKaId=PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderExportPermit.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderExportPermit.SakhanId = sakhan.Id
		INNER JOIN Users ON Users.Id = BorderExportPermit.ApproveUserId
		WHERE IsPayment=1
		AND AccountTransaction.TransactionFormType=''Border Export Permit''
		AND ((@FromDate IS NULL) OR AccountTransaction.PaymentDate>=@FromDate)
		AND ((@ToDate IS NULL) OR AccountTransaction.PaymentDate<DATEADD(day, 1, @ToDate))
		AND BorderExportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderExportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND AccountTransaction.PaymentType=(CASE WHEN @PaymentType='''' then AccountTransaction.PaymentType ELSE @PaymentType END)
		AND ApplyType=@ApplyType AND BorderExportPermit.Status=''Approved''
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderExportPermit.SakhanId=(CASE WHEN @SakhanId=0 then BorderExportPermit.SakhanId ELSE @SakhanId END)
        ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
    ) pg
    ORDER BY ' + @ob + N'
    OPTION (RECOMPILE);';
    END
    ELSE IF @FormType = N'Border Import Permit'
    BEGIN
        SET @cntpart = CASE WHEN @IncludeTotalCount = 1
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM (
		SELECT BorderImportPermit.Id FROM BorderImportPermit
		INNER JOIN AccountTransaction ON BorderImportPermit.Id=AccountTransaction.TransactionId
		INNER JOIN PaThaKa ON BorderImportPermit.PaThaKaId=PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderImportPermit.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderImportPermit.SakhanId = sakhan.Id
		INNER JOIN Users ON Users.Id = BorderImportPermit.ApproveUserId
		WHERE IsPayment=1
		AND AccountTransaction.TransactionFormType=''Border Import Permit''
		AND (AccountTransaction.PaymentDate>=@FromDate AND AccountTransaction.PaymentDate<=@ToDate)
		AND BorderImportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderImportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND AccountTransaction.PaymentType=(CASE WHEN @PaymentType='''' then AccountTransaction.PaymentType ELSE @PaymentType END)
		AND ApplyType=@ApplyType AND BorderImportPermit.Status=''Approved''
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderImportPermit.SakhanId=(CASE WHEN @SakhanId=0 then BorderImportPermit.SakhanId ELSE @SakhanId END)
	) tmp OPTION (RECOMPILE, LOOP JOIN); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        SET @sql = @cntpart + N'SELECT pg.*,
        (SELECT top 1 currency.Code FROM BorderImportPermitItem
		INNER JOIN Currency currency ON BorderImportPermitItem.CurrencyId = currency.Id
		WHERE BorderImportPermitItem.BorderImportPermitId=pg.__k_Id) Currency,
        (SELECT SUM(BorderImportPermitItem.Amount) FROM BorderImportPermitItem
		WHERE BorderImportPermitItem.BorderImportPermitId=pg.__k_Id) TotalAmount, @__total AS TotalCount
    FROM (
        SELECT * FROM (
        SELECT BorderImportPermit.ApplicationNo,
BorderImportPermit.ApplicationDate,
Users.FullName as ApprovedUser,
AccountTransaction.PaymentDate Date,
CONVERT(varchar,AccountTransaction.PaymentDate,103) sDate,
section.Code SectionCode,
ApplyType,
OldImportPermitNo OldLicenceNo,
ImportPermitNo LicenceNo,
BorderImportPermit.CreatedDate LicenceDate,
CONVERT(varchar,BorderImportPermit.CreatedDate,103) sLicenceDate,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
VoucherNo,
VoucherDate,
CONVERT(varchar,AccountTransaction.VoucherDate,103) sVoucherDate,
CAST(AccountTransaction.TotalAmount AS decimal(38,6)) Amount,
PaymentType,
BorderImportPermit.CommodityType,
BorderImportPermit.ExchangeRate,
CAST(BorderImportPermit.TotalCIF AS decimal(38,6)) TotalCIF,
sakhan.Id SakhanId,
sakhan.Code SakhanCode,
sakhan.Name SakhanName,
CAST(NULL AS nvarchar(200)) AS TradeMethod,
BorderImportPermit.Id AS __k_Id
        FROM BorderImportPermit
		INNER JOIN AccountTransaction ON BorderImportPermit.Id=AccountTransaction.TransactionId
		INNER JOIN PaThaKa ON BorderImportPermit.PaThaKaId=PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderImportPermit.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderImportPermit.SakhanId = sakhan.Id
		INNER JOIN Users ON Users.Id = BorderImportPermit.ApproveUserId
		WHERE IsPayment=1
		AND AccountTransaction.TransactionFormType=''Border Import Permit''
		AND (AccountTransaction.PaymentDate>=@FromDate AND AccountTransaction.PaymentDate<=@ToDate)
		AND BorderImportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderImportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND AccountTransaction.PaymentType=(CASE WHEN @PaymentType='''' then AccountTransaction.PaymentType ELSE @PaymentType END)
		AND ApplyType=@ApplyType AND BorderImportPermit.Status=''Approved''
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderImportPermit.SakhanId=(CASE WHEN @SakhanId=0 then BorderImportPermit.SakhanId ELSE @SakhanId END)
        ) u
        ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
    ) pg
    ORDER BY ' + @ob + N'
    OPTION (RECOMPILE);';
    END
    ELSE
    BEGIN
        -- TotalCount only when requested, computed over the UN-paged base (no subqueries) as a separate scalar.
        SET @cntpart = CASE WHEN @IncludeTotalCount = 1
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM ImportLicence
		INNER JOIN AccountTransaction ON ImportLicence.Id=AccountTransaction.TransactionId
		INNER JOIN PaThaKa ON ImportLicence.PaThaKaId=PaThaKa.Id
		INNER JOIN ExportImportSection section ON ImportLicence.ExportImportSectionId = section.Id
		INNER JOIN Users ON Users.Id = ImportLicence.ApproveUserId
		WHERE IsPayment=1
		AND (AccountTransaction.PaymentDate>=@FromDate AND AccountTransaction.PaymentDate<=@ToDate)
		AND ImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND AccountTransaction.PaymentType=(CASE WHEN @PaymentType='''' then AccountTransaction.PaymentType ELSE @PaymentType END)
		AND ApplyType=@ApplyType AND ImportLicence.Status=''Approved''
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END) OPTION (RECOMPILE); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        SET @sql = @cntpart + N'SELECT pg.*, cur.Code AS Currency, amt.TotalAmount AS TotalAmount, CAST(NULL AS int) SakhanId, CAST(NULL AS nvarchar(50)) SakhanCode, CAST(NULL AS nvarchar(200)) SakhanName, @__total AS TotalCount
    FROM (
        SELECT ImportLicence.ApplicationNo,
ImportLicence.ApplicationDate,
Users.FullName as ApprovedUser,
AccountTransaction.PaymentDate Date,
CONVERT(varchar,AccountTransaction.PaymentDate,103) sDate,
section.Code SectionCode,
ApplyType,
OldImportLicenceNo OldLicenceNo,
ImportLicenceNo LicenceNo,
ImportLicence.CreatedDate LicenceDate,
CONVERT(varchar,ImportLicence.CreatedDate,103) sLicenceDate,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
VoucherNo,
VoucherDate,
CONVERT(varchar,AccountTransaction.VoucherDate,103) sVoucherDate,
CAST(AccountTransaction.TotalAmount AS decimal(38,6)) Amount,
PaymentType,
ImportLicence.CommodityType,
ImportLicence.ExchangeRate,
CAST(ImportLicence.TotalCIF AS decimal(38,6)) TotalCIF,
(SELECT method.Name FROM dbo.ExportImportMethod AS method WHERE method.Id = ImportLicence.ExportImportMethodId) AS TradeMethod,
ImportLicence.Id AS __k_Id
        FROM ImportLicence
		INNER JOIN AccountTransaction ON ImportLicence.Id=AccountTransaction.TransactionId
		INNER JOIN PaThaKa ON ImportLicence.PaThaKaId=PaThaKa.Id
		INNER JOIN ExportImportSection section ON ImportLicence.ExportImportSectionId = section.Id
		INNER JOIN Users ON Users.Id = ImportLicence.ApproveUserId
		WHERE IsPayment=1
		AND (AccountTransaction.PaymentDate>=@FromDate AND AccountTransaction.PaymentDate<=@ToDate)
		AND ImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND AccountTransaction.PaymentType=(CASE WHEN @PaymentType='''' then AccountTransaction.PaymentType ELSE @PaymentType END)
		AND ApplyType=@ApplyType AND ImportLicence.Status=''Approved''
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
        ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
    ) pg
    OUTER APPLY (
        SELECT SUM(v.TotalAmount) AS TotalAmount
        FROM dbo.vw_ImportLicenceItemTotalByCurrency AS v WITH (NOEXPAND)
        WHERE v.ImportLicenceId = pg.__k_Id
    ) amt
    OUTER APPLY (
        SELECT TOP 1 currency.Code
        FROM dbo.vw_ImportLicenceItemTotalByCurrency AS v WITH (NOEXPAND)
        INNER JOIN Currency currency ON v.CurrencyId = currency.Id
        WHERE v.ImportLicenceId = pg.__k_Id
    ) cur
    ORDER BY ' + @ob + N'
    OPTION (RECOMPILE);';
    END

    EXEC sp_executesql @sql, N'@FormType nvarchar(50), @FromDate datetime, @ToDate datetime, @ExportImportSectionId int, @PaymentType nvarchar(50), @ApplyType nvarchar(20), @CompanyRegistrationNo nvarchar(50), @SakhanId int, @off bigint, @ps bigint, @ComputedTotal int', @FormType=@FormType, @FromDate=@FromDate, @ToDate=@ToDate, @ExportImportSectionId=@ExportImportSectionId, @PaymentType=@PaymentType, @ApplyType=@ApplyType, @CompanyRegistrationNo=@CompanyRegistrationNo, @SakhanId=@SakhanId, @off=@off, @ps=@ps, @ComputedTotal=@ComputedTotal;
END
