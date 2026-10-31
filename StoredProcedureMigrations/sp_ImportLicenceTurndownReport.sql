-- Deploy these procedures before deploying the report API.
-- MessageHistory also stores reopen events and remarks cleared after checking.
-- Only currently rejected applications and events with recorded reasons belong
-- in this report; excluded history must not contribute to dates or counts.
CREATE OR ALTER PROCEDURE dbo.sp_ImportLicenceTurndownReport_pagination
    @FormType nvarchar(50),
    @FromDate datetime,
    @ToDate datetime,
    @ExportImportSectionId int = 0,
    @CompanyRegistrationNo nvarchar(50) = N'',
    @CompanyName nvarchar(200) = N'',
    @ApplyType nvarchar(20) = N'',
    @SortColumn nvarchar(128) = N'TurndownDate',
    @SortOrder nvarchar(4) = N'DESC',
    @PageIndex int = 0,
    @PageSize int = NULL,
    @IncludeTotalCount bit = 0,
    @FilterColumn nvarchar(128) = NULL,
    @FilterQuery nvarchar(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @FormType NOT IN (N'Import Licence', N'Border Import Licence') OR @FormType IS NULL
        THROW 50001, 'Unsupported import licence form type.', 1;
    IF @FromDate IS NULL OR @ToDate IS NULL OR @ToDate < @FromDate OR @ToDate >= '99991231'
        THROW 50002, 'A valid turndown date range is required.', 1;

    DECLARE @licence sysname = CASE @FormType WHEN N'Import Licence' THEN N'ImportLicence' ELSE N'BorderImportLicence' END;
    DECLARE @item sysname = @licence + N'Item';
    DECLARE @foreignKey sysname = @licence + N'Id';
    DECLARE @endDate datetime = DATEADD(day, 1, CONVERT(date, @ToDate));

    SELECT DISTINCT h.TransactionId INTO #Candidates
    FROM dbo.MessageHistory h
    CROSS APPLY (VALUES (NULLIF(LTRIM(RTRIM(
        REPLACE(REPLACE(REPLACE(REPLACE(h.Remark, NCHAR(9), N' '), NCHAR(10), N' '), NCHAR(13), N' '), NCHAR(160), N' ')
    )), N''))) AS reason(RemarkText)
    WHERE h.FormType = @FormType
      AND h.CreatedDate >= CONVERT(date, @FromDate) AND h.CreatedDate < @endDate
      AND reason.RemarkText IS NOT NULL AND reason.RemarkText <> N'Re Open'
      AND ((@FormType = N'Import Licence' AND EXISTS (
            SELECT 1 FROM dbo.ImportLicence l WHERE l.Id = h.TransactionId AND l.Status = N'Reject'))
        OR (@FormType = N'Border Import Licence' AND EXISTS (
            SELECT 1 FROM dbo.BorderImportLicence l WHERE l.Id = h.TransactionId AND l.Status = N'Reject')))
    OPTION (RECOMPILE);
    CREATE UNIQUE CLUSTERED INDEX IX_Candidates ON #Candidates(TransactionId);

    -- Date filters determine membership, not the count or latest event.
    SELECT h.TransactionId, h.Remark, h.CreatedDate,
        COUNT(*) OVER (PARTITION BY h.TransactionId) AS TurndownCount,
        ROW_NUMBER() OVER (PARTITION BY h.TransactionId ORDER BY h.CreatedDate DESC, h.Id DESC) AS rn
    INTO #History
    FROM dbo.MessageHistory h
    INNER JOIN #Candidates c ON c.TransactionId = h.TransactionId
    CROSS APPLY (VALUES (NULLIF(LTRIM(RTRIM(
        REPLACE(REPLACE(REPLACE(REPLACE(h.Remark, NCHAR(9), N' '), NCHAR(10), N' '), NCHAR(13), N' '), NCHAR(160), N' ')
    )), N''))) AS reason(RemarkText)
    WHERE h.FormType = @FormType
      AND reason.RemarkText IS NOT NULL AND reason.RemarkText <> N'Re Open';

    DECLARE @columns TABLE (Name sysname PRIMARY KEY);
    INSERT @columns VALUES (N'SectionCode'),(N'Status'),(N'ApplyType'),(N'ApplicationNo'),
        (N'ApplicationDate'),(N'LicenceNo'),(N'LicenceDate'),(N'CompanyRegistrationNo'),
        (N'CompanyName'),(N'CommodityType'),(N'HSCode'),(N'AdditionalDescription'),
        (N'Currency'),(N'Amount'),(N'TurndownCount'),(N'TurndownDate'),(N'TurndownRemark');
    IF NOT EXISTS (SELECT 1 FROM @columns WHERE Name = @SortColumn)
        SET @SortColumn = N'TurndownDate';
    DECLARE @order nvarchar(400) = QUOTENAME(@SortColumn)
        + CASE WHEN UPPER(@SortOrder) = N'ASC' THEN N' ASC' ELSE N' DESC' END + N', Id ASC';
    DECLARE @filter nvarchar(500) = N'';
    IF NULLIF(@FilterQuery, N'') IS NOT NULL AND EXISTS (SELECT 1 FROM @columns WHERE Name = @FilterColumn)
        SET @filter = N' WHERE CHARINDEX(@FilterQuery, CONVERT(nvarchar(max), ' + QUOTENAME(@FilterColumn) + N', 126)) > 0';
    DECLARE @offset bigint = CASE WHEN @PageSize > 0 AND @PageIndex > 0 THEN CAST(@PageIndex AS bigint) * @PageSize ELSE 0 END;
    DECLARE @take bigint = CASE WHEN ISNULL(@PageSize, 0) <= 0 THEN 2147483647
        ELSE CAST(@PageSize AS bigint) + CASE WHEN @IncludeTotalCount = 0 THEN 1 ELSE 0 END END;

    -- Identifiers come exclusively from the two fixed form types and column whitelist.
    -- All user values are bound parameters, including text used in column searches.
    DECLARE @sql nvarchar(max) = N'
    SELECT RTRIM(l.Id) AS Id, s.Code AS SectionCode, N''Turndown'' AS Status,
        l.ApplyType, l.ApplicationNo, l.ApplicationDate, l.ImportLicenceNo AS LicenceNo,
        l.IssuedDate AS LicenceDate, p.CompanyRegistrationNo, p.CompanyName, l.CommodityType,
        firstItem.HSCode, firstItem.Description AS AdditionalDescription, currency.Code AS Currency,
        ISNULL(total.Amount, CONVERT(decimal(38,4), 0)) AS Amount,
        h.TurndownCount, h.CreatedDate AS TurndownDate,
        LTRIM(RTRIM(h.Remark)) AS TurndownRemark
    INTO #Report
    FROM dbo.' + QUOTENAME(@licence) + N' l
    INNER JOIN #History h ON h.TransactionId = l.Id AND h.rn = 1
    LEFT JOIN dbo.PaThaKa p ON p.Id = l.PaThaKaId
    LEFT JOIN dbo.ExportImportSection s ON s.Id = l.ExportImportSectionId
    OUTER APPLY (SELECT TOP (1) i.HSCode, i.Description, i.CurrencyId
        FROM dbo.' + QUOTENAME(@item) + N' i WHERE i.' + QUOTENAME(@foreignKey) + N' = l.Id
        ORDER BY i.ItemNo, i.UniqueId, i.Id) firstItem
    LEFT JOIN dbo.Currency currency ON currency.Id = firstItem.CurrencyId
    OUTER APPLY (SELECT SUM(i.Amount) AS Amount FROM dbo.' + QUOTENAME(@item) + N' i
        WHERE i.' + QUOTENAME(@foreignKey) + N' = l.Id) total
    WHERE l.Status = N''Reject''
      AND (@ExportImportSectionId = 0 OR l.ExportImportSectionId = @ExportImportSectionId)
      AND (@CompanyRegistrationNo = N'''' OR p.CompanyRegistrationNo = @CompanyRegistrationNo)
      AND (@CompanyName = N'''' OR CHARINDEX(@CompanyName, p.CompanyName) > 0)
      AND (@ApplyType = N'''' OR l.ApplyType = @ApplyType)
    OPTION (RECOMPILE);

    DECLARE @count int = NULL;
    IF @IncludeTotalCount = 1 SELECT @count = COUNT(*) FROM #Report' + @filter + N';
    SELECT *, @count AS TotalCount FROM #Report' + @filter + N'
    ORDER BY ' + @order + N' OFFSET @offset ROWS FETCH NEXT @take ROWS ONLY;';

    EXEC sys.sp_executesql @sql,
        N'@ExportImportSectionId int, @CompanyRegistrationNo nvarchar(50), @CompanyName nvarchar(200),
          @ApplyType nvarchar(20), @FilterQuery nvarchar(500), @IncludeTotalCount bit, @offset bigint, @take bigint',
        @ExportImportSectionId, @CompanyRegistrationNo, @CompanyName, @ApplyType,
        @FilterQuery, @IncludeTotalCount, @offset, @take;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_ImportLicenceTurndownHistory
    @FormType nvarchar(50), @TransactionId char(36)
AS
BEGIN
    SET NOCOUNT ON;
    IF @FormType NOT IN (N'Import Licence', N'Border Import Licence') OR @FormType IS NULL
        THROW 50001, 'Unsupported import licence form type.', 1;
    SELECT RTRIM(h.Id) AS Id, h.CreatedDate, h.Remark
    FROM dbo.MessageHistory h
    CROSS APPLY (VALUES (NULLIF(LTRIM(RTRIM(
        REPLACE(REPLACE(REPLACE(REPLACE(h.Remark, NCHAR(9), N' '), NCHAR(10), N' '), NCHAR(13), N' '), NCHAR(160), N' ')
    )), N''))) AS reason(RemarkText)
    WHERE h.TransactionId = @TransactionId AND h.FormType = @FormType
      AND reason.RemarkText IS NOT NULL AND reason.RemarkText <> N'Re Open'
      AND ((@FormType = N'Import Licence' AND EXISTS (
            SELECT 1 FROM dbo.ImportLicence l WHERE l.Id = h.TransactionId AND l.Status = N'Reject'))
        OR (@FormType = N'Border Import Licence' AND EXISTS (
            SELECT 1 FROM dbo.BorderImportLicence l WHERE l.Id = h.TransactionId AND l.Status = N'Reject')))
    ORDER BY h.CreatedDate DESC, h.Id DESC
    OPTION (RECOMPILE);
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_ImportLicenceTurndownApplyTypes @FormType nvarchar(50)
AS
BEGIN
    SET NOCOUNT ON;
    IF @FormType = N'Import Licence'
        SELECT DISTINCT ApplyType AS Value FROM dbo.ImportLicence WHERE NULLIF(LTRIM(RTRIM(ApplyType)), N'') IS NOT NULL ORDER BY Value;
    ELSE IF @FormType = N'Border Import Licence'
        SELECT DISTINCT ApplyType AS Value FROM dbo.BorderImportLicence WHERE NULLIF(LTRIM(RTRIM(ApplyType)), N'') IS NOT NULL ORDER BY Value;
    ELSE THROW 50001, 'Unsupported import licence form type.', 1;
END;
GO
