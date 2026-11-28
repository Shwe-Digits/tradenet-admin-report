using API.StoredProcedureToLinq;
using Microsoft.EntityFrameworkCore;

namespace Backend.Tests;

public sealed class PendingReportLicenceDateTests
{
    [Fact]
    public void Stored_procedure_row_mapping_preserves_licence_date()
    {
        var licenceDate = new DateTime(2026, 9, 30, 10, 6, 0);
        var row = new sp_PendingReportRow();
        var rowProperty = typeof(sp_PendingReportRow).GetProperty("LicenceDate");
        var resultProperty = typeof(sp_PendingReportResult).GetProperty("LicenceDate");

        Assert.NotNull(rowProperty);
        Assert.NotNull(resultProperty);

        rowProperty.SetValue(row, licenceDate);

        Assert.Equal(licenceDate, resultProperty.GetValue(row.ToResult()));
    }

    [Theory]
    [InlineData("Import Licence")]
    [InlineData("Export Licence")]
    [InlineData("Border Import Licence")]
    public void Pending_linq_branches_source_licence_date_from_issued_date(string formType)
    {
        using var db = ReportTestHelper.CreateSqlServerDbContext();
        var sql = sp_PendingReport.Query(db, new sp_PendingReportRequest
        {
            FormType = formType,
            FromDate = new DateTime(2026, 1, 1),
            ToDate = new DateTime(2026, 1, 31, 23, 59, 59),
        }).ToQueryString();

        Assert.Contains("IssuedDate", sql, StringComparison.Ordinal);
    }

    [Fact]
    public void Pending_pagination_procedure_returns_licence_date_for_both_menu_reports()
    {
        var script = File.ReadAllText(Path.Combine(
            RepositoryRoot,
            "StoredProcedureMigrations",
            "sp_PendingReport_pagination.sql"));
        var deploymentScript = File.ReadAllText(Path.Combine(
            RepositoryRoot,
            "StoredProcedureMigrations",
            "Deployments",
            "Done For Fix",
            "2026-10-02_PendingReportsLicenceDate",
            "01_sp_PendingReport_pagination.sql"));

        Assert.Equal(1, CountExactLines(script, "ImportLicence.IssuedDate LicenceDate,"));
        Assert.Equal(1, CountExactLines(script, "BorderImportLicence.IssuedDate LicenceDate,"));
        Assert.Equal(1, CountExactLines(deploymentScript, "ImportLicence.IssuedDate LicenceDate,"));
        Assert.Equal(1, CountExactLines(deploymentScript, "BorderImportLicence.IssuedDate LicenceDate,"));
    }

    [Theory]
    [InlineData("ImportLicencePendingReportController.cs")]
    [InlineData("BorderImportLicencePendingReportController.cs")]
    public void Changed_pending_exports_invalidate_the_previous_excel_layout(string controllerFile)
    {
        var source = File.ReadAllText(Path.Combine(
            RepositoryRoot,
            "Backend",
            "Controllers",
            "Report",
            controllerFile));

        Assert.Contains("[ExcelFormatVersion(3)]", source, StringComparison.Ordinal);
    }

    private static int CountExactLines(string value, string expectedLine) =>
        value.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
            .Count(line => string.Equals(line.Trim(), expectedLine, StringComparison.Ordinal));

    private static string RepositoryRoot
    {
        get
        {
            var directory = new DirectoryInfo(AppContext.BaseDirectory);
            while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Backend", "API.csproj")))
            {
                directory = directory.Parent;
            }

            return directory?.FullName
                ?? throw new DirectoryNotFoundException("Could not locate the repository root.");
        }
    }
}
