using API.DBContext;
using API.Service.ExcelExport;

namespace Backend.Controllers.Report;

[ExcelFormatVersion(3)]
public sealed class BorderImportLicenceTurndownReportController : LicenceTurndownReportControllerBase
{
    public BorderImportLicenceTurndownReportController(TradeNetDbContext context, IExcelExportJobService excelExportJobs)
        : base(context, excelExportJobs, "Border Import Licence", "BorderImportLicenceTurndownReport") { }
}
