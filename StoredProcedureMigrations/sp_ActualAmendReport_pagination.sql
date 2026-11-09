CREATE OR ALTER PROCEDURE [dbo].[sp_ActualAmendReport_pagination]
    @FormType nvarchar(50) = N'',
    @FromDate datetime = NULL,
    @ToDate datetime = NULL,
    @ExportImportSectionId int = 0,
    @AmendRemarkId int = 0,
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

    -- Date window mirrors the original dbo.sp_ActualAmendReport exactly: CreatedDate >= @FromDate AND CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)),
    -- i.e. the whole selected calendar day. Controllers pass ToDate as request.ToDate.Date.
    -- CONVERT(date, ...) is what makes this safe: the plain '< DATEADD(day, 1, @ToDate)' form admits
    -- the whole NEXT day whenever @ToDate carries a time (commit e88c13e; Actual Amend reports showed one extra day).

    DECLARE @ps bigint = CASE
        WHEN ISNULL(@PageSize,0) <= 0 THEN 9223372036854775807
        WHEN @IncludeTotalCount = 0 THEN @PageSize + 1
        ELSE @PageSize END;
    DECLARE @off bigint = CASE WHEN ISNULL(@PageSize,0) <= 0 THEN 0 ELSE ISNULL(@PageIndex,0) * CAST(@PageSize AS bigint) END;
    DECLARE @dir nvarchar(4) = CASE WHEN UPPER(ISNULL(@SortOrder,'ASC')) = 'DESC' THEN 'DESC' ELSE 'ASC' END;

    DECLARE @ob nvarchar(400);
    IF @SortColumn IS NOT NULL AND @SortColumn IN (N'Date', N'SectionCode', N'SectionName', N'OldLicenceNo', N'LicenceNo', N'sDate', N'CompanyRegistrationNo', N'CompanyName', N'UnitLevel', N'StreetNumberStreetName', N'QuarterCityTownship', N'State', N'Country', N'PostalCode')
        SET @ob = QUOTENAME(@SortColumn) + N' ' + @dir
            + CASE WHEN @SortColumn = N'Date' THEN N'' ELSE N', [Date] ASC' END
            + CASE WHEN @SortColumn = N'LicenceNo' THEN N'' ELSE N', [LicenceNo] ASC' END;
    ELSE
        SET @ob = N'[Date] ASC, [LicenceNo] ASC';

    DECLARE @cntpart nvarchar(max);
    DECLARE @sql nvarchar(max);

    -- TotalCount only when requested, computed over the UN-paged base (no subqueries) as a separate scalar.
    IF @FormType = N'Export Licence'
    BEGIN
        SET @cntpart = CASE WHEN @IncludeTotalCount = 1
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM ExportLicence
		INNER JOIN PaThaKa ON ExportLicence.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON ExportLicence.ExportImportSectionId = section.Id
		WHERE ApplyType=''Actual Amend'' AND ExportLicence.Status=''Approved''
		AND ((@FromDate IS NULL) OR ExportLicence.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR ExportLicence.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND ExportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ExportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND ExportLicence.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then ExportLicence.AmendRemarkId ELSE @AmendRemarkId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END) OPTION (RECOMPILE); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        SET @sql = @cntpart + N'SELECT pg.*,
        (SELECT top 1 ExportLicenceItem.Description FROM ExportLicenceItem
            WHERE ExportLicenceItem.ExportLicenceId=pg.__k_Id) Description,
        (SELECT top 1 ExportLicenceItem.Quantity FROM ExportLicenceItem
            WHERE ExportLicenceItem.ExportLicenceId=pg.__k_Id) Quantity,
        (SELECT top 1 currency.Code FROM ExportLicenceItem
		INNER JOIN Currency currency ON ExportLicenceItem.CurrencyId = currency.Id
		WHERE ExportLicenceItem.ExportLicenceId=pg.__k_Id) Currency,
        (SELECT top 1 HSCode.Code FROM ExportLicenceItem
		INNER JOIN HSCode ON ExportLicenceItem.HSCodeId = HSCode.Id
		WHERE ExportLicenceItem.ExportLicenceId=pg.__k_Id) HSCode,
        (SELECT top 1 ISNULL(ExportLicenceItem.Amount,0) FROM ExportLicenceItem
		WHERE ExportLicenceItem.ExportLicenceId=pg.__k_Id) Amount, CAST(NULL AS int) SakhanId, CAST(NULL AS nvarchar(50)) SakhanCode, CAST(NULL AS nvarchar(200)) SakhanName, @__total AS TotalCount
    FROM (
        SELECT ExportLicence.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldExportLicenceNo OldLicenceNo,
ExportLicenceNo LicenceNo,
CONVERT(varchar,ExportLicence.CreatedDate,103) sDate,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
ExportLicence.Id AS __k_Id
        FROM ExportLicence
		INNER JOIN PaThaKa ON ExportLicence.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON ExportLicence.ExportImportSectionId = section.Id
		WHERE ApplyType=''Actual Amend'' AND ExportLicence.Status=''Approved''
		AND ((@FromDate IS NULL) OR ExportLicence.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR ExportLicence.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND ExportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ExportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND ExportLicence.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then ExportLicence.AmendRemarkId ELSE @AmendRemarkId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
        ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
    ) pg
    ORDER BY ' + @ob + N'
    OPTION (RECOMPILE);';
    END
    ELSE IF @FormType = N'Import Permit'
    BEGIN
        SET @cntpart = CASE WHEN @IncludeTotalCount = 1
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM ImportPermit
		INNER JOIN PaThaKa ON ImportPermit.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON ImportPermit.ExportImportSectionId = section.Id
		WHERE ApplyType=''Actual Amend'' AND ImportPermit.Status=''Approved''
		AND ((@FromDate IS NULL) OR ImportPermit.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR ImportPermit.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND ImportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ImportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND ImportPermit.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then ImportPermit.AmendRemarkId ELSE @AmendRemarkId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END) OPTION (RECOMPILE); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        SET @sql = @cntpart + N'SELECT pg.*, CAST(NULL AS nvarchar(max)) Description, CAST(NULL AS decimal(18,4)) Quantity,(SELECT top 1 currency.Code FROM ImportPermitItem
		INNER JOIN Currency currency ON ImportPermitItem.CurrencyId = currency.Id
		WHERE ImportPermitItem.ImportPermitId=pg.__k_Id) Currency,
        (SELECT top 1 HSCode.Code FROM ImportPermitItem
		INNER JOIN HSCode ON ImportPermitItem.HSCodeId = HSCode.Id
		WHERE ImportPermitItem.ImportPermitId=pg.__k_Id) HSCode,
        (SELECT top 1 ISNULL(ImportPermitItem.Amount,0) FROM ImportPermitItem
		WHERE ImportPermitItem.ImportPermitId=pg.__k_Id) Amount, CAST(NULL AS int) SakhanId, CAST(NULL AS nvarchar(50)) SakhanCode, CAST(NULL AS nvarchar(200)) SakhanName, @__total AS TotalCount
    FROM (
        SELECT ImportPermit.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldImportPermitNo OldLicenceNo,
ImportPermitNo LicenceNo,
CONVERT(varchar,ImportPermit.CreatedDate,103) sDate,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
ImportPermit.Id AS __k_Id
        FROM ImportPermit
		INNER JOIN PaThaKa ON ImportPermit.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON ImportPermit.ExportImportSectionId = section.Id
		WHERE ApplyType=''Actual Amend'' AND ImportPermit.Status=''Approved''
		AND ((@FromDate IS NULL) OR ImportPermit.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR ImportPermit.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND ImportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ImportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND ImportPermit.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then ImportPermit.AmendRemarkId ELSE @AmendRemarkId END)
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
		WHERE ApplyType=''Actual Amend'' AND ExportPermit.Status=''Approved''
		AND ((@FromDate IS NULL) OR ExportPermit.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR ExportPermit.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND ExportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ExportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND ExportPermit.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then ExportPermit.AmendRemarkId ELSE @AmendRemarkId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END) OPTION (RECOMPILE); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        SET @sql = @cntpart + N'SELECT pg.*, CAST(NULL AS nvarchar(max)) Description, CAST(NULL AS decimal(18,4)) Quantity,(SELECT top 1 currency.Code FROM ExportPermitItem
		INNER JOIN Currency currency ON ExportPermitItem.CurrencyId = currency.Id
		WHERE ExportPermitItem.ExportPermitId=pg.__k_Id ORDER BY ExportPermitItem.HSCodeId, ExportPermitItem.ItemNo) Currency,
        (SELECT top 1 HSCode.Code FROM ExportPermitItem
		INNER JOIN HSCode ON ExportPermitItem.HSCodeId = HSCode.Id
		WHERE ExportPermitItem.ExportPermitId=pg.__k_Id ORDER BY ExportPermitItem.HSCodeId, ExportPermitItem.ItemNo) HSCode,
        (SELECT top 1 ISNULL(ExportPermitItem.Amount,0) FROM ExportPermitItem
		WHERE ExportPermitItem.ExportPermitId=pg.__k_Id ORDER BY ExportPermitItem.HSCodeId, ExportPermitItem.ItemNo) Amount, CAST(NULL AS int) SakhanId, CAST(NULL AS nvarchar(50)) SakhanCode, CAST(NULL AS nvarchar(200)) SakhanName, @__total AS TotalCount
    FROM (
        SELECT ExportPermit.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldExportPermitNo OldLicenceNo,
ExportPermitNo LicenceNo,
CONVERT(varchar,ExportPermit.CreatedDate,103) sDate,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
ExportPermit.Id AS __k_Id
        FROM ExportPermit
		INNER JOIN PaThaKa ON ExportPermit.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON ExportPermit.ExportImportSectionId = section.Id
		WHERE ApplyType=''Actual Amend'' AND ExportPermit.Status=''Approved''
		AND ((@FromDate IS NULL) OR ExportPermit.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR ExportPermit.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND ExportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ExportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND ExportPermit.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then ExportPermit.AmendRemarkId ELSE @AmendRemarkId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
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
		WHERE ApplyType=''Actual Amend'' AND BorderExportLicence.Status=''Approved'' AND CardType=''Pa Tha Ka''
		AND ((@FromDate IS NULL) OR BorderExportLicence.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR BorderExportLicence.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderExportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderExportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND BorderExportLicence.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then BorderExportLicence.AmendRemarkId ELSE @AmendRemarkId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderExportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderExportLicence.SakhanId ELSE @SakhanId END)
		UNION ALL
		SELECT BorderExportLicence.Id FROM BorderExportLicence
		INNER JOIN IndividualTrading ON BorderExportLicence.IndividualTradingId = IndividualTrading.Id
		INNER JOIN ExportImportSection section ON BorderExportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderExportLicence.SakhanId = sakhan.Id
		WHERE ApplyType=''Actual Amend'' AND BorderExportLicence.Status=''Approved'' AND CardType=''Individual Trading''
		AND ((@FromDate IS NULL) OR BorderExportLicence.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR BorderExportLicence.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderExportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderExportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND BorderExportLicence.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then BorderExportLicence.AmendRemarkId ELSE @AmendRemarkId END)
		AND IndividualTrading.TINNo=(CASE WHEN @CompanyRegistrationNo='''' then IndividualTrading.TINNo ELSE @CompanyRegistrationNo END)
		AND BorderExportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderExportLicence.SakhanId ELSE @SakhanId END)
	) tmp OPTION (RECOMPILE); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        SET @sql = @cntpart + N'SELECT pg.*, CAST(NULL AS nvarchar(max)) Description, CAST(NULL AS decimal(18,4)) Quantity,(SELECT top 1 currency.Code FROM BorderExportLicenceItem
		INNER JOIN Currency currency ON BorderExportLicenceItem.CurrencyId = currency.Id
		WHERE BorderExportLicenceItem.BorderExportLicenceId=pg.__k_Id) Currency,
        (SELECT top 1 HSCode.Code FROM BorderExportLicenceItem
		INNER JOIN HSCode ON BorderExportLicenceItem.HSCodeId = HSCode.Id
		WHERE BorderExportLicenceItem.BorderExportLicenceId=pg.__k_Id) HSCode,
        (SELECT top 1 ISNULL(BorderExportLicenceItem.Amount,0) FROM BorderExportLicenceItem
		WHERE BorderExportLicenceItem.BorderExportLicenceId=pg.__k_Id) Amount, @__total AS TotalCount
    FROM (
        SELECT * FROM (
        SELECT BorderExportLicence.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldExportLicenceNo OldLicenceNo,
ExportLicenceNo LicenceNo,
CONVERT(varchar,BorderExportLicence.CreatedDate,103) sDate,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
sakhan.Id SakhanId,
sakhan.Code SakhanCode,
sakhan.Name SakhanName,
BorderExportLicence.Id AS __k_Id
        FROM BorderExportLicence
		INNER JOIN PaThaKa ON BorderExportLicence.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderExportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderExportLicence.SakhanId = sakhan.Id
		WHERE ApplyType=''Actual Amend'' AND BorderExportLicence.Status=''Approved'' AND CardType=''Pa Tha Ka''
		AND ((@FromDate IS NULL) OR BorderExportLicence.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR BorderExportLicence.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderExportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderExportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND BorderExportLicence.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then BorderExportLicence.AmendRemarkId ELSE @AmendRemarkId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderExportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderExportLicence.SakhanId ELSE @SakhanId END)
		UNION ALL
        SELECT BorderExportLicence.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldExportLicenceNo OldLicenceNo,
ExportLicenceNo LicenceNo,
CONVERT(varchar,BorderExportLicence.CreatedDate,103) sDate,
IndividualTrading.TINNo CompanyRegistrationNo,
IndividualTrading.Name CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
sakhan.Id SakhanId,
sakhan.Code SakhanCode,
sakhan.Name SakhanName,
BorderExportLicence.Id AS __k_Id
        FROM BorderExportLicence
		INNER JOIN IndividualTrading ON BorderExportLicence.IndividualTradingId = IndividualTrading.Id
		INNER JOIN ExportImportSection section ON BorderExportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderExportLicence.SakhanId = sakhan.Id
		WHERE ApplyType=''Actual Amend'' AND BorderExportLicence.Status=''Approved'' AND CardType=''Individual Trading''
		AND ((@FromDate IS NULL) OR BorderExportLicence.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR BorderExportLicence.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderExportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderExportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND BorderExportLicence.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then BorderExportLicence.AmendRemarkId ELSE @AmendRemarkId END)
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
        SET @cntpart = CASE WHEN @IncludeTotalCount = 1
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM (
		SELECT BorderImportLicence.Id FROM BorderImportLicence
		INNER JOIN PaThaKa ON BorderImportLicence.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderImportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderImportLicence.SakhanId = sakhan.Id
		WHERE ApplyType=''Actual Amend'' AND BorderImportLicence.Status=''Approved'' AND CardType=''Pa Tha Ka''
		AND ((@FromDate IS NULL) OR BorderImportLicence.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR BorderImportLicence.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND BorderImportLicence.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then BorderImportLicence.AmendRemarkId ELSE @AmendRemarkId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderImportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderImportLicence.SakhanId ELSE @SakhanId END)
		UNION ALL
		SELECT BorderImportLicence.Id FROM BorderImportLicence
		INNER JOIN IndividualTrading ON BorderImportLicence.IndividualTradingId = IndividualTrading.Id
		INNER JOIN ExportImportSection section ON BorderImportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderImportLicence.SakhanId = sakhan.Id
		WHERE ApplyType=''Actual Amend'' AND BorderImportLicence.Status=''Approved'' AND CardType=''Individual Trading''
		AND ((@FromDate IS NULL) OR BorderImportLicence.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR BorderImportLicence.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND BorderImportLicence.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then BorderImportLicence.AmendRemarkId ELSE @AmendRemarkId END)
		AND IndividualTrading.TINNo=(CASE WHEN @CompanyRegistrationNo='''' then IndividualTrading.TINNo ELSE @CompanyRegistrationNo END)
		AND BorderImportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderImportLicence.SakhanId ELSE @SakhanId END)
	) tmp OPTION (RECOMPILE); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        SET @sql = @cntpart + N'SELECT pg.*, CAST(NULL AS nvarchar(max)) Description, CAST(NULL AS decimal(18,4)) Quantity,(SELECT top 1 currency.Code FROM BorderImportLicenceItem
		INNER JOIN Currency currency ON BorderImportLicenceItem.CurrencyId = currency.Id
		WHERE BorderImportLicenceItem.BorderImportLicenceId=pg.__k_Id) Currency,
        (SELECT top 1 HSCode.Code FROM BorderImportLicenceItem
		INNER JOIN HSCode ON BorderImportLicenceItem.HSCodeId = HSCode.Id
		WHERE BorderImportLicenceItem.BorderImportLicenceId=pg.__k_Id) HSCode,
        (SELECT top 1 ISNULL(BorderImportLicenceItem.Amount,0) FROM BorderImportLicenceItem
		WHERE BorderImportLicenceItem.BorderImportLicenceId=pg.__k_Id) Amount, @__total AS TotalCount
    FROM (
        SELECT * FROM (
        SELECT BorderImportLicence.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldImportLicenceNo OldLicenceNo,
ImportLicenceNo LicenceNo,
CONVERT(varchar,BorderImportLicence.CreatedDate,103) sDate,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
sakhan.Id SakhanId,
sakhan.Code SakhanCode,
sakhan.Name SakhanName,
BorderImportLicence.Id AS __k_Id
        FROM BorderImportLicence
		INNER JOIN PaThaKa ON BorderImportLicence.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderImportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderImportLicence.SakhanId = sakhan.Id
		WHERE ApplyType=''Actual Amend'' AND BorderImportLicence.Status=''Approved'' AND CardType=''Pa Tha Ka''
		AND ((@FromDate IS NULL) OR BorderImportLicence.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR BorderImportLicence.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND BorderImportLicence.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then BorderImportLicence.AmendRemarkId ELSE @AmendRemarkId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderImportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderImportLicence.SakhanId ELSE @SakhanId END)
		UNION ALL
        SELECT BorderImportLicence.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldImportLicenceNo OldLicenceNo,
ImportLicenceNo LicenceNo,
CONVERT(varchar,BorderImportLicence.CreatedDate,103) sDate,
IndividualTrading.TINNo CompanyRegistrationNo,
IndividualTrading.Name CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
sakhan.Id SakhanId,
sakhan.Code SakhanCode,
sakhan.Name SakhanName,
BorderImportLicence.Id AS __k_Id
        FROM BorderImportLicence
		INNER JOIN IndividualTrading ON BorderImportLicence.IndividualTradingId = IndividualTrading.Id
		INNER JOIN ExportImportSection section ON BorderImportLicence.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderImportLicence.SakhanId = sakhan.Id
		WHERE ApplyType=''Actual Amend'' AND BorderImportLicence.Status=''Approved'' AND CardType=''Individual Trading''
		AND ((@FromDate IS NULL) OR BorderImportLicence.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR BorderImportLicence.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND BorderImportLicence.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then BorderImportLicence.AmendRemarkId ELSE @AmendRemarkId END)
		AND IndividualTrading.TINNo=(CASE WHEN @CompanyRegistrationNo='''' then IndividualTrading.TINNo ELSE @CompanyRegistrationNo END)
		AND BorderImportLicence.SakhanId=(CASE WHEN @SakhanId=0 then BorderImportLicence.SakhanId ELSE @SakhanId END)
        ) u
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
		WHERE ApplyType=''Actual Amend'' AND BorderExportPermit.Status=''Approved''
		AND ((@FromDate IS NULL) OR BorderExportPermit.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR BorderExportPermit.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderExportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderExportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND BorderExportPermit.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then BorderExportPermit.AmendRemarkId ELSE @AmendRemarkId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderExportPermit.SakhanId=(CASE WHEN @SakhanId=0 then BorderExportPermit.SakhanId ELSE @SakhanId END) OPTION (RECOMPILE); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        SET @sql = @cntpart + N'SELECT pg.*, CAST(NULL AS nvarchar(max)) Description, CAST(NULL AS decimal(18,4)) Quantity,(SELECT top 1 currency.Code FROM BorderExportPermitItem
		INNER JOIN Currency currency ON BorderExportPermitItem.CurrencyId = currency.Id
		WHERE BorderExportPermitItem.BorderExportPermitId=pg.__k_Id) Currency,
        (SELECT top 1 HSCode.Code FROM BorderExportPermitItem
		INNER JOIN HSCode ON BorderExportPermitItem.HSCodeId = HSCode.Id
		WHERE BorderExportPermitItem.BorderExportPermitId=pg.__k_Id) HSCode,
        (SELECT top 1 ISNULL(BorderExportPermitItem.Amount,0) FROM BorderExportPermitItem
		WHERE BorderExportPermitItem.BorderExportPermitId=pg.__k_Id) Amount, @__total AS TotalCount
    FROM (
        SELECT BorderExportPermit.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldExportPermitNo OldLicenceNo,
ExportPermitNo LicenceNo,
CONVERT(varchar,BorderExportPermit.CreatedDate,103) sDate,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
sakhan.Id SakhanId,
sakhan.Code SakhanCode,
sakhan.Name SakhanName,
BorderExportPermit.Id AS __k_Id
        FROM BorderExportPermit
		INNER JOIN PaThaKa ON BorderExportPermit.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderExportPermit.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderExportPermit.SakhanId = sakhan.Id
		WHERE ApplyType=''Actual Amend'' AND BorderExportPermit.Status=''Approved''
		AND ((@FromDate IS NULL) OR BorderExportPermit.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR BorderExportPermit.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderExportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderExportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND BorderExportPermit.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then BorderExportPermit.AmendRemarkId ELSE @AmendRemarkId END)
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
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM BorderImportPermit
		INNER JOIN PaThaKa ON BorderImportPermit.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderImportPermit.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderImportPermit.SakhanId = sakhan.Id
		WHERE ApplyType=''Actual Amend'' AND BorderImportPermit.Status=''Approved''
		AND ((@FromDate IS NULL) OR BorderImportPermit.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR BorderImportPermit.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderImportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderImportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND BorderImportPermit.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then BorderImportPermit.AmendRemarkId ELSE @AmendRemarkId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderImportPermit.SakhanId=(CASE WHEN @SakhanId=0 then BorderImportPermit.SakhanId ELSE @SakhanId END) OPTION (RECOMPILE); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        SET @sql = @cntpart + N'SELECT pg.*, CAST(NULL AS nvarchar(max)) Description, CAST(NULL AS decimal(18,4)) Quantity,(SELECT top 1 currency.Code FROM BorderImportPermitItem
		INNER JOIN Currency currency ON BorderImportPermitItem.CurrencyId = currency.Id
		WHERE BorderImportPermitItem.BorderImportPermitId=pg.__k_Id) Currency,
        (SELECT top 1 HSCode.Code FROM BorderImportPermitItem
		INNER JOIN HSCode ON BorderImportPermitItem.HSCodeId = HSCode.Id
		WHERE BorderImportPermitItem.BorderImportPermitId=pg.__k_Id) HSCode,
        (SELECT top 1 ISNULL(BorderImportPermitItem.Amount,0) FROM BorderImportPermitItem
		WHERE BorderImportPermitItem.BorderImportPermitId=pg.__k_Id) Amount, @__total AS TotalCount
    FROM (
        SELECT BorderImportPermit.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldImportPermitNo OldLicenceNo,
ImportPermitNo LicenceNo,
CONVERT(varchar,BorderImportPermit.CreatedDate,103) sDate,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
sakhan.Id SakhanId,
sakhan.Code SakhanCode,
sakhan.Name SakhanName,
BorderImportPermit.Id AS __k_Id
        FROM BorderImportPermit
		INNER JOIN PaThaKa ON BorderImportPermit.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON BorderImportPermit.ExportImportSectionId = section.Id
		INNER JOIN Sakhan sakhan ON BorderImportPermit.SakhanId = sakhan.Id
		WHERE ApplyType=''Actual Amend'' AND BorderImportPermit.Status=''Approved''
		AND ((@FromDate IS NULL) OR BorderImportPermit.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR BorderImportPermit.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND BorderImportPermit.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then BorderImportPermit.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND BorderImportPermit.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then BorderImportPermit.AmendRemarkId ELSE @AmendRemarkId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
		AND BorderImportPermit.SakhanId=(CASE WHEN @SakhanId=0 then BorderImportPermit.SakhanId ELSE @SakhanId END)
        ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
    ) pg
    ORDER BY ' + @ob + N'
    OPTION (RECOMPILE);';
    END
    ELSE
    BEGIN
        SET @cntpart = CASE WHEN @IncludeTotalCount = 1
            THEN N'DECLARE @__total int; SELECT @__total = COUNT(*) FROM ImportLicence
		INNER JOIN PaThaKa ON ImportLicence.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON ImportLicence.ExportImportSectionId = section.Id
		WHERE ApplyType=''Actual Amend'' AND ImportLicence.Status=''Approved''
		AND ((@FromDate IS NULL) OR ImportLicence.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR ImportLicence.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND ImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND ImportLicence.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then ImportLicence.AmendRemarkId ELSE @AmendRemarkId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END) OPTION (RECOMPILE); '
            ELSE N'DECLARE @__total int = NULL; ' END;

        SET @sql = @cntpart + N'SELECT pg.*, CAST(NULL AS nvarchar(max)) Description, CAST(NULL AS decimal(18,4)) Quantity,(SELECT top 1 currency.Code FROM ImportLicenceItem
		INNER JOIN Currency currency ON ImportLicenceItem.CurrencyId = currency.Id
		WHERE ImportLicenceItem.ImportLicenceId=pg.__k_Id) Currency,
        (SELECT top 1 HSCode.Code FROM ImportLicenceItem
		INNER JOIN HSCode ON ImportLicenceItem.HSCodeId = HSCode.Id
		WHERE ImportLicenceItem.ImportLicenceId=pg.__k_Id) HSCode,
        (SELECT top 1 ISNULL(ImportLicenceItem.Amount,0) FROM ImportLicenceItem
		WHERE ImportLicenceItem.ImportLicenceId=pg.__k_Id) Amount, CAST(NULL AS int) SakhanId, CAST(NULL AS nvarchar(50)) SakhanCode, CAST(NULL AS nvarchar(200)) SakhanName, @__total AS TotalCount
    FROM (
        SELECT ImportLicence.CreatedDate Date,
section.Code SectionCode,
section.Name SectionName,
OldImportLicenceNo OldLicenceNo,
ImportLicenceNo LicenceNo,
CONVERT(varchar,ImportLicence.CreatedDate,103) sDate,
PaThaKa.CompanyRegistrationNo,
PaThaKa.CompanyName,
UnitLevel,
StreetNumberStreetName,
QuarterCityTownship,
State,
Country,
PostalCode,
ImportLicence.Id AS __k_Id
        FROM ImportLicence
		INNER JOIN PaThaKa ON ImportLicence.PaThaKaId = PaThaKa.Id
		INNER JOIN ExportImportSection section ON ImportLicence.ExportImportSectionId = section.Id
		WHERE ApplyType=''Actual Amend'' AND ImportLicence.Status=''Approved''
		AND ((@FromDate IS NULL) OR ImportLicence.CreatedDate >= @FromDate)
		AND ((@ToDate IS NULL) OR ImportLicence.CreatedDate < DATEADD(day, 1, CONVERT(date, @ToDate)))
		AND ImportLicence.ExportImportSectionId=(CASE WHEN @ExportImportSectionId=0 then ImportLicence.ExportImportSectionId ELSE @ExportImportSectionId END)
		AND ImportLicence.AmendRemarkId=(CASE WHEN @AmendRemarkId=0 then ImportLicence.AmendRemarkId ELSE @AmendRemarkId END)
		AND PaThaKa.CompanyRegistrationNo=(CASE WHEN @CompanyRegistrationNo='''' then PaThaKa.CompanyRegistrationNo ELSE @CompanyRegistrationNo END)
        ORDER BY ' + @ob + N' OFFSET @off ROWS FETCH NEXT @ps ROWS ONLY
    ) pg
    ORDER BY ' + @ob + N'
    OPTION (RECOMPILE);';
    END

    EXEC sp_executesql @sql, N'@FormType nvarchar(50), @FromDate datetime, @ToDate datetime, @ExportImportSectionId int, @AmendRemarkId int, @CompanyRegistrationNo nvarchar(50), @SakhanId int, @off bigint, @ps bigint', @FormType=@FormType, @FromDate=@FromDate, @ToDate=@ToDate, @ExportImportSectionId=@ExportImportSectionId, @AmendRemarkId=@AmendRemarkId, @CompanyRegistrationNo=@CompanyRegistrationNo, @SakhanId=@SakhanId, @off=@off, @ps=@ps;
END
