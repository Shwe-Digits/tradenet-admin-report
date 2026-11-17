SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
CREATE OR ALTER PROCEDURE dbo.sp_PermitPendingReport_pagination
    @FromDate datetime,
    @ToDate datetime,
    @FormType nvarchar(50),
    @ExportImportSectionId int = 0,
    @SortColumn nvarchar(128) = NULL,
    @SortOrder nvarchar(4) = NULL,
    @PageIndex int = NULL,
    @PageSize int = NULL,
    @IncludeTotalCount bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @table sysname=CASE @FormType
        WHEN N'Import Permit' THEN N'ImportPermit'
        WHEN N'Export Permit' THEN N'ExportPermit'
        WHEN N'Border Import Permit' THEN N'BorderImportPermit'
        WHEN N'Border Export Permit' THEN N'BorderExportPermit' END;
    IF @table IS NULL THROW 51000,'Unsupported permit type.',1;
    IF @FromDate IS NULL OR @ToDate IS NULL OR @ToDate<@FromDate
        THROW 51000,'A valid date range is required.',1;

    -- Only these fixed identifiers enter SQL. All filter/paging values are parameters.
    DECLARE @items nvarchar(258)=N'dbo.'+QUOTENAME(@table+N'Item');
    DECLARE @foreignKey nvarchar(258)=QUOTENAME(@table+N'Id');
    DECLARE @column nvarchar(128)=CASE @SortColumn
        WHEN N'Section' THEN N'SectionName' WHEN N'TotalValue' THEN N'Amount'
        ELSE @SortColumn END;
    IF @column IS NULL OR @column NOT IN (N'Status',N'ApplyType',N'ApplicationDate',N'LicenceDate',
        N'ApplicationNo',N'SectionCode',N'SectionName',N'CompanyRegistrationNo',N'CompanyName',
        N'CommodityType',N'HSCode',N'AdditionalDescription',N'Currency',N'Amount')
        SET @column=N'ApplicationDate';
    DECLARE @direction nvarchar(4)=CASE WHEN UPPER(@SortOrder)=N'DESC' THEN N'DESC' ELSE N'ASC' END;
    DECLARE @order nvarchar(600)=QUOTENAME(@column)+N' '+@direction
        +CASE WHEN @column=N'ApplicationDate' THEN N'' ELSE N',ApplicationDate ASC' END
        +CASE WHEN @column=N'ApplicationNo' THEN N'' ELSE N',ApplicationNo ASC' END+N',Id ASC';
    DECLARE @off bigint=CASE WHEN ISNULL(@PageSize,0)<=0 THEN 0
        ELSE CAST(ISNULL(@PageIndex,0) AS bigint)*@PageSize END;
    DECLARE @take bigint=CASE WHEN ISNULL(@PageSize,0)<=0 THEN 9223372036854775807
        ELSE CAST(@PageSize AS bigint)+CASE WHEN @IncludeTotalCount=0 THEN 1 ELSE 0 END END;

    -- Match the licence pending report: Pending/Reject and inclusive application dates.
    -- Keep the date and section columns bare so existing indexes remain usable.
    DECLARE @from nvarchar(max)=N' FROM dbo.'+QUOTENAME(@table)+N' p
        INNER JOIN dbo.PaThaKa company ON company.Id=p.PaThaKaId
        INNER JOIN dbo.ExportImportSection section ON section.Id=p.ExportImportSectionId
        WHERE p.Status IN (N''Pending'',N''Reject'')
            AND p.ApplicationDate>=@FromDate AND p.ApplicationDate<=@ToDate
            AND (@ExportImportSectionId=0 OR p.ExportImportSectionId=@ExportImportSectionId)';
    DECLARE @base nvarchar(max)=N'SELECT p.Id,p.Status,p.ApplyType,p.ApplicationDate,
        p.IssuedDate AS LicenceDate,p.ApplicationNo,section.Code AS SectionCode,section.Name AS SectionName,
        company.CompanyRegistrationNo,company.CompanyName,p.CommodityType'+@from;
    DECLARE @total int;
    IF @IncludeTotalCount=1
    BEGIN
        DECLARE @countSql nvarchar(max)=N'SELECT @total=COUNT(*)'+@from+N' OPTION(RECOMPILE);';
        EXEC sys.sp_executesql @countSql,
            N'@FromDate datetime,@ToDate datetime,@ExportImportSectionId int,@total int OUTPUT',
            @FromDate,@ToDate,@ExportImportSectionId,@total OUTPUT;
    END;

    -- The same first item supplies HS Code and Description; duplicate item IDs with
    -- different UniqueIds remain separate items in the all-item amount sum.
    DECLARE @apply nvarchar(max)=N'
        OUTER APPLY(SELECT TOP(1) i.HSCode,i.Description FROM '+@items+N' i
            WHERE i.'+@foreignKey+N'=b.Id ORDER BY i.ItemNo,i.Id,i.UniqueId) firstItem
        OUTER APPLY(SELECT TOP(1) c.Code FROM '+@items+N' i INNER JOIN dbo.Currency c ON c.Id=i.CurrencyId
            WHERE i.'+@foreignKey+N'=b.Id ORDER BY i.ItemNo,i.Id,i.UniqueId) currencyRow
        OUTER APPLY(SELECT SUM(i.Amount) AS Amount FROM '+@items+N' i WHERE i.'+@foreignKey+N'=b.Id) amountRow';
    DECLARE @itemColumns nvarchar(500)=N'firstItem.HSCode,firstItem.Description AS AdditionalDescription,
        currencyRow.Code AS Currency,ISNULL(amountRow.Amount,0) AS Amount';
    DECLARE @itemSort bit=CASE WHEN @column IN (N'HSCode',N'AdditionalDescription',N'Currency',N'Amount') THEN 1 ELSE 0 END;
    DECLARE @pageSource nvarchar(max)=CASE WHEN @itemSort=1
        THEN N'SELECT b.*,'+@itemColumns+N' FROM ('+@base+N') b'+@apply ELSE @base END;
    DECLARE @page nvarchar(max)=N'SELECT * FROM ('+@pageSource+N') q ORDER BY '+@order
        +N' OFFSET @off ROWS FETCH NEXT @take ROWS ONLY';
    -- For ordinary searches, item lookups/aggregation happen after paging, not over
    -- every item in the day/week/month/year. Item-column sorting alone needs them early.
    DECLARE @sql nvarchar(max)=N'SELECT b.Status,b.ApplyType,b.ApplicationDate,b.LicenceDate,b.ApplicationNo,
        b.SectionCode,b.SectionName,b.CompanyRegistrationNo,b.CompanyName,b.CommodityType,'
        +CASE WHEN @itemSort=1 THEN N'b.HSCode,b.AdditionalDescription,b.Currency,b.Amount' ELSE @itemColumns END
        +N',@total AS TotalCount FROM ('+@page+N') b'+CASE WHEN @itemSort=0 THEN @apply ELSE N'' END
        +N' ORDER BY '+@order+N' OPTION(RECOMPILE);';
    EXEC sys.sp_executesql @sql,
        N'@FromDate datetime,@ToDate datetime,@ExportImportSectionId int,@off bigint,@take bigint,@total int',
        @FromDate,@ToDate,@ExportImportSectionId,@off,@take,@total;
END;
