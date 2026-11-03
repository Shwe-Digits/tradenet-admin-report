using API.Model.TradeNet;
using API.Service.Reports;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using System.Reflection;
using System.Security.Claims;

namespace Backend.Tests;

public class ReportAccessPolicyTests
{
    [Theory]
    [InlineData("ImportLicencePendingReport", true)]
    [InlineData("BorderImportLicencePendingReport", true)]
    [InlineData("DataImport", false)]
    public async Task Ict_access_is_enforced_by_the_report_authorization_filter(string controller, bool allowed)
    {
        using var db = ReportTestHelper.CreateInMemoryDbContext(Guid.NewGuid().ToString());
        db.Users.Add(new User
        {
            Id = 42, UserType = "ICT Report", UserName = "ict", FullName = "ICT Test",
            Password = "test-only", Position = "ICT", IsActive = true,
        });
        await db.SaveChangesAsync();
        var principal = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Name, "42"), new Claim(ClaimTypes.Role, "User"),
        }, "Test"));
        var descriptor = new ControllerActionDescriptor
        {
            ControllerName = controller,
            ControllerTypeInfo = ReportTestHelper.ControllerTypes
                .Single(type => type.Name == controller + "Controller").GetTypeInfo(),
        };
        var context = new AuthorizationFilterContext(new ActionContext(
            new DefaultHttpContext { User = principal }, new RouteData(), descriptor),
            Array.Empty<IFilterMetadata>());

        await new ReportAccessFilter(new ReportAccessService(db)).OnAuthorizationAsync(context);

        if (allowed) Assert.Null(context.Result);
        else Assert.IsType<ForbidResult>(context.Result);
    }

    [Theory]
    [InlineData("ICT Report")]
    [InlineData("ict report")]
    public void Ict_report_user_can_access_every_report_without_admin_privileges(string userType)
    {
        var access = ReportAccessPolicy.Create(userType, Array.Empty<UserDetail>());
        var reports = ReportTestHelper.ControllerTypes
            .Select(type => type.Name.Replace("Controller", "", StringComparison.Ordinal))
            .Where(name => !name.EndsWith("DataImport", StringComparison.Ordinal));

        Assert.False(access.IsAdmin);
        foreach (var report in reports)
        {
            Assert.True(access.CanAccess(report), $"ICT must be able to read {report}.");
            Assert.Contains(ReportAccessPolicy.CategoryForController(report), access.Categories);
        }
        Assert.True(access.CanAccess("AdvanceSearchImportLicence"));
        Assert.True(access.CanAccess("AdvanceSearchBorderImportLicence"));
        Assert.False(access.CanAccess("DataImport"));
        Assert.False(access.CanAccess("UnknownNewReport"));
    }

    [Fact]
    public void Report_user_sees_only_assigned_type_and_subtype()
    {
        var access = ReportAccessPolicy.Create("Report", new[]
        {
            new UserDetail { Type = "Import Licence", SubType = "Border", Section = "1,2" },
            new UserDetail { Type = "Registration", SubType = "Pa Tha Ka", Section = "" },
        });

        Assert.True(access.CanAccess("BorderImportLicencePendingReport"));
        Assert.True(access.CanAccess("AdvanceSearchBorderImportLicence"));
        Assert.True(access.CanAccess("CompanyProfile"));
        Assert.False(access.CanAccess("ImportLicencePendingReport"));
        Assert.False(access.CanAccess("AdvanceSearchImportLicence"));
        Assert.False(access.CanAccess("ImportPermitDetailReport"));
        Assert.False(access.CanAccess("MPUReport"));
    }

    [Fact]
    public void Report_user_can_access_both_oga_recommendation_reports_without_assignment()
    {
        var access = ReportAccessPolicy.Create("Report", Array.Empty<UserDetail>());

        Assert.Contains("report-oga-recommendation", access.Categories);
        Assert.True(access.CanAccess("OGARecommendationReport"));
        Assert.True(access.CanAccess("OGARecommendationHistoryReport"));
        Assert.False(access.CanAccess("OGARecommendationAdministrationReport"));
        Assert.False(access.CanAccess("ImportLicenceDetailReport"));
        Assert.False(access.CanAccess("DataImport"));
    }

    [Fact]
    public void Check_and_approve_users_follow_the_same_assignments()
    {
        var assignment = new[] { new UserDetail { Type = "Export Permit", SubType = "Oversea", Section = "1" } };

        foreach (var userType in new[] { "Check User", "Approve User" })
        {
            var access = ReportAccessPolicy.Create(userType, assignment);
            Assert.True(access.CanAccess("ExportPermitDetailReport"));
            Assert.False(access.CanAccess("BorderExportPermitDetailReport"));
            Assert.False(access.CanAccess("OGARecommendationReport"));
            Assert.False(access.CanAccess("OGARecommendationHistoryReport"));
        }
    }

    [Fact]
    public void Admin_sees_all_and_account_user_sees_payment_only()
    {
        var admin = ReportAccessPolicy.Create("Super Administrator", Array.Empty<UserDetail>());
        var account = ReportAccessPolicy.Create("Account User", Array.Empty<UserDetail>());

        Assert.True(admin.IsAdmin);
        Assert.True(admin.CanAccess("MemberRegistrationReport"));
        Assert.True(admin.CanAccess("DataImport"));
        Assert.True(account.CanAccess("MPUReport"));
        Assert.False(account.CanAccess("ImportLicenceDetailReport"));
        Assert.False(account.CanAccess("OGARecommendationReport"));
    }

    [Fact]
    public void Unassigned_and_unknown_roles_fail_closed()
    {
        Assert.Equal(new[] { "report-oga-recommendation" },
            ReportAccessPolicy.Create("Report", Array.Empty<UserDetail>()).Categories);
        Assert.False(ReportAccessPolicy.Create("Report", Array.Empty<UserDetail>()).CanAccess("ImportLicenceDetailReport"));
        Assert.False(ReportAccessPolicy.Create("Sakhan User", new[]
        {
            new UserDetail { Type = "Import Licence", SubType = "Border", Section = "1" },
        }).CanAccess("BorderImportLicenceDetailReport"));
        Assert.False(ReportAccessPolicy.Create("Report", Array.Empty<UserDetail>()).CanAccess("UnknownNewReport"));
    }

    [Fact]
    public void Every_report_controller_has_an_explicit_category_or_is_data_import()
    {
        var unmapped = ReportTestHelper.ControllerTypes
            .Select(type => type.Name.Replace("Controller", "", StringComparison.Ordinal))
            .Where(name => name != "DataImport" && ReportAccessPolicy.CategoryForController(name) == null)
            .ToArray();

        Assert.Empty(unmapped);
    }
}
