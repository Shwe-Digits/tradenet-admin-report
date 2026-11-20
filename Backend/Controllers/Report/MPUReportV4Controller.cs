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
    [ExcelFormatVersion(1)]
    public class MPUReportV4Controller : ControllerBase, IStreamingExcelReport, IExcelFooterTotalsProvider
    {
        private const string ReportKey = "MPUReportV4";
        private const int DefaultPageSize = 10;
        private const int MaxPageSize = 1000;

        private readonly TradeNetDbContext _context;
        private readonly IExcelExportJobService _excelExportJobs;

        public MPUReportV4Controller(TradeNetDbContext context, IExcelExportJobService excelExportJobs)
        {
            _context = context;
            _excelExportJobs = excelExportJobs;
        }

        [HttpPost]
        public async Task<ActionResult<ApiResult<sp_MPUReport_V4Result>>> Post([FromBody] MPUReportV3Request? request)
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
            var includeTotalCount = request.IncludeTotalCount;

            var rows = await sp_MPUReport_V4.ExecuteAsync(
                _context, procedureRequest!, sortColumn, sortOrder, pageIndex, pageSize, includeTotalCount);

            var data = rows.Select(row => row.ToV4Result()).ToList();

            var result = includeTotalCount
                ? ApiResult<sp_MPUReport_V4Result>.CreatePageFromRows(
                    data, rows.Count > 0 ? (rows[0].TotalCount ?? 0) : 0, pageIndex, pageSize,
                    request.SortColumn, request.SortOrder, request.FilterColumn, request.FilterQuery)
                : ApiResult<sp_MPUReport_V4Result>.CreateFastPageFromRows(
                    data, pageIndex, pageSize,
                    request.SortColumn, request.SortOrder, request.FilterColumn, request.FilterQuery);

            if (includeTotalCount)
            {
                result.ColumnTotals = await sp_MPUReport_V3.ExecuteColumnTotalsAsync(_context, procedureRequest!);
            }

            return Ok(result);
        }

        [HttpPost("Excel")]
        public async Task<IActionResult> Excel([FromBody] MPUReportV3Request? request)
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
        public string ExcelWorksheetTitle => "MPU Report V4";
        public Type ExcelRequestType => typeof(MPUReportV3Request);

        [NonAction]
        public Task WriteRowsAsync(object request, IExcelRowSink sink, int chunkSize, CancellationToken cancellationToken)
            => WriteRowsAsync((MPUReportV3Request)request, sink, chunkSize, cancellationToken);

        private async Task WriteRowsAsync(
            MPUReportV3Request request,
            IExcelRowSink sink,
            int chunkSize,
            CancellationToken cancellationToken)
        {
            if (!TryCreateReportRequest(request, out var procedureRequest, out _))
            {
                throw new ArgumentException("Invalid MPU Report V4 export filters.", nameof(request));
            }

            await foreach (var chunk in sp_MPUReport_V4.ExecuteQueryable(_context, procedureRequest!)
                .AsAsyncEnumerable().ChunkAsync(chunkSize, cancellationToken))
            {
                sink.Append(chunk.Select(row => row.ToV4Result()).ToList());
            }
        }

        // V4 adds a lookup column. Its monetary totals use the same calculation as V3.
        [NonAction]
        public async Task<ReportFooterTotals?> GetExcelFooterTotalsAsync(
            object request,
            CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (!TryCreateReportRequest((MPUReportV3Request)request, out var procedureRequest, out _))
            {
                throw new InvalidOperationException(
                    "MPU Report V4 footer totals: the export's stored FromDate/ToDate are invalid.");
            }

            var columnTotals = await sp_MPUReport_V3.ExecuteColumnTotalsAsync(_context, procedureRequest!);

            return new ReportFooterTotals(columnTotals, CurrencyTotals: null);
        }

        private bool TryCreateReportRequest(
            MPUReportV3Request? request,
            out sp_MPUReport_V3Request? procedureRequest,
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

            procedureRequest = new sp_MPUReport_V3Request
            {
                FromDate = request.FromDate,
                ToDate = request.ToDate,
                FormType = request.FormType,
                PaymentType = request.PaymentType,
            };

            return true;
        }
    }

}
