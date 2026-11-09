-- Additive report only. Existing voucher and account summary procedures stay unchanged.
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
CREATE OR ALTER PROCEDURE dbo.sp_ImportLicenceVoucherDetailReport_pagination
    @FromDate datetime,
    @ToDate datetime,
    @ExportImportSectionId int = 0,
    @PaymentType nvarchar(50) = N'',
    @ApplyType nvarchar(20) = N'New',
    @CompanyRegistrationNo nvarchar(50) = N'',
    @SortColumn nvarchar(128) = NULL,
    @SortOrder nvarchar(4) = NULL,
    @PageIndex int = NULL,
    @PageSize int = NULL,
    @IncludeTotalCount bit = 1
AS
BEGIN
    SET NOCOUNT ON;

    -- One row per fee, joined through its own account transaction (not just the licence).
    -- Preserve the original voucher's paid/approved eligibility and search filters.
    SELECT d.Id AS DetailId, a.Id AS AccountTransactionId, imp.Id AS ImportLicenceId,
        imp.ApplicationNo, imp.ApplicationDate, u.FullName AS ApprovedUser,
        a.PaymentDate AS Date, CONVERT(varchar(10),a.PaymentDate,103) AS SDate,
        section.Code AS SectionCode, imp.ApplyType,
        imp.OldImportLicenceNo AS OldLicenceNo, imp.ImportLicenceNo AS LicenceNo,
        imp.CreatedDate AS LicenceDate, CONVERT(varchar(10),imp.CreatedDate,103) AS SLicenceDate,
        p.CompanyRegistrationNo, p.CompanyName,
        a.VoucherNo, a.VoucherDate, CONVERT(varchar(10),a.VoucherDate,103) AS SVoucherDate,
        t.Description, CAST(d.Amount AS decimal(38,6)) AS Amount,
        d.SortOrder AS DetailSortOrder, a.PaymentType, imp.CommodityType,
        CAST(imp.ExchangeRate AS decimal(38,6)) AS ExchangeRate,
        CAST(imp.TotalCIF AS decimal(38,6)) AS TotalCIF
    INTO #Details
    FROM dbo.ImportLicence imp
    INNER JOIN dbo.AccountTransaction a ON a.TransactionId=imp.Id
    INNER JOIN dbo.AccountTransactionDetail d ON d.AccountTransactionId=a.Id
    INNER JOIN dbo.AccountTitle t ON t.Id=d.AccountTitleId
    INNER JOIN dbo.PaThaKa p ON p.Id=imp.PaThaKaId
    INNER JOIN dbo.ExportImportSection section ON section.Id=imp.ExportImportSectionId
    INNER JOIN dbo.Users u ON u.Id=imp.ApproveUserId
    WHERE a.IsPayment=1 AND imp.Status=N'Approved'
        AND a.TransactionFormType=N'Import Licence'
        AND a.PaymentDate>=@FromDate
        AND a.PaymentDate<=@ToDate
        AND (@ExportImportSectionId=0 OR imp.ExportImportSectionId=@ExportImportSectionId)
        AND (@PaymentType=N'' OR a.PaymentType=@PaymentType)
        AND imp.ApplyType=@ApplyType
        AND (@CompanyRegistrationNo=N'' OR p.CompanyRegistrationNo=@CompanyRegistrationNo)
    OPTION (RECOMPILE);

    DECLARE @total int = CASE WHEN @IncludeTotalCount=1 THEN (SELECT COUNT(*) FROM #Details) END;
    DECLARE @amountTotal decimal(38,6) = (SELECT COALESCE(SUM(Amount),0) FROM #Details);
    DECLARE @off bigint = CASE WHEN ISNULL(@PageSize,0)<=0 THEN 0
        ELSE CAST(ISNULL(@PageIndex,0) AS bigint)*@PageSize END;
    DECLARE @take bigint = CASE WHEN ISNULL(@PageSize,0)<=0 THEN 9223372036854775807
        ELSE CAST(@PageSize AS bigint)+CASE WHEN @IncludeTotalCount=0 THEN 1 ELSE 0 END END;
    DECLARE @dir nvarchar(4) = CASE WHEN UPPER(@SortOrder)=N'DESC' THEN N'DESC' ELSE N'ASC' END;
    DECLARE @column nvarchar(128) = CASE WHEN @SortColumn IN (
        N'ApplicationNo',N'ApplicationDate',N'ApprovedUser',N'Date',N'SDate',N'SectionCode',
        N'ApplyType',N'OldLicenceNo',N'LicenceNo',N'LicenceDate',N'SLicenceDate',
        N'CompanyRegistrationNo',N'CompanyName',N'VoucherNo',N'VoucherDate',N'SVoucherDate',
        N'Description',N'Amount',N'PaymentType',N'CommodityType',N'ExchangeRate',N'TotalCIF')
        THEN @SortColumn ELSE N'ApplicationNo' END;
    -- Stable transaction/detail keys prevent repeated or missing fees between pages.
    DECLARE @order nvarchar(500) = QUOTENAME(@column)+N' '+@dir
        +CASE WHEN @column=N'VoucherNo' THEN N'' ELSE N', VoucherNo' END
        +N', AccountTransactionId, DetailSortOrder, DetailId';
    DECLARE @sql nvarchar(max) = N'
        SELECT pg.*, cur.Code AS Currency, amt.TotalAmount,
            @total AS TotalCount, @amountTotal AS AmountTotal
        FROM (SELECT * FROM #Details ORDER BY '+@order+N'
            OFFSET @off ROWS FETCH NEXT @take ROWS ONLY) pg
        OUTER APPLY (SELECT SUM(item.Amount) AS TotalAmount FROM dbo.ImportLicenceItem item
            WHERE item.ImportLicenceId=pg.ImportLicenceId) amt
        OUTER APPLY (SELECT TOP (1) c.Code FROM dbo.ImportLicenceItem item
            INNER JOIN dbo.Currency c ON c.Id=item.CurrencyId
            WHERE item.ImportLicenceId=pg.ImportLicenceId ORDER BY item.Id) cur
        ORDER BY '+@order+N';';
    EXEC sys.sp_executesql @sql,
        N'@off bigint,@take bigint,@total int,@amountTotal decimal(38,6)',
        @off,@take,@total,@amountTotal;
END;
