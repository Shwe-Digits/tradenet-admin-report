SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
CREATE OR ALTER PROCEDURE dbo.sp_ApplicationNumberReport_pagination
    @FromDate datetime,
    @ToDate datetime,
    @FormType nvarchar(50) = N'',
    @SortColumn nvarchar(128) = NULL,
    @SortOrder nvarchar(4) = NULL,
    @PageIndex int = NULL,
    @PageSize int = NULL,
    @IncludeTotalCount bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    IF @FormType IS NULL OR @FormType NOT IN (N'',N'Import Licence',N'Border Import Licence')
        THROW 51000,'Unsupported application type.',1;

    DECLARE @off bigint=CASE WHEN ISNULL(@PageSize,0)<=0 THEN 0 ELSE CAST(ISNULL(@PageIndex,0) AS bigint)*@PageSize END;
    DECLARE @take bigint=CASE WHEN ISNULL(@PageSize,0)<=0 THEN 9223372036854775807
        ELSE CAST(@PageSize AS bigint)+CASE WHEN @IncludeTotalCount=0 THEN 1 ELSE 0 END END;
    DECLARE @dir nvarchar(4)=CASE WHEN UPPER(@SortOrder)=N'DESC' THEN N'DESC' ELSE N'ASC' END;
    DECLARE @column nvarchar(128)=CASE WHEN @SortColumn IN (
        N'ApplicationNo',N'Id',N'TransactionId',N'Sakhan',N'PaThaKaNo',N'ApplyType',N'FormType',
        N'MPUApplicationNo',N'InvoiceNo',N'MOCAmount',N'IMAmount',N'TransactionAmount',N'MerchantId',
        N'ResponseCode',N'AccountNo',N'TransactionRefNo',N'ApprovalCode',N'TransactionDateTime',
        N'Status',N'FailReason',N'MemberId',N'PaymentType') THEN @SortColumn ELSE N'TransactionDateTime' END;

    -- Normal date pages seek only enough keys for the page and its look-ahead row.
    -- WITH TIES keeps every boundary timestamp so the existing Id/FormType ordering
    -- remains correct, including when reading the date index backwards.
    IF @IncludeTotalCount=0 AND ISNULL(@PageSize,0)>0 AND @column=N'TransactionDateTime'
    BEGIN
        DECLARE @limit bigint=@off+@take;
        DECLARE @pageSql nvarchar(max)=N'
        WITH matches AS (
            SELECT * FROM (
                SELECT TOP(@limit) WITH TIES m.Id,imp.ApplicationNo,m.FormType,m.TransactionDateTime
                FROM dbo.MPUPaymentTransaction m
                INNER JOIN dbo.ImportLicence imp ON imp.Id=m.TransactionId
                WHERE (@FormType=N'''' OR @FormType=N''Import Licence'')
                    AND (m.ApplicationNo=N'''' OR m.ApplicationNo IS NULL)
                    AND m.ResponseCode=N''00'' AND m.Status=N''AP''
                    AND m.TransactionDateTime>=@FromDate AND m.TransactionDateTime<=@ToDate
                ORDER BY m.TransactionDateTime '+@dir+N'
            ) AS oversea
            UNION ALL
            SELECT * FROM (
                SELECT TOP(@limit) WITH TIES m.Id,imp.ApplicationNo,m.FormType,m.TransactionDateTime
                FROM dbo.MPUPaymentTransaction m
                INNER JOIN dbo.BorderImportLicence imp ON imp.Id=m.TransactionId
                WHERE (@FormType=N'''' OR @FormType=N''Border Import Licence'')
                    AND (m.ApplicationNo=N'''' OR m.ApplicationNo IS NULL)
                    AND m.ResponseCode=N''00'' AND m.Status=N''AP''
                    AND m.TransactionDateTime>=@FromDate AND m.TransactionDateTime<=@ToDate
                ORDER BY m.TransactionDateTime '+@dir+N'
            ) AS border
        ), pageKeys AS (
            SELECT * FROM matches ORDER BY TransactionDateTime '+@dir+N',Id,FormType
                OFFSET @off ROWS FETCH NEXT @take ROWS ONLY
        )
        SELECT p.ApplicationNo,m.Id,m.TransactionId,m.Sakhan,m.PaThaKaNo,m.ApplyType,m.FormType,
            m.ApplicationNo AS MPUApplicationNo,m.InvoiceNo,m.MOCAmount,m.IMAmount,m.TransactionAmount,
            m.MerchantId,m.ResponseCode,m.AccountNo,m.TransactionRefNo,m.ApprovalCode,
            m.TransactionDateTime,m.Status,m.FailReason,m.MemberId,m.PaymentType,CAST(NULL AS int) AS TotalCount
        FROM pageKeys p INNER JOIN dbo.MPUPaymentTransaction m ON m.Id=p.Id
        ORDER BY p.TransactionDateTime '+@dir+N',p.Id,p.FormType OPTION(RECOMPILE);';
        EXEC sys.sp_executesql @pageSql,
            N'@FromDate datetime,@ToDate datetime,@FormType nvarchar(50),@off bigint,@take bigint,@limit bigint',
            @FromDate,@ToDate,@FormType,@off,@take,@limit;
        RETURN;
    END;

    -- Read-only recovery report. Preserve the payment's stored number separately.
    -- These are the email's exact inclusive timestamps and missing-number conditions.
    SELECT imp.ApplicationNo,m.Id,m.TransactionId,m.Sakhan,m.PaThaKaNo,m.ApplyType,m.FormType,
        m.ApplicationNo AS MPUApplicationNo,m.InvoiceNo,m.MOCAmount,m.IMAmount,m.TransactionAmount,
        m.MerchantId,m.ResponseCode,m.AccountNo,m.TransactionRefNo,m.ApprovalCode,
        m.TransactionDateTime,m.Status,m.FailReason,m.MemberId,m.PaymentType
    INTO #Rows
    FROM dbo.MPUPaymentTransaction m
    INNER JOIN dbo.ImportLicence imp ON imp.Id=m.TransactionId
    WHERE (@FormType=N'' OR @FormType=N'Import Licence')
        AND (m.ApplicationNo=N'' OR m.ApplicationNo IS NULL)
        AND m.ResponseCode=N'00' AND m.Status=N'AP'
        AND m.TransactionDateTime>=@FromDate AND m.TransactionDateTime<=@ToDate
    UNION ALL
    SELECT imp.ApplicationNo,m.Id,m.TransactionId,m.Sakhan,m.PaThaKaNo,m.ApplyType,m.FormType,
        m.ApplicationNo,m.InvoiceNo,m.MOCAmount,m.IMAmount,m.TransactionAmount,
        m.MerchantId,m.ResponseCode,m.AccountNo,m.TransactionRefNo,m.ApprovalCode,
        m.TransactionDateTime,m.Status,m.FailReason,m.MemberId,m.PaymentType
    FROM dbo.MPUPaymentTransaction m
    INNER JOIN dbo.BorderImportLicence imp ON imp.Id=m.TransactionId
    WHERE (@FormType=N'' OR @FormType=N'Border Import Licence')
        AND (m.ApplicationNo=N'' OR m.ApplicationNo IS NULL)
        AND m.ResponseCode=N'00' AND m.Status=N'AP'
        AND m.TransactionDateTime>=@FromDate AND m.TransactionDateTime<=@ToDate
    OPTION(RECOMPILE);

    DECLARE @total int=CASE WHEN @IncludeTotalCount=1 THEN (SELECT COUNT(*) FROM #Rows) END;
    DECLARE @order nvarchar(400)=QUOTENAME(@column)+N' '+@dir
        +CASE WHEN @column=N'Id' THEN N'' ELSE N',Id' END+N',FormType';
    IF @column=N'FormType' SET @order=QUOTENAME(@column)+N' '+@dir+N',Id';
    DECLARE @sql nvarchar(max)=N'SELECT *,@total AS TotalCount FROM #Rows ORDER BY '+@order+
        N' OFFSET @off ROWS FETCH NEXT @take ROWS ONLY;';
    EXEC sys.sp_executesql @sql,N'@total int,@off bigint,@take bigint',@total,@off,@take;
END;
