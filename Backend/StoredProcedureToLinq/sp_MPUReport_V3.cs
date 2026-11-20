using API.DBContext;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.StoredProcedureToLinq;

public sealed class sp_MPUReport_V3Request
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public string FormType { get; set; } = string.Empty;
    public string PaymentType { get; set; } = string.Empty;
}

public class sp_MPUReport_V3Result
{
    public int Id { get; set; }
    public string? Sakhan { get; set; }
    public DateTime? TransactionDateTime { get; set; }
    public string CompanyName { get; set; } = null!;
    public string? CompanyRegistrationNo { get; set; }
    public string? ApplicationNo { get; set; }
    public string? MerchantId { get; set; }
    public string? AccountNo { get; set; }
    public string? InvoiceNo { get; set; }
    public string? ApprovalCode { get; set; }
    public string? TransactionRefNo { get; set; }
    public string? TransactionAmount { get; set; }
    public string? MOCAmount { get; set; }
    public string? IMAmount { get; set; }
    public string? MPUAmount { get; set; }
    public string? AmountDiff { get; set; }
    public string? FormType { get; set; }
    public string? ApplyType { get; set; }
    public string? VoucherNo { get; set; }
    public double? TotalAmount { get; set; }
    public DateTime? PaymentDate { get; set; }
}

public class sp_MPUReport_V3Row
{
    public int Id { get; set; }
    public string? Sakhan { get; set; }
    public DateTime? TransactionDateTime { get; set; }
    public string CompanyName { get; set; } = null!;
    public string? CompanyRegistrationNo { get; set; }
    public string? ApplicationNo { get; set; }
    public string? MerchantId { get; set; }
    public string? AccountNo { get; set; }
    public string? InvoiceNo { get; set; }
    public string? ApprovalCode { get; set; }
    public string? TransactionRefNo { get; set; }
    public string? TransactionAmount { get; set; }
    public string? MOCAmount { get; set; }
    public string? IMAmount { get; set; }
    public string? MPUAmount { get; set; }
    public string? AmountDiff { get; set; }
    public string? FormType { get; set; }
    public string? ApplyType { get; set; }
    public string? VoucherNo { get; set; }
    public double? TotalAmount { get; set; }
    public DateTime? PaymentDate { get; set; }
    public int? TotalCount { get; set; }

    public sp_MPUReport_V3Result ToResult() => ToResult<sp_MPUReport_V3Result>();

    protected TResult ToResult<TResult>() where TResult : sp_MPUReport_V3Result, new() => new()
    {
        Id = Id,
        Sakhan = Sakhan,
        TransactionDateTime = TransactionDateTime,
        CompanyName = CompanyName,
        CompanyRegistrationNo = CompanyRegistrationNo,
        ApplicationNo = ApplicationNo,
        MerchantId = MerchantId,
        AccountNo = AccountNo,
        InvoiceNo = InvoiceNo,
        ApprovalCode = ApprovalCode,
        TransactionRefNo = TransactionRefNo,
        TransactionAmount = TransactionAmount,
        MOCAmount = MOCAmount,
        IMAmount = IMAmount,
        MPUAmount = MPUAmount,
        AmountDiff = AmountDiff,
        FormType = FormType,
        ApplyType = ApplyType,
        VoucherNo = VoucherNo,
        TotalAmount = TotalAmount,
        PaymentDate = PaymentDate,
    };
}

public sealed class sp_MPUReport_V3ColumnTotals
{
    public decimal TransactionAmount { get; set; }
    public decimal MOCAmount { get; set; }
    public decimal IMAmount { get; set; }
    public decimal MPUAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal AmountDiff { get; set; }

    public IReadOnlyDictionary<string, decimal> ToDictionary() => new Dictionary<string, decimal>
    {
        ["transactionAmount"] = TransactionAmount,
        ["mocAmount"] = MOCAmount,
        ["imAmount"] = IMAmount,
        ["mpuAmount"] = MPUAmount,
        ["totalAmount"] = TotalAmount,
        ["amountDiff"] = AmountDiff,
    };
}

public static class sp_MPUReport_V3
{
    internal const int CommandTimeoutSeconds = 180;

    public static async Task<List<sp_MPUReport_V3Row>> ExecuteAsync(
        TradeNetDbContext db,
        sp_MPUReport_V3Request request,
        string? sortColumn = null,
        string? sortOrder = null,
        int? pageIndex = null,
        int? pageSize = null,
        bool includeTotalCount = true)
    {
        ArgumentNullException.ThrowIfNull(db);

        var previousTimeout = db.Database.GetCommandTimeout();
        try
        {
            return await ExecuteQueryable(db, request, sortColumn, sortOrder, pageIndex, pageSize, includeTotalCount)
                .ToListAsync();
        }
        finally
        {
            db.Database.SetCommandTimeout(previousTimeout);
        }
    }

    public static IQueryable<sp_MPUReport_V3Row> ExecuteQueryable(
        TradeNetDbContext db,
        sp_MPUReport_V3Request request,
        string? sortColumn = null,
        string? sortOrder = null,
        int? pageIndex = null,
        int? pageSize = null,
        bool includeTotalCount = true)
    {
        ArgumentNullException.ThrowIfNull(db);
        ArgumentNullException.ThrowIfNull(request);

        const string sql =
            "EXEC dbo.sp_MPUReport_V3_pagination @FromDate, @ToDate, @FormType, @PaymentType, " +
            "@SortColumn, @SortOrder, @PageIndex, @PageSize, @IncludeTotalCount";

        db.Database.SetCommandTimeout(CommandTimeoutSeconds);

        return db.Database.SqlQueryRaw<sp_MPUReport_V3Row>(sql,
            CreatePageParameters(request, sortColumn, sortOrder, pageIndex, pageSize, includeTotalCount));
    }

    internal static SqlParameter[] CreatePageParameters(sp_MPUReport_V3Request request, string? sortColumn,
        string? sortOrder, int? pageIndex, int? pageSize, bool includeTotalCount) =>
        [
            new SqlParameter("@FromDate", request.FromDate),
            new SqlParameter("@ToDate", request.ToDate),
            new SqlParameter("@FormType", request.FormType ?? string.Empty),
            new SqlParameter("@PaymentType", request.PaymentType ?? string.Empty),
            new SqlParameter("@SortColumn", (object?)sortColumn ?? DBNull.Value),
            new SqlParameter("@SortOrder", (object?)sortOrder ?? DBNull.Value),
            new SqlParameter("@PageIndex", (object?)pageIndex ?? DBNull.Value),
            new SqlParameter("@PageSize", (object?)pageSize ?? DBNull.Value),
            new SqlParameter("@IncludeTotalCount", includeTotalCount),
        ];

    public static async Task<IReadOnlyDictionary<string, decimal>> ExecuteColumnTotalsAsync(
        TradeNetDbContext db,
        sp_MPUReport_V3Request request)
    {
        ArgumentNullException.ThrowIfNull(db);
        ArgumentNullException.ThrowIfNull(request);

        var parameters = new[]
        {
            new SqlParameter("@FromDate", request.FromDate),
            new SqlParameter("@ToDate", request.ToDate),
            new SqlParameter("@FormType", request.FormType ?? string.Empty),
            new SqlParameter("@PaymentType", request.PaymentType ?? string.Empty),
        };

        // The footer has to sum exactly the rows the grid shows, so this mirrors
        // sp_MPUReport_V3_pagination.sql step for step -- including the rule that neither
        // sequence may be numbered over the report's own filtered rows. See that file for
        // why (2026-09-17 ငွေစာရင်း voucher complaint).
        const string sql = @"
DROP TABLE IF EXISTS #idsTotals;
DROP TABLE IF EXISTS #mpuAllTotals;
DROP TABLE IF EXISTS #mpuTotals;
DROP TABLE IF EXISTS #accTotals;

SELECT DISTINCT m.TransactionId
INTO #idsTotals
FROM dbo.MPUPaymentTransaction m
WHERE m.TransactionDateTime >= @FromDate
    AND m.TransactionDateTime <= @ToDate
    AND m.ResponseCode = '00'
    AND m.FormType IS NOT NULL
    AND m.FormType LIKE (CASE WHEN @FormType = '' THEN m.FormType + '%' ELSE @FormType + '%' END)
    AND (@PaymentType = ''
        OR m.PaymentType = @PaymentType
        OR (@PaymentType = 'CitizenPay'
            AND REPLACE(REPLACE(REPLACE(LOWER(ISNULL(m.PaymentType, '')), ' ', ''), '-', ''), '_', '')
                IN ('citizenpay', 'citizen', 'cp')));

CREATE INDEX IX_idsTotals_TransactionId ON #idsTotals(TransactionId);

SELECT
    m.*,
    ROW_NUMBER() OVER (
        PARTITION BY m.TransactionId
        ORDER BY m.TransactionDateTime, m.Id
    ) AS rn
INTO #mpuAllTotals
FROM dbo.MPUPaymentTransaction m
WHERE m.ResponseCode = '00'
    AND EXISTS (SELECT 1 FROM #idsTotals i WHERE i.TransactionId = m.TransactionId);

CREATE INDEX IX_mpuAllTotals_TransactionId_rn ON #mpuAllTotals(TransactionId, rn);

SELECT *
INTO #mpuTotals
FROM #mpuAllTotals m
WHERE m.TransactionDateTime >= @FromDate
    AND m.TransactionDateTime <= @ToDate
    AND m.FormType IS NOT NULL
    AND m.FormType LIKE (CASE WHEN @FormType = '' THEN m.FormType + '%' ELSE @FormType + '%' END)
    AND (@PaymentType = ''
        OR m.PaymentType = @PaymentType
        OR (@PaymentType = 'CitizenPay'
            AND REPLACE(REPLACE(REPLACE(LOWER(ISNULL(m.PaymentType, '')), ' ', ''), '-', ''), '_', '')
                IN ('citizenpay', 'citizen', 'cp')));

CREATE INDEX IX_mpuTotals_TransactionId_rn ON #mpuTotals(TransactionId, rn);

SELECT
    a.TransactionId,
    a.VoucherNo,
    a.TotalAmount,
    ROW_NUMBER() OVER (
        PARTITION BY a.TransactionId
        ORDER BY a.CreatedDate, a.Id
    ) AS rn
INTO #accTotals
FROM dbo.AccountTransaction a
WHERE a.IsPayment = 1
    AND a.VoucherNo IS NOT NULL
    AND EXISTS (SELECT 1 FROM #idsTotals i WHERE i.TransactionId = a.TransactionId)
    AND EXISTS (
        SELECT 1
        FROM #mpuAllTotals m
        WHERE m.TransactionId = a.TransactionId
            AND m.TransactionDateTime IS NOT NULL
            AND ABS(DATEDIFF(day, ISNULL(a.PaymentDate, a.CreatedDate), m.TransactionDateTime)) <= 2);

CREATE INDEX IX_accTotals_TransactionId_rn ON #accTotals(TransactionId, rn);

SELECT
    CAST(ISNULL(SUM(amounts.TransactionAmount), 0) AS decimal(18, 2)) AS TransactionAmount,
    CAST(ISNULL(SUM(amounts.MOCAmount), 0) AS decimal(18, 2)) AS MOCAmount,
    CAST(ISNULL(SUM(amounts.IMAmount), 0) AS decimal(18, 2)) AS IMAmount,
    CAST(ISNULL(SUM(amounts.TransactionAmount - amounts.MOCAmount - amounts.IMAmount), 0) AS decimal(18, 2)) AS MPUAmount,
    CAST(ISNULL(SUM(CAST(a.TotalAmount AS decimal(18, 2))), 0) AS decimal(18, 2)) AS TotalAmount,
    CAST(ISNULL(SUM(amounts.TransactionAmount - amounts.MOCAmount), 0) AS decimal(18, 2)) AS AmountDiff
FROM #mpuTotals m
INNER JOIN #accTotals a
    ON m.TransactionId = a.TransactionId
   AND m.rn = a.rn
CROSS APPLY (
    SELECT
        ISNULL(TRY_CONVERT(decimal(18, 2),
            CASE
                WHEN LEN(ISNULL(m.TransactionAmount, '')) > 2 THEN LEFT(m.TransactionAmount, LEN(m.TransactionAmount) - 2) + '.' + RIGHT(m.TransactionAmount, 2)
                WHEN LEN(ISNULL(m.TransactionAmount, '')) > 0 THEN '0.' + RIGHT('00' + m.TransactionAmount, 2)
                ELSE '0'
            END), 0) AS TransactionAmount,
        ISNULL(TRY_CONVERT(decimal(18, 2), m.MOCAmount), 0) AS MOCAmount,
        ISNULL(TRY_CONVERT(decimal(18, 2), m.IMAmount), 0) AS IMAmount
) amounts;

DROP TABLE IF EXISTS #idsTotals;
DROP TABLE IF EXISTS #mpuAllTotals;
DROP TABLE IF EXISTS #mpuTotals;
DROP TABLE IF EXISTS #accTotals;";

        var previousTimeout = db.Database.GetCommandTimeout();
        try
        {
            db.Database.SetCommandTimeout(CommandTimeoutSeconds);
            var totals = (await db.Database
                .SqlQueryRaw<sp_MPUReport_V3ColumnTotals>(sql, parameters)
                .ToListAsync())
                .Single();

            return totals.ToDictionary();
        }
        finally
        {
            db.Database.SetCommandTimeout(previousTimeout);
        }
    }

    public static IQueryable<sp_MPUReport_V3Result> Query(
        TradeNetDbContext db,
        sp_MPUReport_V3Request request)
    {
        ArgumentNullException.ThrowIfNull(db);
        ArgumentNullException.ThrowIfNull(request);

        // Both sequences are numbered over the universe the pairing assumes -- successful
        // charges against payment vouchers -- and over the WHOLE history, never over the
        // report's filtered rows. Mirrors sp_MPUReport_V3_pagination.sql; see there for
        // the 2026-09-17 ငွေစာရင်း voucher complaint that pinned these rules down.
        //
        // NOTE: nothing calls this method -- the grid, the Excel export and the footer all
        // go through the stored procedure. It is kept as the readable statement of what
        // that procedure does, so it deliberately omits the procedure's third rule (drop
        // payments more than two days from any of the application's charges): expressing
        // it here would mean a correlated Any() inside the row-number Count(), which EF
        // translates into something far slower than the temp tables the procedure uses.
        // If this method is ever made live, port that rule across first.
        var mpuRows =
            from transaction in db.MpupaymentTransactions
            where transaction.ResponseCode == "00"
            select new
            {
                Transaction = transaction,
                RowNumber = db.MpupaymentTransactions.Count(other =>
                    other.TransactionId == transaction.TransactionId
                    && other.ResponseCode == "00"
                    && (other.TransactionDateTime == null
                        || other.TransactionDateTime < transaction.TransactionDateTime
                        || (other.TransactionDateTime == transaction.TransactionDateTime
                            && other.Id <= transaction.Id)))
            };

        var accountRows =
            from account in db.AccountTransactions
            where account.IsPayment && account.VoucherNo != null
            select new
            {
                Account = account,
                RowNumber = db.AccountTransactions.Count(other =>
                    other.TransactionId == account.TransactionId
                    && other.IsPayment
                    && other.VoucherNo != null
                    && (other.CreatedDate < account.CreatedDate
                        || (other.CreatedDate == account.CreatedDate
                            && string.Compare(other.Id, account.Id) <= 0)))
            };

        return
            from mpuRow in mpuRows
            join accountRow in accountRows
                on new { mpuRow.Transaction.TransactionId, mpuRow.RowNumber }
                equals new { accountRow.Account.TransactionId, accountRow.RowNumber }
            where mpuRow.Transaction.TransactionDateTime >= request.FromDate
                && mpuRow.Transaction.TransactionDateTime <= request.ToDate
                && mpuRow.Transaction.FormType != null
                && (request.FormType == string.Empty || EF.Functions.Like(mpuRow.Transaction.FormType, request.FormType + "%"))
                && mpuRow.Transaction.PaymentType == request.PaymentType
            orderby mpuRow.Transaction.TransactionId, mpuRow.Transaction.TransactionDateTime
            select new sp_MPUReport_V3Result
            {
                Id = mpuRow.Transaction.Id,
                Sakhan = mpuRow.Transaction.Sakhan,
                TransactionDateTime = mpuRow.Transaction.TransactionDateTime,
                CompanyName = db.PaThaKas
                    .Where(paThaKa => paThaKa.PaThaKaNo == mpuRow.Transaction.PaThaKaNo
                        || paThaKa.CompanyRegistrationNo == mpuRow.Transaction.PaThaKaNo)
                    .Select(paThaKa => paThaKa.CompanyName)
                    .FirstOrDefault() ?? string.Empty,
                CompanyRegistrationNo = mpuRow.Transaction.PaThaKaNo,
                ApplicationNo = mpuRow.Transaction.ApplicationNo,
                MerchantId = mpuRow.Transaction.MerchantId,
                AccountNo = mpuRow.Transaction.AccountNo,
                InvoiceNo = mpuRow.Transaction.InvoiceNo,
                ApprovalCode = mpuRow.Transaction.ApprovalCode,
                TransactionRefNo = mpuRow.Transaction.TransactionRefNo,
                TransactionAmount = mpuRow.Transaction.TransactionAmount,
                MOCAmount = mpuRow.Transaction.Mocamount,
                IMAmount = mpuRow.Transaction.Imamount,
                FormType = mpuRow.Transaction.FormType,
                ApplyType = mpuRow.Transaction.ApplyType,
                VoucherNo = accountRow.Account.VoucherNo,
                TotalAmount = accountRow.Account.TotalAmount,
                PaymentDate = accountRow.Account.PaymentDate
            };
    }
}
