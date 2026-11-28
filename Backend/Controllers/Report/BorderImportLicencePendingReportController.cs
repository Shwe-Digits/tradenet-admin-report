using System;
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
    [ExcelFormatVersion(3)]
    public class BorderImportLicencePendingReportController : ControllerBase, IStreamingExcelReport
    {
        private const string ReportKey = "BorderImportLicencePendingReport";
        private const int DefaultPageSize = 10;
        private const int MaxPageSize = 1000;

        private readonly TradeNetDbContext _context;
        private readonly IExcelExportJobService _excelExportJobs;

        public BorderImportLicencePendingReportController(TradeNetDbContext context, IExcelExportJobService excelExportJobs)
        {
            _context = context;
            _excelExportJobs = excelExportJobs;
        }

        [HttpPost]
        public async Task<ActionResult<ApiResult<sp_PendingReportResult>>> Post([FromBody] BorderImportLicencePendingReportRequest? request)
        {
            if (!TryCreateReportRequest(request, out var procedureRequest, out var errorResult))
            {
                return errorResult!;
            }

            // The deployed pagination procedure is hard-coded to ImportLicence and
            // ignores FormType. Use the retained legacy-compatible LINQ query so this
            // endpoint reads BorderImportLicence even before a DB migration is deployed.
            var pageIndex = Math.Max(0, request!.PageIndex);
            var pageSize = request.PageSize <= 0
                ? DefaultPageSize
                : Math.Min(request.PageSize, MaxPageSize);
            var result = await ApiResult<sp_PendingReportResult>.CreateFastPageAsync(
                sp_PendingReport.Query(_context, procedureRequest!),
                pageIndex,
                pageSize,
                request.SortColumn,
                request.SortOrder,
                request.FilterColumn,
                request.FilterQuery,
                request.IncludeTotalCount);

            return Ok(result);
        }

        [HttpPost("Excel")]
        public async Task<IActionResult> Excel([FromBody] BorderImportLicencePendingReportRequest? request)
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
        public string ExcelWorksheetTitle => "Border Import Licence Pending Report";
        public Type ExcelRequestType => typeof(BorderImportLicencePendingReportRequest);

        [NonAction]
        public Task WriteRowsAsync(object request, IExcelRowSink sink, int chunkSize, CancellationToken cancellationToken)
            => WriteRowsAsync((BorderImportLicencePendingReportRequest)request, sink, chunkSize, cancellationToken);

        private async Task WriteRowsAsync(
            BorderImportLicencePendingReportRequest request,
            IExcelRowSink sink,
            int chunkSize,
            CancellationToken cancellationToken)
        {
            TryCreateReportRequest(request, out var procedureRequest, out _);
            await foreach (var chunk in sp_PendingReport.Query(_context, procedureRequest!)
                .OrderBy(row => row.ApplicationDate)
                .ThenBy(row => row.ApplicationNo)
                .AsAsyncEnumerable().ChunkAsync(chunkSize, cancellationToken))
            {
                sink.Append(chunk);
            }
        }

        private bool TryCreateReportRequest(
            BorderImportLicencePendingReportRequest? request,
            out sp_PendingReportRequest? procedureRequest,
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
            procedureRequest = new sp_PendingReportRequest
            {
                FromDate = request.FromDate,
                ToDate = request.ToDate,
                FormType = "Border Import Licence",
                ExportImportSectionId = request.ExportImportSectionId,
            };

            return true;
        }
    }

    public sealed class BorderImportLicencePendingReportRequest : ReportQueryRequest
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public string FormType { get; set; } = string.Empty;
        public int ExportImportSectionId { get; set; }
    }
}

