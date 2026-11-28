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
    [ExcelFormatVersion(3)]
    public class BorderImportLicenceVoucherReportController : ControllerBase, IStreamingExcelReport
    {
        private const string ReportKey = "BorderImportLicenceVoucherReport";

        private const int DefaultPageSize = 10;
        private const int MaxPageSize = 1000;

        private readonly TradeNetDbContext _context;
        private readonly IExcelExportJobService _excelExportJobs;

        public BorderImportLicenceVoucherReportController(TradeNetDbContext context, IExcelExportJobService excelExportJobs)
        {
            _context = context;
            _excelExportJobs = excelExportJobs;
        }

        [HttpPost]
        public async Task<ActionResult<ApiResult<sp_VoucherReportResult>>> Post([FromBody] BorderImportLicenceVoucherReportRequest? request)
        {
            if (!TryCreateReportRequest(request, out var procedureRequest, out var errorResult))
            {
                return errorResult!;
            }

            var pageIndex = Math.Max(0, request!.PageIndex);
            var pageSize = request.PageSize <= 0
                ? DefaultPageSize
                : Math.Min(request.PageSize, MaxPageSize);

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

            // Legacy BorderVoucherReport.rdlc has one grand TOTAL under the
            // AccountTransaction Amount column. Compute it over the complete
            // filtered population, not only the current page.
            if (data.Count > 0)
            {
                var amountTotal = await sp_VoucherReport.ExecuteAmountTotalAsync(
                    _context,
                    procedureRequest!);
                if (amountTotal.HasValue)
                {
                    result.ColumnTotals = new Dictionary<string, decimal>
                    {
                        ["amount"] = decimal.Round(amountTotal.Value, 0),
                    };
                }
            }

            return Ok(result);
        }

        [HttpPost("Excel")]
        public async Task<IActionResult> Excel([FromBody] BorderImportLicenceVoucherReportRequest? request)
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
        public string ExcelWorksheetTitle => "Border Import Licence Voucher Report";
        public Type ExcelRequestType => typeof(BorderImportLicenceVoucherReportRequest);

        [NonAction]
        public Task WriteRowsAsync(object request, IExcelRowSink sink, int chunkSize, CancellationToken cancellationToken)
            => WriteRowsAsync((BorderImportLicenceVoucherReportRequest)request, sink, chunkSize, cancellationToken);

        private async Task WriteRowsAsync(
            BorderImportLicenceVoucherReportRequest request,
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
            BorderImportLicenceVoucherReportRequest? request,
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
                FormType = "Border Import Licence",
                FromDate = request.FromDate,
                // The pagination procedure uses an exclusive next-day upper
                // bound. Strip the UI's end-of-day time so it cannot add an
                // unintended extra calendar day.
                ToDate = request.ToDate.Date,
                ExportImportSectionId = request.ExportImportSectionId,
                PaymentType = request.PaymentType,
                // The old filter has no All option; its first/default value is New.
                ApplyType = string.IsNullOrWhiteSpace(request.ApplyType)
                    ? "New"
                    : request.ApplyType,
                CompanyRegistrationNo = (request.CompanyRegistrationNo ?? string.Empty).Trim(),
                SakhanId = request.SakhanId,
            };

            return true;
        }
    }

    public sealed class BorderImportLicenceVoucherReportRequest : ReportQueryRequest
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

