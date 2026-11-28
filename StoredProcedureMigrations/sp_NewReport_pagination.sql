CREATE OR ALTER PROCEDURE [dbo].[sp_NewReport_pagination]
    @FormType nvarchar(50) = N'',
    @FromDate datetime = NULL,
    @ToDate datetime = NULL,
    @ExportImportSectionId int = 0,
    @CompanyRegistrationNo nvarchar(50) = N'',
    @SakhanId int = 0,
    @auto nvarchar(50) = N'',
    @SortColumn nvarchar(128) = NULL,
    @SortOrder nvarchar(4) = NULL,
    @PageIndex int = NULL,
    @PageSize int = NULL,
    @IncludeTotalCount bit = 1,
    @quota nvarchar(50) = N''
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
    IF @SortColumn IS NOT NULL AND @SortColumn IN (N'TradeMethod', N'Date', N'SectionCode', N'SectionName', N'OldLicenceNo', N'LicenceNo', N'sDate', N'ApplicationNo', N'ApplicationDate', N'LicenceDate', N'Remark', N'CompanyRegistrationNo', N'CompanyName', N'UnitLevel', N'StreetNumberStreetName', N'QuarterCityTownship', N'State', N'Country', N'PostalCode', N'auto', N'quota', N'CommodityType')
    BEGIN
        SET @ob = QUOTENAME(@SortColumn) + N' ' + @dir;
        IF @SortColumn <> N'Date' SET @ob += N', [Date] ASC';
        IF @SortColumn <> N'LicenceNo' SET @ob += N', [LicenceNo] ASC';
    END
    ELSE
        SET @ob = N'[Date] ASC, [LicenceNo] ASC';

    DECLARE @cntpart nvarchar(max);
    DECLARE @sql nvarchar(max);

    -- TotalCount only when requested, computed over the UN-paged base (no subqueries) as a separate scalar.
    IF @FormType = N'Import Permit'
    BEGIN
        SET @cntpart = CASE WHEN @IncludeTotalCount = 1
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM ImportPermit
		INNER JOIN PaThaKa ON ImportPermit.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON ImportPermit.ExportImportSectionId = section.Id
		WHERE ApplyType=''New'' AND ImportPermit.Status=''Approved''
		AND (ImportPermit.CreatedDate>=@FromDate AND ImportPermit.CreatedDate<=@ToDate)
		AND ImportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ImportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END) OPTION (RECOMPILE); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        -- ImportPermit has no auto/quota columns, so emit those as NULL to keep the result
        -- set matching sp_NewReportRow. CommodityType IS a real ImportPermit column, so
        -- source it (the grid's "Commodity Type" column was showing N/A otherwise).
        SET @sql = @cntpart + N'SELECT pg.*,(SELECT top 1 currency.Code FROM ImportPermitItem
		INNER JOIN Currency currency ON ImportPermitItem.CurrencyId = currency.Id
		WHERE ImportPermitItem.ImportPermitId=pg.__k_Id) Currency,
        (SELECT top 1 HSCode.Code FROM ImportPermitItem
		INNER JOIN HSCode ON ImportPermitItem.HSCodeId = HSCode.Id
		WHERE ImportPermitItem.ImportPermitId=pg.__k_Id) HSCode,
        (SELECT ISNULL(SUM(ImportPermitItem.Amount),0) FROM ImportPermitItem
		WHERE ImportPermitItem.ImportPermitId=pg.__k_Id) Amount, CAST(NULL AS int) SakhanId, CAST(NULL AS nvarchar(50)) SakhanCode, CAST(NULL AS nvarchar(200)) SakhanName, @__total AS TotalCount
    FROM (
        SELECT ImportPermit.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldImportPermitNo OldLicenceNo,
ImportPermitNo LicenceNo,
CONVERT(varchar,ImportPermit.LastDate,103) sDate,
CAST(NULL AS nvarchar(50)) ApplicationNo,
CAST(NULL AS datetime) ApplicationDate,
ImportPermit.IssuedDate LicenceDate,
CAST(NULL AS nvarchar(max)) Remark,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
CAST(NULL AS nvarchar(50)) auto,
CAST(NULL AS nvarchar(50)) quota,
ImportPermit.CommodityType,
CAST(NULL AS nvarchar(200)) AS TradeMethod,
ImportPermit.Id AS __k_Id
        FROM ImportPermit
		INNER JOIN PaThaKa ON ImportPermit.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON ImportPermit.ExportImportSectionId = section.Id
		WHERE ApplyType=''New'' AND ImportPermit.Status=''Approved''
		AND (ImportPermit.CreatedDate>=@FromDate AND ImportPermit.CreatedDate<=@ToDate)
		AND ImportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ImportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
        ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
    ) pg
    ORDER BY ' + @ob + N'
    OPTION (RECOMPILE);';
    END
    ELSE IF @FormType = N'Export Permit'
    BEGIN
        SET @cntpart = CASE WHEN @IncludeTotalCount = 1
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM ExportPermit
		INNER JOIN PaThaKa ON ExportPermit.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON ExportPermit.ExportImportSectionId = section.Id
		WHERE ApplyType=''New'' AND ExportPermit.Status=''Approved''
		AND (ExportPermit.CreatedDate>=@FromDate AND ExportPermit.CreatedDate<=@ToDate)
		AND ExportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ExportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END) OPTION (RECOMPILE); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        -- ExportPermit has no auto/quota columns; emit those as NULL. CommodityType is a
        -- real ExportPermit column (surfaced on the Export Permit New report) so select it.
        SET @sql = @cntpart + N'SELECT pg.*,(SELECT top 1 currency.Code FROM ExportPermitItem
		INNER JOIN Currency currency ON ExportPermitItem.CurrencyId = currency.Id
		WHERE ExportPermitItem.ExportPermitId=pg.__k_Id ORDER BY ExportPermitItem.HSCodeId, ExportPermitItem.ItemNo) Currency,
        (SELECT top 1 HSCode.Code FROM ExportPermitItem
		INNER JOIN HSCode ON ExportPermitItem.HSCodeId = HSCode.Id
		WHERE ExportPermitItem.ExportPermitId=pg.__k_Id ORDER BY ExportPermitItem.HSCodeId, ExportPermitItem.ItemNo) HSCode,
        (SELECT ISNULL(SUM(ExportPermitItem.Amount),0) FROM ExportPermitItem
		WHERE ExportPermitItem.ExportPermitId=pg.__k_Id) Amount, CAST(NULL AS int) SakhanId, CAST(NULL AS nvarchar(50)) SakhanCode, CAST(NULL AS nvarchar(200)) SakhanName, @__total AS TotalCount
    FROM (
        SELECT ExportPermit.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldExportPermitNo OldLicenceNo,
ExportPermitNo LicenceNo,
CONVERT(varchar,ExportPermit.LastDate,103) sDate,
CAST(NULL AS nvarchar(50)) ApplicationNo,
CAST(NULL AS datetime) ApplicationDate,
ExportPermit.IssuedDate LicenceDate,
CAST(NULL AS nvarchar(max)) Remark,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
CAST(NULL AS nvarchar(50)) auto,
CAST(NULL AS nvarchar(50)) quota,
ExportPermit.CommodityType,
CAST(NULL AS nvarchar(200)) AS TradeMethod,
ExportPermit.Id AS __k_Id
        FROM ExportPermit
		INNER JOIN PaThaKa ON ExportPermit.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON ExportPermit.ExportImportSectionId = section.Id
		WHERE ApplyType=''New'' AND ExportPermit.Status=''Approved''
		AND (ExportPermit.CreatedDate>=@FromDate AND ExportPermit.CreatedDate<=@ToDate)
		AND ExportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ExportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
        ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
    ) pg
    ORDER BY ' + @ob + N'
    OPTION (RECOMPILE);';
    END
    ELSE IF @FormType = N'Export Licence'
    BEGIN
        SET @cntpart = CASE WHEN @IncludeTotalCount = 1
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM ExportLicence
		INNER JOIN PaThaKa ON ExportLicence.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON ExportLicence.ExportImportSectionId = section.Id
		WHERE ApplyType=''New'' AND ExportLicence.Status=''Approved''
		AND ((@FromDate IS NULL) OR ExportLicence.CreatedDate>=@FromDate)
		AND ((@ToDate IS NULL) OR ExportLicence.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND ExportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ExportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND (@auto='''' OR ExportLicence.auto=@auto) OPTION (RECOMPILE); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        SET @sql = @cntpart + N'SELECT pg.*,(SELECT top 1 currency.Code FROM ExportLicenceItem
		INNER JOIN Currency currency ON ExportLicenceItem.CurrencyId = currency.Id
		WHERE ExportLicenceItem.ExportLicenceId=pg.__k_Id) Currency,
        (SELECT top 1 HSCode.Code FROM ExportLicenceItem
		INNER JOIN HSCode ON ExportLicenceItem.HSCodeId = HSCode.Id
		WHERE ExportLicenceItem.ExportLicenceId=pg.__k_Id) HSCode,
        (SELECT ISNULL(SUM(ExportLicenceItem.Amount),0) FROM ExportLicenceItem
		WHERE ExportLicenceItem.ExportLicenceId=pg.__k_Id) Amount, CAST(NULL AS int) SakhanId, CAST(NULL AS nvarchar(50)) SakhanCode, CAST(NULL AS nvarchar(200)) SakhanName, @__total AS TotalCount
    FROM (
        SELECT ExportLicence.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldExportLicenceNo OldLicenceNo,
ExportLicenceNo LicenceNo,
CONVERT(varchar,ExportLicence.LastDate,103) sDate,
CAST(NULL AS nvarchar(50)) ApplicationNo,
CAST(NULL AS datetime) ApplicationDate,
ExportLicence.IssuedDate LicenceDate,
CAST(NULL AS nvarchar(max)) Remark,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
ExportLicence.auto,
CAST(N'''' AS nvarchar(50)) quota,
ExportLicence.CommodityType,
(SELECT method.Name FROM dbo.ExportImportMethod AS method WHERE method.Id = ExportLicence.ExportImportMethodId) AS TradeMethod,
ExportLicence.Id AS __k_Id
        FROM ExportLicence
		INNER JOIN PaThaKa ON ExportLicence.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON ExportLicence.ExportImportSectionId = section.Id
		WHERE ApplyType=''New'' AND ExportLicence.Status=''Approved''
		AND ((@FromDate IS NULL) OR ExportLicence.CreatedDate>=@FromDate)
		AND ((@ToDate IS NULL) OR ExportLicence.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND ExportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ExportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND (@auto='''' OR ExportLicence.auto=@auto)
        ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
    ) pg
    ORDER BY ' + @ob + N'
    OPTION (RECOMPILE);';
    END
    ELSE IF @FormType = N'Border Export Licence'
    BEGIN
        SET @cntpart = CASE WHEN @IncludeTotalCount = 1
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM (
		SELECT BorderExportLicence.Id FROM BorderExportLicence
		INNER JOIN PaThaKa ON BorderExportLicence.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderExportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderExportLicence.SakhanId = sakhan.Id
		WHERE ApplyType=''New'' AND BorderExportLicence.Status=''Approved'' AND CardType=''Pa Tha Ka''
		AND (BorderExportLicence.CreatedDate>=@FromDate AND BorderExportLicence.CreatedDate<=@ToDate)
		AND BorderExportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderExportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderExportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderExportLicence.SakhanId ELSE @SakhanId END)
		AND BorderExportLicence.auto=(CASE WHEN @auto='''' then BorderExportLicence.auto ELSE @auto END)
		UNION ALL
		SELECT BorderExportLicence.Id FROM BorderExportLicence
		INNER JOIN IndividualTrading ON BorderExportLicence.IndividualTradingId = IndividualTrading.Id
		INNER JOIN ExportImportSection section ON BorderExportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderExportLicence.SakhanId = sakhan.Id
		WHERE ApplyType=''New'' AND BorderExportLicence.Status=''Approved'' AND CardType=''Individual Trading''
		AND (BorderExportLicence.CreatedDate>=@FromDate AND BorderExportLicence.CreatedDate<=@ToDate)
		AND BorderExportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderExportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND IndividualTrading.TINNo=(CASE WHEN @CompanyRegistrationNo='''' then IndividualTrading.TINNo ELSE @CompanyRegistrationNo END)
		AND BorderExportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderExportLicence.SakhanId ELSE @SakhanId END)
		AND BorderExportLicence.auto=(CASE WHEN @auto='''' then BorderExportLicence.auto ELSE @auto END)
	) tmp OPTION (RECOMPILE); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        SET @sql = @cntpart + N'SELECT pg.*,(SELECT top 1 currency.Code FROM BorderExportLicenceItem
		INNER JOIN Currency currency ON BorderExportLicenceItem.CurrencyId = currency.Id
		WHERE BorderExportLicenceItem.BorderExportLicenceId=pg.__k_Id) Currency,
        (SELECT top 1 HSCode.Code FROM BorderExportLicenceItem
		INNER JOIN HSCode ON BorderExportLicenceItem.HSCodeId = HSCode.Id
		WHERE BorderExportLicenceItem.BorderExportLicenceId=pg.__k_Id) HSCode,
        (SELECT ISNULL(SUM(BorderExportLicenceItem.Amount),0) FROM BorderExportLicenceItem
		WHERE BorderExportLicenceItem.BorderExportLicenceId=pg.__k_Id) Amount, @__total AS TotalCount
    FROM (
        SELECT * FROM (
        SELECT BorderExportLicence.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldExportLicenceNo OldLicenceNo,
ExportLicenceNo LicenceNo,
CONVERT(varchar,BorderExportLicence.CreatedDate,103) sDate,
CAST(NULL AS nvarchar(50)) ApplicationNo,
CAST(NULL AS datetime) ApplicationDate,
BorderExportLicence.IssuedDate LicenceDate,
CAST(NULL AS nvarchar(max)) Remark,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
BorderExportLicence.auto,
CAST(NULL AS nvarchar(50)) quota,
CAST(NULL AS nvarchar(max)) CommodityType,
sakhan.Id SakhanId,
sakhan.Code SakhanCode,
sakhan.Name SakhanName,
(SELECT method.Name FROM dbo.ExportImportMethod AS method WHERE method.Id = BorderExportLicence.ExportImportMethodId) AS TradeMethod,
BorderExportLicence.Id AS __k_Id
        FROM BorderExportLicence
		INNER JOIN PaThaKa ON BorderExportLicence.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderExportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderExportLicence.SakhanId = sakhan.Id
		WHERE ApplyType=''New'' AND BorderExportLicence.Status=''Approved'' AND CardType=''Pa Tha Ka''
		AND (BorderExportLicence.CreatedDate>=@FromDate AND BorderExportLicence.CreatedDate<=@ToDate)
		AND BorderExportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderExportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderExportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderExportLicence.SakhanId ELSE @SakhanId END)
		AND BorderExportLicence.auto=(CASE WHEN @auto='''' then BorderExportLicence.auto ELSE @auto END)
		UNION ALL
        SELECT BorderExportLicence.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldExportLicenceNo OldLicenceNo,
ExportLicenceNo LicenceNo,
CONVERT(varchar,BorderExportLicence.CreatedDate,103) sDate,
CAST(NULL AS nvarchar(50)) ApplicationNo,
CAST(NULL AS datetime) ApplicationDate,
BorderExportLicence.IssuedDate LicenceDate,
CAST(NULL AS nvarchar(max)) Remark,
IndividualTrading.TINNo CompanyRegistrationNo,
IndividualTrading.Name CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
BorderExportLicence.auto,
CAST(NULL AS nvarchar(50)) quota,
CAST(NULL AS nvarchar(max)) CommodityType,
sakhan.Id SakhanId,
sakhan.Code SakhanCode,
sakhan.Name SakhanName,
(SELECT method.Name FROM dbo.ExportImportMethod AS method WHERE method.Id = BorderExportLicence.ExportImportMethodId) AS TradeMethod,
BorderExportLicence.Id AS __k_Id
        FROM BorderExportLicence
		INNER JOIN IndividualTrading ON BorderExportLicence.IndividualTradingId = IndividualTrading.Id
		INNER JOIN ExportImportSection section ON BorderExportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderExportLicence.SakhanId = sakhan.Id
		WHERE ApplyType=''New'' AND BorderExportLicence.Status=''Approved'' AND CardType=''Individual Trading''
		AND (BorderExportLicence.CreatedDate>=@FromDate AND BorderExportLicence.CreatedDate<=@ToDate)
		AND BorderExportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderExportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND IndividualTrading.TINNo=(CASE WHEN @CompanyRegistrationNo='''' then IndividualTrading.TINNo ELSE @CompanyRegistrationNo END)
		AND BorderExportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderExportLicence.SakhanId ELSE @SakhanId END)
		AND BorderExportLicence.auto=(CASE WHEN @auto='''' then BorderExportLicence.auto ELSE @auto END)
        ) u
        ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
    ) pg
    ORDER BY ' + @ob + N'
    OPTION (RECOMPILE);';
    END
    ELSE IF @FormType = N'Border Import Licence'
    BEGIN
        SET @cntpart = N'DECLARE @__total int = NULL; ';

        SET @sql = @cntpart + N'SELECT
        pg.Date,
        pg.SectionCode,
        pg.SectionName,
        pg.OldLicenceNo,
        pg.LicenceNo,
        pg.sDate,
        pg.ApplicationNo,
        pg.ApplicationDate,
        pg.LicenceDate,
        pg.Remark,
        pg.CompanyRegistrationNo,
        pg.CompanyName,
        pg.UnitLevel,
        pg.StreetNumberStreetName,
        pg.QuarterCityTownship,
        pg.State,
        pg.Country,
        pg.PostalCode,
        pg.auto,
        pg.quota,
        pg.CommodityType,
        pg.SakhanId,
        pg.SakhanCode,
        pg.SakhanName,
        pg.TradeMethod,
        pg.__k_Id,
        (SELECT top 1 currency.Code FROM BorderImportLicenceItem
		INNER JOIN Currency currency ON BorderImportLicenceItem.CurrencyId = currency.Id
		WHERE BorderImportLicenceItem.BorderImportLicenceId=pg.__k_Id) Currency,
        (SELECT top 1 HSCode.Code FROM BorderImportLicenceItem
		INNER JOIN HSCode ON BorderImportLicenceItem.HSCodeId = HSCode.Id
		WHERE BorderImportLicenceItem.BorderImportLicenceId=pg.__k_Id) HSCode,
        (SELECT ISNULL(SUM(BorderImportLicenceItem.Amount),0) FROM BorderImportLicenceItem
		WHERE BorderImportLicenceItem.BorderImportLicenceId=pg.__k_Id) Amount, pg.__TotalCount AS TotalCount
    FROM (
        SELECT counted.* FROM (
        SELECT u.*, COUNT(*) OVER() AS __TotalCount FROM (
        SELECT BorderImportLicence.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldImportLicenceNo OldLicenceNo,
ImportLicenceNo LicenceNo,
CONVERT(varchar,BorderImportLicence.CreatedDate,103) sDate,
CAST(NULL AS nvarchar(50)) ApplicationNo,
CAST(NULL AS datetime) ApplicationDate,
BorderImportLicence.IssuedDate LicenceDate,
CAST(NULL AS nvarchar(max)) Remark,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
BorderImportLicence.auto,
BorderImportLicence.quota,
CAST(NULL AS nvarchar(max)) CommodityType,
sakhan.Id SakhanId,
sakhan.Code SakhanCode,
sakhan.Name SakhanName,
(SELECT method.Name FROM dbo.ExportImportMethod AS method WHERE method.Id = BorderImportLicence.ExportImportMethodId) AS TradeMethod,
BorderImportLicence.Id AS __k_Id
        FROM BorderImportLicence
		INNER JOIN PaThaKa ON BorderImportLicence.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderImportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderImportLicence.SakhanId = sakhan.Id
		WHERE ApplyType=''New'' AND BorderImportLicence.Status=''Approved'' AND CardType=''Pa Tha Ka''
		AND ((@FromDate IS NULL) OR BorderImportLicence.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR BorderImportLicence.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderImportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderImportLicence.SakhanId ELSE @SakhanId END)
		AND (@auto='''' OR BorderImportLicence.auto=@auto)
		UNION ALL
        SELECT BorderImportLicence.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldImportLicenceNo OldLicenceNo,
ImportLicenceNo LicenceNo,
CONVERT(varchar,BorderImportLicence.CreatedDate,103) sDate,
CAST(NULL AS nvarchar(50)) ApplicationNo,
CAST(NULL AS datetime) ApplicationDate,
BorderImportLicence.IssuedDate LicenceDate,
CAST(NULL AS nvarchar(max)) Remark,
IndividualTrading.TINNo CompanyRegistrationNo,
IndividualTrading.Name CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
BorderImportLicence.auto,
BorderImportLicence.quota,
CAST(NULL AS nvarchar(max)) CommodityType,
sakhan.Id SakhanId,
sakhan.Code SakhanCode,
sakhan.Name SakhanName,
(SELECT method.Name FROM dbo.ExportImportMethod AS method WHERE method.Id = BorderImportLicence.ExportImportMethodId) AS TradeMethod,
BorderImportLicence.Id AS __k_Id
        FROM BorderImportLicence
		INNER JOIN IndividualTrading ON BorderImportLicence.IndividualTradingId = IndividualTrading.Id
		INNER JOIN ExportImportSection section ON BorderImportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderImportLicence.SakhanId = sakhan.Id
		WHERE ApplyType=''New'' AND BorderImportLicence.Status=''Approved'' AND CardType=''Individual Trading''
		AND ((@FromDate IS NULL) OR BorderImportLicence.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR BorderImportLicence.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND IndividualTrading.TINNo=(CASE WHEN @CompanyRegistrationNo='''' then IndividualTrading.TINNo ELSE @CompanyRegistrationNo END)
		AND BorderImportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderImportLicence.SakhanId ELSE @SakhanId END)
		AND (@auto='''' OR BorderImportLicence.auto=@auto)
        ) u
        ) counted
        ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
    ) pg
    ORDER BY ' + @ob + N'
    OPTION (RECOMPILE);';
    END
    ELSE IF @FormType = N'Border Export Permit'
    BEGIN
        SET @cntpart = CASE WHEN @IncludeTotalCount = 1
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM BorderExportPermit
		INNER JOIN PaThaKa ON BorderExportPermit.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderExportPermit.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderExportPermit.SakhanId = sakhan.Id
		WHERE ApplyType=''New'' AND BorderExportPermit.Status=''Approved''
		AND ((@FromDate IS NULL) OR BorderExportPermit.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR BorderExportPermit.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderExportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderExportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderExportPermit.SakhanId=(CASE WHEN @SakhanId=0 then BorderExportPermit.SakhanId ELSE @SakhanId END) OPTION (RECOMPILE); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        SET @sql = @cntpart + N'SELECT pg.*,(SELECT top 1 currency.Code FROM BorderExportPermitItem
		INNER JOIN Currency currency ON BorderExportPermitItem.CurrencyId = currency.Id
		WHERE BorderExportPermitItem.BorderExportPermitId=pg.__k_Id) Currency,
        (SELECT top 1 HSCode.Code FROM BorderExportPermitItem
		INNER JOIN HSCode ON BorderExportPermitItem.HSCodeId = HSCode.Id
		WHERE BorderExportPermitItem.BorderExportPermitId=pg.__k_Id) HSCode,
        (SELECT ISNULL(SUM(BorderExportPermitItem.Amount),0) FROM BorderExportPermitItem
		WHERE BorderExportPermitItem.BorderExportPermitId=pg.__k_Id) Amount, @__total AS TotalCount
    FROM (
        SELECT BorderExportPermit.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldExportPermitNo OldLicenceNo,
ExportPermitNo LicenceNo,
CONVERT(varchar,BorderExportPermit.CreatedDate,103) sDate,
CAST(NULL AS nvarchar(50)) ApplicationNo,
CAST(NULL AS datetime) ApplicationDate,
BorderExportPermit.IssuedDate LicenceDate,
CAST(NULL AS nvarchar(max)) Remark,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
CAST(NULL AS nvarchar(50)) auto,
CAST(NULL AS nvarchar(50)) quota,
BorderExportPermit.CommodityType,
sakhan.Id SakhanId,
sakhan.Code SakhanCode,
sakhan.Name SakhanName,
CAST(NULL AS nvarchar(200)) AS TradeMethod,
BorderExportPermit.Id AS __k_Id
        FROM BorderExportPermit
		INNER JOIN PaThaKa ON BorderExportPermit.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderExportPermit.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderExportPermit.SakhanId = sakhan.Id
		WHERE ApplyType=''New'' AND BorderExportPermit.Status=''Approved''
		AND ((@FromDate IS NULL) OR BorderExportPermit.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR BorderExportPermit.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderExportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderExportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
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
		INNER JOIN PaThaKa ON BorderImportPermit.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderImportPermit.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderImportPermit.SakhanId = sakhan.Id
		WHERE ApplyType=''New'' AND BorderImportPermit.Status=''Approved''
		AND ((@FromDate IS NULL) OR BorderImportPermit.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR BorderImportPermit.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderImportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderImportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderImportPermit.SakhanId=(CASE WHEN @SakhanId=0 then BorderImportPermit.SakhanId ELSE @SakhanId END)
	) tmp OPTION (RECOMPILE); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        SET @sql = @cntpart + N'SELECT pg.*,(SELECT top 1 currency.Code FROM BorderImportPermitItem
		INNER JOIN Currency currency ON BorderImportPermitItem.CurrencyId = currency.Id
		WHERE BorderImportPermitItem.BorderImportPermitId=pg.__k_Id) Currency,
        (SELECT top 1 HSCode.Code FROM BorderImportPermitItem
		INNER JOIN HSCode ON BorderImportPermitItem.HSCodeId = HSCode.Id
		WHERE BorderImportPermitItem.BorderImportPermitId=pg.__k_Id) HSCode,
        (SELECT ISNULL(SUM(BorderImportPermitItem.Amount),0) FROM BorderImportPermitItem
		WHERE BorderImportPermitItem.BorderImportPermitId=pg.__k_Id) Amount, @__total AS TotalCount
    FROM (
        SELECT * FROM (
        SELECT BorderImportPermit.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldImportPermitNo OldLicenceNo,
ImportPermitNo LicenceNo,
CONVERT(varchar,BorderImportPermit.CreatedDate,103) sDate,
CAST(NULL AS nvarchar(50)) ApplicationNo,
CAST(NULL AS datetime) ApplicationDate,
BorderImportPermit.IssuedDate LicenceDate,
CAST(NULL AS nvarchar(max)) Remark,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
CAST(NULL AS nvarchar(50)) auto,
CAST(NULL AS nvarchar(50)) quota,
CAST(NULL AS nvarchar(max)) CommodityType,
sakhan.Id SakhanId,
sakhan.Code SakhanCode,
sakhan.Name SakhanName,
CAST(NULL AS nvarchar(200)) AS TradeMethod,
BorderImportPermit.Id AS __k_Id
        FROM BorderImportPermit
		INNER JOIN PaThaKa ON BorderImportPermit.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderImportPermit.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderImportPermit.SakhanId = sakhan.Id
		WHERE ApplyType=''New'' AND BorderImportPermit.Status=''Approved''
		AND ((@FromDate IS NULL) OR BorderImportPermit.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR BorderImportPermit.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderImportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderImportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
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
        -- Import Licence New listing. The date window is UNCONDITIONAL here, exactly as in
        -- legacy Tradenet 2.0 (Business/Reports.cs -> dbo.sp_NewReport, a plain
        -- CreatedDate BETWEEN @FromDate AND @ToDate conjunct with both dates required on the form).
        -- 2026-09-17: reverted the 2026-06-19 "skip the dates when @CompanyRegistrationNo is given"
        -- patch. It made a reg-no search return every licence since the system began -- the customer
        -- asked for Jan-2025 + reg-no 101103471 and got 1386 rows dated from 2021, where the
        -- Import Licence Company List report (which always honours the window) correctly returns 34.
        -- Unlike Director List, this report had NO date-independent "by reg-no" twin in Tradenet 2.0,
        -- so there is nothing here to inherit a date-skip from. If a reg-no lookup comes back empty,
        -- that is the page's default current-month range, not this predicate -- widen the range.
        -- Both the COUNT and the paged SELECT must keep the same predicate so TotalCount == rows shown.
        -- (Comment kept OUT of the N'...' literal to avoid the nvarchar(4000) truncation trap.)
        SET @cntpart = CASE WHEN @IncludeTotalCount = 1
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM ImportLicence
		INNER JOIN PaThaKa ON ImportLicence.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON ImportLicence.ExportImportSectionId = section.Id
		WHERE ApplyType=''New'' AND ImportLicence.Status=''Approved''
		AND (ImportLicence.CreatedDate>=@FromDate AND ImportLicence.CreatedDate<=@ToDate)
		AND ImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND (@auto='''' OR ImportLicence.auto=@auto)
		AND (@quota='''' OR ImportLicence.quota=@quota) OPTION (RECOMPILE); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        SET @sql = @cntpart + N'SELECT pg.*,(SELECT top 1 currency.Code FROM ImportLicenceItem
		INNER JOIN Currency currency ON ImportLicenceItem.CurrencyId = currency.Id
		WHERE ImportLicenceItem.ImportLicenceId=pg.__k_Id) Currency,
        (SELECT top 1 HSCode.Code FROM ImportLicenceItem
		INNER JOIN HSCode ON ImportLicenceItem.HSCodeId = HSCode.Id
		WHERE ImportLicenceItem.ImportLicenceId=pg.__k_Id) HSCode,
        (SELECT ISNULL(SUM(ImportLicenceItem.Amount),0) FROM ImportLicenceItem
		WHERE ImportLicenceItem.ImportLicenceId=pg.__k_Id) Amount, CAST(NULL AS int) SakhanId, CAST(NULL AS nvarchar(50)) SakhanCode, CAST(NULL AS nvarchar(200)) SakhanName, @__total AS TotalCount
    FROM (
        SELECT ImportLicence.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldImportLicenceNo OldLicenceNo,
ImportLicenceNo LicenceNo,
CONVERT(varchar,ImportLicence.LastDate,103) sDate,
ImportLicence.ApplicationNo,
ImportLicence.ApplicationDate,
ImportLicence.IssuedDate LicenceDate,
ImportLicence.Remark,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
ImportLicence.auto,
ImportLicence.quota,
ImportLicence.CommodityType,
(SELECT method.Name FROM dbo.ExportImportMethod AS method WHERE method.Id = ImportLicence.ExportImportMethodId) AS TradeMethod,
ImportLicence.Id AS __k_Id
        FROM ImportLicence
		INNER JOIN PaThaKa ON ImportLicence.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON ImportLicence.ExportImportSectionId = section.Id
		WHERE ApplyType=''New'' AND ImportLicence.Status=''Approved''
		AND (ImportLicence.CreatedDate>=@FromDate AND ImportLicence.CreatedDate<=@ToDate)
		AND ImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND (@auto='''' OR ImportLicence.auto=@auto)
		AND (@quota='''' OR ImportLicence.quota=@quota)
        ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
    ) pg
    ORDER BY ' + @ob + N'
    OPTION (RECOMPILE);';
    END

    EXEC sp_executesql @sql, N'@FormType nvarchar(50), @FromDate datetime, @ToDate datetime, @ExportImportSectionId int, @CompanyRegistrationNo nvarchar(50), @SakhanId int, @auto nvarchar(50), @quota nvarchar(50), @off bigint, @ps bigint', @FormType=@FormType, @FromDate=@FromDate, @ToDate=@ToDate, @ExportImportSectionId=@ExportImportSectionId, @CompanyRegistrationNo=@CompanyRegistrationNo, @SakhanId=@SakhanId, @auto=@auto, @quota=@quota, @off=@off, @ps=@ps;
END
