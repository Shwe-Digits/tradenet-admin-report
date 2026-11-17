using API.DBContext;
using API.Service.ExcelExport;

namespace Backend.Controllers.Report;

public sealed class ExportPermitPendingReportController : PermitPendingReportControllerBase
{
    protected override string FormType => "Export Permit";

    public ExportPermitPendingReportController(TradeNetDbContext context,IExcelExportJobService excelExportJobs)
        : base(context,excelExportJobs) { }
}
