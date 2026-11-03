using API.Model.ExcelExport;
using API.Model.TradeNet;
using API.Service.Reports;
using Backend.Controllers;

namespace Backend.Tests;

public class ExcelExportAccessTests
{
    [Theory]
    [InlineData("ImportLicencePendingReport")]
    [InlineData("BorderImportLicencePendingReport")]
    [InlineData("MPUReport")]
    [InlineData("OGARecommendationHistoryReport")]
    public void Ict_report_user_can_export_all_reports_but_only_access_their_own_jobs(string reportKey)
    {
        var access = ReportAccessPolicy.Create("ICT Report", Array.Empty<UserDetail>());
        var job = new ExcelExportJob { RequestedByUserName = "42", ReportKey = reportKey };

        Assert.True(ExcelExportController.CanAccessJob(access, "42", job));
        Assert.False(ExcelExportController.CanAccessJob(access, "43", job));
    }

    [Fact]
    public void Non_admin_can_access_only_owned_jobs_for_assigned_reports()
    {
        var access = ReportAccessPolicy.Create("Report", new[]
        {
            new UserDetail { Type = "Import Licence", SubType = "Border", Section = "1" },
        });
        var job = new ExcelExportJob
        {
            RequestedByUserName = "42", ReportKey = "BorderImportLicencePendingReport",
        };

        Assert.True(ExcelExportController.CanAccessJob(access, "42", job));
        Assert.False(ExcelExportController.CanAccessJob(access, "43", job));
        job.ReportKey = "ImportLicencePendingReport";
        Assert.False(ExcelExportController.CanAccessJob(access, "42", job));
    }

    [Fact]
    public void Admin_can_access_every_job()
    {
        var access = ReportAccessPolicy.Create("Super Administrator", Array.Empty<UserDetail>());
        var job = new ExcelExportJob { RequestedByUserName = "42", ReportKey = "ImportLicencePendingReport" };
        Assert.True(ExcelExportController.CanAccessJob(access, "43", job));
    }

    [Fact]
    public void Report_user_can_access_only_their_oga_recommendation_exports_without_assignment()
    {
        var access = ReportAccessPolicy.Create("Report", Array.Empty<UserDetail>());
        var job = new ExcelExportJob
        {
            RequestedByUserName = "42", ReportKey = "OGARecommendationHistoryReport",
        };

        Assert.True(ExcelExportController.CanAccessJob(access, "42", job));
        Assert.False(ExcelExportController.CanAccessJob(access, "43", job));
        job.ReportKey = "ImportLicencePendingReport";
        Assert.False(ExcelExportController.CanAccessJob(access, "42", job));
    }
}
