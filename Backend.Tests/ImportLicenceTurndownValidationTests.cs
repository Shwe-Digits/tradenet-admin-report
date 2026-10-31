using API.StoredProcedureToLinq;
using API.Service.ExcelExport;
using Backend.Controllers.Report;
using Microsoft.AspNetCore.Mvc;
using System.Reflection;

namespace Backend.Tests;

public sealed class ImportLicenceTurndownValidationTests
{
    [Theory]
    [InlineData(typeof(ImportLicenceTurndownReportController))]
    [InlineData(typeof(BorderImportLicenceTurndownReportController))]
    public void Corrected_reports_do_not_reuse_cached_exports_with_the_old_row_rules(Type controllerType)
    {
        var version = controllerType.GetCustomAttribute<ExcelFormatVersionAttribute>()?.Version ?? 1;
        Assert.True(version > 1, "Changing row eligibility must invalidate old cached Excel exports.");
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task Grid_and_excel_reject_invalid_dates_before_querying_or_queuing(bool border)
    {
        using var db = ReportTestHelper.CreateInMemoryDbContext(Guid.NewGuid().ToString());
        LicenceTurndownReportControllerBase controller = border
            ? new BorderImportLicenceTurndownReportController(db, null!)
            : new ImportLicenceTurndownReportController(db, null!);
        var invalid = new ImportLicenceTurndownReportRequest
        {
            FromDate = new DateTime(2026, 10, 2), ToDate = new DateTime(2026, 10, 1)
        };
        Assert.IsType<BadRequestObjectResult>((await controller.Post(null)).Result);
        Assert.IsType<BadRequestObjectResult>((await controller.Post(invalid)).Result);
        Assert.IsType<BadRequestObjectResult>(await controller.Excel(invalid));
        Assert.IsType<BadRequestObjectResult>((await controller.History("invalid-id")).Result);
        invalid.FromDate = new DateTime(1600, 1, 1);
        Assert.IsType<BadRequestObjectResult>((await controller.Post(invalid)).Result);
    }
}
