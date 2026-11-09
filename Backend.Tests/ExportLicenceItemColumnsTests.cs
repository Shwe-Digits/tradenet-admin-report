using System.Collections;
using System.Reflection;
using API.DBContext;
using API.Service.ExcelExport;
using Backend.Controllers.Report;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

namespace Backend.Tests;

public sealed class ExportLicenceItemColumnsTests : IAsyncLifetime
{
    private readonly string _database = "TradeNet_ExportItems_Tests_" + Guid.NewGuid().ToString("N");
    private TradeNetDbContext CreateDb() => ReportTestHelper.CreateSqlServerDbContext(_database);
    private static string Root => FindRoot();
    private static string FindRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir != null && !Directory.Exists(Path.Combine(dir.FullName, "StoredProcedureMigrations"))) dir = dir.Parent;
        return dir!.FullName;
    }

    public async Task InitializeAsync()
    {
        await using var db = CreateDb();
        await db.Database.GetService<IRelationalDatabaseCreator>().CreateAsync();
        await db.Database.ExecuteSqlRawAsync("""
            CREATE TABLE dbo.PaThaKa (Id char(36) PRIMARY KEY, CompanyRegistrationNo nvarchar(50), CompanyName nvarchar(200),
                UnitLevel nvarchar(50), StreetNumberStreetName nvarchar(100), QuarterCityTownship nvarchar(100),
                State nvarchar(100), Country nvarchar(100), PostalCode nvarchar(50));
            CREATE TABLE dbo.ExportImportSection (Id int PRIMARY KEY, Code nvarchar(50), Name nvarchar(200));
            CREATE TABLE dbo.Currency (Id int PRIMARY KEY, Code nvarchar(50));
            CREATE TABLE dbo.HSCode (Id int PRIMARY KEY, Code nvarchar(100));
            CREATE TABLE dbo.ExportLicence (Id char(36) PRIMARY KEY, ApplyType nvarchar(20), Status nvarchar(50), CreatedDate datetime,
                PaThaKaId char(36), ExportImportSectionId int, AmendRemarkId int, OldExportLicenceNo nvarchar(50),
                ExportLicenceNo nvarchar(50), Remark nvarchar(200), auto nvarchar(50));
            CREATE TABLE dbo.ExportLicenceItem (Id char(36), UniqueId int, ExportLicenceId char(36), HSCodeId int,
                CurrencyId int, Description nvarchar(max), Quantity decimal(18,4), Amount decimal(18,4),
                PRIMARY KEY (Id,UniqueId));
            INSERT dbo.PaThaKa VALUES ('company','12345','Example Company','','Road','Town','State','Myanmar','');
            INSERT dbo.ExportImportSection VALUES (1,'2','Section Two');
            INSERT dbo.Currency VALUES (1,'USD'),(2,'CNY');
            INSERT dbo.HSCode VALUES (1,'0101210000'),(2,'9999999999');
            INSERT dbo.ExportLicence VALUES
                ('amend','Amend','Approved','2026-10-07','company',1,1,'OLD-1','AMEND-1','Amend remark','Auto'),
                ('actual','Actual Amend','Approved','2026-10-07','company',1,1,'OLD-2','ACTUAL-1','Actual remark','Auto'),
                ('cancel','Cancel','Approved','2026-10-07','company',1,1,'OLD-3','CANCEL-1','Cancel remark','Auto');
            INSERT dbo.ExportLicenceItem
                SELECT 'a-'+Id,1,Id,1,1,N'ကုန်ပစ္စည်း & description',12.3456,20 FROM dbo.ExportLicence;
            INSERT dbo.ExportLicenceItem
                SELECT 'z-'+Id,2,Id,2,2,N'Second item',99,999 FROM dbo.ExportLicence;
            SELECT Id,ApplyType,Status,CreatedDate,PaThaKaId,ExportImportSectionId,AmendRemarkId,
                OldExportLicenceNo AS OldImportPermitNo,ExportLicenceNo AS ImportPermitNo,Remark
                INTO dbo.ImportPermit FROM dbo.ExportLicence;
            SELECT Id,UniqueId,ExportLicenceId AS ImportPermitId,HSCodeId,CurrencyId,Description,Quantity,Amount
                INTO dbo.ImportPermitItem FROM dbo.ExportLicenceItem;
            """);
        foreach (var name in new[] { "sp_AmendReport_pagination", "sp_ActualAmendReport_pagination", "sp_CancelReport_pagination", "sp_ExportLicenceListingCurrencyTotals" })
            await db.Database.ExecuteSqlRawAsync(File.ReadAllText(Path.Combine(Root, "StoredProcedureMigrations", name + ".sql")));
    }

    public async Task DisposeAsync()
    {
        await using var db = CreateDb();
        await db.Database.EnsureDeletedAsync();
    }

    [Theory]
    [InlineData(typeof(ExportLicenceAmendmentReportController), true)]
    [InlineData(typeof(ExportLicenceActualAmendmentReportController), true)]
    [InlineData(typeof(ExportLicenceCancellationReportController), true)]
    [InlineData(typeof(ExportLicenceAmendmentReportController), false)]
    [InlineData(typeof(ExportLicenceActualAmendmentReportController), false)]
    [InlineData(typeof(ExportLicenceCancellationReportController), false)]
    public async Task Grid_and_streamed_export_include_item_columns_without_multiplying_licences(Type type, bool hasItems)
    {
        await using var db = CreateDb();
        if (!hasItems) await db.Database.ExecuteSqlRawAsync("DELETE dbo.ExportLicenceItem;");
        var controller = ReportTestHelper.CreateController(type, db);
        var request = ReportTestHelper.CreateRequest(type);
        request.GetType().GetProperty("FromDate")!.SetValue(request, new DateTime(2026,10,1));
        request.GetType().GetProperty("ToDate")!.SetValue(request, new DateTime(2026,10,31));
        request.GetType().GetProperty("IncludeTotalCount")!.SetValue(request, true);
        var task = (Task)type.GetMethod("Post")!.Invoke(controller, new[] {request})!;
        await task;
        var result = ReportTestHelper.GetTaskResult(task)!;
        var api = Assert.IsType<OkObjectResult>(result.GetType().GetProperty("Result")!.GetValue(result)).Value!;
        var row = Assert.Single(((IEnumerable)api.GetType().GetProperty("Data")!.GetValue(api)!).Cast<object>());
        Assert.Equal(1, api.GetType().GetProperty("TotalCount")!.GetValue(api));
        Assert.Equal(hasItems ? "0101210000" : null, Value(row,"HSCode"));
        Assert.Equal(hasItems ? "ကုန်ပစ္စည်း & description" : null, Value(row,"Description"));
        Assert.Equal(hasItems ? 12.3456m : (decimal?)null, Value(row,"Quantity"));
        Assert.Equal(hasItems ? 20m : (decimal?)null, Value(row,"Amount"));
        var sink = new CaptureSink();
        await ((IStreamingExcelReport)controller).WriteRowsAsync(request,sink,1,CancellationToken.None);
        var exported = Assert.Single(sink.Rows);
        Assert.Equal(Value(row,"Description"),Value(exported,"Description"));
        Assert.Equal(Value(row,"Quantity"),Value(exported,"Quantity"));
    }

    [Theory]
    [InlineData("Amend")]
    [InlineData("Actual Amend")]
    [InlineData("Cancel")]
    public async Task Shared_procedures_keep_other_report_families_compatible(string action)
    {
        await using var db = CreateDb();
        var from = new DateTime(2026,10,1);
        var to = new DateTime(2026,10,31);
        object row = action switch
        {
            "Amend" => Assert.Single(await API.StoredProcedureToLinq.sp_AmendReport.ExecuteAsync(db,
                new() { FormType="Import Permit",FromDate=from,ToDate=to })).ToResult(),
            "Actual Amend" => Assert.Single(await API.StoredProcedureToLinq.sp_ActualAmendReport.ExecuteAsync(db,
                new() { FormType="Import Permit",FromDate=from,ToDate=to })).ToResult(),
            _ => Assert.Single(await API.StoredProcedureToLinq.sp_CancelReport.ExecuteAsync(db,
                new() { FormType="Import Permit",FromDate=from,ToDate=to })).ToResult(),
        };
        Assert.Null(Value(row,"Description"));
        Assert.Null(Value(row,"Quantity"));
        Assert.Equal(20m,Value(row,"Amount"));
        var json = System.Text.Json.JsonSerializer.Serialize(row, row.GetType());
        Assert.DoesNotContain("\"Description\"",json);
        Assert.DoesNotContain("\"Quantity\"",json);
    }

    [Theory]
    [InlineData(typeof(ExportLicenceAmendmentReportController))]
    [InlineData(typeof(ExportLicenceActualAmendmentReportController))]
    [InlineData(typeof(ExportLicenceCancellationReportController))]
    public void New_columns_invalidate_old_cached_excel_files(Type type)
        => Assert.True((type.GetCustomAttribute<ExcelFormatVersionAttribute>()?.Version ?? 1) > 2);

    private static object? Value(object row,string name)
    {
        var property = row.GetType().GetProperty(name);
        Assert.NotNull(property);
        return property.GetValue(row);
    }
    private sealed class CaptureSink : IExcelRowSink
    {
        public List<object> Rows {get;} = new();
        public void Append<T>(IReadOnlyList<T> rows) => Rows.AddRange(rows.Cast<object>());
    }
}
