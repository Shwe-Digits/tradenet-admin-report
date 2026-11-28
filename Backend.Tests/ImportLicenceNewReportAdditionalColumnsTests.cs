using API.StoredProcedureToLinq;
using Microsoft.EntityFrameworkCore;

namespace Backend.Tests;

public sealed class ImportLicenceNewReportAdditionalColumnsTests
{
    [Fact]
    public void Result_mapping_preserves_licence_date()
    {
        var licenceDate = new DateTime(2026, 9, 30, 7, 28, 57);
        var row = new sp_NewReportRow
        {
            LicenceDate = licenceDate,
        };

        var result = row.ToResult();

        Assert.Equal(licenceDate, result.LicenceDate);
    }

    [Fact]
    public void All_application_sql_branches_source_licence_date_from_issued_date()
    {
        var script = File.ReadAllText(Path.Combine(
            RepositoryRoot,
            "StoredProcedureMigrations",
            "sp_NewReport_pagination.sql"));
        // ApplicationNo, ApplicationDate, and Remark remain typed placeholders in
        // branches that do not source them so the shared row shape stays compatible.
        Assert.Equal(9, CountOccurrences(script, "CAST(NULL AS nvarchar(50)) ApplicationNo"));
        Assert.Equal(9, CountOccurrences(script, "CAST(NULL AS datetime) ApplicationDate"));
        Assert.Equal(9, CountOccurrences(script, "CAST(NULL AS nvarchar(max)) Remark"));
        Assert.DoesNotContain("CAST(NULL AS datetime) LicenceDate", script, StringComparison.Ordinal);

        Assert.Equal(1, CountExactLines(script, "ImportLicence.IssuedDate LicenceDate,"));
        Assert.Equal(1, CountExactLines(script, "ImportPermit.IssuedDate LicenceDate,"));
        Assert.Equal(1, CountExactLines(script, "ExportLicence.IssuedDate LicenceDate,"));
        Assert.Equal(1, CountExactLines(script, "ExportPermit.IssuedDate LicenceDate,"));
        Assert.Equal(2, CountExactLines(script, "BorderImportLicence.IssuedDate LicenceDate,"));
        Assert.Equal(1, CountExactLines(script, "BorderImportPermit.IssuedDate LicenceDate,"));
        Assert.Equal(2, CountExactLines(script, "BorderExportLicence.IssuedDate LicenceDate,"));
        Assert.Equal(1, CountExactLines(script, "BorderExportPermit.IssuedDate LicenceDate,"));
    }

    [Theory]
    [InlineData("Import Licence")]
    [InlineData("Import Permit")]
    [InlineData("Export Licence")]
    [InlineData("Export Permit")]
    [InlineData("Border Import Licence")]
    [InlineData("Border Import Permit")]
    [InlineData("Border Export Licence")]
    [InlineData("Border Export Permit")]
    public void All_application_linq_branches_project_issued_date(string formType)
    {
        using var db = ReportTestHelper.CreateSqlServerDbContext();
        var sql = sp_NewReport.Query(db, new sp_NewReportRequest
        {
            FormType = formType,
            FromDate = new DateTime(2026, 1, 1),
            ToDate = new DateTime(2026, 1, 31, 23, 59, 59),
        }).ToQueryString();

        Assert.Contains("IssuedDate", sql, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("ImportLicenceNewReportNewReportController.cs", 4)]
    [InlineData("ImportPermitNewReportNewReportController.cs", 2)]
    [InlineData("ExportLicenceNewReportNewReportController.cs", 4)]
    [InlineData("ExportPermitNewReportNewReportController.cs", 3)]
    [InlineData("BorderImportLicenceNewReportNewReportController.cs", 3)]
    [InlineData("BorderImportPermitNewReportNewReportController.cs", 3)]
    [InlineData("BorderExportLicenceNewReportNewReportController.cs", 3)]
    [InlineData("BorderExportPermitNewReportNewReportController.cs", 2)]
    public void All_application_excel_versions_invalidate_older_column_layouts(
        string controllerFile,
        int expectedVersion)
    {
        var source = File.ReadAllText(Path.Combine(
            RepositoryRoot,
            "Backend",
            "Controllers",
            "Report",
            controllerFile));

        Assert.Contains($"[ExcelFormatVersion({expectedVersion})]", source, StringComparison.Ordinal);
    }

    private static int CountOccurrences(string value, string searchValue) =>
        value.Split(searchValue, StringSplitOptions.None).Length - 1;

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
