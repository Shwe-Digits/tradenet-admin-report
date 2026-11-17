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

namespace Backend.Controllers.Report;

[Authorize]
[ApiController]
[Route("api/[controller]")]
[ExcelFormatVersion(1)]
public abstract class PermitPendingReportControllerBase : ControllerBase,IStreamingExcelReport
{
    private readonly TradeNetDbContext _context;
    private readonly IExcelExportJobService _excelExportJobs;
    protected abstract string FormType { get; }
    private string ReportKey=>GetType().Name.Replace("Controller",string.Empty);

    protected PermitPendingReportControllerBase(TradeNetDbContext context,IExcelExportJobService excelExportJobs)
    {
        _context=context;
        _excelExportJobs=excelExportJobs;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResult<sp_PendingReportResult>>> Post([FromBody] PermitPendingReportRequest? request)
    {
        if(!TryCreateReportRequest(request,out var procedure,out var error))return error!;
        var pageIndex=Math.Max(0,request!.PageIndex);
        var pageSize=request.PageSize<=0 ? 10 : Math.Min(request.PageSize,1000);
        var rows=await sp_PermitPendingReport.ExecuteQueryable(_context,procedure!,request.SortColumn,request.SortOrder,
            pageIndex,pageSize,request.IncludeTotalCount).ToListAsync();
        var data=rows.Select(row=>row.ToResult()).ToList();
        var result=request.IncludeTotalCount
            ? ApiResult<sp_PendingReportResult>.CreatePageFromRows(data,rows.FirstOrDefault()?.TotalCount??0,pageIndex,pageSize,
                request.SortColumn,request.SortOrder,request.FilterColumn,request.FilterQuery)
            : ApiResult<sp_PendingReportResult>.CreateFastPageFromRows(data,pageIndex,pageSize,
                request.SortColumn,request.SortOrder,request.FilterColumn,request.FilterQuery);
        return Ok(result);
    }

    [HttpPost("Excel")]
    public async Task<IActionResult> Excel([FromBody] PermitPendingReportRequest? request)
    {
        if(!TryCreateReportRequest(request,out _,out var error))return error!;
        return Ok(await _excelExportJobs.EnqueueAsync(ReportKey,request!,request!.ToDate,User.FindFirst(ClaimTypes.Name)?.Value));
    }

    public string ExcelWorksheetTitle=>FormType+" Pending Report";
    public Type ExcelRequestType=>typeof(PermitPendingReportRequest);

    [NonAction]
    public async Task WriteRowsAsync(object request,IExcelRowSink sink,int chunkSize,CancellationToken cancellationToken)
    {
        var typed=(PermitPendingReportRequest)request;
        if(!TryCreateReportRequest(typed,out var procedure,out _))throw new ArgumentException("Invalid pending report request.",nameof(request));
        await foreach(var chunk in sp_PermitPendingReport.ExecuteQueryable(_context,procedure!,typed.SortColumn,typed.SortOrder)
            .AsAsyncEnumerable().ChunkAsync(chunkSize,cancellationToken))
            sink.Append(chunk.Select(row=>row.ToResult()).ToList());
    }

    protected bool TryCreateReportRequest(PermitPendingReportRequest? request,out sp_PendingReportRequest? procedureRequest,out ActionResult? errorResult)
    {
        procedureRequest=null;
        errorResult=null;
        if(request==null){errorResult=BadRequest("Request body is required.");return false;}
        if(request.FromDate==default){errorResult=BadRequest("FromDate is required.");return false;}
        if(request.ToDate==default){errorResult=BadRequest("ToDate is required.");return false;}
        if(request.ToDate<request.FromDate){errorResult=BadRequest("ToDate must be greater than or equal to FromDate.");return false;}
        if(request.ExportImportSectionId<0){errorResult=BadRequest("ExportImportSectionId cannot be negative.");return false;}
        procedureRequest=new sp_PendingReportRequest { FromDate=request.FromDate,ToDate=request.ToDate,
            FormType=FormType,ExportImportSectionId=request.ExportImportSectionId };
        return true;
    }
}

public sealed class PermitPendingReportRequest : ReportQueryRequest
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public int ExportImportSectionId { get; set; }
}
