using API.DBContext;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.StoredProcedureToLinq;

public sealed class sp_PendingReportRequest
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public string FormType { get; set; } = string.Empty;
    public int ExportImportSectionId { get; set; }
}

public sealed class sp_PendingReportResult
{
    public string Status { get; set; } = null!;
    public string ApplyType { get; set; } = null!;
    public DateTime ApplicationDate { get; set; }
    public DateTime? LicenceDate { get; set; }
    public string ApplicationNo { get; set; } = null!;
    public string SectionCode { get; set; } = null!;
    public string SectionName { get; set; } = null!;
    public string CompanyRegistrationNo { get; set; } = null!;
    public string CompanyName { get; set; } = null!;
    public string? Currency { get; set; }
    public string? AdditionalDescription { get; set; }
    public decimal Amount { get; set; }
    public string? CommodityType { get; set; }
    public string? HSCode { get; set; }
    public string? TradeMethod { get; set; }
}

public class sp_PendingReportRow
{
    public string? Status { get; set; }
    public string? ApplyType { get; set; }
    public DateTime? ApplicationDate { get; set; }
    public DateTime? LicenceDate { get; set; }
    public string? ApplicationNo { get; set; }
    public string? SectionCode { get; set; }
    public string? SectionName { get; set; }
    public string? CompanyRegistrationNo { get; set; }
    public string? CompanyName { get; set; }
    public string? Currency { get; set; }
    public string? AdditionalDescription { get; set; }
    public decimal? Amount { get; set; }
    public string? CommodityType { get; set; }
    public string? HSCode { get; set; }
    public int? TotalCount { get; set; }

    public sp_PendingReportResult ToResult() => new()
    {
        Status = Status ?? string.Empty,
        ApplyType = ApplyType ?? string.Empty,
        ApplicationDate = ApplicationDate ?? default,
        LicenceDate = LicenceDate,
        ApplicationNo = ApplicationNo ?? string.Empty,
        SectionCode = SectionCode ?? string.Empty,
        SectionName = SectionName ?? string.Empty,
        CompanyRegistrationNo = CompanyRegistrationNo ?? string.Empty,
        CompanyName = CompanyName ?? string.Empty,
        Currency = Currency,
        AdditionalDescription = AdditionalDescription,
        Amount = Amount ?? 0m,
        CommodityType = CommodityType,
        HSCode = HSCode,
    };
}

public sealed class sp_LicencePendingReportRow : sp_PendingReportRow
{
    public string? TradeMethod { get; set; }

    public sp_PendingReportResult ToLicenceResult()
    {
        var result = ToResult();
        result.TradeMethod = TradeMethod;
        return result;
    }
}

public static class sp_PendingReport
{
    private const string Pending = "Pending";
    private const string Reject = "Reject";

    /// <summary>
    /// Executes <c>dbo.sp_PendingReport_pagination</c> (DB-side paging via INSERT-EXEC
    /// wrapper over the untouched original). The LINQ <see cref="Query"/> below is retained
    /// for not-yet-converted sibling report families.
    /// </summary>
    public static async Task<List<sp_LicencePendingReportRow>> ExecuteAsync(
        TradeNetDbContext db,
        sp_PendingReportRequest request,
        string? sortColumn = null,
        string? sortOrder = null,
        int? pageIndex = null,
        int? pageSize = null,
        bool includeTotalCount = true)
    {
        return await ExecuteQueryable(db, request, sortColumn, sortOrder, pageIndex, pageSize, includeTotalCount)
            .ToListAsync();
    }

    public static IQueryable<sp_LicencePendingReportRow> ExecuteQueryable(
        TradeNetDbContext db,
        sp_PendingReportRequest request,
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
            new SqlParameter("@FromDate", request.FromDate),
            new SqlParameter("@ToDate", request.ToDate),
            new SqlParameter("@FormType", request.FormType ?? string.Empty),
            new SqlParameter("@ExportImportSectionId", request.ExportImportSectionId),
            new SqlParameter("@SortColumn", (object?)sortColumn ?? DBNull.Value),
            new SqlParameter("@SortOrder", (object?)sortOrder ?? DBNull.Value),
            new SqlParameter("@PageIndex", (object?)pageIndex ?? DBNull.Value),
            new SqlParameter("@PageSize", (object?)pageSize ?? DBNull.Value),
            new SqlParameter("@IncludeTotalCount", includeTotalCount),
        };

        const string sql =
            "EXEC dbo.sp_PendingReport_pagination @FromDate, @ToDate, @FormType, @ExportImportSectionId, " +
            "@SortColumn, @SortOrder, @PageIndex, @PageSize, @IncludeTotalCount";

        return db.Database.SqlQueryRaw<sp_LicencePendingReportRow>(sql, parameters);
    }

    public static IQueryable<sp_PendingReportResult> Query(
        TradeNetDbContext db,
        sp_PendingReportRequest request)
    {
        ArgumentNullException.ThrowIfNull(db);
        ArgumentNullException.ThrowIfNull(request);

        // The Border Import pending endpoint must never build a query over the
        // ordinary ImportLicence/ExportLicence tables. Keeping a dedicated query
        // also makes its grid and streaming Excel paths independent of the
        // currently deployed, incorrectly hard-coded pagination procedure.
        if (request.FormType == "Border Import Licence")
        {
            return BorderImportLicenceQuery(db, request);
        }

        var importCurrencyByLicence =
            from firstItem in
                (from item in db.ImportLicenceItems
                 where db.Currencies.Any(currency => currency.Id == item.CurrencyId)
                 group item by item.ImportLicenceId into grouped
                 select new { LicenceId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.ImportLicenceItems on firstItem.ItemId equals item.Id
            join currency in db.Currencies on item.CurrencyId equals currency.Id
            select new { firstItem.LicenceId, currency.Code };

        var importAmountByLicence =
            from item in db.ImportLicenceItems
            group item by item.ImportLicenceId into grouped
            select new { LicenceId = grouped.Key, Amount = grouped.Sum(item => (decimal?)item.Amount) };

        var importFirstItemByLicence =
            from grouped in
                (from item in db.ImportLicenceItems
                 group item by item.ImportLicenceId into g
                 select new { LicenceId = g.Key, ItemId = g.Min(item => item.Id) })
            join item in db.ImportLicenceItems on grouped.ItemId equals item.Id
            select new { grouped.LicenceId, item.Description, item.Hscode };

        var exportCurrencyByLicence =
            from firstItem in
                (from item in db.ExportLicenceItems
                 where db.Currencies.Any(currency => currency.Id == item.CurrencyId)
                 group item by item.ExportLicenceId into grouped
                 select new { LicenceId = grouped.Key, ItemId = grouped.Min(item => item.Id) })
            join item in db.ExportLicenceItems on firstItem.ItemId equals item.Id
            join currency in db.Currencies on item.CurrencyId equals currency.Id
            select new { firstItem.LicenceId, currency.Code };

        var exportAmountByLicence =
            from item in db.ExportLicenceItems
            group item by item.ExportLicenceId into grouped
            select new { LicenceId = grouped.Key, Amount = grouped.Sum(item => (decimal?)item.Amount) };

        var exportFirstItemByLicence =
            from grouped in
                (from item in db.ExportLicenceItems
                 group item by item.ExportLicenceId into g
                 select new { LicenceId = g.Key, ItemId = g.Min(item => item.Id) })
            join item in db.ExportLicenceItems on grouped.ItemId equals item.Id
            select new { grouped.LicenceId, item.Description, item.Hscode };

        return
            (from licence in db.ImportLicences
             join paThaKa in db.PaThaKas on licence.PaThaKaId equals paThaKa.Id
             join section in db.ExportImportSections on licence.ExportImportSectionId equals section.Id
             join currencyRow in importCurrencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
             from currencyRow in currencyJoin.DefaultIfEmpty()
             join amountRow in importAmountByLicence on licence.Id equals amountRow.LicenceId into amountJoin
             from amountRow in amountJoin.DefaultIfEmpty()
             join firstItemRow in importFirstItemByLicence on licence.Id equals firstItemRow.LicenceId into firstItemJoin
             from firstItemRow in firstItemJoin.DefaultIfEmpty()
             where request.FormType == "Import Licence"
                && (licence.Status == Pending || licence.Status == Reject)
                && licence.ApplicationDate >= request.FromDate
                && licence.ApplicationDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
             select new sp_PendingReportResult
             {
                 Status = licence.Status,
                 ApplyType = licence.ApplyType,
                 ApplicationDate = licence.ApplicationDate,
                 LicenceDate = licence.IssuedDate,
                 ApplicationNo = licence.ApplicationNo,
                 SectionCode = section.Code,
                 SectionName = section.Name,
                 CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                 CompanyName = paThaKa.CompanyName,
                 Currency = currencyRow.Code,
                 AdditionalDescription = firstItemRow.Description,
                 Amount = amountRow.Amount ?? 0m,
                 CommodityType = licence.CommodityType,
                 HSCode = firstItemRow.Hscode
             })
            .Concat(
            from licence in db.ExportLicences
            join paThaKa in db.PaThaKas on licence.PaThaKaId equals paThaKa.Id
            join section in db.ExportImportSections on licence.ExportImportSectionId equals section.Id
            join currencyRow in exportCurrencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join amountRow in exportAmountByLicence on licence.Id equals amountRow.LicenceId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join firstItemRow in exportFirstItemByLicence on licence.Id equals firstItemRow.LicenceId into firstItemJoin
            from firstItemRow in firstItemJoin.DefaultIfEmpty()
            where request.FormType == "Export Licence"
                && (licence.Status == Pending || licence.Status == Reject)
                && licence.ApplicationDate >= request.FromDate
                && licence.ApplicationDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
            select new sp_PendingReportResult
            {
                Status = licence.Status,
                ApplyType = licence.ApplyType,
                ApplicationDate = licence.ApplicationDate,
                LicenceDate = licence.IssuedDate,
                ApplicationNo = licence.ApplicationNo,
                SectionCode = section.Code,
                SectionName = section.Name,
                CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                CompanyName = paThaKa.CompanyName,
                Currency = currencyRow.Code,
                AdditionalDescription = firstItemRow.Description,
                Amount = amountRow.Amount ?? 0m,
                CommodityType = licence.CommodityType,
                HSCode = firstItemRow.Hscode
            });
    }

    private static IQueryable<sp_PendingReportResult> BorderImportLicenceQuery(
        TradeNetDbContext db,
        sp_PendingReportRequest request)
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

        var amountByLicence =
            from item in db.BorderImportLicenceItems
            group item by item.BorderImportLicenceId into grouped
            select new { LicenceId = grouped.Key, Amount = grouped.Sum(item => (decimal?)item.Amount) };

        var firstItemByLicence =
            from grouped in
                (from item in db.BorderImportLicenceItems
                 group item by item.BorderImportLicenceId into g
                 select new { LicenceId = g.Key, ItemId = g.Min(item => item.Id) })
            join item in db.BorderImportLicenceItems on grouped.ItemId equals item.Id
            select new { grouped.LicenceId, item.Description, item.Hscode };

        return
            from licence in db.BorderImportLicences
            join paThaKa in db.PaThaKas on licence.PaThaKaId equals paThaKa.Id
            join section in db.ExportImportSections on licence.ExportImportSectionId equals section.Id
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            join amountRow in amountByLicence on licence.Id equals amountRow.LicenceId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join firstItemRow in firstItemByLicence on licence.Id equals firstItemRow.LicenceId into firstItemJoin
            from firstItemRow in firstItemJoin.DefaultIfEmpty()
            where (licence.Status == Pending || licence.Status == Reject)
                && licence.ApplicationDate >= request.FromDate
                && licence.ApplicationDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
            select new sp_PendingReportResult
            {
                Status = licence.Status,
                ApplyType = licence.ApplyType,
                ApplicationDate = licence.ApplicationDate,
                LicenceDate = licence.IssuedDate,
                ApplicationNo = licence.ApplicationNo,
                SectionCode = section.Code,
                SectionName = section.Name,
                CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                CompanyName = paThaKa.CompanyName,
                Currency = currencyRow.Code,
                AdditionalDescription = firstItemRow.Description,
                Amount = amountRow.Amount ?? 0m,
                CommodityType = licence.CommodityType,
                HSCode = firstItemRow.Hscode,
                TradeMethod = db.ExportImportMethods
                    .Where(method => method.Id == licence.ExportImportMethodId)
                    .Select(method => method.Name)
                    .FirstOrDefault()
            };
    }
}
