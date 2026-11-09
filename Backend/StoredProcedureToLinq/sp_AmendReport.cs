using API.DBContext;
using System.Text.Json.Serialization;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.StoredProcedureToLinq;

public sealed class sp_AmendReportRequest
{
    public string FormType { get; set; } = string.Empty;
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public int ExportImportSectionId { get; set; }
    public int AmendRemarkId { get; set; }
    public string CompanyRegistrationNo { get; set; } = string.Empty;
    public int SakhanId { get; set; }
}

public sealed class sp_AmendReportResult
{
    public DateTime? Date { get; set; }
    public string? SectionCode { get; set; }
    public string? SectionName { get; set; }
    public string? OldLicenceNo { get; set; }
    public string? LicenceNo { get; set; }
    public string? SDate { get; set; }
    public string? CompanyRegistrationNo { get; set; }
    public string? CompanyName { get; set; }
    public string? UnitLevel { get; set; }
    public string? StreetNumberStreetName { get; set; }
    public string? QuarterCityTownship { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? Currency { get; set; }
    public string? HSCode { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Description { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public decimal? Quantity { get; set; }
    public decimal? Amount { get; set; }
    public int? SakhanId { get; set; }
    public string? SakhanCode { get; set; }
    public string? SakhanName { get; set; }
}

public sealed class sp_AmendReportRow
{
    public DateTime? Date { get; set; }
    public string? SectionCode { get; set; }
    public string? SectionName { get; set; }
    public string? OldLicenceNo { get; set; }
    public string? LicenceNo { get; set; }
    public string? SDate { get; set; }
    public string? CompanyRegistrationNo { get; set; }
    public string? CompanyName { get; set; }
    public string? UnitLevel { get; set; }
    public string? StreetNumberStreetName { get; set; }
    public string? QuarterCityTownship { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? Currency { get; set; }
    public string? HSCode { get; set; }
    public string? Description { get; set; }
    public decimal? Quantity { get; set; }
    public decimal? Amount { get; set; }
    public int? SakhanId { get; set; }
    public string? SakhanCode { get; set; }
    public string? SakhanName { get; set; }
    public int? TotalCount { get; set; }

    public sp_AmendReportResult ToResult() => new()
    {
        Date = Date,
        SectionCode = SectionCode,
        SectionName = SectionName,
        OldLicenceNo = OldLicenceNo,
        LicenceNo = LicenceNo,
        SDate = SDate,
        CompanyRegistrationNo = CompanyRegistrationNo,
        CompanyName = CompanyName,
        UnitLevel = UnitLevel,
        StreetNumberStreetName = StreetNumberStreetName,
        QuarterCityTownship = QuarterCityTownship,
        State = State,
        Country = Country,
        PostalCode = PostalCode,
        Currency = Currency,
        HSCode = HSCode,
        Description = Description,
        Quantity = Quantity,
        Amount = Amount,
        SakhanId = SakhanId,
        SakhanCode = SakhanCode,
        SakhanName = SakhanName,
    };
}

public static class sp_AmendReport
{
    private const string Amend = "Amend";
    private const string Approved = "Approved";
    private const string PaThaKaCardType = "Pa Tha Ka";
    private const string IndividualTradingCardType = "Individual Trading";

    /// <summary>
    /// Executes <c>dbo.sp_AmendReport_pagination</c> (DB-side paging via INSERT-EXEC
    /// wrapper over the untouched original). The LINQ <see cref="Query"/> below is retained
    /// for not-yet-converted sibling report families.
    /// </summary>
    public static async Task<List<sp_AmendReportRow>> ExecuteAsync(
        TradeNetDbContext db,
        sp_AmendReportRequest request,
        string? sortColumn = null,
        string? sortOrder = null,
        int? pageIndex = null,
        int? pageSize = null,
        bool includeTotalCount = true)
    {
        return await ExecuteQueryable(db, request, sortColumn, sortOrder, pageIndex, pageSize, includeTotalCount)
            .ToListAsync();
    }

    public static IQueryable<sp_AmendReportRow> ExecuteQueryable(
        TradeNetDbContext db,
        sp_AmendReportRequest request,
        string? sortColumn = null,
        string? sortOrder = null,
        int? pageIndex = null,
        int? pageSize = null,
        bool includeTotalCount = true)
    {
        ArgumentNullException.ThrowIfNull(db);
        ArgumentNullException.ThrowIfNull(request);

        var parameters = new[]
        {
            new SqlParameter("@FormType", request.FormType ?? string.Empty),
            new SqlParameter("@FromDate", request.FromDate),
            new SqlParameter("@ToDate", request.ToDate),
            new SqlParameter("@ExportImportSectionId", request.ExportImportSectionId),
            new SqlParameter("@AmendRemarkId", request.AmendRemarkId),
            new SqlParameter("@CompanyRegistrationNo", request.CompanyRegistrationNo ?? string.Empty),
            new SqlParameter("@SakhanId", request.SakhanId),
            new SqlParameter("@SortColumn", (object?)sortColumn ?? DBNull.Value),
            new SqlParameter("@SortOrder", (object?)sortOrder ?? DBNull.Value),
            new SqlParameter("@PageIndex", (object?)pageIndex ?? DBNull.Value),
            new SqlParameter("@PageSize", (object?)pageSize ?? DBNull.Value),
            new SqlParameter("@IncludeTotalCount", includeTotalCount),
        };

        const string sql =
            "EXEC dbo.sp_AmendReport_pagination @FormType, @FromDate, @ToDate, @ExportImportSectionId, " +
            "@AmendRemarkId, @CompanyRegistrationNo, @SakhanId, @SortColumn, @SortOrder, @PageIndex, @PageSize, @IncludeTotalCount";

        return db.Database.SqlQueryRaw<sp_AmendReportRow>(sql, parameters);
    }

    public static IQueryable<sp_AmendReportResult> Query(
        TradeNetDbContext db,
        sp_AmendReportRequest request)
    {
        ArgumentNullException.ThrowIfNull(db);
        ArgumentNullException.ThrowIfNull(request);

        return request.FormType switch
        {
            "Export Licence" => ExportLicenceQuery(db, request),
            "Import Licence" => ImportLicenceQuery(db, request),
            "Export Permit" => ExportPermitQuery(db, request),
            "Import Permit" => ImportPermitQuery(db, request),
            "Border Export Licence" => BorderExportLicenceQuery(db, request),
            "Border Import Licence" => BorderImportLicenceQuery(db, request),
            "Border Export Permit" => BorderExportPermitQuery(db, request),
            "Border Import Permit" => BorderImportPermitQuery(db, request),
            _ => EmptyQuery(db)
        };
    }

    private static IQueryable<sp_AmendReportResult> ExportLicenceQuery(
        TradeNetDbContext db,
        sp_AmendReportRequest request)
    {
        var currencyByLicence =
            from firstItem in
                (from item in db.ExportLicenceItems
                 where db.Currencies.Any(currency => currency.Id == item.CurrencyId)
                 group item by item.ExportLicenceId into grouped
                 select new { LicenceId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.ExportLicenceItems on firstItem.ItemId equals item.Id
            join currency in db.Currencies on item.CurrencyId equals currency.Id
            select new { firstItem.LicenceId, currency.Code };

        var firstItemByLicence =
            from grouped in
                (from item in db.ExportLicenceItems
                 group item by item.ExportLicenceId into g
                 select new { LicenceId = g.Key, ItemId = g.Min(item => item.Id) })
            join item in db.ExportLicenceItems on grouped.ItemId equals item.Id
            select new { grouped.LicenceId, Amount = (decimal?)item.Amount };

        var hsCodeByLicence =
            from firstItem in
                (from item in db.ExportLicenceItems
                 where db.Hscodes.Any(hsCode => hsCode.Id == item.HscodeId)
                 group item by item.ExportLicenceId into grouped
                 select new { LicenceId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.ExportLicenceItems on firstItem.ItemId equals item.Id
            join hsCode in db.Hscodes on item.HscodeId equals hsCode.Id
            select new { firstItem.LicenceId, HSCode = hsCode.Code };

        return
            from licence in db.ExportLicences
            join paThaKa in db.PaThaKas on licence.PaThaKaId equals paThaKa.Id
            join section in db.ExportImportSections on licence.ExportImportSectionId equals section.Id
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join firstItemRow in firstItemByLicence on licence.Id equals firstItemRow.LicenceId into firstItemJoin
            from firstItemRow in firstItemJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByLicence on licence.Id equals hsCodeRow.LicenceId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where licence.ApplyType == Amend
                && licence.Status == Approved
                && licence.CreatedDate >= request.FromDate
                && licence.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
                && (request.AmendRemarkId == 0 ? licence.AmendRemarkId != null : licence.AmendRemarkId == request.AmendRemarkId)
                && (request.CompanyRegistrationNo == string.Empty
                    ? paThaKa.CompanyRegistrationNo == paThaKa.CompanyRegistrationNo
                    : paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
            select new sp_AmendReportResult
            {
                Date = licence.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = licence.OldExportLicenceNo,
                LicenceNo = licence.ExportLicenceNo,
                SDate = licence.CreatedDate == null
                    ? null
                    : (licence.CreatedDate.Value.Day < 10 ? "0" : string.Empty)
                    + licence.CreatedDate.Value.Day.ToString()
                    + "/"
                    + (licence.CreatedDate.Value.Month < 10 ? "0" : string.Empty)
                    + licence.CreatedDate.Value.Month.ToString()
                    + "/"
                    + licence.CreatedDate.Value.Year.ToString(),
                CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                CompanyName = paThaKa.CompanyName,
                UnitLevel = paThaKa.UnitLevel,
                StreetNumberStreetName = paThaKa.StreetNumberStreetName,
                QuarterCityTownship = paThaKa.QuarterCityTownship,
                State = paThaKa.State,
                Country = paThaKa.Country,
                PostalCode = paThaKa.PostalCode,
                Currency = currencyRow.Code,
                HSCode = hsCodeRow.HSCode,
                Amount = firstItemRow.Amount
            };
    }

    private static IQueryable<sp_AmendReportResult> ImportLicenceQuery(
        TradeNetDbContext db,
        sp_AmendReportRequest request)
    {
        var currencyByLicence =
            from firstItem in
                (from item in db.ImportLicenceItems
                 where db.Currencies.Any(currency => currency.Id == item.CurrencyId)
                 group item by item.ImportLicenceId into grouped
                 select new { LicenceId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.ImportLicenceItems on firstItem.ItemId equals item.Id
            join currency in db.Currencies on item.CurrencyId equals currency.Id
            select new { firstItem.LicenceId, currency.Code };

        var firstItemByLicence =
            from grouped in
                (from item in db.ImportLicenceItems
                 group item by item.ImportLicenceId into g
                 select new { LicenceId = g.Key, ItemId = g.Min(item => item.Id) })
            join item in db.ImportLicenceItems on grouped.ItemId equals item.Id
            select new { grouped.LicenceId, Amount = (decimal?)item.Amount };

        var hsCodeByLicence =
            from firstItem in
                (from item in db.ImportLicenceItems
                 where db.Hscodes.Any(hsCode => hsCode.Id == item.HscodeId)
                 group item by item.ImportLicenceId into grouped
                 select new { LicenceId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.ImportLicenceItems on firstItem.ItemId equals item.Id
            join hsCode in db.Hscodes on item.HscodeId equals hsCode.Id
            select new { firstItem.LicenceId, HSCode = hsCode.Code };

        return
            from licence in db.ImportLicences
            join paThaKa in db.PaThaKas on licence.PaThaKaId equals paThaKa.Id
            join section in db.ExportImportSections on licence.ExportImportSectionId equals section.Id
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join firstItemRow in firstItemByLicence on licence.Id equals firstItemRow.LicenceId into firstItemJoin
            from firstItemRow in firstItemJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByLicence on licence.Id equals hsCodeRow.LicenceId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where licence.ApplyType == Amend
                && licence.Status == Approved
                && licence.CreatedDate >= request.FromDate
                && licence.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
                && (request.AmendRemarkId == 0 ? licence.AmendRemarkId != null : licence.AmendRemarkId == request.AmendRemarkId)
                && (request.CompanyRegistrationNo == string.Empty
                    ? paThaKa.CompanyRegistrationNo == paThaKa.CompanyRegistrationNo
                    : paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
            select new sp_AmendReportResult
            {
                Date = licence.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = licence.OldImportLicenceNo,
                LicenceNo = licence.ImportLicenceNo,
                SDate = licence.CreatedDate == null
                    ? null
                    : (licence.CreatedDate.Value.Day < 10 ? "0" : string.Empty)
                    + licence.CreatedDate.Value.Day.ToString()
                    + "/"
                    + (licence.CreatedDate.Value.Month < 10 ? "0" : string.Empty)
                    + licence.CreatedDate.Value.Month.ToString()
                    + "/"
                    + licence.CreatedDate.Value.Year.ToString(),
                CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                CompanyName = paThaKa.CompanyName,
                UnitLevel = paThaKa.UnitLevel,
                StreetNumberStreetName = paThaKa.StreetNumberStreetName,
                QuarterCityTownship = paThaKa.QuarterCityTownship,
                State = paThaKa.State,
                Country = paThaKa.Country,
                PostalCode = paThaKa.PostalCode,
                Currency = currencyRow.Code,
                HSCode = hsCodeRow.HSCode,
                Amount = firstItemRow.Amount
            };
    }

    private static IQueryable<sp_AmendReportResult> ExportPermitQuery(
        TradeNetDbContext db,
        sp_AmendReportRequest request)
    {
        var currencyByPermit =
            from firstItem in
                (from item in db.ExportPermitItems
                 where db.Currencies.Any(currency => currency.Id == item.CurrencyId)
                 group item by item.ExportPermitId into grouped
                 select new { PermitId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.ExportPermitItems on firstItem.ItemId equals item.Id
            join currency in db.Currencies on item.CurrencyId equals currency.Id
            select new { firstItem.PermitId, currency.Code };

        var firstItemByPermit =
            from grouped in
                (from item in db.ExportPermitItems
                 group item by item.ExportPermitId into g
                 select new { PermitId = g.Key, ItemId = g.Min(item => item.Id) })
            join item in db.ExportPermitItems on grouped.ItemId equals item.Id
            select new { grouped.PermitId, Amount = (decimal?)item.Amount };

        var hsCodeByPermit =
            from firstItem in
                (from item in db.ExportPermitItems
                 where db.Hscodes.Any(hsCode => hsCode.Id == item.HscodeId)
                 group item by item.ExportPermitId into grouped
                 select new { PermitId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.ExportPermitItems on firstItem.ItemId equals item.Id
            join hsCode in db.Hscodes on item.HscodeId equals hsCode.Id
            select new { firstItem.PermitId, HSCode = hsCode.Code };

        return
            from permit in db.ExportPermits
            join paThaKa in db.PaThaKas on permit.PaThaKaId equals paThaKa.Id
            join section in db.ExportImportSections on permit.ExportImportSectionId equals section.Id
            join currencyRow in currencyByPermit on permit.Id equals currencyRow.PermitId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join firstItemRow in firstItemByPermit on permit.Id equals firstItemRow.PermitId into firstItemJoin
            from firstItemRow in firstItemJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByPermit on permit.Id equals hsCodeRow.PermitId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where permit.ApplyType == Amend
                && permit.Status == Approved
                && permit.CreatedDate >= request.FromDate
                && permit.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || permit.ExportImportSectionId == request.ExportImportSectionId)
                && (request.AmendRemarkId == 0 ? permit.AmendRemarkId != null : permit.AmendRemarkId == request.AmendRemarkId)
                && (request.CompanyRegistrationNo == string.Empty
                    ? paThaKa.CompanyRegistrationNo == paThaKa.CompanyRegistrationNo
                    : paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
            select new sp_AmendReportResult
            {
                Date = permit.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = permit.OldExportPermitNo,
                LicenceNo = permit.ExportPermitNo,
                SDate = permit.CreatedDate == null
                    ? null
                    : (permit.CreatedDate.Value.Day < 10 ? "0" : string.Empty)
                    + permit.CreatedDate.Value.Day.ToString()
                    + "/"
                    + (permit.CreatedDate.Value.Month < 10 ? "0" : string.Empty)
                    + permit.CreatedDate.Value.Month.ToString()
                    + "/"
                    + permit.CreatedDate.Value.Year.ToString(),
                CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                CompanyName = paThaKa.CompanyName,
                UnitLevel = paThaKa.UnitLevel,
                StreetNumberStreetName = paThaKa.StreetNumberStreetName,
                QuarterCityTownship = paThaKa.QuarterCityTownship,
                State = paThaKa.State,
                Country = paThaKa.Country,
                PostalCode = paThaKa.PostalCode,
                Currency = currencyRow.Code,
                HSCode = hsCodeRow.HSCode,
                Amount = firstItemRow.Amount
            };
    }

    private static IQueryable<sp_AmendReportResult> ImportPermitQuery(
        TradeNetDbContext db,
        sp_AmendReportRequest request)
    {
        var currencyByPermit =
            from firstItem in
                (from item in db.ImportPermitItems
                 where db.Currencies.Any(currency => currency.Id == item.CurrencyId)
                 group item by item.ImportPermitId into grouped
                 select new { PermitId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.ImportPermitItems on firstItem.ItemId equals item.Id
            join currency in db.Currencies on item.CurrencyId equals currency.Id
            select new { firstItem.PermitId, currency.Code };

        var firstItemByPermit =
            from grouped in
                (from item in db.ImportPermitItems
                 group item by item.ImportPermitId into g
                 select new { PermitId = g.Key, ItemId = g.Min(item => item.Id) })
            join item in db.ImportPermitItems on grouped.ItemId equals item.Id
            select new { grouped.PermitId, Amount = (decimal?)item.Amount };

        var hsCodeByPermit =
            from firstItem in
                (from item in db.ImportPermitItems
                 where db.Hscodes.Any(hsCode => hsCode.Id == item.HscodeId)
                 group item by item.ImportPermitId into grouped
                 select new { PermitId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.ImportPermitItems on firstItem.ItemId equals item.Id
            join hsCode in db.Hscodes on item.HscodeId equals hsCode.Id
            select new { firstItem.PermitId, HSCode = hsCode.Code };

        return
            from permit in db.ImportPermits
            join paThaKa in db.PaThaKas on permit.PaThaKaId equals paThaKa.Id
            join section in db.ExportImportSections on permit.ExportImportSectionId equals section.Id
            join currencyRow in currencyByPermit on permit.Id equals currencyRow.PermitId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join firstItemRow in firstItemByPermit on permit.Id equals firstItemRow.PermitId into firstItemJoin
            from firstItemRow in firstItemJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByPermit on permit.Id equals hsCodeRow.PermitId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where permit.ApplyType == Amend
                && permit.Status == Approved
                && permit.CreatedDate >= request.FromDate
                && permit.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || permit.ExportImportSectionId == request.ExportImportSectionId)
                && (request.AmendRemarkId == 0 ? permit.AmendRemarkId != null : permit.AmendRemarkId == request.AmendRemarkId)
                && (request.CompanyRegistrationNo == string.Empty
                    ? paThaKa.CompanyRegistrationNo == paThaKa.CompanyRegistrationNo
                    : paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
            select new sp_AmendReportResult
            {
                Date = permit.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = permit.OldImportPermitNo,
                LicenceNo = permit.ImportPermitNo,
                SDate = permit.CreatedDate == null
                    ? null
                    : (permit.CreatedDate.Value.Day < 10 ? "0" : string.Empty)
                    + permit.CreatedDate.Value.Day.ToString()
                    + "/"
                    + (permit.CreatedDate.Value.Month < 10 ? "0" : string.Empty)
                    + permit.CreatedDate.Value.Month.ToString()
                    + "/"
                    + permit.CreatedDate.Value.Year.ToString(),
                CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                CompanyName = paThaKa.CompanyName,
                UnitLevel = paThaKa.UnitLevel,
                StreetNumberStreetName = paThaKa.StreetNumberStreetName,
                QuarterCityTownship = paThaKa.QuarterCityTownship,
                State = paThaKa.State,
                Country = paThaKa.Country,
                PostalCode = paThaKa.PostalCode,
                Currency = currencyRow.Code,
                HSCode = hsCodeRow.HSCode,
                Amount = firstItemRow.Amount
            };
    }

    private static IQueryable<sp_AmendReportResult> BorderExportLicenceQuery(
        TradeNetDbContext db,
        sp_AmendReportRequest request)
    {
        var currencyByLicence =
            from firstItem in
                (from item in db.BorderExportLicenceItems
                 where db.Currencies.Any(currency => currency.Id == item.CurrencyId)
                 group item by item.BorderExportLicenceId into grouped
                 select new { LicenceId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.BorderExportLicenceItems on firstItem.ItemId equals item.Id
            join currency in db.Currencies on item.CurrencyId equals currency.Id
            select new { firstItem.LicenceId, currency.Code };

        var firstItemByLicence =
            from grouped in
                (from item in db.BorderExportLicenceItems
                 group item by item.BorderExportLicenceId into g
                 select new { LicenceId = g.Key, ItemId = g.Min(item => item.Id) })
            join item in db.BorderExportLicenceItems on grouped.ItemId equals item.Id
            select new { grouped.LicenceId, Amount = (decimal?)item.Amount };

        var hsCodeByLicence =
            from firstItem in
                (from item in db.BorderExportLicenceItems
                 where db.Hscodes.Any(hsCode => hsCode.Id == item.HscodeId)
                 group item by item.BorderExportLicenceId into grouped
                 select new { LicenceId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.BorderExportLicenceItems on firstItem.ItemId equals item.Id
            join hsCode in db.Hscodes on item.HscodeId equals hsCode.Id
            select new { firstItem.LicenceId, HSCode = hsCode.Code };

        var paThaKaQuery =
            from licence in db.BorderExportLicences
            join paThaKa in db.PaThaKas on licence.PaThaKaId equals paThaKa.Id
            join section in db.ExportImportSections on licence.ExportImportSectionId equals section.Id
            join sakhan in db.Sakhans on licence.SakhanId equals sakhan.Id
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join firstItemRow in firstItemByLicence on licence.Id equals firstItemRow.LicenceId into firstItemJoin
            from firstItemRow in firstItemJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByLicence on licence.Id equals hsCodeRow.LicenceId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where licence.ApplyType == Amend
                && licence.Status == Approved
                && licence.CardType == PaThaKaCardType
                && licence.CreatedDate >= request.FromDate
                && licence.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
                && (request.AmendRemarkId == 0 ? licence.AmendRemarkId != null : licence.AmendRemarkId == request.AmendRemarkId)
                && (request.CompanyRegistrationNo == string.Empty
                    ? paThaKa.CompanyRegistrationNo == paThaKa.CompanyRegistrationNo
                    : paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
                && (request.SakhanId == 0
                    ? licence.ExportImportSectionId == licence.SakhanId
                    : licence.ExportImportSectionId == request.SakhanId)
            select new sp_AmendReportResult
            {
                Date = licence.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = licence.OldExportLicenceNo,
                LicenceNo = licence.ExportLicenceNo,
                SDate = licence.CreatedDate == null
                    ? null
                    : (licence.CreatedDate.Value.Day < 10 ? "0" : string.Empty)
                    + licence.CreatedDate.Value.Day.ToString()
                    + "/"
                    + (licence.CreatedDate.Value.Month < 10 ? "0" : string.Empty)
                    + licence.CreatedDate.Value.Month.ToString()
                    + "/"
                    + licence.CreatedDate.Value.Year.ToString(),
                CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                CompanyName = paThaKa.CompanyName,
                UnitLevel = paThaKa.UnitLevel,
                StreetNumberStreetName = paThaKa.StreetNumberStreetName,
                QuarterCityTownship = paThaKa.QuarterCityTownship,
                State = paThaKa.State,
                Country = paThaKa.Country,
                PostalCode = paThaKa.PostalCode,
                Currency = currencyRow.Code,
                HSCode = hsCodeRow.HSCode,
                Amount = firstItemRow.Amount,
                SakhanId = sakhan.Id,
                SakhanCode = sakhan.Code,
                SakhanName = sakhan.Name
            };

        var individualTradingQuery =
            from licence in db.BorderExportLicences
            join individualTrading in db.IndividualTradings on licence.IndividualTradingId equals individualTrading.Id
            join section in db.ExportImportSections on licence.ExportImportSectionId equals section.Id
            join sakhan in db.Sakhans on licence.SakhanId equals sakhan.Id
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join firstItemRow in firstItemByLicence on licence.Id equals firstItemRow.LicenceId into firstItemJoin
            from firstItemRow in firstItemJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByLicence on licence.Id equals hsCodeRow.LicenceId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where licence.ApplyType == Amend
                && licence.Status == Approved
                && licence.CardType == IndividualTradingCardType
                && licence.CreatedDate >= request.FromDate
                && licence.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
                && (request.AmendRemarkId == 0 ? licence.AmendRemarkId != null : licence.AmendRemarkId == request.AmendRemarkId)
                && (request.CompanyRegistrationNo == string.Empty
                    ? individualTrading.Tinno == individualTrading.Tinno
                    : individualTrading.Tinno == request.CompanyRegistrationNo)
                && (request.SakhanId == 0 || licence.SakhanId == request.SakhanId)
            select new sp_AmendReportResult
            {
                Date = licence.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = licence.OldExportLicenceNo,
                LicenceNo = licence.ExportLicenceNo,
                SDate = licence.CreatedDate == null
                    ? null
                    : (licence.CreatedDate.Value.Day < 10 ? "0" : string.Empty)
                    + licence.CreatedDate.Value.Day.ToString()
                    + "/"
                    + (licence.CreatedDate.Value.Month < 10 ? "0" : string.Empty)
                    + licence.CreatedDate.Value.Month.ToString()
                    + "/"
                    + licence.CreatedDate.Value.Year.ToString(),
                CompanyRegistrationNo = individualTrading.Tinno,
                CompanyName = individualTrading.Name,
                UnitLevel = individualTrading.UnitLevel,
                StreetNumberStreetName = individualTrading.StreetNumberStreetName,
                QuarterCityTownship = individualTrading.QuarterCityTownship,
                State = individualTrading.State,
                Country = individualTrading.Country,
                PostalCode = individualTrading.PostalCode,
                Currency = currencyRow.Code,
                HSCode = hsCodeRow.HSCode,
                Amount = firstItemRow.Amount,
                SakhanId = sakhan.Id,
                SakhanCode = sakhan.Code,
                SakhanName = sakhan.Name
            };

        return paThaKaQuery.Concat(individualTradingQuery).OrderBy(result => result.Date);
    }

    private static IQueryable<sp_AmendReportResult> BorderImportLicenceQuery(
        TradeNetDbContext db,
        sp_AmendReportRequest request)
    {
        var currencyByLicence =
            from firstItem in
                (from item in db.BorderImportLicenceItems
                 where db.Currencies.Any(currency => currency.Id == item.CurrencyId)
                 group item by item.BorderImportLicenceId into grouped
                 select new { LicenceId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.BorderImportLicenceItems on firstItem.ItemId equals item.Id
            join currency in db.Currencies on item.CurrencyId equals currency.Id
            select new { firstItem.LicenceId, currency.Code };

        var firstItemByLicence =
            from grouped in
                (from item in db.BorderImportLicenceItems
                 group item by item.BorderImportLicenceId into g
                 select new { LicenceId = g.Key, ItemId = g.Min(item => item.Id) })
            join item in db.BorderImportLicenceItems on grouped.ItemId equals item.Id
            select new { grouped.LicenceId, Amount = (decimal?)item.Amount };

        var hsCodeByLicence =
            from firstItem in
                (from item in db.BorderImportLicenceItems
                 where db.Hscodes.Any(hsCode => hsCode.Id == item.HscodeId)
                 group item by item.BorderImportLicenceId into grouped
                 select new { LicenceId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.BorderImportLicenceItems on firstItem.ItemId equals item.Id
            join hsCode in db.Hscodes on item.HscodeId equals hsCode.Id
            select new { firstItem.LicenceId, HSCode = hsCode.Code };

        var paThaKaQuery =
            from licence in db.BorderImportLicences
            join paThaKa in db.PaThaKas on licence.PaThaKaId equals paThaKa.Id
            join section in db.ExportImportSections on licence.ExportImportSectionId equals section.Id
            join sakhan in db.Sakhans on licence.SakhanId equals sakhan.Id
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join firstItemRow in firstItemByLicence on licence.Id equals firstItemRow.LicenceId into firstItemJoin
            from firstItemRow in firstItemJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByLicence on licence.Id equals hsCodeRow.LicenceId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where licence.ApplyType == Amend
                && licence.Status == Approved
                && licence.CardType == PaThaKaCardType
                && licence.CreatedDate >= request.FromDate
                && licence.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
                && (request.AmendRemarkId == 0 ? licence.AmendRemarkId != null : licence.AmendRemarkId == request.AmendRemarkId)
                && (request.CompanyRegistrationNo == string.Empty
                    ? paThaKa.CompanyRegistrationNo == paThaKa.CompanyRegistrationNo
                    : paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
                && (request.SakhanId == 0 || licence.SakhanId == request.SakhanId)
            select new sp_AmendReportResult
            {
                Date = licence.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = licence.OldImportLicenceNo,
                LicenceNo = licence.ImportLicenceNo,
                SDate = licence.CreatedDate == null
                    ? null
                    : (licence.CreatedDate.Value.Day < 10 ? "0" : string.Empty)
                    + licence.CreatedDate.Value.Day.ToString()
                    + "/"
                    + (licence.CreatedDate.Value.Month < 10 ? "0" : string.Empty)
                    + licence.CreatedDate.Value.Month.ToString()
                    + "/"
                    + licence.CreatedDate.Value.Year.ToString(),
                CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                CompanyName = paThaKa.CompanyName,
                UnitLevel = paThaKa.UnitLevel,
                StreetNumberStreetName = paThaKa.StreetNumberStreetName,
                QuarterCityTownship = paThaKa.QuarterCityTownship,
                State = paThaKa.State,
                Country = paThaKa.Country,
                PostalCode = paThaKa.PostalCode,
                Currency = currencyRow.Code,
                HSCode = hsCodeRow.HSCode,
                Amount = firstItemRow.Amount,
                SakhanId = sakhan.Id,
                SakhanCode = sakhan.Code,
                SakhanName = sakhan.Name
            };

        var individualTradingQuery =
            from licence in db.BorderImportLicences
            join individualTrading in db.IndividualTradings on licence.IndividualTradingId equals individualTrading.Id
            join section in db.ExportImportSections on licence.ExportImportSectionId equals section.Id
            join sakhan in db.Sakhans on licence.SakhanId equals sakhan.Id
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join firstItemRow in firstItemByLicence on licence.Id equals firstItemRow.LicenceId into firstItemJoin
            from firstItemRow in firstItemJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByLicence on licence.Id equals hsCodeRow.LicenceId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where licence.ApplyType == Amend
                && licence.Status == Approved
                && licence.CardType == IndividualTradingCardType
                && licence.CreatedDate >= request.FromDate
                && licence.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
                && (request.AmendRemarkId == 0 ? licence.AmendRemarkId != null : licence.AmendRemarkId == request.AmendRemarkId)
                && (request.CompanyRegistrationNo == string.Empty
                    ? individualTrading.Tinno == individualTrading.Tinno
                    : individualTrading.Tinno == request.CompanyRegistrationNo)
                && (request.SakhanId == 0 || licence.SakhanId == request.SakhanId)
            select new sp_AmendReportResult
            {
                Date = licence.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = licence.OldImportLicenceNo,
                LicenceNo = licence.ImportLicenceNo,
                SDate = licence.CreatedDate == null
                    ? null
                    : (licence.CreatedDate.Value.Day < 10 ? "0" : string.Empty)
                    + licence.CreatedDate.Value.Day.ToString()
                    + "/"
                    + (licence.CreatedDate.Value.Month < 10 ? "0" : string.Empty)
                    + licence.CreatedDate.Value.Month.ToString()
                    + "/"
                    + licence.CreatedDate.Value.Year.ToString(),
                CompanyRegistrationNo = individualTrading.Tinno,
                CompanyName = individualTrading.Name,
                UnitLevel = individualTrading.UnitLevel,
                StreetNumberStreetName = individualTrading.StreetNumberStreetName,
                QuarterCityTownship = individualTrading.QuarterCityTownship,
                State = individualTrading.State,
                Country = individualTrading.Country,
                PostalCode = individualTrading.PostalCode,
                Currency = currencyRow.Code,
                HSCode = hsCodeRow.HSCode,
                Amount = firstItemRow.Amount,
                SakhanId = sakhan.Id,
                SakhanCode = sakhan.Code,
                SakhanName = sakhan.Name
            };

        return paThaKaQuery.Concat(individualTradingQuery).OrderBy(result => result.Date);
    }

    private static IQueryable<sp_AmendReportResult> BorderExportPermitQuery(
        TradeNetDbContext db,
        sp_AmendReportRequest request)
    {
        var currencyByPermit =
            from firstItem in
                (from item in db.BorderExportPermitItems
                 where db.Currencies.Any(currency => currency.Id == item.CurrencyId)
                 group item by item.BorderExportPermitId into grouped
                 select new { PermitId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.BorderExportPermitItems on firstItem.ItemId equals item.Id
            join currency in db.Currencies on item.CurrencyId equals currency.Id
            select new { firstItem.PermitId, currency.Code };

        var firstItemByPermit =
            from grouped in
                (from item in db.BorderExportPermitItems
                 group item by item.BorderExportPermitId into g
                 select new { PermitId = g.Key, ItemId = g.Min(item => item.Id) })
            join item in db.BorderExportPermitItems on grouped.ItemId equals item.Id
            select new { grouped.PermitId, Amount = (decimal?)item.Amount };

        var hsCodeByPermit =
            from firstItem in
                (from item in db.BorderExportPermitItems
                 where db.Hscodes.Any(hsCode => hsCode.Id == item.HscodeId)
                 group item by item.BorderExportPermitId into grouped
                 select new { PermitId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.BorderExportPermitItems on firstItem.ItemId equals item.Id
            join hsCode in db.Hscodes on item.HscodeId equals hsCode.Id
            select new { firstItem.PermitId, HSCode = hsCode.Code };

        return
            from permit in db.BorderExportPermits
            join paThaKa in db.PaThaKas on permit.PaThaKaId equals paThaKa.Id
            join section in db.ExportImportSections on permit.ExportImportSectionId equals section.Id
            join sakhan in db.Sakhans on permit.SakhanId equals sakhan.Id
            join currencyRow in currencyByPermit on permit.Id equals currencyRow.PermitId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join firstItemRow in firstItemByPermit on permit.Id equals firstItemRow.PermitId into firstItemJoin
            from firstItemRow in firstItemJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByPermit on permit.Id equals hsCodeRow.PermitId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where permit.ApplyType == Amend
                && permit.Status == Approved
                && permit.CreatedDate >= request.FromDate
                && permit.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || permit.ExportImportSectionId == request.ExportImportSectionId)
                && (request.AmendRemarkId == 0 ? permit.AmendRemarkId != null : permit.AmendRemarkId == request.AmendRemarkId)
                && (request.CompanyRegistrationNo == string.Empty
                    ? paThaKa.CompanyRegistrationNo == paThaKa.CompanyRegistrationNo
                    : paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
                && (request.SakhanId == 0 || permit.SakhanId == request.SakhanId)
            select new sp_AmendReportResult
            {
                Date = permit.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = permit.OldExportPermitNo,
                LicenceNo = permit.ExportPermitNo,
                SDate = permit.CreatedDate == null
                    ? null
                    : (permit.CreatedDate.Value.Day < 10 ? "0" : string.Empty)
                    + permit.CreatedDate.Value.Day.ToString()
                    + "/"
                    + (permit.CreatedDate.Value.Month < 10 ? "0" : string.Empty)
                    + permit.CreatedDate.Value.Month.ToString()
                    + "/"
                    + permit.CreatedDate.Value.Year.ToString(),
                CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                CompanyName = paThaKa.CompanyName,
                UnitLevel = paThaKa.UnitLevel,
                StreetNumberStreetName = paThaKa.StreetNumberStreetName,
                QuarterCityTownship = paThaKa.QuarterCityTownship,
                State = paThaKa.State,
                Country = paThaKa.Country,
                PostalCode = paThaKa.PostalCode,
                Currency = currencyRow.Code,
                HSCode = hsCodeRow.HSCode,
                Amount = firstItemRow.Amount,
                SakhanId = sakhan.Id,
                SakhanCode = sakhan.Code,
                SakhanName = sakhan.Name
            };
    }

    private static IQueryable<sp_AmendReportResult> BorderImportPermitQuery(
        TradeNetDbContext db,
        sp_AmendReportRequest request)
    {
        var currencyByPermit =
            from firstItem in
                (from item in db.BorderImportPermitItems
                 where db.Currencies.Any(currency => currency.Id == item.CurrencyId)
                 group item by item.BorderImportPermitId into grouped
                 select new { PermitId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.BorderImportPermitItems on firstItem.ItemId equals item.Id
            join currency in db.Currencies on item.CurrencyId equals currency.Id
            select new { firstItem.PermitId, currency.Code };

        var firstItemByPermit =
            from grouped in
                (from item in db.BorderImportPermitItems
                 group item by item.BorderImportPermitId into g
                 select new { PermitId = g.Key, ItemId = g.Min(item => item.Id) })
            join item in db.BorderImportPermitItems on grouped.ItemId equals item.Id
            select new { grouped.PermitId, Amount = (decimal?)item.Amount };

        var hsCodeByPermit =
            from firstItem in
                (from item in db.BorderImportPermitItems
                 where db.Hscodes.Any(hsCode => hsCode.Id == item.HscodeId)
                 group item by item.BorderImportPermitId into grouped
                 select new { PermitId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.BorderImportPermitItems on firstItem.ItemId equals item.Id
            join hsCode in db.Hscodes on item.HscodeId equals hsCode.Id
            select new { firstItem.PermitId, HSCode = hsCode.Code };

        return
            from permit in db.BorderImportPermits
            join paThaKa in db.PaThaKas on permit.PaThaKaId equals paThaKa.Id
            join section in db.ExportImportSections on permit.ExportImportSectionId equals section.Id
            join sakhan in db.Sakhans on permit.SakhanId equals sakhan.Id
            join currencyRow in currencyByPermit on permit.Id equals currencyRow.PermitId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join firstItemRow in firstItemByPermit on permit.Id equals firstItemRow.PermitId into firstItemJoin
            from firstItemRow in firstItemJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByPermit on permit.Id equals hsCodeRow.PermitId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where permit.ApplyType == Amend
                && permit.Status == Approved
                && permit.CreatedDate >= request.FromDate
                && permit.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || permit.ExportImportSectionId == request.ExportImportSectionId)
                && (request.AmendRemarkId == 0 ? permit.AmendRemarkId != null : permit.AmendRemarkId == request.AmendRemarkId)
                && (request.CompanyRegistrationNo == string.Empty
                    ? paThaKa.CompanyRegistrationNo == paThaKa.CompanyRegistrationNo
                    : paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
                && (request.SakhanId == 0 || permit.SakhanId == request.SakhanId)
            select new sp_AmendReportResult
            {
                Date = permit.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = permit.OldImportPermitNo,
                LicenceNo = permit.ImportPermitNo,
                SDate = permit.CreatedDate == null
                    ? null
                    : (permit.CreatedDate.Value.Day < 10 ? "0" : string.Empty)
                    + permit.CreatedDate.Value.Day.ToString()
                    + "/"
                    + (permit.CreatedDate.Value.Month < 10 ? "0" : string.Empty)
                    + permit.CreatedDate.Value.Month.ToString()
                    + "/"
                    + permit.CreatedDate.Value.Year.ToString(),
                CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                CompanyName = paThaKa.CompanyName,
                UnitLevel = paThaKa.UnitLevel,
                StreetNumberStreetName = paThaKa.StreetNumberStreetName,
                QuarterCityTownship = paThaKa.QuarterCityTownship,
                State = paThaKa.State,
                Country = paThaKa.Country,
                PostalCode = paThaKa.PostalCode,
                Currency = currencyRow.Code,
                HSCode = hsCodeRow.HSCode,
                Amount = firstItemRow.Amount,
                SakhanId = sakhan.Id,
                SakhanCode = sakhan.Code,
                SakhanName = sakhan.Name
            };
    }

    private static IQueryable<sp_AmendReportResult> EmptyQuery(TradeNetDbContext db)
    {
        return db.ExportLicences
            .Where(_ => false)
            .Select(licence => new sp_AmendReportResult
            {
                Date = licence.CreatedDate,
                SectionCode = licence.ExportImportSectionId.ToString(),
                SectionName = licence.ExportImportSectionId.ToString(),
                OldLicenceNo = licence.OldExportLicenceNo,
                LicenceNo = licence.ExportLicenceNo,
                SDate = licence.ApplicationNo,
                CompanyRegistrationNo = licence.PaThaKaId,
                CompanyName = licence.PaThaKaId,
                UnitLevel = licence.PaThaKaId,
                StreetNumberStreetName = licence.PaThaKaId,
                QuarterCityTownship = licence.PaThaKaId,
                State = licence.PaThaKaId,
                Country = licence.PaThaKaId,
                PostalCode = licence.PaThaKaId,
                Currency = licence.ApplyType,
                HSCode = licence.ApplyType,
                Amount = 0m,
                SakhanId = licence.ExportImportSectionId,
                SakhanCode = licence.ExportImportSectionId.ToString(),
                SakhanName = licence.ExportImportSectionId.ToString()
            });
    }
}

