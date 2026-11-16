using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DBContext;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace API.StoredProcedureToLinq;

public sealed class ApplicationNumberReportResult
{
    public string? ApplicationNo { get; set; }
    public int Id { get; set; }
    public string? TransactionId { get; set; }
    public string? Sakhan { get; set; }
    public string? PaThaKaNo { get; set; }
    public string? ApplyType { get; set; }
    public string? FormType { get; set; }
    public string? MPUApplicationNo { get; set; }
    public string? InvoiceNo { get; set; }
    public string? MOCAmount { get; set; }
    public string? IMAmount { get; set; }
    public string? TransactionAmount { get; set; }
    public string? MerchantId { get; set; }
    public string? ResponseCode { get; set; }
    public string? AccountNo { get; set; }
    public string? TransactionRefNo { get; set; }
    public string? ApprovalCode { get; set; }
    public DateTime? TransactionDateTime { get; set; }
    public string? Status { get; set; }
    public string? FailReason { get; set; }
    public string? MemberId { get; set; }
    public string? PaymentType { get; set; }
}

public sealed class ApplicationNumberReportRow
{
    public string? ApplicationNo { get; set; }
    public int Id { get; set; }
    public string? TransactionId { get; set; }
    public string? Sakhan { get; set; }
    public string? PaThaKaNo { get; set; }
    public string? ApplyType { get; set; }
    public string? FormType { get; set; }
    public string? MPUApplicationNo { get; set; }
    public string? InvoiceNo { get; set; }
    public string? MOCAmount { get; set; }
    public string? IMAmount { get; set; }
    public string? TransactionAmount { get; set; }
    public string? MerchantId { get; set; }
    public string? ResponseCode { get; set; }
    public string? AccountNo { get; set; }
    public string? TransactionRefNo { get; set; }
    public string? ApprovalCode { get; set; }
    public DateTime? TransactionDateTime { get; set; }
    public string? Status { get; set; }
    public string? FailReason { get; set; }
    public string? MemberId { get; set; }
    public string? PaymentType { get; set; }
    public int? TotalCount { get; set; }
    public ApplicationNumberReportResult ToResult() => new()
    {
        ApplicationNo = ApplicationNo,
        Id = Id,
        TransactionId = TransactionId,
        Sakhan = Sakhan,
        PaThaKaNo = PaThaKaNo,
        ApplyType = ApplyType,
        FormType = FormType,
        MPUApplicationNo = MPUApplicationNo,
        InvoiceNo = InvoiceNo,
        MOCAmount = MOCAmount,
        IMAmount = IMAmount,
        TransactionAmount = TransactionAmount,
        MerchantId = MerchantId,
        ResponseCode = ResponseCode,
        AccountNo = AccountNo,
        TransactionRefNo = TransactionRefNo,
        ApprovalCode = ApprovalCode,
        TransactionDateTime = TransactionDateTime,
        Status = Status,
        FailReason = FailReason,
        MemberId = MemberId,
        PaymentType = PaymentType,
    };
}

public static class sp_ApplicationNumberReport
{
    public static IQueryable<ApplicationNumberReportRow> ExecuteQueryable(TradeNetDbContext db,
        DateTime fromDate, DateTime toDate, string formType, string? sortColumn = null,
        string? sortOrder = null, int? pageIndex = null, int? pageSize = null, bool includeTotalCount = true)
    {
        return db.Database.SqlQueryRaw<ApplicationNumberReportRow>(
            "EXEC dbo.sp_ApplicationNumberReport_pagination @FromDate,@ToDate,@FormType,@SortColumn,@SortOrder,@PageIndex,@PageSize,@IncludeTotalCount",
            new SqlParameter("@FromDate", fromDate), new SqlParameter("@ToDate", toDate),
            new SqlParameter("@FormType", formType),
            new SqlParameter("@SortColumn", (object?)sortColumn ?? DBNull.Value),
            new SqlParameter("@SortOrder", (object?)sortOrder ?? DBNull.Value),
            new SqlParameter("@PageIndex", (object?)pageIndex ?? DBNull.Value),
            new SqlParameter("@PageSize", (object?)pageSize ?? DBNull.Value),
            new SqlParameter("@IncludeTotalCount", includeTotalCount));
    }
}
