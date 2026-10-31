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

namespace Backend.Controllers.Report;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public abstract class LicenceTurndownReportControllerBase : ControllerBase, IStreamingExcelReport
{
    private readonly TradeNetDbContext _context;
    private readonly IExcelExportJobService _excelExportJobs;
    private readonly string _formType;
    private readonly string _reportKey;

    protected LicenceTurndownReportControllerBase(TradeNetDbContext context,
        IExcelExportJobService excelExportJobs, string formType, string reportKey)
    {
        _context = context;
        _excelExportJobs = excelExportJobs;
        _formType = formType;
        _reportKey = reportKey;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResult<ImportLicenceTurndownReportRow>>> Post(
        [FromBody] ImportLicenceTurndownReportRequest? request)
    {
        if (!TryCreateReportRequest(request, out var validated, out var error)) return error!;
        var rows = await sp_ImportLicenceTurndownReport.Query(_context, _formType, validated!).ToListAsync();
        var pageIndex = Math.Max(0, validated!.PageIndex);
        var pageSize = validated.PageSize <= 0 ? 10 : Math.Min(validated.PageSize, 1000);
        return Ok(validated.IncludeTotalCount
            ? ApiResult<ImportLicenceTurndownReportRow>.CreatePageFromRows(rows,
                rows.FirstOrDefault()?.TotalCount ?? 0, pageIndex, pageSize,
                validated.SortColumn, validated.SortOrder, validated.FilterColumn, validated.FilterQuery)
            : ApiResult<ImportLicenceTurndownReportRow>.CreateFastPageFromRows(rows, pageIndex, pageSize,
                validated.SortColumn, validated.SortOrder, validated.FilterColumn, validated.FilterQuery));
    }

    [HttpGet("History/{id}")]
    public async Task<ActionResult<List<ImportLicenceTurndownHistoryRow>>> History(string id)
    {
        if (!Guid.TryParse(id, out _)) return BadRequest("A valid application ID is required.");
        return Ok(await sp_ImportLicenceTurndownReport.History(_context, _formType, id).ToListAsync());
    }

    [HttpPost("Excel")]
    public async Task<IActionResult> Excel([FromBody] ImportLicenceTurndownReportRequest? request)
    {
        if (!TryCreateReportRequest(request, out var validated, out var error)) return error!;
        return Ok(await _excelExportJobs.EnqueueAsync(_reportKey, validated!, validated!.ToDate,
            User.FindFirst(ClaimTypes.Name)?.Value));
    }

    public string ExcelWorksheetTitle => _formType + " Turndown Report";
    public Type ExcelRequestType => typeof(ImportLicenceTurndownReportRequest);

    [NonAction]
    public async Task WriteRowsAsync(object request, IExcelRowSink sink, int chunkSize, CancellationToken cancellationToken)
    {
        var filters = (ImportLicenceTurndownReportRequest)request;
        if (!TryCreateReportRequest(filters, out _, out _)) throw new ArgumentException("Invalid turndown report date range.");
        await foreach (var chunk in sp_ImportLicenceTurndownReport.Query(_context, _formType, filters, export: true)
            .AsAsyncEnumerable().ChunkAsync(chunkSize, cancellationToken))
        {
            sink.Append(chunk.ToList());
        }
    }

    protected bool TryCreateReportRequest(ImportLicenceTurndownReportRequest? request,
        out ImportLicenceTurndownReportRequest? validated, out ActionResult? error)
    {
        validated = null;
        error = null;
        if (request == null || request.FromDate < new DateTime(1753, 1, 1)
            || request.ToDate.Date >= new DateTime(9999, 12, 31) || request.ToDate.Date < request.FromDate.Date)
        {
            error = BadRequest("A valid From Date / To Date range is required.");
            return false;
        }
        validated = request;
        return true;
    }
}

[ExcelFormatVersion(2)]
public sealed class ImportLicenceTurndownReportController : LicenceTurndownReportControllerBase
{
    public ImportLicenceTurndownReportController(TradeNetDbContext context, IExcelExportJobService excelExportJobs)
        : base(context, excelExportJobs, "Import Licence", "ImportLicenceTurndownReport") { }
}
