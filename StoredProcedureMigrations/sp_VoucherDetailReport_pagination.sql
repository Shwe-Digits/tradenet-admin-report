-- Additive companion to the seven remaining licence/permit voucher reports.
-- The existing Oversea Import Licence detail procedure remains independent.
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
CREATE OR ALTER PROCEDURE dbo.sp_VoucherDetailReport_pagination
    @FormType nvarchar(50),
    @FromDate datetime,
    @ToDate datetime,
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
    SET ARITHABORT ON; -- Required by the original permit indexed views (NOEXPAND).

    -- Only these fixed report identities may become SQL identifiers.
    IF @FormType IS NULL OR @FormType NOT IN (
        N'Import Permit',N'Export Licence',N'Export Permit',N'Border Import Licence',
        N'Border Import Permit',N'Border Export Licence',N'Border Export Permit')
        THROW 51000,'Unsupported voucher detail report form type.',1;

    DECLARE @tableName sysname = REPLACE(@FormType,N' ',N'');
    DECLARE @table nvarchar(258) = QUOTENAME(@tableName);
    DECLARE @items nvarchar(258) = QUOTENAME(@tableName+N'Item');
    DECLARE @itemKey nvarchar(258) = QUOTENAME(@tableName+N'Id');
    DECLARE @number sysname = CASE WHEN @FormType LIKE N'%Import%' THEN N'Import' ELSE N'Export' END
        +CASE WHEN @FormType LIKE N'%Permit' THEN N'PermitNo' ELSE N'LicenceNo' END;
    DECLARE @border bit = CASE WHEN @FormType LIKE N'Border %' THEN 1 ELSE 0 END;
    DECLARE @individual bit = CASE WHEN @FormType IN (N'Border Import Licence',N'Border Export Licence') THEN 1 ELSE 0 END;

    DECLARE @company nvarchar(500) = CASE WHEN @individual=1 THEN
        N'CASE WHEN imp.CardType=N''Individual Trading'' THEN individual.TINNo ELSE p.CompanyRegistrationNo END'
        ELSE N'p.CompanyRegistrationNo' END;
    DECLARE @companyName nvarchar(500) = CASE WHEN @individual=1 THEN
        N'CASE WHEN imp.CardType=N''Individual Trading'' THEN individual.Name ELSE p.CompanyName END'
        ELSE N'p.CompanyName' END;
    DECLARE @companyJoin nvarchar(1000) = CASE WHEN @individual=1 THEN
        N'LEFT JOIN dbo.PaThaKa p ON p.Id=imp.PaThaKaId
          LEFT JOIN dbo.IndividualTrading individual ON individual.Id=imp.IndividualTradingId'
        ELSE N'INNER JOIN dbo.PaThaKa p ON p.Id=imp.PaThaKaId' END;
    DECLARE @cardFilter nvarchar(500) = CASE WHEN @individual=1 THEN
        N' AND ((imp.CardType=N''Pa Tha Ka'' AND p.Id IS NOT NULL)
             OR (imp.CardType=N''Individual Trading'' AND individual.Id IS NOT NULL))'
        ELSE N'' END;
    DECLARE @sakhanColumns nvarchar(400) = CASE WHEN @border=1 THEN
        N's.Id AS SakhanId,s.Code AS SakhanCode,s.Name AS SakhanName'
        ELSE N'CAST(NULL AS int) AS SakhanId,CAST(NULL AS nvarchar(50)) AS SakhanCode,CAST(NULL AS nvarchar(200)) AS SakhanName' END;
    DECLARE @sakhanJoin nvarchar(200) = CASE WHEN @border=1 THEN
        N'INNER JOIN dbo.Sakhan s ON s.Id=imp.SakhanId' ELSE N'' END;
    DECLARE @sakhanFilter nvarchar(300) = CASE WHEN @border=1 THEN
        N' AND imp.SakhanId=CASE WHEN @SakhanId=0 THEN imp.SakhanId ELSE @SakhanId END' ELSE N'' END;

    -- Match the original branch projections, including the Export Permit literal zeros.
    DECLARE @exchange nvarchar(200) = CASE
        WHEN @FormType IN (N'Import Permit',N'Border Import Permit',N'Border Import Licence') THEN N'CAST(imp.ExchangeRate AS decimal(38,6))'
        WHEN @FormType=N'Export Permit' THEN N'CAST(0 AS decimal(38,6))'
        ELSE N'CAST(NULL AS decimal(38,6))' END;
    DECLARE @cif nvarchar(200) = REPLACE(@exchange,N'ExchangeRate',N'TotalCIF');

    -- The original families use different date bounds. Preserve each one exactly.
    DECLARE @dates nvarchar(600) = CASE
        WHEN @FormType IN (N'Export Licence',N'Border Import Licence') THEN
            N'(@FromDate IS NULL OR a.PaymentDate>=@FromDate)
              AND (@ToDate IS NULL OR a.PaymentDate<DATEADD(day,1,CONVERT(date,@ToDate)))'
        WHEN @FormType=N'Border Export Permit' THEN
            N'(@FromDate IS NULL OR a.PaymentDate>=@FromDate)
              AND (@ToDate IS NULL OR a.PaymentDate<DATEADD(day,1,@ToDate))'
        ELSE N'a.PaymentDate>=@FromDate AND a.PaymentDate<=@ToDate' END;
    DECLARE @apply nvarchar(200) = CASE WHEN @FormType=N'Export Licence'
        THEN N'(@ApplyType=N'''' OR imp.ApplyType=@ApplyType)' ELSE N'imp.ApplyType=@ApplyType' END;
    -- Border Export Licence's existing voucher branch does not add a form discriminator.
    DECLARE @transactionForm nvarchar(200) = CASE WHEN @FormType=N'Border Export Licence'
        THEN N'' ELSE N' AND a.TransactionFormType=@FormType' END;

    DECLARE @currencyJoin nvarchar(max);
    IF @FormType IN (N'Import Permit',N'Export Permit')
        SET @currencyJoin=N'
          OUTER APPLY (SELECT SUM(v.TotalAmount) AS TotalAmount
              FROM dbo.'+QUOTENAME(N'vw_'+@tableName+N'ItemTotalByCurrency')+N' v WITH (NOEXPAND)
              WHERE v.'+@itemKey+N'=pg.LicenceId) amt
          OUTER APPLY (SELECT TOP (1) c.Code AS Currency
              FROM dbo.'+QUOTENAME(N'vw_'+@tableName+N'ItemTotalByCurrency')+N' v WITH (NOEXPAND)
              JOIN dbo.Currency c ON c.Id=v.CurrencyId WHERE v.'+@itemKey+N'=pg.LicenceId) cur';
    ELSE IF @FormType=N'Border Import Licence'
        SET @currencyJoin=N'
          OUTER APPLY (SELECT SUM(item.Amount) AS TotalAmount,MIN(c.Code) AS Currency
              FROM dbo.'+@items+N' item JOIN dbo.Currency c ON c.Id=item.CurrencyId
              WHERE item.'+@itemKey+N'=pg.LicenceId) amt
          OUTER APPLY (SELECT amt.Currency) cur';
    ELSE
        SET @currencyJoin=N'
          OUTER APPLY (SELECT SUM(CAST(item.Amount AS decimal(38,6))) AS TotalAmount
              FROM dbo.'+@items+N' item WHERE item.'+@itemKey+N'=pg.LicenceId) amt
          OUTER APPLY (SELECT TOP (1) c.Code AS Currency FROM dbo.'+@items+N' item
              JOIN dbo.Currency c ON c.Id=item.CurrencyId WHERE item.'+@itemKey+N'=pg.LicenceId) cur';

    DECLARE @column nvarchar(128) = CASE WHEN @SortColumn IN (
        N'ApplicationNo',N'ApplicationDate',N'ApprovedUser',N'Date',N'SDate',N'SectionCode',
        N'ApplyType',N'OldLicenceNo',N'LicenceNo',N'LicenceDate',N'SLicenceDate',
        N'CompanyRegistrationNo',N'CompanyName',N'VoucherNo',N'VoucherDate',N'SVoucherDate',
        N'Description',N'Amount',N'PaymentType',N'CommodityType',N'ExchangeRate',N'TotalCIF')
        THEN @SortColumn ELSE N'ApplicationNo' END;
    DECLARE @dir nvarchar(4) = CASE WHEN UPPER(@SortOrder)=N'DESC' THEN N'DESC' ELSE N'ASC' END;
    DECLARE @order nvarchar(500) = QUOTENAME(@column)+N' '+@dir
        +N', AccountTransactionId,DetailSortOrder,DetailId';
    DECLARE @off bigint = CASE WHEN ISNULL(@PageSize,0)<=0 THEN 0
        ELSE CAST(ISNULL(@PageIndex,0) AS bigint)*@PageSize END;
    DECLARE @take bigint = CASE WHEN ISNULL(@PageSize,0)<=0 THEN 9223372036854775807
        ELSE CAST(@PageSize AS bigint)+CASE WHEN @IncludeTotalCount=0 THEN 1 ELSE 0 END END;

    -- Materialize fees before counting/paging. Goods joins happen on the page only,
    -- so multiple goods never multiply a voucher fee or its aggregate.
    DECLARE @sql nvarchar(max) = N'
        SELECT imp.Id AS LicenceId,a.Id AS AccountTransactionId,d.Id AS DetailId,d.SortOrder AS DetailSortOrder,
            imp.ApplicationNo,imp.ApplicationDate,u.FullName AS ApprovedUser,
            a.PaymentDate AS Date,CONVERT(varchar(10),a.PaymentDate,103) AS SDate,
            section.Code AS SectionCode,imp.ApplyType,imp.'+QUOTENAME(N'Old'+@number)+N' AS OldLicenceNo,
            imp.'+QUOTENAME(@number)+N' AS LicenceNo,imp.CreatedDate AS LicenceDate,
            CONVERT(varchar(10),imp.CreatedDate,103) AS SLicenceDate,
            '+@company+N' AS CompanyRegistrationNo,'+@companyName+N' AS CompanyName,
            a.VoucherNo,a.VoucherDate,CONVERT(varchar(10),a.VoucherDate,103) AS SVoucherDate,
            t.Description,CAST(d.Amount AS decimal(38,6)) AS Amount,a.PaymentType,imp.CommodityType,
            '+@exchange+N' AS ExchangeRate,'+@cif+N' AS TotalCIF,'+@sakhanColumns+N'
        INTO #Details FROM dbo.'+@table+N' imp
        INNER JOIN dbo.AccountTransaction a ON a.TransactionId=imp.Id
        INNER JOIN dbo.AccountTransactionDetail d ON d.AccountTransactionId=a.Id
        INNER JOIN dbo.AccountTitle t ON t.Id=d.AccountTitleId
        '+@companyJoin+N'
        INNER JOIN dbo.ExportImportSection section ON section.Id=imp.ExportImportSectionId
        INNER JOIN dbo.Users u ON u.Id=imp.ApproveUserId '+@sakhanJoin+N'
        WHERE a.IsPayment=1 AND imp.Status=N''Approved'' '+@transactionForm+N'
            AND '+@dates+N' AND '+@apply+N'
            AND imp.ExportImportSectionId=CASE WHEN @ExportImportSectionId=0 THEN imp.ExportImportSectionId ELSE @ExportImportSectionId END
            AND a.PaymentType=CASE WHEN @PaymentType=N'''' THEN a.PaymentType ELSE @PaymentType END
            AND '+@company+N'=CASE WHEN @CompanyRegistrationNo=N'''' THEN '+@company+N' ELSE @CompanyRegistrationNo END
            '+@cardFilter+@sakhanFilter+N'
        OPTION(RECOMPILE);

        DECLARE @total int = CASE WHEN @IncludeTotalCount=1 THEN (SELECT COUNT(*) FROM #Details) END;
        DECLARE @amountTotal decimal(38,6) = (SELECT COALESCE(SUM(Amount),0) FROM #Details);
        SELECT pg.*,amt.TotalAmount,cur.Currency,@total AS TotalCount,@amountTotal AS AmountTotal
        FROM (SELECT * FROM #Details ORDER BY '+@order+N' OFFSET @off ROWS FETCH NEXT @take ROWS ONLY) pg
        '+@currencyJoin+N'
        ORDER BY '+@order+N' OPTION(RECOMPILE);';
    EXEC sys.sp_executesql @sql,
        N'@FormType nvarchar(50),@FromDate datetime,@ToDate datetime,@ExportImportSectionId int,
          @PaymentType nvarchar(50),@ApplyType nvarchar(20),@CompanyRegistrationNo nvarchar(50),
          @SakhanId int,@IncludeTotalCount bit,@off bigint,@take bigint',
        @FormType,@FromDate,@ToDate,@ExportImportSectionId,@PaymentType,@ApplyType,@CompanyRegistrationNo,
        @SakhanId,@IncludeTotalCount,@off,@take;
END;
