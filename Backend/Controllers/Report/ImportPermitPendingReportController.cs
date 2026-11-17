using API.DBContext;
using API.Service.ExcelExport;

namespace Backend.Controllers.Report;

public sealed class ImportPermitPendingReportController : PermitPendingReportControllerBase
{
    protected override string FormType => "Import Permit";

    public ImportPermitPendingReportController(TradeNetDbContext context,IExcelExportJobService excelExportJobs)
        : base(context,excelExportJobs) { }
}
