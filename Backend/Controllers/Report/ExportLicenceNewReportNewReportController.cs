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
    // 2: the export now carries the per-currency Total footer. The job cache keys on the request
    // payload + this version, so an unchanged filter set would keep serving the footer-less .xlsx.
    // 3: add Licence Date after Licence No.
    [ExcelFormatVersion(4)]
    public class ExportLicenceNewReportNewReportController : ControllerBase, IStreamingExcelReport
    {
        private const string ReportKey = "ExportLicenceNewReportNewReport";
        private const int DefaultPageSize = 10;
        private const int MaxPageSize = 1000;

        private readonly TradeNetDbContext _context;
        private readonly IExcelExportJobService _excelExportJobs;

        public ExportLicenceNewReportNewReportController(TradeNetDbContext context, IExcelExportJobService excelExportJobs)
        {
            _context = context;
            _excelExportJobs = excelExportJobs;
        }

        [HttpPost]
        public async Task<ActionResult<ApiResult<sp_NewReportResult>>> Post([FromBody] ExportLicenceNewReportNewReportRequest? request)
        {
            if (!TryCreateReportRequest(request, out var procedureRequest, out var errorResult))
            {
                return errorResult!;
            }

            var pageIndex = Math.Max(0, request!.PageIndex);
            var pageSize = request.PageSize <= 0 ? DefaultPageSize : Math.Min(request.PageSize, MaxPageSize);
            var sortColumn = string.IsNullOrWhiteSpace(request.SortColumn) ? null : request.SortColumn;
            var sortOrder = string.IsNullOrWhiteSpace(request.SortOrder) ? null : request.SortOrder;

            var rows = await sp_NewReport.ExecuteAsync(
                _context, procedureRequest!, sortColumn, sortOrder, pageIndex, pageSize, request.IncludeTotalCount);
            var data = rows.Select(row => row.ToResult()).ToList();

            var result = request.IncludeTotalCount
                ? ApiResult<sp_NewReportResult>.CreatePageFromRows(
                    data, rows.Count > 0 ? (rows[0].TotalCount ?? 0) : 0, pageIndex, pageSize,
                    request.SortColumn, request.SortOrder, request.FilterColumn, request.FilterQuery)
                : ApiResult<sp_NewReportResult>.CreateFastPageFromRows(
                    data, pageIndex, pageSize,
                    request.SortColumn, request.SortOrder, request.FilterColumn, request.FilterQuery);

            // The legacy NewLicenceReport.rdlc "Currency" group footer: one
            // "<CUR>: N licence(s)" + summed Total Value row per currency, plus the grand
            // "Total: N licence(s)". Deferred to the exact-count request (the grid's one lazy
            // round trip per Filter click, which BasicTable merges into the footer) so the first
            // page still renders without paying for the wide COUNT + the totals query. The Excel
            // export gets it too: ExcelFooterTotalsResolver replays this action with
            // IncludeTotalCount = true.
            if (request.IncludeTotalCount && data.Count > 0)
            {
                result.CurrencyTotals = await ExportLicenceListingCurrencyTotals.ExecuteAsync(
                    _context, procedureRequest!.FormType, "New",
                    procedureRequest.FromDate, procedureRequest.ToDate,
                    procedureRequest.ExportImportSectionId, procedureRequest.CompanyRegistrationNo,
                    0, procedureRequest.SakhanId, procedureRequest.Auto ?? string.Empty);
            }

            return Ok(result);
        }

        [HttpPost("Excel")]
        public async Task<IActionResult> Excel([FromBody] ExportLicenceNewReportNewReportRequest? request)
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
        public string ExcelWorksheetTitle => "Export Licence New Report (New Report )";
        public Type ExcelRequestType => typeof(ExportLicenceNewReportNewReportRequest);

        [NonAction]
        public Task WriteRowsAsync(object request, IExcelRowSink sink, int chunkSize, CancellationToken cancellationToken)
            => WriteRowsAsync((ExportLicenceNewReportNewReportRequest)request, sink, chunkSize, cancellationToken);

        private async Task WriteRowsAsync(
            ExportLicenceNewReportNewReportRequest request,
            IExcelRowSink sink,
            int chunkSize,
            CancellationToken cancellationToken)
        {
            TryCreateReportRequest(request, out var procedureRequest, out _);
            await foreach (var chunk in sp_NewReport.ExecuteQueryable(_context, procedureRequest!)
                .AsAsyncEnumerable().ChunkAsync(chunkSize, cancellationToken))
            {
                sink.Append(chunk.Select(row => row.ToResult()).ToList());
            }
        }

        private bool TryCreateReportRequest(
            ExportLicenceNewReportNewReportRequest? request,
            out sp_NewReportRequest? procedureRequest,
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
            procedureRequest = new sp_NewReportRequest
            {
                FormType = "Export Licence",
                FromDate = request.FromDate,
                ToDate = request.ToDate,
                ExportImportSectionId = request.ExportImportSectionId,
                CompanyRegistrationNo = request.CompanyRegistrationNo,
                SakhanId = request.SakhanId,
                Auto = request.Auto,
            };

            return true;
        }
    }

    public sealed class ExportLicenceNewReportNewReportRequest : ReportQueryRequest
    {
        public string FormType { get; set; } = string.Empty;
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int ExportImportSectionId { get; set; }
        public string CompanyRegistrationNo { get; set; } = string.Empty;
        public int SakhanId { get; set; }
        public string Auto { get; set; } = string.Empty;
    }
}

