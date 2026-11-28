using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using API.DBContext;
using API.Model;
using API.Service.ExcelExport;
using API.Service.Reports;
using API.StoredProcedureToLinq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers.Report
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    // v2: the LicenceNo (header2) column is now hidden for ApplyType='New', the way
    // VoucherReport.rdlc:1883 does, so the sheet's column set changed.
    // v3: the export now carries the Total Amount footer. The job cache keys on the request
    // payload + this version, so an unchanged filter set would keep serving the footer-less .xlsx.
    [ExcelFormatVersion(4)]
    public class ExportLicenceVoucherReportController : ControllerBase, IStreamingExcelReport
    {
        private const string ReportKey = "ExportLicenceVoucherReport";
        private const int DefaultPageSize = 10;
        private const int MaxPageSize = 1000;

        private readonly TradeNetDbContext _context;
        private readonly IExcelExportJobService _excelExportJobs;

        public ExportLicenceVoucherReportController(TradeNetDbContext context, IExcelExportJobService excelExportJobs)
        {
            _context = context;
            _excelExportJobs = excelExportJobs;
        }

        [HttpPost]
        public async Task<ActionResult<ApiResult<sp_VoucherReportResult>>> Post([FromBody] ExportLicenceVoucherReportRequest? request)
        {
            if (!TryCreateReportRequest(request, out var procedureRequest, out var errorResult))
            {
                return errorResult!;
            }

            var pageIndex = Math.Max(0, request!.PageIndex);
            var pageSize = request.PageSize <= 0 ? DefaultPageSize : Math.Min(request.PageSize, MaxPageSize);
            var sortColumn = string.IsNullOrWhiteSpace(request.SortColumn) ? null : request.SortColumn;
            var sortOrder = string.IsNullOrWhiteSpace(request.SortOrder) ? null : request.SortOrder;

            var rows = await sp_VoucherReport.ExecuteAsync(
                _context, procedureRequest!, sortColumn, sortOrder, pageIndex, pageSize, request.IncludeTotalCount);
            var data = rows.Select(row => row.ToResult()).ToList();

            var result = request.IncludeTotalCount
                ? ApiResult<sp_VoucherReportResult>.CreatePageFromRows(
                    data, rows.Count > 0 ? (rows[0].TotalCount ?? 0) : 0, pageIndex, pageSize,
                    request.SortColumn, request.SortOrder, request.FilterColumn, request.FilterQuery)
                : ApiResult<sp_VoucherReportResult>.CreateFastPageFromRows(
                    data, pageIndex, pageSize,
                    request.SortColumn, request.SortOrder, request.FilterColumn, request.FilterQuery);

            // Legacy VoucherReport.rdlc footer: ONE static row - TOTAL + =FORMAT(SUM(Fields!Amount.Value),"N0")
            // = SUM(AccountTransaction.TotalAmount), the MMK voucher fee. NOT the goods value that
            // sp_ExportLicenceVoucherCurrencyTotals sums - that would print a licence-value total under
            // the fee column. Lic Value stays a plain column: the old rdlc never totals it.
            //
            // Gated on IncludeTotalCount so the fast first page is not blocked: CreateFastPageFromRows
            // sets IsTotalCountExact = false, so the grid always follows up with an exact-count POST,
            // and BasicTable picks the footer up from that response as lazyColumnTotals.
            if (request.IncludeTotalCount && data.Count > 0)
            {
                var amountTotal = await sp_VoucherReport.ExecuteAmountTotalAsync(_context, procedureRequest!);
                if (amountTotal.HasValue)
                {
                    result.ColumnTotals = new Dictionary<string, decimal>
                    {
                        // Rounded to 0 dp to reproduce the rdlc's "N0"; keyed by the grid column's
                        // dataIndex ("amount"), which is what BasicTable matches on.
                        ["amount"] = decimal.Round(amountTotal.Value, 0),
                    };
                }
            }

            return Ok(result);
        }

        [HttpPost("Excel")]
        public async Task<IActionResult> Excel([FromBody] ExportLicenceVoucherReportRequest? request)
        {
            if (!TryCreateReportRequest(request, out _, out var errorResult))
            {
                return errorResult!;
            }

            var result = await _excelExportJobs.EnqueueAsync(
                ReportKey,
                request!,
                request!.ToDate,
                User.FindFirst(ClaimTypes.Name)?.Value);

            return Ok(result);
        }

        // --- Async Excel export streaming (used by the background queue worker) ---
        public string ExcelWorksheetTitle => "Export Licence Voucher Report";
        public Type ExcelRequestType => typeof(ExportLicenceVoucherReportRequest);

        [NonAction]
        public Task WriteRowsAsync(object request, IExcelRowSink sink, int chunkSize, CancellationToken cancellationToken)
            => WriteRowsAsync((ExportLicenceVoucherReportRequest)request, sink, chunkSize, cancellationToken);

        private async Task WriteRowsAsync(
            ExportLicenceVoucherReportRequest request,
            IExcelRowSink sink,
            int chunkSize,
            CancellationToken cancellationToken)
        {
            TryCreateReportRequest(request, out var procedureRequest, out _);
            await foreach (var chunk in sp_VoucherReport.ExecuteQueryable(_context, procedureRequest!)
                .AsAsyncEnumerable().ChunkAsync(chunkSize, cancellationToken))
            {
                sink.Append(chunk.Select(row => row.ToResult()).ToList());
            }
        }

        private bool TryCreateReportRequest(
            ExportLicenceVoucherReportRequest? request,
            out sp_VoucherReportRequest? procedureRequest,
            out ActionResult? errorResult)
        {
            procedureRequest = null;
            errorResult = null;

            if (request == null)
            {
                errorResult = BadRequest("Request body is required.");
                return false;
            }

            if (request.FromDate == default)
            {
                errorResult = BadRequest("FromDate is required.");
                return false;
            }

            if (request.ToDate == default)
            {
                errorResult = BadRequest("ToDate is required.");
                return false;
            }

            if (request.ToDate < request.FromDate)
            {
                errorResult = BadRequest("ToDate must be greater than or equal to FromDate.");
                return false;
            }
            procedureRequest = new sp_VoucherReportRequest
            {
                FormType = "Export Licence",
                FromDate = request.FromDate,
                ToDate = request.ToDate,
                ExportImportSectionId = request.ExportImportSectionId,
                PaymentType = request.PaymentType,
                ApplyType = request.ApplyType,
                CompanyRegistrationNo = request.CompanyRegistrationNo,
                SakhanId = request.SakhanId,
            };

            return true;
        }
    }

    public sealed class ExportLicenceVoucherReportRequest : ReportQueryRequest
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
}

