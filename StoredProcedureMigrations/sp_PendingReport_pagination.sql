CREATE OR ALTER PROCEDURE [dbo].[sp_PendingReport_pagination]
    @FromDate datetime = NULL,
    @ToDate datetime = NULL,
    @FormType nvarchar(50) = N'',
    @ExportImportSectionId int = 0,
    @SortColumn nvarchar(128) = NULL,
    @SortOrder nvarchar(4) = NULL,
    @PageIndex int = NULL,
    @PageSize int = NULL,
    @IncludeTotalCount bit = 1
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ps bigint = CASE
        WHEN ISNULL(@PageSize,0) <= 0 THEN 9223372036854775807
        WHEN @IncludeTotalCount = 0 THEN @PageSize + 1
        ELSE @PageSize END;
    DECLARE @off bigint = CASE WHEN ISNULL(@PageSize,0) <= 0 THEN 0 ELSE ISNULL(@PageIndex,0) * CAST(@PageSize AS bigint) END;
    DECLARE @dir nvarchar(4) = CASE WHEN UPPER(ISNULL(@SortOrder,'ASC')) = 'DESC' THEN 'DESC' ELSE 'ASC' END;

    DECLARE @ob nvarchar(400);
    IF @SortColumn IS NOT NULL AND @SortColumn IN (N'TradeMethod', N'Status', N'ApplyType', N'ApplicationDate', N'LicenceDate', N'ApplicationNo', N'SectionCode', N'SectionName', N'CompanyRegistrationNo', N'CompanyName', N'CommodityType')
        SET @ob = QUOTENAME(@SortColumn) + N' ' + @dir
            + CASE WHEN @SortColumn = N'ApplicationDate' THEN N'' ELSE N', [ApplicationDate] ASC' END
            + CASE WHEN @SortColumn = N'ApplicationNo' THEN N'' ELSE N', [ApplicationNo] ASC' END;
    ELSE
        SET @ob = N'[ApplicationDate] ASC, [ApplicationNo] ASC';

    -- The legacy Border Import Licence Pending report reads the border licence
    -- and item tables. Keep this branch separate so @FormType can never fall
    -- through to the ordinary ImportLicence query below.
    IF @FormType = N'Border Import Licence'
    BEGIN
        DECLARE @borderCntPart nvarchar(max) = CASE WHEN @IncludeTotalCount = 1
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM BorderImportLicence
		INNER JOIN PaThaKa ON BorderImportLicence.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderImportLicence.ExportImportSectionId = section.Id
		WHERE (BorderImportLicence.Status=''Pending'' or BorderImportLicence.Status=''Reject'')
		AND (BorderImportLicence.ApplicationDate>=@FromDate AND BorderImportLicence.ApplicationDate<=@ToDate)
		AND BorderImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END) OPTION (RECOMPILE); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        DECLARE @borderSql nvarchar(max) = @borderCntPart + N'SELECT pg.*,
        (SELECT top 1 currency.Code FROM BorderImportLicenceItem
		INNER JOIN Currency currency ON BorderImportLicenceItem.CurrencyId = currency.Id
		WHERE BorderImportLicenceItem.BorderImportLicenceId=pg.__k_Id) Currency,
        (SELECT top 1 BorderImportLicenceItem.Description FROM BorderImportLicenceItem
		WHERE BorderImportLicenceItem.BorderImportLicenceId=pg.__k_Id) AdditionalDescription,
        (SELECT ISNULL(SUM(BorderImportLicenceItem.Amount),0) FROM BorderImportLicenceItem
		WHERE BorderImportLicenceItem.BorderImportLicenceId=pg.__k_Id) Amount,
        (SELECT top 1 BorderImportLicenceItem.HSCode FROM BorderImportLicenceItem
		WHERE BorderImportLicenceItem.BorderImportLicenceId=pg.__k_Id) HSCode,
        @__total AS TotalCount
        FROM (
            SELECT BorderImportLicence.Status,
BorderImportLicence.ApplyType,
BorderImportLicence.ApplicationDate,
BorderImportLicence.IssuedDate LicenceDate,
BorderImportLicence.ApplicationNo,
section.Code SectionCode,
section.Name SectionName,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
BorderImportLicence.CommodityType,
(SELECT method.Name FROM dbo.ExportImportMethod AS method WHERE method.Id = BorderImportLicence.ExportImportMethodId) AS TradeMethod,
BorderImportLicence.Id AS __k_Id
            FROM BorderImportLicence
		INNER JOIN PaThaKa ON BorderImportLicence.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderImportLicence.ExportImportSectionId = section.Id
		WHERE (BorderImportLicence.Status=''Pending'' or BorderImportLicence.Status=''Reject'')
		AND (BorderImportLicence.ApplicationDate>=@FromDate AND BorderImportLicence.ApplicationDate<=@ToDate)
		AND BorderImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
            ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
        ) pg
        ORDER BY ' + @ob + N'
        OPTION (RECOMPILE);';

        EXEC sp_executesql @borderSql,
            N'@FromDate datetime, @ToDate datetime, @ExportImportSectionId int, @off bigint, @ps bigint',
            @FromDate=@FromDate,
            @ToDate=@ToDate,
            @ExportImportSectionId=@ExportImportSectionId,
            @off=@off,
            @ps=@ps;
        RETURN;
    END

    -- TotalCount only when requested, computed over the UN-paged base (no subqueries) as a separate scalar.
    DECLARE @cntpart nvarchar(max) = CASE WHEN @IncludeTotalCount = 1
        THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM ImportLicence
		INNER JOIN PaThaKa ON ImportLicence.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON ImportLicence.ExportImportSectionId = section.Id
		WHERE (ImportLicence.Status=''Pending'' or ImportLicence.Status=''Reject'')
		AND (ImportLicence.ApplicationDate>=@FromDate AND ImportLicence.ApplicationDate<=@ToDate)
		AND ImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END) OPTION (RECOMPILE); '
        ELSE N'DECLARE @__total int = NULL; ' END;

    DECLARE @sql nvarchar(max) = @cntpart + N'SELECT pg.*,(SELECT top 1 currency.Code FROM ImportLicenceItem
		INNER JOIN Currency currency ON ImportLicenceItem.CurrencyId = currency.Id
		WHERE ImportLicenceItem.ImportLicenceId=pg.__k_Id) Currency,
        (SELECT top 1 ImportLicenceItem.Description FROM ImportLicenceItem
		WHERE ImportLicenceItem.ImportLicenceId=pg.__k_Id) AdditionalDescription,
        (SELECT ISNULL(SUM(ImportLicenceItem.Amount),0) FROM ImportLicenceItem
		WHERE ImportLicenceItem.ImportLicenceId=pg.__k_Id) Amount,
        (SELECT top 1 ImportLicenceItem.HSCode FROM ImportLicenceItem
		WHERE ImportLicenceItem.ImportLicenceId=pg.__k_Id) HSCode, @__total AS TotalCount
    FROM (
        SELECT ImportLicence.Status,
ImportLicence.ApplyType,
ImportLicence.ApplicationDate,
ImportLicence.IssuedDate LicenceDate,
ImportLicence.ApplicationNo,
section.Code SectionCode,
section.Name SectionName,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
ImportLicence.CommodityType,
(SELECT method.Name FROM dbo.ExportImportMethod AS method WHERE method.Id = ImportLicence.ExportImportMethodId) AS TradeMethod,
ImportLicence.Id AS __k_Id
        FROM ImportLicence
		INNER JOIN PaThaKa ON ImportLicence.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON ImportLicence.ExportImportSectionId = section.Id
		WHERE (ImportLicence.Status=''Pending'' or ImportLicence.Status=''Reject'')
		AND (ImportLicence.ApplicationDate>=@FromDate AND ImportLicence.ApplicationDate<=@ToDate)
		AND ImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
        ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
    ) pg
    ORDER BY ' + @ob + N'
    OPTION (RECOMPILE);';

    EXEC sp_executesql @sql, N'@FromDate datetime, @ToDate datetime, @FormType nvarchar(50), @ExportImportSectionId int, @off bigint, @ps bigint', @FromDate=@FromDate, @ToDate=@ToDate, @FormType=@FormType, @ExportImportSectionId=@ExportImportSectionId, @off=@off, @ps=@ps;
END
