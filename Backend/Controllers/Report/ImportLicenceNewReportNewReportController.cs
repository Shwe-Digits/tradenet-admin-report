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
    [ExcelFormatVersion(4)]
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ImportLicenceNewReportNewReportController : ControllerBase, IStreamingExcelReport
    {
        private const string ReportKey = "ImportLicenceNewReportNewReport";

        private const int DefaultPageSize = 10;
        private const int MaxPageSize = 1000;

        // Excel worksheets allow 1,048,576 rows including the header.
        private const int MaxExcelDataRows = 1_048_576 - 1;

        private readonly TradeNetDbContext _context;
        private readonly IExcelExportJobService _excelExportJobs;

        public ImportLicenceNewReportNewReportController(TradeNetDbContext context, IExcelExportJobService excelExportJobs)
        {
            _context = context;
            _excelExportJobs = excelExportJobs;
        }

        [HttpPost]
        public async Task<ActionResult<ApiResult<sp_NewReportResult>>> Post([FromBody] ImportLicenceNewReportNewReportRequest? request)
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

            if (data.Count > 0)
            {
                // Legacy NewLicenceReport.rdlc "Currency" group footer: per-currency licence
                // count + summed value, plus the grand "Total: N licence(s)". New licences carry
                // no amend remark, so amendRemarkId: 0 (the proc's New branch ignores it).
                result.CurrencyTotals = await ImportLicenceListingCurrencyTotals.ExecuteAsync(
                    _context, "New", procedureRequest!.FromDate, procedureRequest.ToDate,
                    procedureRequest.ExportImportSectionId, procedureRequest.CompanyRegistrationNo,
                    amendRemarkId: 0, auto: procedureRequest.Auto, quota: procedureRequest.Quota);
            }

            return Ok(result);
        }

        [HttpPost("Excel")]
        public async Task<IActionResult> Excel([FromBody] ImportLicenceNewReportNewReportRequest? request)
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
        public string ExcelWorksheetTitle => "Import Licence New Report";
        public Type ExcelRequestType => typeof(ImportLicenceNewReportNewReportRequest);

        [NonAction]
        public Task WriteRowsAsync(object request, IExcelRowSink sink, int chunkSize, CancellationToken cancellationToken)
            => WriteRowsAsync((ImportLicenceNewReportNewReportRequest)request, sink, chunkSize, cancellationToken);

        private async Task WriteRowsAsync(
            ImportLicenceNewReportNewReportRequest request,
            IExcelRowSink sink,
            int chunkSize,
            CancellationToken cancellationToken)
        {
            TryCreateReportRequest(request, out var procedureRequest, out _);
            await foreach (var chunk in sp_NewReport.ExecuteQueryable(
                    _context,
                    procedureRequest!,
                    includeTotalCount: false)
                .AsAsyncEnumerable().ChunkAsync(chunkSize, cancellationToken))
            {
                sink.Append(chunk.Select(row => row.ToResult()).ToList());
            }
        }

        private bool TryCreateReportRequest(
            ImportLicenceNewReportNewReportRequest? request,
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
                FormType = "Import Licence",
                FromDate = request.FromDate,
                ToDate = request.ToDate,
                ExportImportSectionId = request.ExportImportSectionId,
                CompanyRegistrationNo = request.CompanyRegistrationNo?.Trim() ?? string.Empty,
                SakhanId = request.SakhanId,
                Auto = request.Auto?.Trim() ?? string.Empty,
                Quota = request.Quota?.Trim() ?? string.Empty,
            };

            return true;
        }
    }

    public sealed class ImportLicenceNewReportNewReportRequest : ReportQueryRequest
    {
        public string FormType { get; set; } = string.Empty;
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int ExportImportSectionId { get; set; }
        public string? CompanyRegistrationNo { get; set; }
        public int SakhanId { get; set; }
        public string? Auto { get; set; }
        public string? Quota { get; set; }
    }
}
