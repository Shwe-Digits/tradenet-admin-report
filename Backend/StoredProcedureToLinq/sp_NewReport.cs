using API.DBContext;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.StoredProcedureToLinq;

public sealed class sp_NewReportRequest
{
    public string FormType { get; set; } = string.Empty;
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public int ExportImportSectionId { get; set; }
    public string CompanyRegistrationNo { get; set; } = string.Empty;
    public int SakhanId { get; set; }
    public string Auto { get; set; } = string.Empty;
    public string Quota { get; set; } = string.Empty;
}

public sealed class sp_NewReportResult
{
    public DateTime? Date { get; set; }
    public string? SectionCode { get; set; }
    public string? SectionName { get; set; }
    public string? OldLicenceNo { get; set; }
    public string? LicenceNo { get; set; }
    public string? SDate { get; set; }
    public string? ApplicationNo { get; set; }
    public DateTime? ApplicationDate { get; set; }
    public DateTime? LicenceDate { get; set; }
    public string? Remark { get; set; }
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
    public decimal? Amount { get; set; }
    public string? Auto { get; set; }
    public string? Quota { get; set; }
    public string? CommodityType { get; set; }
    public int? SakhanId { get; set; }
    public string? SakhanCode { get; set; }
    public string? SakhanName { get; set; }
    public string? TradeMethod { get; set; }
}

public sealed class sp_NewReportRow
{
    public DateTime? Date { get; set; }
    public string? SectionCode { get; set; }
    public string? SectionName { get; set; }
    public string? OldLicenceNo { get; set; }
    public string? LicenceNo { get; set; }
    public string? SDate { get; set; }
    public string? ApplicationNo { get; set; }
    public DateTime? ApplicationDate { get; set; }
    public DateTime? LicenceDate { get; set; }
    public string? Remark { get; set; }
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
    public decimal? Amount { get; set; }
    public string? Auto { get; set; }
    public string? Quota { get; set; }
    public string? CommodityType { get; set; }
    public int? SakhanId { get; set; }
    public string? SakhanCode { get; set; }
    public string? SakhanName { get; set; }
    public string? TradeMethod { get; set; }
    public int? TotalCount { get; set; }

    public sp_NewReportResult ToResult() => new()
    {
        Date = Date,
        SectionCode = SectionCode,
        SectionName = SectionName,
        OldLicenceNo = OldLicenceNo,
        LicenceNo = LicenceNo,
        SDate = SDate,
        ApplicationNo = ApplicationNo,
        ApplicationDate = ApplicationDate,
        LicenceDate = LicenceDate,
        Remark = Remark,
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
        Amount = Amount,
        Auto = Auto,
        Quota = Quota,
        CommodityType = CommodityType,
        SakhanId = SakhanId,
        SakhanCode = SakhanCode,
        SakhanName = SakhanName,
        TradeMethod = TradeMethod,
    };
}

public static class sp_NewReport
{
    private const string New = "New";
    private const string Approved = "Approved";
    private const string PaThaKaCardType = "Pa Tha Ka";
    private const string IndividualTradingCardType = "Individual Trading";

    /// <summary>
    /// Executes <c>dbo.sp_NewReport_pagination</c> (DB-side paging via INSERT-EXEC
    /// wrapper over the untouched original). The LINQ <see cref="Query"/> below is retained
    /// for not-yet-converted sibling report families.
    /// </summary>
    public static async Task<List<sp_NewReportRow>> ExecuteAsync(
        TradeNetDbContext db,
        sp_NewReportRequest request,
        string? sortColumn = null,
        string? sortOrder = null,
        int? pageIndex = null,
        int? pageSize = null,
        bool includeTotalCount = true)
    {
        return await ExecuteQueryable(db, request, sortColumn, sortOrder, pageIndex, pageSize, includeTotalCount)
            .ToListAsync();
    }

    public static IQueryable<sp_NewReportRow> ExecuteQueryable(
        TradeNetDbContext db,
        sp_NewReportRequest request,
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
            new SqlParameter("@CompanyRegistrationNo", request.CompanyRegistrationNo ?? string.Empty),
            new SqlParameter("@SakhanId", request.SakhanId),
            new SqlParameter("@auto", request.Auto ?? string.Empty),
            new SqlParameter("@quota", request.Quota ?? string.Empty),
            new SqlParameter("@SortColumn", (object?)sortColumn ?? DBNull.Value),
            new SqlParameter("@SortOrder", (object?)sortOrder ?? DBNull.Value),
            new SqlParameter("@PageIndex", (object?)pageIndex ?? DBNull.Value),
            new SqlParameter("@PageSize", (object?)pageSize ?? DBNull.Value),
            new SqlParameter("@IncludeTotalCount", includeTotalCount),
        };

        const string sql =
            "EXEC dbo.sp_NewReport_pagination @FormType, @FromDate, @ToDate, @ExportImportSectionId, " +
            "@CompanyRegistrationNo, @SakhanId, @auto, @SortColumn, @SortOrder, @PageIndex, @PageSize, @IncludeTotalCount, @quota";

        return db.Database.SqlQueryRaw<sp_NewReportRow>(sql, parameters);
    }

    public static IQueryable<sp_NewReportResult> Query(
        TradeNetDbContext db,
        sp_NewReportRequest request)
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

    private static IQueryable<sp_NewReportResult> ExportLicenceQuery(
        TradeNetDbContext db,
        sp_NewReportRequest request)
    {
        var amountByLicence =
            from item in db.ExportLicenceItems
            group item by item.ExportLicenceId into grouped
            select new { LicenceId = grouped.Key, Amount = grouped.Sum(item => (decimal?)item.Amount) };

        var currencyByLicence =
            from firstItem in
                (from item in db.ExportLicenceItems
                 where db.Currencies.Any(currency => currency.Id == item.CurrencyId)
                 group item by item.ExportLicenceId into grouped
                 select new { LicenceId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.ExportLicenceItems on firstItem.ItemId equals item.Id
            join currency in db.Currencies on item.CurrencyId equals currency.Id
            select new { firstItem.LicenceId, currency.Code };

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
            join amountRow in amountByLicence on licence.Id equals amountRow.LicenceId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByLicence on licence.Id equals hsCodeRow.LicenceId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where licence.ApplyType == New
                && licence.Status == Approved
                && licence.CreatedDate >= request.FromDate
                && licence.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
                && (request.CompanyRegistrationNo == string.Empty || paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
                && (request.Auto == string.Empty || licence.Auto == request.Auto)
            select new sp_NewReportResult
            {
                Date = licence.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = licence.OldExportLicenceNo,
                LicenceNo = licence.ExportLicenceNo,
                LicenceDate = licence.IssuedDate,
                SDate = licence.LastDate == null
                    ? null
                    : (licence.LastDate.Value.Day < 10 ? "0" : string.Empty)
                    + licence.LastDate.Value.Day.ToString()
                    + "/"
                    + (licence.LastDate.Value.Month < 10 ? "0" : string.Empty)
                    + licence.LastDate.Value.Month.ToString()
                    + "/"
                    + licence.LastDate.Value.Year.ToString(),
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
                Amount = amountRow.Amount ?? 0,
                Auto = licence.Auto
            };
    }

    private static IQueryable<sp_NewReportResult> ImportLicenceQuery(
        TradeNetDbContext db,
        sp_NewReportRequest request)
    {
        var amountByLicence =
            from item in db.ImportLicenceItems
            group item by item.ImportLicenceId into grouped
            select new { LicenceId = grouped.Key, Amount = grouped.Sum(item => (decimal?)item.Amount) };

        var currencyByLicence =
            from firstItem in
                (from item in db.ImportLicenceItems
                 where db.Currencies.Any(currency => currency.Id == item.CurrencyId)
                 group item by item.ImportLicenceId into grouped
                 select new { LicenceId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.ImportLicenceItems on firstItem.ItemId equals item.Id
            join currency in db.Currencies on item.CurrencyId equals currency.Id
            select new { firstItem.LicenceId, currency.Code };

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
            join amountRow in amountByLicence on licence.Id equals amountRow.LicenceId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByLicence on licence.Id equals hsCodeRow.LicenceId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where licence.ApplyType == New
                && licence.Status == Approved
                && licence.CreatedDate >= request.FromDate
                && licence.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
                && (request.CompanyRegistrationNo == string.Empty || paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
                && (request.Auto == string.Empty || licence.Auto == request.Auto)
                && (request.Quota == string.Empty || licence.Quota == request.Quota)
            select new sp_NewReportResult
            {
                Date = licence.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = licence.OldImportLicenceNo,
                LicenceNo = licence.ImportLicenceNo,
                SDate = licence.LastDate == null
                    ? null
                    : (licence.LastDate.Value.Day < 10 ? "0" : string.Empty)
                    + licence.LastDate.Value.Day.ToString()
                    + "/"
                    + (licence.LastDate.Value.Month < 10 ? "0" : string.Empty)
                    + licence.LastDate.Value.Month.ToString()
                    + "/"
                    + licence.LastDate.Value.Year.ToString(),
                ApplicationNo = licence.ApplicationNo,
                ApplicationDate = licence.ApplicationDate,
                LicenceDate = licence.IssuedDate,
                Remark = licence.Remark,
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
                Amount = amountRow.Amount ?? 0,
                Auto = licence.Auto,
                Quota = licence.Quota,
                CommodityType = licence.CommodityType
            };
    }

    private static IQueryable<sp_NewReportResult> ExportPermitQuery(
        TradeNetDbContext db,
        sp_NewReportRequest request)
    {
        var amountByPermit =
            from item in db.ExportPermitItems
            group item by item.ExportPermitId into grouped
            select new { PermitId = grouped.Key, Amount = grouped.Sum(item => (decimal?)item.Amount) };

        var currencyByPermit =
            from firstItem in
                (from item in db.ExportPermitItems
                 where db.Currencies.Any(currency => currency.Id == item.CurrencyId)
                 group item by item.ExportPermitId into grouped
                 select new { PermitId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.ExportPermitItems on firstItem.ItemId equals item.Id
            join currency in db.Currencies on item.CurrencyId equals currency.Id
            select new { firstItem.PermitId, currency.Code };

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
            join amountRow in amountByPermit on permit.Id equals amountRow.PermitId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByPermit on permit.Id equals currencyRow.PermitId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByPermit on permit.Id equals hsCodeRow.PermitId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where permit.ApplyType == New
                && permit.Status == Approved
                && permit.CreatedDate >= request.FromDate
                && permit.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || permit.ExportImportSectionId == request.ExportImportSectionId)
                && (request.CompanyRegistrationNo == string.Empty || paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
            select new sp_NewReportResult
            {
                Date = permit.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = permit.OldExportPermitNo,
                LicenceNo = permit.ExportPermitNo,
                LicenceDate = permit.IssuedDate,
                SDate = permit.LastDate == null
                    ? null
                    : (permit.LastDate.Value.Day < 10 ? "0" : string.Empty)
                    + permit.LastDate.Value.Day.ToString()
                    + "/"
                    + (permit.LastDate.Value.Month < 10 ? "0" : string.Empty)
                    + permit.LastDate.Value.Month.ToString()
                    + "/"
                    + permit.LastDate.Value.Year.ToString(),
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
                Amount = amountRow.Amount ?? 0
            };
    }

    private static IQueryable<sp_NewReportResult> ImportPermitQuery(
        TradeNetDbContext db,
        sp_NewReportRequest request)
    {
        var amountByPermit =
            from item in db.ImportPermitItems
            group item by item.ImportPermitId into grouped
            select new { PermitId = grouped.Key, Amount = grouped.Sum(item => (decimal?)item.Amount) };

        var currencyByPermit =
            from firstItem in
                (from item in db.ImportPermitItems
                 where db.Currencies.Any(currency => currency.Id == item.CurrencyId)
                 group item by item.ImportPermitId into grouped
                 select new { PermitId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.ImportPermitItems on firstItem.ItemId equals item.Id
            join currency in db.Currencies on item.CurrencyId equals currency.Id
            select new { firstItem.PermitId, currency.Code };

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
            join amountRow in amountByPermit on permit.Id equals amountRow.PermitId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByPermit on permit.Id equals currencyRow.PermitId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByPermit on permit.Id equals hsCodeRow.PermitId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where permit.ApplyType == New
                && permit.Status == Approved
                && permit.CreatedDate >= request.FromDate
                && permit.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || permit.ExportImportSectionId == request.ExportImportSectionId)
                && (request.CompanyRegistrationNo == string.Empty || paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
            select new sp_NewReportResult
            {
                Date = permit.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = permit.OldImportPermitNo,
                LicenceNo = permit.ImportPermitNo,
                LicenceDate = permit.IssuedDate,
                SDate = permit.LastDate == null
                    ? null
                    : (permit.LastDate.Value.Day < 10 ? "0" : string.Empty)
                    + permit.LastDate.Value.Day.ToString()
                    + "/"
                    + (permit.LastDate.Value.Month < 10 ? "0" : string.Empty)
                    + permit.LastDate.Value.Month.ToString()
                    + "/"
                    + permit.LastDate.Value.Year.ToString(),
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
                CommodityType = permit.CommodityType,
                Amount = amountRow.Amount ?? 0
            };
    }

    private static IQueryable<sp_NewReportResult> BorderExportLicenceQuery(
        TradeNetDbContext db,
        sp_NewReportRequest request)
    {
        var amountByLicence =
            from item in db.BorderExportLicenceItems
            group item by item.BorderExportLicenceId into grouped
            select new { LicenceId = grouped.Key, Amount = grouped.Sum(item => (decimal?)item.Amount) };

        var currencyByLicence =
            from firstItem in
                (from item in db.BorderExportLicenceItems
                 where db.Currencies.Any(currency => currency.Id == item.CurrencyId)
                 group item by item.BorderExportLicenceId into grouped
                 select new { LicenceId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.BorderExportLicenceItems on firstItem.ItemId equals item.Id
            join currency in db.Currencies on item.CurrencyId equals currency.Id
            select new { firstItem.LicenceId, currency.Code };

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
            join amountRow in amountByLicence on licence.Id equals amountRow.LicenceId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByLicence on licence.Id equals hsCodeRow.LicenceId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where licence.ApplyType == New
                && licence.Status == Approved
                && licence.CardType == PaThaKaCardType
                && licence.CreatedDate >= request.FromDate
                && licence.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
                && (request.CompanyRegistrationNo == string.Empty || paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
                && (request.SakhanId == 0 || licence.SakhanId == request.SakhanId)
                && (request.Auto == string.Empty || licence.Auto == request.Auto)
            select new sp_NewReportResult
            {
                Date = licence.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = licence.OldExportLicenceNo,
                LicenceNo = licence.ExportLicenceNo,
                LicenceDate = licence.IssuedDate,
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
                Amount = amountRow.Amount ?? 0,
                Auto = licence.Auto,
                SakhanId = sakhan.Id,
                SakhanCode = sakhan.Code,
                SakhanName = sakhan.Name
            };

        var individualTradingQuery =
            from licence in db.BorderExportLicences
            join individualTrading in db.IndividualTradings on licence.IndividualTradingId equals individualTrading.Id
            join section in db.ExportImportSections on licence.ExportImportSectionId equals section.Id
            join sakhan in db.Sakhans on licence.SakhanId equals sakhan.Id
            join amountRow in amountByLicence on licence.Id equals amountRow.LicenceId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByLicence on licence.Id equals hsCodeRow.LicenceId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where licence.ApplyType == New
                && licence.Status == Approved
                && licence.CardType == IndividualTradingCardType
                && licence.CreatedDate >= request.FromDate
                && licence.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
                && (request.CompanyRegistrationNo == string.Empty || individualTrading.Tinno == request.CompanyRegistrationNo)
                && (request.SakhanId == 0 || licence.SakhanId == request.SakhanId)
                && (request.Auto == string.Empty || licence.Auto == request.Auto)
            select new sp_NewReportResult
            {
                Date = licence.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = licence.OldExportLicenceNo,
                LicenceNo = licence.ExportLicenceNo,
                LicenceDate = licence.IssuedDate,
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
                Amount = amountRow.Amount ?? 0,
                Auto = licence.Auto,
                SakhanId = sakhan.Id,
                SakhanCode = sakhan.Code,
                SakhanName = sakhan.Name
            };

        return paThaKaQuery.Concat(individualTradingQuery).OrderBy(result => result.Date);
    }

    private static IQueryable<sp_NewReportResult> BorderImportLicenceQuery(
        TradeNetDbContext db,
        sp_NewReportRequest request)
    {
        var amountByLicence =
            from item in db.BorderImportLicenceItems
            group item by item.BorderImportLicenceId into grouped
            select new { LicenceId = grouped.Key, Amount = grouped.Sum(item => (decimal?)item.Amount) };

        var currencyByLicence =
            from firstItem in
                (from item in db.BorderImportLicenceItems
                 where db.Currencies.Any(currency => currency.Id == item.CurrencyId)
                 group item by item.BorderImportLicenceId into grouped
                 select new { LicenceId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.BorderImportLicenceItems on firstItem.ItemId equals item.Id
            join currency in db.Currencies on item.CurrencyId equals currency.Id
            select new { firstItem.LicenceId, currency.Code };

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
            join amountRow in amountByLicence on licence.Id equals amountRow.LicenceId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByLicence on licence.Id equals hsCodeRow.LicenceId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where licence.ApplyType == New
                && licence.Status == Approved
                && licence.CardType == PaThaKaCardType
                && licence.CreatedDate >= request.FromDate
                && licence.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
                && (request.CompanyRegistrationNo == string.Empty || paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
                && (request.SakhanId == 0 || licence.SakhanId == request.SakhanId)
            select new sp_NewReportResult
            {
                Date = licence.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = licence.OldImportLicenceNo,
                LicenceNo = licence.ImportLicenceNo,
                LicenceDate = licence.IssuedDate,
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
                Amount = amountRow.Amount ?? 0,
                Auto = licence.Auto,
                Quota = licence.Quota,
                SakhanId = sakhan.Id,
                SakhanCode = sakhan.Code,
                SakhanName = sakhan.Name
            };

        var individualTradingQuery =
            from licence in db.BorderImportLicences
            join individualTrading in db.IndividualTradings on licence.IndividualTradingId equals individualTrading.Id
            join section in db.ExportImportSections on licence.ExportImportSectionId equals section.Id
            join sakhan in db.Sakhans on licence.SakhanId equals sakhan.Id
            join amountRow in amountByLicence on licence.Id equals amountRow.LicenceId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByLicence on licence.Id equals hsCodeRow.LicenceId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where licence.ApplyType == New
                && licence.Status == Approved
                && licence.CardType == IndividualTradingCardType
                && licence.CreatedDate >= request.FromDate
                && licence.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
                && (request.CompanyRegistrationNo == string.Empty || individualTrading.Tinno == request.CompanyRegistrationNo)
                && (request.SakhanId == 0 || licence.SakhanId == request.SakhanId)
            select new sp_NewReportResult
            {
                Date = licence.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = licence.OldImportLicenceNo,
                LicenceNo = licence.ImportLicenceNo,
                LicenceDate = licence.IssuedDate,
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
                Amount = amountRow.Amount ?? 0,
                Auto = licence.Auto,
                Quota = licence.Quota,
                SakhanId = sakhan.Id,
                SakhanCode = sakhan.Code,
                SakhanName = sakhan.Name
            };

        return paThaKaQuery.Concat(individualTradingQuery).OrderBy(result => result.Date);
    }

    private static IQueryable<sp_NewReportResult> BorderExportPermitQuery(
        TradeNetDbContext db,
        sp_NewReportRequest request)
    {
        var amountByPermit =
            from item in db.BorderExportPermitItems
            group item by item.BorderExportPermitId into grouped
            select new { PermitId = grouped.Key, Amount = grouped.Sum(item => (decimal?)item.Amount) };

        var currencyByPermit =
            from firstItem in
                (from item in db.BorderExportPermitItems
                 where db.Currencies.Any(currency => currency.Id == item.CurrencyId)
                 group item by item.BorderExportPermitId into grouped
                 select new { PermitId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.BorderExportPermitItems on firstItem.ItemId equals item.Id
            join currency in db.Currencies on item.CurrencyId equals currency.Id
            select new { firstItem.PermitId, currency.Code };

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
            join amountRow in amountByPermit on permit.Id equals amountRow.PermitId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByPermit on permit.Id equals currencyRow.PermitId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByPermit on permit.Id equals hsCodeRow.PermitId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where permit.ApplyType == New
                && permit.Status == Approved
                && permit.CreatedDate >= request.FromDate
                && permit.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || permit.ExportImportSectionId == request.ExportImportSectionId)
                && (request.CompanyRegistrationNo == string.Empty || paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
                && (request.SakhanId == 0 || permit.SakhanId == request.SakhanId)
            select new sp_NewReportResult
            {
                Date = permit.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = permit.OldExportPermitNo,
                LicenceNo = permit.ExportPermitNo,
                LicenceDate = permit.IssuedDate,
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
                Amount = amountRow.Amount ?? 0,
                SakhanId = sakhan.Id,
                SakhanCode = sakhan.Code,
                SakhanName = sakhan.Name
            };
    }

    private static IQueryable<sp_NewReportResult> BorderImportPermitQuery(
        TradeNetDbContext db,
        sp_NewReportRequest request)
    {
        var amountByPermit =
            from item in db.BorderImportPermitItems
            group item by item.BorderImportPermitId into grouped
            select new { PermitId = grouped.Key, Amount = grouped.Sum(item => (decimal?)item.Amount) };

        var currencyByPermit =
            from firstItem in
                (from item in db.BorderImportPermitItems
                 where db.Currencies.Any(currency => currency.Id == item.CurrencyId)
                 group item by item.BorderImportPermitId into grouped
                 select new { PermitId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.BorderImportPermitItems on firstItem.ItemId equals item.Id
            join currency in db.Currencies on item.CurrencyId equals currency.Id
            select new { firstItem.PermitId, currency.Code };

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
            join amountRow in amountByPermit on permit.Id equals amountRow.PermitId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByPermit on permit.Id equals currencyRow.PermitId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join hsCodeRow in hsCodeByPermit on permit.Id equals hsCodeRow.PermitId into hsCodeJoin
            from hsCodeRow in hsCodeJoin.DefaultIfEmpty()
            where permit.ApplyType == New
                && permit.Status == Approved
                && permit.CreatedDate >= request.FromDate
                && permit.CreatedDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || permit.ExportImportSectionId == request.ExportImportSectionId)
                && (request.CompanyRegistrationNo == string.Empty || paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
                && (request.SakhanId == 0 || permit.SakhanId == request.SakhanId)
            select new sp_NewReportResult
            {
                Date = permit.CreatedDate,
                SectionCode = section.Code,
                SectionName = section.Name,
                OldLicenceNo = permit.OldImportPermitNo,
                LicenceNo = permit.ImportPermitNo,
                LicenceDate = permit.IssuedDate,
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
                Amount = amountRow.Amount ?? 0,
                SakhanId = sakhan.Id,
                SakhanCode = sakhan.Code,
                SakhanName = sakhan.Name
            };
    }

    private static IQueryable<sp_NewReportResult> EmptyQuery(TradeNetDbContext db)
    {
        return db.ExportLicences
            .Where(_ => false)
            .Select(licence => new sp_NewReportResult
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
                Auto = licence.Auto,
                Quota = licence.CommodityType,
                CommodityType = licence.CommodityType,
                SakhanId = licence.ExportImportSectionId,
                SakhanCode = licence.ExportImportSectionId.ToString(),
                SakhanName = licence.ExportImportSectionId.ToString()
            });
    }
}
