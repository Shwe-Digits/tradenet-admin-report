using API.DBContext;
using API.StoredProcedureToLinq;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

namespace Backend.Tests;

public sealed class ImportLicenceTurndownReportTests : IAsyncLifetime
{
    private readonly string _databaseName = "TradeNet_Turndown_Tests_" + Guid.NewGuid().ToString("N");

    private TradeNetDbContext CreateDb() => ReportTestHelper.CreateSqlServerDbContext(_databaseName);

    public async Task InitializeAsync()
    {
        await using var db = CreateDb();
        await db.Database.GetService<IRelationalDatabaseCreator>().CreateAsync();
        await db.Database.ExecuteSqlRawAsync("""
            CREATE TABLE dbo.MessageHistory (Id char(36) NOT NULL, TransactionId char(36) NOT NULL,
                FormType nvarchar(50) NOT NULL, Remark nvarchar(max) NULL, CreatedDate datetime NULL);
            CREATE TABLE dbo.PaThaKa (Id char(36) PRIMARY KEY, CompanyRegistrationNo nvarchar(50), CompanyName nvarchar(200));
            CREATE TABLE dbo.ExportImportSection (Id int PRIMARY KEY, Code nvarchar(50), Name nvarchar(200));
            CREATE TABLE dbo.Currency (Id int PRIMARY KEY, Code nvarchar(50));
            CREATE TABLE dbo.ImportLicence (Id char(36) PRIMARY KEY, ApplyType nvarchar(20), ApplicationNo nvarchar(50),
                ApplicationDate datetime, ImportLicenceNo nvarchar(50), IssuedDate datetime NULL, PaThaKaId char(36),
                ExportImportSectionId int, CommodityType nvarchar(200), Status nvarchar(100));
            SELECT TOP (0) Id, ApplyType, ApplicationNo, ApplicationDate, ImportLicenceNo,
                IssuedDate, PaThaKaId, ExportImportSectionId, CommodityType, Status INTO dbo.BorderImportLicence FROM dbo.ImportLicence;
            CREATE TABLE dbo.ImportLicenceItem (Id char(36), UniqueId int, ImportLicenceId char(36), ItemNo int,
                HSCode nvarchar(100), Description nvarchar(max), CurrencyId int, Amount decimal(18,4));
            SELECT TOP (0) Id, UniqueId, ImportLicenceId AS BorderImportLicenceId, ItemNo, HSCode, Description,
                CurrencyId, Amount INTO dbo.BorderImportLicenceItem FROM dbo.ImportLicenceItem;
            INSERT dbo.ExportImportSection VALUES (1,'2','Section Two');
            INSERT dbo.Currency VALUES (1,'USD');
            INSERT dbo.PaThaKa VALUES ('company-1','12345','Example Company');
            INSERT dbo.ImportLicence VALUES
                ('application-1','New','OIL-1','2026-09-15','LIC-1','2026-09-20','company-1',1,'Electronics','Reject'),
                ('application-2','Reissue','OIL-2','2026-09-15','',NULL,'company-1',1,'Electronics','Reject');
            INSERT dbo.BorderImportLicence VALUES
                ('application-1','Amend','BIL-1','2026-09-15','B-LIC-1','2026-09-20','company-1',1,'Border goods','Reject');
            INSERT dbo.ImportLicenceItem VALUES
                ('item-1',1,'application-1',1,'8507109900',N'First item',1,12.2500),
                ('item-2',2,'application-1',2,'8507109901',N'Second item',1,7.7500);
            INSERT dbo.BorderImportLicenceItem VALUES ('border-item',1,'application-1',1,'1234567890',N'Border item',1,50);
            INSERT dbo.MessageHistory VALUES
                ('event-1','application-1','Import Licence',N'First turndown','2026-10-01T23:59:59'),
                ('event-2','application-1','Import Licence',N'Re Open','2026-10-02T09:00:00'),
                ('event-3','application-1','Import Licence',N'Latest turndown','2026-10-03T09:00:00'),
                ('event-4','application-1','Border Import Licence',N'Border turndown','2026-10-01T10:00:00'),
                ('event-5','application-1','Import Licence',NULL,'2026-10-04T09:00:00'),
                ('event-6','application-1','Import Licence',N'   ','2026-10-05T09:00:00'),
                ('event-7','application-1','Border Import Licence',NULL,'2026-10-04T09:00:00');
            """
        );
        var root = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../.."));
        var sql = await File.ReadAllTextAsync(Path.Combine(root,
            "StoredProcedureMigrations/sp_ImportLicenceTurndownReport.sql"));
        foreach (var batch in System.Text.RegularExpressions.Regex.Split(sql, @"^GO\s*$",
                     System.Text.RegularExpressions.RegexOptions.Multiline | System.Text.RegularExpressions.RegexOptions.IgnoreCase))
        {
            if (!string.IsNullOrWhiteSpace(batch)) await db.Database.ExecuteSqlRawAsync(batch);
        }

    }

    public Task DisposeAsync() => DeleteDatabase();

    private async Task DeleteDatabase()
    {
        await using var db = CreateDb();
        await db.Database.EnsureDeletedAsync();
    }

    [Fact]
    public async Task History_excludes_missing_blank_and_reopen_remarks_and_stays_in_its_family()
    {
        await using var db = CreateDb();
        await db.Database.ExecuteSqlRawAsync("""
            DELETE dbo.MessageHistory WHERE TransactionId = 'application-1';
            INSERT dbo.MessageHistory (Id,TransactionId,FormType,Remark,CreatedDate) VALUES
            ('history-1','application-1','Import Licence',NULL,'2026-10-01T09:00:00'),
            ('history-2','application-1','Import Licence',N' Re Open ','2026-10-02T09:00:00'),
            ('history-3','application-1','Import Licence',N'Second turndown','2026-10-03T09:00:00'),
            ('history-4','application-1','Border Import Licence',N'Border only','2026-10-04T09:00:00'),
            ('history-5','application-1','Import Licence',N'First turndown','2026-09-30T09:00:00'),
            ('history-6','application-1','Import Licence',N'','2026-10-05T09:00:00'),
            ('history-7','application-1','Import Licence',N'   ','2026-10-06T09:00:00'),
            ('history-8','application-1','Import Licence',NCHAR(9)+NCHAR(13)+NCHAR(10)+NCHAR(160),'2026-10-07T09:00:00');
            """
        );

        var history = await sp_ImportLicenceTurndownReport.History(db, "Import Licence", "application-1").ToListAsync();
        Assert.Equal(2, history.Count);
        Assert.Equal("Second turndown", history[0].Remark);
        Assert.Equal(new DateTime(2026, 10, 3, 9, 0, 0), history[0].CreatedDate);
        Assert.Equal("First turndown", history[1].Remark);
        Assert.All(history, row => Assert.False(string.IsNullOrWhiteSpace(row.Remark)));
        Assert.Single(await sp_ImportLicenceTurndownReport.History(db, "Border Import Licence", "application-1").ToListAsync());
    }

    [Theory]
    [InlineData("Import Licence", "OIL-1", 2, 20)]
    [InlineData("Border Import Licence", "BIL-1", 1, 50)]
    public async Task Date_filter_selects_events_but_latest_and_count_use_full_history(
        string formType, string applicationNo, int count, decimal amount)
    {
        await using var db = CreateDb();
        var request = new ImportLicenceTurndownReportRequest
        {
            FromDate = new DateTime(2026, 10, 1), ToDate = new DateTime(2026, 10, 1),
            ExportImportSectionId = 1, CompanyRegistrationNo = "12345", CompanyName = "Example",
            IncludeTotalCount = true, PageSize = 10
        };
        var rows = await sp_ImportLicenceTurndownReport.Query(db, formType, request).ToListAsync();
        var row = Assert.Single(rows);
        Assert.Equal(applicationNo, row.ApplicationNo);
        Assert.Equal(count, row.TurndownCount);
        Assert.Equal(amount, row.Amount);
        Assert.Equal(1, row.TotalCount);
        Assert.Equal(formType == "Import Licence" ? new DateTime(2026, 10, 3, 9, 0, 0)
            : new DateTime(2026, 10, 1, 10, 0, 0), row.TurndownDate);
        request.ApplyType = "Extension";
        Assert.Empty(await sp_ImportLicenceTurndownReport.Query(db, formType, request).ToListAsync());
        request.ApplyType = "";
        request.CompanyRegistrationNo = "wrong-company";
        Assert.Empty(await sp_ImportLicenceTurndownReport.Query(db, formType, request).ToListAsync());
        request.CompanyRegistrationNo = "12345";
        request.CompanyName = "Other Company";
        Assert.Empty(await sp_ImportLicenceTurndownReport.Query(db, formType, request).ToListAsync());
        request.CompanyName = "";
        request.ExportImportSectionId = 99;
        Assert.Empty(await sp_ImportLicenceTurndownReport.Query(db, formType, request).ToListAsync());
    }

    [Fact]
    public async Task Apply_types_come_from_the_database_and_are_family_specific()
    {
        await using var db = CreateDb();
        var oversea = await sp_ImportLicenceTurndownReport.ApplyTypes(db, "Import Licence").ToListAsync();
        Assert.Contains(oversea, row => row.Value == "Reissue");
        Assert.DoesNotContain(oversea, row => row.Value == "Amend");
        Assert.Equal("Amend", Assert.Single(await sp_ImportLicenceTurndownReport.ApplyTypes(db, "Border Import Licence").ToListAsync()).Value);
    }

    [Fact]
    public async Task Fast_paging_sorting_search_and_export_use_the_same_rows()
    {
        await using var db = CreateDb();
        await db.Database.ExecuteSqlRawAsync("""
            INSERT dbo.MessageHistory VALUES
                ('paging-event','application-2','Import Licence',N'Additional turndown','2026-10-01T10:00:00');
            """
        );
        var request = new ImportLicenceTurndownReportRequest
        {
            FromDate = new DateTime(2026, 10, 1), ToDate = new DateTime(2026, 10, 1),
            PageSize = 1, SortColumn = "ApplicationNo", SortOrder = "ASC"
        };
        var fast = await sp_ImportLicenceTurndownReport.Query(db, "Import Licence", request).ToListAsync();
        Assert.Equal(2, fast.Count); // pageSize + 1 tells the pager there is another page.
        Assert.Equal("OIL-1", fast[0].ApplicationNo);
        request.IncludeTotalCount = true;
        request.PageIndex = 1;
        var exact = Assert.Single(await sp_ImportLicenceTurndownReport.Query(db, "Import Licence", request).ToListAsync());
        Assert.Equal(2, exact.TotalCount);
        Assert.Equal("OIL-2", exact.ApplicationNo);
        Assert.Equal("Additional turndown", exact.TurndownRemark);
        var exported = await sp_ImportLicenceTurndownReport.Query(db, "Import Licence", request, export: true).ToListAsync();
        Assert.Equal(2, exported.Count);
        request.FilterColumn = "ApplicationNo";
        request.FilterQuery = "OIL-2";
        request.PageIndex = 0;
        Assert.Equal("OIL-2", Assert.Single(await sp_ImportLicenceTurndownReport.Query(db, "Import Licence", request).ToListAsync()).ApplicationNo);
        Assert.Single(await sp_ImportLicenceTurndownReport.Query(db, "Import Licence", request, export: true).ToListAsync());
        request.SortColumn = "Id; DROP TABLE dbo.ImportLicence;--";
        Assert.Single(await sp_ImportLicenceTurndownReport.Query(db, "Import Licence", request).ToListAsync());
    }

    [Theory]
    [InlineData("Import Licence", "Approved")]
    [InlineData("Border Import Licence", "Approved")]
    [InlineData("Import Licence", "Pending")]
    [InlineData("Border Import Licence", "Payment Ready")]
    public async Task Non_rejected_applications_are_excluded_from_grid_history_and_export(string formType, string status)
    {
        await using var db = CreateDb();
        var table = formType == "Import Licence" ? "ImportLicence" : "BorderImportLicence";
        await db.Database.ExecuteSqlRawAsync($"UPDATE dbo.[{table}] SET Status = {{0}} WHERE Id = 'application-1'", status);
        var request = new ImportLicenceTurndownReportRequest
        {
            FromDate = new DateTime(2026, 10, 1), ToDate = new DateTime(2026, 10, 1), IncludeTotalCount = true
        };
        Assert.Empty(await sp_ImportLicenceTurndownReport.Query(db, formType, request).ToListAsync());
        Assert.Empty(await sp_ImportLicenceTurndownReport.Query(db, formType, request, export: true).ToListAsync());
        Assert.Empty(await sp_ImportLicenceTurndownReport.History(db, formType, "application-1").ToListAsync());
    }

    [Theory]
    [InlineData("Import Licence")]
    [InlineData("Border Import Licence")]
    public async Task Invalid_events_inside_date_range_do_not_select_an_application(string formType)
    {
        await using var db = CreateDb();
        await db.Database.ExecuteSqlRawAsync("""
            DELETE dbo.MessageHistory;
            INSERT dbo.MessageHistory VALUES
                ('valid-old','application-1',{0},N'Older valid rejection','2026-09-30T09:00:00'),
                ('null-event','application-1',{0},NULL,'2026-10-01T09:00:00'),
                ('empty-event','application-1',{0},N'','2026-10-01T10:00:00'),
                ('spaces-event','application-1',{0},N'   ','2026-10-01T11:00:00'),
                ('whitespace-event','application-1',{0},NCHAR(9)+NCHAR(10)+NCHAR(13)+NCHAR(160),'2026-10-01T12:00:00'),
                ('reopen-event','application-1',{0},N' Re Open ','2026-10-01T13:00:00');
            """, formType);
        var request = new ImportLicenceTurndownReportRequest
        {
            FromDate = new DateTime(2026, 10, 1), ToDate = new DateTime(2026, 10, 1), IncludeTotalCount = true
        };
        Assert.Empty(await sp_ImportLicenceTurndownReport.Query(db, formType, request).ToListAsync());
        Assert.Empty(await sp_ImportLicenceTurndownReport.Query(db, formType, request, export: true).ToListAsync());
        Assert.Equal("Older valid rejection", Assert.Single(await sp_ImportLicenceTurndownReport.History(db, formType, "application-1").ToListAsync()).Remark);
    }
}
