using API.DBContext;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.StoredProcedureToLinq;

public sealed class sp_ImportLicenceVoucherDetailReportResult
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
    public string DetailId { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
    public string PaymentType { get; set; } = null!;
    public string? Currency { get; set; }
    public decimal? TotalAmount { get; set; }
    public string? CommodityType { get; set; }
    public decimal? ExchangeRate { get; set; }
    public decimal? TotalCIF { get; set; }
}

public sealed class sp_ImportLicenceVoucherDetailReportRow
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
    public string DetailId { get; set; } = null!;
    public string? Description { get; set; }
    public decimal AmountTotal { get; set; }
    public int? TotalCount { get; set; }

    public sp_ImportLicenceVoucherDetailReportResult ToResult() => new()
    {
        DetailId = DetailId,
        Description = Description,
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
        Amount = Amount ?? 0m,
        PaymentType = PaymentType ?? string.Empty,
        Currency = Currency,
        TotalAmount = TotalAmount,
        CommodityType = CommodityType,
        ExchangeRate = ExchangeRate,
        TotalCIF = TotalCIF,
    };
}

public static class sp_ImportLicenceVoucherDetailReport
{
    public static async Task<List<sp_ImportLicenceVoucherDetailReportRow>> ExecuteAsync(
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

    public static IQueryable<sp_ImportLicenceVoucherDetailReportRow> ExecuteQueryable(
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
            new SqlParameter("@FromDate", request.FromDate),
            new SqlParameter("@ToDate", request.ToDate),
            new SqlParameter("@ExportImportSectionId", request.ExportImportSectionId),
            new SqlParameter("@PaymentType", request.PaymentType ?? string.Empty),
            new SqlParameter("@ApplyType", request.ApplyType ?? string.Empty),
            new SqlParameter("@CompanyRegistrationNo", request.CompanyRegistrationNo ?? string.Empty),
            new SqlParameter("@SortColumn", (object?)sortColumn ?? DBNull.Value),
            new SqlParameter("@SortOrder", (object?)sortOrder ?? DBNull.Value),
            new SqlParameter("@PageIndex", (object?)pageIndex ?? DBNull.Value),
            new SqlParameter("@PageSize", (object?)pageSize ?? DBNull.Value),
            new SqlParameter("@IncludeTotalCount", includeTotalCount),
        };

        const string sql =
            "EXEC dbo.sp_ImportLicenceVoucherDetailReport_pagination @FromDate, @ToDate, @ExportImportSectionId, " +
            "@PaymentType, @ApplyType, @CompanyRegistrationNo, @SortColumn, @SortOrder, @PageIndex, @PageSize, @IncludeTotalCount";

        return db.Database.SqlQueryRaw<sp_ImportLicenceVoucherDetailReportRow>(sql, parameters);
    }

}
