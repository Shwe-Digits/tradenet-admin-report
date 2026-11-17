using API.DBContext;
using API.Service.ExcelExport;

namespace Backend.Controllers.Report;

public sealed class BorderImportPermitPendingReportController : PermitPendingReportControllerBase
{
    protected override string FormType => "Border Import Permit";

    public BorderImportPermitPendingReportController(TradeNetDbContext context,IExcelExportJobService excelExportJobs)
        : base(context,excelExportJobs) { }
}
