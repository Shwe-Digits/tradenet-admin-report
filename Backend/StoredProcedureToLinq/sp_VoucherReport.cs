using API.DBContext;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.StoredProcedureToLinq;

public sealed class sp_VoucherReportRequest
{
    public string FormType { get; set; } = string.Empty;
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public int ExportImportSectionId { get; set; }
    public string PaymentType { get; set; } = string.Empty;
    public string ApplyType { get; set; } = string.Empty;
    public string CompanyRegistrationNo { get; set; } = string.Empty;
    public int SakhanId { get; set; }
}

public sealed class sp_VoucherReportResult
{
    public string ApplicationNo { get; set; } = null!;
    public DateTime ApplicationDate { get; set; }
    public string ApprovedUser { get; set; } = null!;
    public DateTime? Date { get; set; }
    public string? SDate { get; set; }
    public string? SectionCode { get; set; }
    public string ApplyType { get; set; } = null!;
    public string? OldLicenceNo { get; set; }
    public string LicenceNo { get; set; } = null!;
    public DateTime? LicenceDate { get; set; }
    public string? SLicenceDate { get; set; }
    public string CompanyRegistrationNo { get; set; } = null!;
    public string CompanyName { get; set; } = null!;
    public string? VoucherNo { get; set; }
    public DateTime? VoucherDate { get; set; }
    public string? SVoucherDate { get; set; }
    public double Amount { get; set; }
    public string PaymentType { get; set; } = null!;
    public int? SakhanId { get; set; }
    public string? SakhanCode { get; set; }
    public string? SakhanName { get; set; }
    public string? TradeMethod { get; set; }
    public string? Currency { get; set; }
    public decimal? TotalAmount { get; set; }
    public string? CommodityType { get; set; }
    public decimal? ExchangeRate { get; set; }
    public double? TotalCIF { get; set; }
}

public sealed class sp_VoucherReportRow
{
    public string? ApplicationNo { get; set; }
    public DateTime? ApplicationDate { get; set; }
    public string? ApprovedUser { get; set; }
    public DateTime? Date { get; set; }
    public string? SDate { get; set; }
    public string? SectionCode { get; set; }
    public string? ApplyType { get; set; }
    public string? OldLicenceNo { get; set; }
    public string? LicenceNo { get; set; }
    public DateTime? LicenceDate { get; set; }
    public string? SLicenceDate { get; set; }
    public string? CompanyRegistrationNo { get; set; }
    public string? CompanyName { get; set; }
    public string? VoucherNo { get; set; }
    public DateTime? VoucherDate { get; set; }
    public string? SVoucherDate { get; set; }
    public decimal? Amount { get; set; }
    public string? PaymentType { get; set; }
    public string? Currency { get; set; }
    public decimal? TotalAmount { get; set; }
    public string? CommodityType { get; set; }
    public decimal? ExchangeRate { get; set; }
    public decimal? TotalCIF { get; set; }
    public int? SakhanId { get; set; }
    public string? SakhanCode { get; set; }
    public string? SakhanName { get; set; }
    public string? TradeMethod { get; set; }
    public int? TotalCount { get; set; }

    public sp_VoucherReportResult ToResult() => new()
    {
        ApplicationNo = ApplicationNo ?? string.Empty,
        ApplicationDate = ApplicationDate ?? default,
        ApprovedUser = ApprovedUser ?? string.Empty,
        Date = Date,
        SDate = SDate,
        SectionCode = SectionCode,
        ApplyType = ApplyType ?? string.Empty,
        OldLicenceNo = OldLicenceNo,
        LicenceNo = LicenceNo ?? string.Empty,
        LicenceDate = LicenceDate,
        SLicenceDate = SLicenceDate,
        CompanyRegistrationNo = CompanyRegistrationNo ?? string.Empty,
        CompanyName = CompanyName ?? string.Empty,
        VoucherNo = VoucherNo,
        VoucherDate = VoucherDate,
        SVoucherDate = SVoucherDate,
        Amount = (double)(Amount ?? 0m),
        PaymentType = PaymentType ?? string.Empty,
        Currency = Currency,
        TotalAmount = TotalAmount,
        CommodityType = CommodityType,
        ExchangeRate = ExchangeRate,
        TotalCIF = TotalCIF.HasValue ? (double)TotalCIF.Value : (double?)null,
        SakhanId = SakhanId,
        SakhanCode = SakhanCode,
        SakhanName = SakhanName,
        TradeMethod = TradeMethod,
    };
}

public static class sp_VoucherReport
{
    private const string Approved = "Approved";
    private const string BorderImportPermitFormType = "Border Import Permit";
    private const string PaThaKaCardType = "Pa Tha Ka";
    private const string IndividualTradingCardType = "Individual Trading";

    /// <summary>
    /// Executes <c>dbo.sp_VoucherReport_pagination</c> (DB-side paging via INSERT-EXEC
    /// wrapper over the untouched original). The LINQ <see cref="Query"/> below is retained
    /// for not-yet-converted sibling report families.
    /// </summary>
    public static async Task<List<sp_VoucherReportRow>> ExecuteAsync(
        TradeNetDbContext db,
        sp_VoucherReportRequest request,
        string? sortColumn = null,
        string? sortOrder = null,
        int? pageIndex = null,
        int? pageSize = null,
        bool includeTotalCount = true)
    {
        return await ExecuteQueryable(db, request, sortColumn, sortOrder, pageIndex, pageSize, includeTotalCount)
            .ToListAsync();
    }

    public static IQueryable<sp_VoucherReportRow> ExecuteQueryable(
        TradeNetDbContext db,
        sp_VoucherReportRequest request,
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
            new SqlParameter("@PaymentType", request.PaymentType ?? string.Empty),
            new SqlParameter("@ApplyType", request.ApplyType ?? string.Empty),
            new SqlParameter("@CompanyRegistrationNo", request.CompanyRegistrationNo ?? string.Empty),
            new SqlParameter("@SakhanId", request.SakhanId),
            new SqlParameter("@SortColumn", (object?)sortColumn ?? DBNull.Value),
            new SqlParameter("@SortOrder", (object?)sortOrder ?? DBNull.Value),
            new SqlParameter("@PageIndex", (object?)pageIndex ?? DBNull.Value),
            new SqlParameter("@PageSize", (object?)pageSize ?? DBNull.Value),
            new SqlParameter("@IncludeTotalCount", includeTotalCount),
        };

        const string sql =
            "EXEC dbo.sp_VoucherReport_pagination @FormType, @FromDate, @ToDate, @ExportImportSectionId, " +
            "@PaymentType, @ApplyType, @CompanyRegistrationNo, @SakhanId, @SortColumn, @SortOrder, @PageIndex, @PageSize, @IncludeTotalCount";

        return db.Database.SqlQueryRaw<sp_VoucherReportRow>(sql, parameters);
    }

    /// <summary>
    /// Grand total of the voucher Amount column (legacy VoucherReport.rdlc "TOTAL" footer =
    /// FORMAT(SUM(Amount),"N0")) over the FULL filtered set, via the retained LINQ <see cref="Query"/>
    /// (same filter the page proc uses). Returns null — so the footer is simply omitted — if the
    /// query cannot be translated/run, rather than failing the whole report.
    ///
    /// A swallowed failure is logged: a missing footer looks identical to "this report has no
    /// total", which is the same class of silently-wrong output the footer was added to fix.
    /// </summary>
    public static async Task<decimal?> ExecuteAmountTotalAsync(
        TradeNetDbContext db,
        sp_VoucherReportRequest request)
    {
        ArgumentNullException.ThrowIfNull(db);
        ArgumentNullException.ThrowIfNull(request);

        try
        {
            var total = await Query(db, request).SumAsync(row => (double?)row.Amount);
            return total.HasValue ? (decimal)total.Value : 0m;
        }
        catch (Exception ex) when (ex is InvalidOperationException or SqlException)
        {
            LogAmountTotalFailure(db, request, ex);
            return null;
        }
    }

    private static string SanitizeForLog(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        return value
            .Replace("\r", string.Empty)
            .Replace("\n", string.Empty);
    }

    private static void LogAmountTotalFailure(
        TradeNetDbContext db,
        sp_VoucherReportRequest request,
        Exception ex)
    {
        try
        {
            db.GetService<ILoggerFactory>()
                .CreateLogger("API.StoredProcedureToLinq.sp_VoucherReport")
                .LogError(
                    ex,
                    "Voucher report Amount grand total failed for FormType={FormType} ApplyType={ApplyType} "
                    + "{FromDate:yyyy-MM-dd}..{ToDate:yyyy-MM-dd}; the report will render without its TOTAL row.",
                    SanitizeForLog(request.FormType),
                    SanitizeForLog(request.ApplyType),
                    request.FromDate,
                    request.ToDate);
        }
        catch (InvalidOperationException)
        {
            // No logger factory on this context (unit tests / a bare DbContextOptions):
            // never let diagnostics turn an omitted footer into a failed report.
        }
    }

    public static IQueryable<sp_VoucherReportResult> Query(
        TradeNetDbContext db,
        sp_VoucherReportRequest request)
    {
        ArgumentNullException.ThrowIfNull(db);
        ArgumentNullException.ThrowIfNull(request);

        var rows = request.FormType switch
        {
            "Export Licence" => ExportLicenceRows(db, request),
            "Import Licence" => ImportLicenceRows(db, request),
            "Export Permit" => ExportPermitRows(db, request),
            "Import Permit" => ImportPermitRows(db, request),
            "Border Export Licence" => BorderExportLicenceRows(db, request),
            "Border Import Licence" => BorderImportLicenceRows(db, request),
            "Border Export Permit" => BorderExportPermitRows(db, request),
            "Border Import Permit" => BorderImportPermitRows(db, request),
            _ => EmptyRows(db)
        };

        return rows
            .OrderBy(row => row.Date)
            .Select(row => new sp_VoucherReportResult
            {
                ApplicationNo = row.ApplicationNo,
                ApplicationDate = row.ApplicationDate,
                ApprovedUser = row.ApprovedUser,
                Date = row.Date,
                SDate = row.Date == null
                    ? null
                    : (row.Date.Value.Day < 10 ? "0" : string.Empty)
                    + row.Date.Value.Day.ToString()
                    + "/"
                    + (row.Date.Value.Month < 10 ? "0" : string.Empty)
                    + row.Date.Value.Month.ToString()
                    + "/"
                    + row.Date.Value.Year.ToString(),
                SectionCode = row.SectionCode,
                ApplyType = row.ApplyType,
                OldLicenceNo = row.OldLicenceNo,
                LicenceNo = row.LicenceNo,
                LicenceDate = row.LicenceDate,
                SLicenceDate = row.LicenceDate == null
                    ? null
                    : (row.LicenceDate.Value.Day < 10 ? "0" : string.Empty)
                    + row.LicenceDate.Value.Day.ToString()
                    + "/"
                    + (row.LicenceDate.Value.Month < 10 ? "0" : string.Empty)
                    + row.LicenceDate.Value.Month.ToString()
                    + "/"
                    + row.LicenceDate.Value.Year.ToString(),
                CompanyRegistrationNo = row.CompanyRegistrationNo,
                CompanyName = row.CompanyName,
                VoucherNo = row.VoucherNo,
                VoucherDate = row.VoucherDate,
                SVoucherDate = row.VoucherDate == null
                    ? null
                    : (row.VoucherDate.Value.Day < 10 ? "0" : string.Empty)
                    + row.VoucherDate.Value.Day.ToString()
                    + "/"
                    + (row.VoucherDate.Value.Month < 10 ? "0" : string.Empty)
                    + row.VoucherDate.Value.Month.ToString()
                    + "/"
                    + row.VoucherDate.Value.Year.ToString(),
                Amount = row.Amount,
                PaymentType = row.PaymentType,
                SakhanId = row.SakhanId,
                SakhanCode = row.SakhanCode,
                SakhanName = row.SakhanName,
                Currency = row.Currency,
                TotalAmount = row.TotalAmount,
                CommodityType = row.CommodityType,
                ExchangeRate = row.ExchangeRate,
                TotalCIF = row.TotalCIF
            });
    }

    private static IQueryable<VoucherRow> ExportLicenceRows(
        TradeNetDbContext db,
        sp_VoucherReportRequest request)
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

        return
            from licence in db.ExportLicences
            join account in db.AccountTransactions on licence.Id equals account.TransactionId
            join paThaKa in db.PaThaKas on licence.PaThaKaId equals paThaKa.Id
            join section in db.ExportImportSections on licence.ExportImportSectionId equals section.Id
            join user in db.Users on licence.ApproveUserId equals (int?)user.Id
            join amountRow in amountByLicence on licence.Id equals amountRow.LicenceId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            where account.IsPayment
                && account.PaymentDate >= request.FromDate
                && account.PaymentDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
                && (request.PaymentType == string.Empty || account.PaymentType == request.PaymentType)
                && licence.ApplyType == request.ApplyType
                && licence.Status == Approved
                && (request.CompanyRegistrationNo == string.Empty || paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
            select new VoucherRow
            {
                ApplicationNo = licence.ApplicationNo,
                ApplicationDate = licence.ApplicationDate,
                ApprovedUser = user.FullName,
                Date = account.PaymentDate,
                SectionCode = section.Code,
                ApplyType = licence.ApplyType,
                OldLicenceNo = licence.OldExportLicenceNo,
                LicenceNo = licence.ExportLicenceNo,
                LicenceDate = licence.CreatedDate,
                CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                CompanyName = paThaKa.CompanyName,
                VoucherNo = account.VoucherNo,
                VoucherDate = account.VoucherDate,
                Amount = account.TotalAmount,
                PaymentType = account.PaymentType,
                Currency = currencyRow.Code,
                TotalAmount = amountRow.Amount,
                CommodityType = licence.CommodityType
            };
    }

    private static IQueryable<VoucherRow> ImportLicenceRows(
        TradeNetDbContext db,
        sp_VoucherReportRequest request)
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

        return
            from licence in db.ImportLicences
            join account in db.AccountTransactions on licence.Id equals account.TransactionId
            join paThaKa in db.PaThaKas on licence.PaThaKaId equals paThaKa.Id
            join section in db.ExportImportSections on licence.ExportImportSectionId equals section.Id
            join user in db.Users on licence.ApproveUserId equals (int?)user.Id
            join amountRow in amountByLicence on licence.Id equals amountRow.LicenceId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            where account.IsPayment
                && account.PaymentDate >= request.FromDate
                && account.PaymentDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
                && (request.PaymentType == string.Empty || account.PaymentType == request.PaymentType)
                && licence.ApplyType == request.ApplyType
                && licence.Status == Approved
                && (request.CompanyRegistrationNo == string.Empty || paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
            select new VoucherRow
            {
                ApplicationNo = licence.ApplicationNo,
                ApplicationDate = licence.ApplicationDate,
                ApprovedUser = user.FullName,
                Date = account.PaymentDate,
                SectionCode = section.Code,
                ApplyType = licence.ApplyType,
                OldLicenceNo = licence.OldImportLicenceNo,
                LicenceNo = licence.ImportLicenceNo,
                LicenceDate = licence.CreatedDate,
                CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                CompanyName = paThaKa.CompanyName,
                VoucherNo = account.VoucherNo,
                VoucherDate = account.VoucherDate,
                Amount = account.TotalAmount,
                PaymentType = account.PaymentType,
                Currency = currencyRow.Code,
                TotalAmount = amountRow.Amount,
                CommodityType = licence.CommodityType,
                ExchangeRate = licence.ExchangeRate,
                TotalCIF = licence.TotalCif
            };
    }

    private static IQueryable<VoucherRow> ExportPermitRows(
        TradeNetDbContext db,
        sp_VoucherReportRequest request)
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

        return
            from permit in db.ExportPermits
            join account in db.AccountTransactions on permit.Id equals account.TransactionId
            join paThaKa in db.PaThaKas on permit.PaThaKaId equals paThaKa.Id
            join section in db.ExportImportSections on permit.ExportImportSectionId equals section.Id
            join user in db.Users on permit.ApproveUserId equals (int?)user.Id
            join amountRow in amountByPermit on permit.Id equals amountRow.PermitId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByPermit on permit.Id equals currencyRow.PermitId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            where account.IsPayment
                && account.PaymentDate >= request.FromDate
                && account.PaymentDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || permit.ExportImportSectionId == request.ExportImportSectionId)
                && (request.PaymentType == string.Empty || account.PaymentType == request.PaymentType)
                && permit.ApplyType == request.ApplyType
                && permit.Status == Approved
                && (request.CompanyRegistrationNo == string.Empty || paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
            select new VoucherRow
            {
                ApplicationNo = permit.ApplicationNo,
                ApplicationDate = permit.ApplicationDate,
                ApprovedUser = user.FullName,
                Date = account.PaymentDate,
                SectionCode = section.Code,
                ApplyType = permit.ApplyType,
                OldLicenceNo = permit.OldExportPermitNo,
                LicenceNo = permit.ExportPermitNo,
                LicenceDate = permit.CreatedDate,
                CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                CompanyName = paThaKa.CompanyName,
                VoucherNo = account.VoucherNo,
                VoucherDate = account.VoucherDate,
                Amount = account.TotalAmount,
                PaymentType = account.PaymentType,
                Currency = currencyRow.Code,
                TotalAmount = amountRow.Amount,
                CommodityType = permit.CommodityType
            };
    }

    private static IQueryable<VoucherRow> ImportPermitRows(
        TradeNetDbContext db,
        sp_VoucherReportRequest request)
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

        return
            from permit in db.ImportPermits
            join account in db.AccountTransactions on permit.Id equals account.TransactionId
            join paThaKa in db.PaThaKas on permit.PaThaKaId equals paThaKa.Id
            join section in db.ExportImportSections on permit.ExportImportSectionId equals section.Id
            join user in db.Users on permit.ApproveUserId equals (int?)user.Id
            join amountRow in amountByPermit on permit.Id equals amountRow.PermitId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByPermit on permit.Id equals currencyRow.PermitId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            where account.IsPayment
                && account.PaymentDate >= request.FromDate
                && account.PaymentDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || permit.ExportImportSectionId == request.ExportImportSectionId)
                && (request.PaymentType == string.Empty || account.PaymentType == request.PaymentType)
                && permit.ApplyType == request.ApplyType
                && permit.Status == Approved
                && (request.CompanyRegistrationNo == string.Empty || paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
            select new VoucherRow
            {
                ApplicationNo = permit.ApplicationNo,
                ApplicationDate = permit.ApplicationDate,
                ApprovedUser = user.FullName,
                Date = account.PaymentDate,
                SectionCode = section.Code,
                ApplyType = permit.ApplyType,
                OldLicenceNo = permit.OldImportPermitNo,
                LicenceNo = permit.ImportPermitNo,
                LicenceDate = permit.CreatedDate,
                CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                CompanyName = paThaKa.CompanyName,
                VoucherNo = account.VoucherNo,
                VoucherDate = account.VoucherDate,
                Amount = account.TotalAmount,
                PaymentType = account.PaymentType,
                Currency = currencyRow.Code,
                TotalAmount = amountRow.Amount,
                CommodityType = permit.CommodityType
            };
    }

    private static IQueryable<VoucherRow> BorderExportLicenceRows(
        TradeNetDbContext db,
        sp_VoucherReportRequest request)
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

        var paThaKaRows =
            from licence in db.BorderExportLicences
            join account in db.AccountTransactions on licence.Id equals account.TransactionId
            join paThaKa in db.PaThaKas on licence.PaThaKaId equals paThaKa.Id
            join section in db.ExportImportSections on licence.ExportImportSectionId equals section.Id
            join sakhan in db.Sakhans on licence.SakhanId equals sakhan.Id
            join user in db.Users on licence.ApproveUserId equals (int?)user.Id
            join amountRow in amountByLicence on licence.Id equals amountRow.LicenceId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            where account.IsPayment
                && account.PaymentDate >= request.FromDate
                && account.PaymentDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
                && (request.PaymentType == string.Empty || account.PaymentType == request.PaymentType)
                && licence.ApplyType == request.ApplyType
                && licence.Status == Approved
                && licence.CardType == PaThaKaCardType
                && (request.CompanyRegistrationNo == string.Empty || paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
                && (request.SakhanId == 0 || licence.SakhanId == request.SakhanId)
            select new VoucherRow
            {
                ApplicationNo = licence.ApplicationNo,
                ApplicationDate = licence.ApplicationDate,
                ApprovedUser = user.FullName,
                Date = account.PaymentDate,
                SectionCode = section.Code,
                ApplyType = licence.ApplyType,
                OldLicenceNo = licence.OldExportLicenceNo,
                LicenceNo = licence.ExportLicenceNo,
                LicenceDate = licence.CreatedDate,
                CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                CompanyName = paThaKa.CompanyName,
                VoucherNo = account.VoucherNo,
                VoucherDate = account.VoucherDate,
                Amount = account.TotalAmount,
                PaymentType = account.PaymentType,
                SakhanId = sakhan.Id,
                SakhanCode = sakhan.Code,
                SakhanName = sakhan.Name,
                Currency = currencyRow.Code,
                TotalAmount = amountRow.Amount,
                CommodityType = licence.CommodityType
            };

        var individualRows =
            from licence in db.BorderExportLicences
            join account in db.AccountTransactions on licence.Id equals account.TransactionId
            join individualTrading in db.IndividualTradings on licence.IndividualTradingId equals individualTrading.Id
            join section in db.ExportImportSections on licence.ExportImportSectionId equals section.Id
            join sakhan in db.Sakhans on licence.SakhanId equals sakhan.Id
            join user in db.Users on licence.ApproveUserId equals (int?)user.Id
            join amountRow in amountByLicence on licence.Id equals amountRow.LicenceId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            where account.IsPayment
                && account.PaymentDate >= request.FromDate
                && account.PaymentDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
                && (request.PaymentType == string.Empty || account.PaymentType == request.PaymentType)
                && licence.ApplyType == request.ApplyType
                && licence.Status == Approved
                && licence.CardType == IndividualTradingCardType
                && (request.CompanyRegistrationNo == string.Empty || individualTrading.Tinno == request.CompanyRegistrationNo)
                && (request.SakhanId == 0 || licence.SakhanId == request.SakhanId)
            select new VoucherRow
            {
                ApplicationNo = licence.ApplicationNo,
                ApplicationDate = licence.ApplicationDate,
                ApprovedUser = user.FullName,
                Date = account.PaymentDate,
                SectionCode = section.Code,
                ApplyType = licence.ApplyType,
                OldLicenceNo = licence.OldExportLicenceNo,
                LicenceNo = licence.ExportLicenceNo,
                LicenceDate = licence.CreatedDate,
                CompanyRegistrationNo = individualTrading.Tinno,
                CompanyName = individualTrading.Name,
                VoucherNo = account.VoucherNo,
                VoucherDate = account.VoucherDate,
                Amount = account.TotalAmount,
                PaymentType = account.PaymentType,
                SakhanId = sakhan.Id,
                SakhanCode = sakhan.Code,
                SakhanName = sakhan.Name,
                Currency = currencyRow.Code,
                TotalAmount = amountRow.Amount,
                CommodityType = licence.CommodityType
            };

        return paThaKaRows.Concat(individualRows);
    }

    private static IQueryable<VoucherRow> BorderImportLicenceRows(
        TradeNetDbContext db,
        sp_VoucherReportRequest request)
    {
        var toDateExclusive = request.ToDate.Date.AddDays(1);

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

        var paThaKaRows =
            from licence in db.BorderImportLicences
            join account in db.AccountTransactions on licence.Id equals account.TransactionId
            join paThaKa in db.PaThaKas on licence.PaThaKaId equals paThaKa.Id
            join section in db.ExportImportSections on licence.ExportImportSectionId equals section.Id
            join sakhan in db.Sakhans on licence.SakhanId equals sakhan.Id
            join user in db.Users on licence.ApproveUserId equals (int?)user.Id
            join amountRow in amountByLicence on licence.Id equals amountRow.LicenceId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            where account.IsPayment
                && account.PaymentDate >= request.FromDate
                && account.PaymentDate < toDateExclusive
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
                && (request.PaymentType == string.Empty || account.PaymentType == request.PaymentType)
                && licence.ApplyType == request.ApplyType
                && licence.Status == Approved
                && licence.CardType == PaThaKaCardType
                && (request.CompanyRegistrationNo == string.Empty || paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
                && (request.SakhanId == 0 || licence.SakhanId == request.SakhanId)
            select new VoucherRow
            {
                ApplicationNo = licence.ApplicationNo,
                ApplicationDate = licence.ApplicationDate,
                ApprovedUser = user.FullName,
                Date = account.PaymentDate,
                SectionCode = section.Code,
                ApplyType = licence.ApplyType,
                OldLicenceNo = licence.OldImportLicenceNo,
                LicenceNo = licence.ImportLicenceNo,
                LicenceDate = licence.CreatedDate,
                CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                CompanyName = paThaKa.CompanyName,
                VoucherNo = account.VoucherNo,
                VoucherDate = account.VoucherDate,
                Amount = account.TotalAmount,
                PaymentType = account.PaymentType,
                SakhanId = sakhan.Id,
                SakhanCode = sakhan.Code,
                SakhanName = sakhan.Name,
                Currency = currencyRow.Code,
                TotalAmount = amountRow.Amount,
                CommodityType = licence.CommodityType,
                ExchangeRate = licence.ExchangeRate,
                TotalCIF = licence.TotalCif
            };

        var individualRows =
            from licence in db.BorderImportLicences
            join account in db.AccountTransactions on licence.Id equals account.TransactionId
            join individualTrading in db.IndividualTradings on licence.IndividualTradingId equals individualTrading.Id
            join section in db.ExportImportSections on licence.ExportImportSectionId equals section.Id
            join sakhan in db.Sakhans on licence.SakhanId equals sakhan.Id
            join user in db.Users on licence.ApproveUserId equals (int?)user.Id
            join amountRow in amountByLicence on licence.Id equals amountRow.LicenceId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByLicence on licence.Id equals currencyRow.LicenceId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            where account.IsPayment
                && account.PaymentDate >= request.FromDate
                && account.PaymentDate < toDateExclusive
                && (request.ExportImportSectionId == 0 || licence.ExportImportSectionId == request.ExportImportSectionId)
                && (request.PaymentType == string.Empty || account.PaymentType == request.PaymentType)
                && licence.ApplyType == request.ApplyType
                && licence.Status == Approved
                && licence.CardType == IndividualTradingCardType
                && (request.CompanyRegistrationNo == string.Empty || individualTrading.Tinno == request.CompanyRegistrationNo)
                && (request.SakhanId == 0 || licence.SakhanId == request.SakhanId)
            select new VoucherRow
            {
                ApplicationNo = licence.ApplicationNo,
                ApplicationDate = licence.ApplicationDate,
                ApprovedUser = user.FullName,
                Date = account.PaymentDate,
                SectionCode = section.Code,
                ApplyType = licence.ApplyType,
                OldLicenceNo = licence.OldImportLicenceNo,
                LicenceNo = licence.ImportLicenceNo,
                LicenceDate = licence.CreatedDate,
                CompanyRegistrationNo = individualTrading.Tinno,
                CompanyName = individualTrading.Name,
                VoucherNo = account.VoucherNo,
                VoucherDate = account.VoucherDate,
                Amount = account.TotalAmount,
                PaymentType = account.PaymentType,
                SakhanId = sakhan.Id,
                SakhanCode = sakhan.Code,
                SakhanName = sakhan.Name,
                Currency = currencyRow.Code,
                TotalAmount = amountRow.Amount,
                CommodityType = licence.CommodityType,
                ExchangeRate = licence.ExchangeRate,
                TotalCIF = licence.TotalCif
            };

        return paThaKaRows.Concat(individualRows);
    }

    private static IQueryable<VoucherRow> BorderExportPermitRows(
        TradeNetDbContext db,
        sp_VoucherReportRequest request)
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

        return
            from permit in db.BorderExportPermits
            join account in db.AccountTransactions on permit.Id equals account.TransactionId
            join paThaKa in db.PaThaKas on permit.PaThaKaId equals paThaKa.Id
            join section in db.ExportImportSections on permit.ExportImportSectionId equals section.Id
            join sakhan in db.Sakhans on permit.SakhanId equals sakhan.Id
            join user in db.Users on permit.ApproveUserId equals (int?)user.Id
            join amountRow in amountByPermit on permit.Id equals amountRow.PermitId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByPermit on permit.Id equals currencyRow.PermitId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            where account.IsPayment
                && account.PaymentDate >= request.FromDate
                && account.PaymentDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || permit.ExportImportSectionId == request.ExportImportSectionId)
                && (request.PaymentType == string.Empty || account.PaymentType == request.PaymentType)
                && permit.ApplyType == request.ApplyType
                && permit.Status == Approved
                && (request.CompanyRegistrationNo == string.Empty || paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
                && (request.SakhanId == 0 || permit.SakhanId == request.SakhanId)
            select new VoucherRow
            {
                ApplicationNo = permit.ApplicationNo,
                ApplicationDate = permit.ApplicationDate,
                ApprovedUser = user.FullName,
                Date = account.PaymentDate,
                SectionCode = section.Code,
                ApplyType = permit.ApplyType,
                OldLicenceNo = permit.OldExportPermitNo,
                LicenceNo = permit.ExportPermitNo,
                LicenceDate = permit.CreatedDate,
                CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                CompanyName = paThaKa.CompanyName,
                VoucherNo = account.VoucherNo,
                VoucherDate = account.VoucherDate,
                Amount = account.TotalAmount,
                PaymentType = account.PaymentType,
                SakhanId = sakhan.Id,
                SakhanCode = sakhan.Code,
                SakhanName = sakhan.Name,
                Currency = currencyRow.Code,
                TotalAmount = amountRow.Amount,
                CommodityType = permit.CommodityType
            };
    }

    private static IQueryable<VoucherRow> BorderImportPermitRows(
        TradeNetDbContext db,
        sp_VoucherReportRequest request)
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

        return
            from permit in db.BorderImportPermits
            join account in db.AccountTransactions on permit.Id equals account.TransactionId
            join paThaKa in db.PaThaKas on permit.PaThaKaId equals paThaKa.Id
            join section in db.ExportImportSections on permit.ExportImportSectionId equals section.Id
            join sakhan in db.Sakhans on permit.SakhanId equals sakhan.Id
            join user in db.Users on permit.ApproveUserId equals (int?)user.Id
            join amountRow in amountByPermit on permit.Id equals amountRow.PermitId into amountJoin
            from amountRow in amountJoin.DefaultIfEmpty()
            join currencyRow in currencyByPermit on permit.Id equals currencyRow.PermitId into currencyJoin
            from currencyRow in currencyJoin.DefaultIfEmpty()
            where account.IsPayment
                // AccountTransaction.TransactionId is only unique WITHIN a form type, so without
                // this discriminator a Border Import Permit could pick up another form's payment
                // rows. The stored procedure has always carried it
                // (sp_VoucherReport_pagination.sql, Border Import Permit branch); this LINQ twin --
                // which serves the footer total -- did not.
                && account.TransactionFormType == BorderImportPermitFormType
                && account.PaymentDate >= request.FromDate
                && account.PaymentDate <= request.ToDate
                && (request.ExportImportSectionId == 0 || permit.ExportImportSectionId == request.ExportImportSectionId)
                && (request.PaymentType == string.Empty || account.PaymentType == request.PaymentType)
                && permit.ApplyType == request.ApplyType
                && permit.Status == Approved
                && (request.CompanyRegistrationNo == string.Empty || paThaKa.CompanyRegistrationNo == request.CompanyRegistrationNo)
                && (request.SakhanId == 0 || permit.SakhanId == request.SakhanId)
            select new VoucherRow
            {
                ApplicationNo = permit.ApplicationNo,
                ApplicationDate = permit.ApplicationDate,
                ApprovedUser = user.FullName,
                Date = account.PaymentDate,
                SectionCode = section.Code,
                ApplyType = permit.ApplyType,
                OldLicenceNo = permit.OldImportPermitNo,
                LicenceNo = permit.ImportPermitNo,
                LicenceDate = permit.CreatedDate,
                CompanyRegistrationNo = paThaKa.CompanyRegistrationNo,
                CompanyName = paThaKa.CompanyName,
                VoucherNo = account.VoucherNo,
                VoucherDate = account.VoucherDate,
                Amount = account.TotalAmount,
                PaymentType = account.PaymentType,
                SakhanId = sakhan.Id,
                SakhanCode = sakhan.Code,
                SakhanName = sakhan.Name,
                Currency = currencyRow.Code,
                TotalAmount = amountRow.Amount,
                CommodityType = permit.CommodityType
            };
    }

    private static IQueryable<VoucherRow> EmptyRows(TradeNetDbContext db)
    {
        return db.AccountTransactions
            .Where(_ => false)
            .Select(account => new VoucherRow
            {
                ApplicationNo = account.TransactionId,
                ApplicationDate = account.CreatedDate,
                ApprovedUser = account.TransactionFormType,
                Date = account.PaymentDate,
                SectionCode = account.TransactionFormType,
                ApplyType = account.TransactionFormType,
                OldLicenceNo = account.TransactionId,
                LicenceNo = account.TransactionId,
                LicenceDate = account.CreatedDate,
                CompanyRegistrationNo = account.MemberId ?? account.TransactionId,
                CompanyName = account.TransactionFormType,
                VoucherNo = account.VoucherNo,
                VoucherDate = account.VoucherDate,
                Amount = account.TotalAmount,
                PaymentType = account.PaymentType,
                SakhanId = account.CreatedUserId,
                SakhanCode = account.TransactionFormType,
                SakhanName = account.TransactionFormType,
                Currency = account.PaymentType,
                TotalAmount = 0m,
                CommodityType = account.TransactionFormType,
                ExchangeRate = 0m,
                TotalCIF = account.TotalAmount
            });
    }

    private sealed class VoucherRow
    {
        public string ApplicationNo { get; set; } = null!;
        public DateTime ApplicationDate { get; set; }
        public string ApprovedUser { get; set; } = null!;
        public DateTime? Date { get; set; }
        public string? SectionCode { get; set; }
        public string ApplyType { get; set; } = null!;
        public string? OldLicenceNo { get; set; }
        public string LicenceNo { get; set; } = null!;
        public DateTime? LicenceDate { get; set; }
        public string CompanyRegistrationNo { get; set; } = null!;
        public string CompanyName { get; set; } = null!;
        public string? VoucherNo { get; set; }
        public DateTime? VoucherDate { get; set; }
        public double Amount { get; set; }
        public string PaymentType { get; set; } = null!;
        public int? SakhanId { get; set; }
        public string? SakhanCode { get; set; }
        public string? SakhanName { get; set; }
        public string? Currency { get; set; }
        public decimal? TotalAmount { get; set; }
        public string? CommodityType { get; set; }
        public decimal? ExchangeRate { get; set; }
        public double? TotalCIF { get; set; }
    }
}
