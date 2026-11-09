using System;
using System.Linq;
using System.Collections.Generic;
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
    // Bumped 2026-09-04: the Amend / Actual Amend date-window fix changes WHICH rows an
    // export contains for an unchanged request payload, so cached closed-period files
    // must not be reused (see ExcelExportJobService).
    // v3: include the requested item Description and QTY columns in regenerated exports.
    [ExcelFormatVersion(3)]
    public class ExportLicenceActualAmendmentReportController : ControllerBase, IStreamingExcelReport
    {
        private const int DefaultPageSize = 10;
        private const int MaxPageSize = 1000;

        // Excel worksheets allow 1,048,576 rows including the header.
        private const int MaxExcelDataRows = 1_048_576 - 1;
        private const string ReportKey = "ExportLicenceActualAmendmentReport";

        private readonly TradeNetDbContext _context;
        private readonly IExcelExportJobService _excelExportJobs;

        public ExportLicenceActualAmendmentReportController(TradeNetDbContext context, IExcelExportJobService excelExportJobs)
        {
            _context = context;
            _excelExportJobs = excelExportJobs;
        }

        [HttpPost]
        public async Task<ActionResult<ApiResult<sp_ActualAmendReportResult>>> Post([FromBody] ExportLicenceActualAmendmentReportRequest? request)
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

            var rows = await sp_ActualAmendReport.ExecuteAsync(
                _context, procedureRequest!, sortColumn, sortOrder, pageIndex, pageSize, request.IncludeTotalCount);

            var data = rows.Select(row => row.ToResult()).ToList();

            var result = request.IncludeTotalCount
                ? ApiResult<sp_ActualAmendReportResult>.CreatePageFromRows(
                    data, rows.Count > 0 ? (rows[0].TotalCount ?? 0) : 0, pageIndex, pageSize,
                    request.SortColumn, request.SortOrder, request.FilterColumn, request.FilterQuery)
                : ApiResult<sp_ActualAmendReportResult>.CreateFastPageFromRows(
                    data, pageIndex, pageSize,
                    request.SortColumn, request.SortOrder, request.FilterColumn, request.FilterQuery);

            if (data.Count > 0)
            {
                result.CurrencyTotals = await ExportLicenceListingCurrencyTotals.ExecuteAsync(
                    _context, procedureRequest!.FormType, "Actual Amend", procedureRequest.FromDate, procedureRequest.ToDate,
                    procedureRequest.ExportImportSectionId, procedureRequest.CompanyRegistrationNo,
                    procedureRequest.AmendRemarkId, procedureRequest.SakhanId);
            }

            return Ok(result);
        }

        [HttpPost("Excel")]
        public async Task<IActionResult> Excel([FromBody] ExportLicenceActualAmendmentReportRequest? request)
        {
            // if (!TryCreateReportRequest(request, out var procedureRequest, out var errorResult))
            // {
            //     return errorResult!;
            // }

            // var sortColumn = string.IsNullOrWhiteSpace(request!.SortColumn) ? null : request.SortColumn;
            // var sortOrder = string.IsNullOrWhiteSpace(request.SortOrder) ? null : request.SortOrder;

            // var rows = await sp_ActualAmendReport.ExecuteAsync(
            //     _context, procedureRequest!, sortColumn, sortOrder, pageIndex: null, pageSize: null);

            // if (rows.Count > MaxExcelDataRows)
            // {
            //     return BadRequest($"Excel export supports up to {MaxExcelDataRows} data rows.");
            // }

            // var data = rows.Select(row => row.ToResult()).ToList();
            // var fileBytes = ExcelGenerator.CreateWorkbook(data, "Export Licence Actual Amendment Report");

            // return File(
            //     fileBytes,
            //     ExcelGenerator.ContentType,
            //     "ExportLicenceActualAmendmentReport.xlsx");
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
        public string ExcelWorksheetTitle => "Export Licence Actual Amendment Report";
        public Type ExcelRequestType => typeof(ExportLicenceActualAmendmentReportRequest);

        [NonAction]
        public Task WriteRowsAsync(object request, IExcelRowSink sink, int chunkSize, CancellationToken cancellationToken)
            => WriteRowsAsync((ExportLicenceActualAmendmentReportRequest)request, sink, chunkSize, cancellationToken);

        private async Task WriteRowsAsync(
            ExportLicenceActualAmendmentReportRequest request,
            IExcelRowSink sink,
            int chunkSize,
            CancellationToken cancellationToken)
        {
            TryCreateReportRequest(request, out var procedureRequest, out _);
            // Stream the SAME stored procedure the grid uses (the other 15 Amend / Actual Amend
            // controllers already do). The legacy LINQ Query() path produced a different row order
            // and was the one export not covered by the procedure's date-window parity fix.
            await foreach (var chunk in sp_ActualAmendReport.ExecuteQueryable(_context, procedureRequest!)
                .AsAsyncEnumerable().ChunkAsync(chunkSize, cancellationToken))
            {
                sink.Append(chunk.Select(row => row.ToResult()).ToList());
            }
        }

        private bool TryCreateReportRequest(
            ExportLicenceActualAmendmentReportRequest? request,
            out sp_ActualAmendReportRequest? procedureRequest,
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

            procedureRequest = new sp_ActualAmendReportRequest
            {
                FormType = "Export Licence",
                FromDate = request.FromDate,
                // The pagination procedure treats ToDate as a calendar date and adds one day.
                // Strip the UI's end-of-day time so the next calendar day is not included.
                ToDate = request.ToDate.Date,
                ExportImportSectionId = request.ExportImportSectionId,
                AmendRemarkId = request.AmendRemarkId,
                CompanyRegistrationNo = request.CompanyRegistrationNo,
                SakhanId = request.SakhanId,
            };

            return true;
        }
    }

    public sealed class ExportLicenceActualAmendmentReportRequest : ReportQueryRequest
    {
        public string FormType { get; set; } = string.Empty;
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int ExportImportSectionId { get; set; }
        public int AmendRemarkId { get; set; }
        public string CompanyRegistrationNo { get; set; } = string.Empty;
        public int SakhanId { get; set; }
    }
}
