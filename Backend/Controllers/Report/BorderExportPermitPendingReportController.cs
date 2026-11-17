using API.DBContext;
using API.Service.ExcelExport;

namespace Backend.Controllers.Report;

public sealed class BorderExportPermitPendingReportController : PermitPendingReportControllerBase
{
    protected override string FormType => "Border Export Permit";

    public BorderExportPermitPendingReportController(TradeNetDbContext context,IExcelExportJobService excelExportJobs)
        : base(context,excelExportJobs) { }
}
