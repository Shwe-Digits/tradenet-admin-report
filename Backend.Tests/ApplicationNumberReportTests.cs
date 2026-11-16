using System.Text.RegularExpressions;
using API.DBContext;
using API.Model;
using API.Service.ExcelExport;
using API.Service.Reports;
using API.Model.TradeNet;
using API.StoredProcedureToLinq;
using Backend.Controllers.Report;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

namespace Backend.Tests;

public sealed class ApplicationNumberReportTests : IAsyncLifetime
{
    private readonly string _database="TradeNet_ApplicationNumbers_"+Guid.NewGuid().ToString("N");
    private TradeNetDbContext Db()=>ReportTestHelper.CreateSqlServerDbContext(_database);
    public async Task InitializeAsync()
    {
        await using var db=Db();
        await db.Database.GetService<IRelationalDatabaseCreator>().CreateAsync();
        await db.Database.ExecuteSqlRawAsync("""
            CREATE TABLE dbo.ImportLicence(Id varchar(36) PRIMARY KEY,ApplicationNo nvarchar(50));
            CREATE TABLE dbo.BorderImportLicence(Id varchar(36) PRIMARY KEY,ApplicationNo nvarchar(50));
            CREATE TABLE dbo.MPUPaymentTransaction(Id int PRIMARY KEY,TransactionId varchar(36),Sakhan nvarchar(200),
                PaThaKaNo nvarchar(50),ApplyType nvarchar(50),FormType nvarchar(50),ApplicationNo nvarchar(50),
                InvoiceNo nvarchar(50),MOCAmount nvarchar(50),IMAmount nvarchar(50),TransactionAmount nvarchar(50),
                MerchantId nvarchar(50),ResponseCode nvarchar(50),AccountNo nvarchar(50),TransactionRefNo nvarchar(50),
                ApprovalCode nvarchar(50),TransactionDateTime datetime,Status nvarchar(50),FailReason nvarchar(200),
                MemberId varchar(36),PaymentType nvarchar(50));
            INSERT dbo.ImportLicence VALUES ('oversea','OIL-001');
            INSERT dbo.BorderImportLicence VALUES ('border','BIL-001');
            INSERT dbo.MPUPaymentTransaction(Id,TransactionId,FormType,ApplicationNo,ResponseCode,Status,TransactionDateTime,TransactionAmount,PaymentType)
            VALUES (1,'oversea','Import Licence','','00','AP','2025-11-15T23:00:00','1120000','MPU'),
                (2,'border','Border Import Licence',NULL,'00','AP','2025-11-16T23:00:00','1120000','MPU'),
                (3,'oversea','Import Licence','EXISTING','00','AP','2025-11-16T12:00:00','1','MPU'),
                (4,'oversea','Import Licence',NULL,'05','AP','2025-11-16T12:00:00','1','MPU'),
                (5,'border','Border Import Licence',NULL,'00','PA','2025-11-16T12:00:00','1','MPU'),
                (6,'unmatched','Export Licence',NULL,'00','AP','2025-11-16T12:00:00','1','MPU'),
                (7,'oversea','Import Licence',NULL,'00','AP','2025-11-16T23:00:01','1','MPU'),
                (8,'oversea','Import Licence',NULL,'00','AP','2025-11-15T22:59:59','1','MPU'),
                (9,'oversea','Import Licence',NULL,'00','AP','2025-11-16T12:00:00','1120000','MPU');
            """);
        var dir=new DirectoryInfo(AppContext.BaseDirectory);
        while(dir!=null && !Directory.Exists(Path.Combine(dir.FullName,"StoredProcedureMigrations")))dir=dir.Parent;
        var sql=File.ReadAllText(Path.Combine(dir!.FullName,"StoredProcedureMigrations","sp_ApplicationNumberReport_pagination.sql"));
        foreach(var batch in Regex.Split(sql,@"^\s*GO\s*$",RegexOptions.Multiline|RegexOptions.IgnoreCase))
            if(!string.IsNullOrWhiteSpace(batch))await db.Database.ExecuteSqlRawAsync(batch);
    }
    public async Task DisposeAsync(){await using var db=Db();await db.Database.EnsureDeletedAsync();}
    private static ApplicationNumberReportRequest Request(string form="")=>new(){
        FromDate=new(2025,11,15,23,0,0),ToDate=new(2025,11,16,23,0,0),FormType=form,IncludeTotalCount=true,PageSize=10
    };
    private static ApplicationNumberReportController Controller(TradeNetDbContext db)=>(ApplicationNumberReportController)
        ReportTestHelper.CreateController(typeof(ApplicationNumberReportController),db);
    private static async Task<ApiResult<ApplicationNumberReportResult>> Page(ApplicationNumberReportController controller,ApplicationNumberReportRequest request)
        =>Assert.IsType<ApiResult<ApplicationNumberReportResult>>(Assert.IsType<OkObjectResult>((await controller.Post(request)).Result).Value);

    [Fact]
    public async Task Exact_mail_conditions_recover_missing_numbers_without_changing_payments()
    {
        await using var db=Db();var controller=Controller(db);var page=await Page(controller,Request());
        Assert.Equal(new[]{1,9,2},page.Data.Select(row=>row.Id));Assert.Equal(3,page.TotalCount);
        Assert.Equal(new[]{"OIL-001","OIL-001","BIL-001"},page.Data.Select(row=>row.ApplicationNo));
        Assert.Equal("",page.Data[0].MPUApplicationNo);Assert.Null(page.Data[2].MPUApplicationNo);
        Assert.All(page.Data,row=>Assert.Equal("1120000",row.TransactionAmount));
        Assert.Null(page.ColumnTotals);
        var unchanged=await db.Database.SqlQueryRaw<string>("SELECT COALESCE(ApplicationNo,'NULL') AS Value FROM dbo.MPUPaymentTransaction WHERE Id=3").SingleAsync();
        Assert.Equal("EXISTING",unchanged);
        var sink=new Sink();await controller.WriteRowsAsync(Request(),sink,1,CancellationToken.None);
        Assert.Equal(page.Data.Select(row=>row.Id),sink.Rows.Select(row=>row.Id));
    }
    [Theory]
    [InlineData("Import Licence",2)]
    [InlineData("Border Import Licence",1)]
    public async Task Application_type_filter_and_paging_are_consistent(string form,int expected)
    {
        await using var db=Db();var controller=Controller(db);
        var request=Request(form);request.PageSize=1;
        var first=await Page(controller,request);Assert.Single(first.Data);Assert.Equal(expected,first.TotalCount);
        request.IncludeTotalCount=false;
        Assert.Equal(expected>1,(await Page(controller,request)).HasNextPage);
        request=Request();request.PageSize=1;request.PageIndex=1;
        Assert.Equal(9,Assert.Single((await Page(controller,request)).Data).Id);
        request.SortColumn="Id]; DROP TABLE ImportLicence;--";
        Assert.Single((await Page(controller,request)).Data);
    }
    [Fact]
    public async Task Invalid_requests_are_rejected_and_empty_results_are_valid()
    {
        await using var db=Db();var controller=Controller(db);
        Assert.IsType<BadRequestObjectResult>((await controller.Post(null)).Result);
        Assert.IsType<BadRequestObjectResult>((await controller.Post(Request("Export Licence"))).Result);
        var request=Request();request.ToDate=request.FromDate.AddSeconds(-1);
        Assert.IsType<BadRequestObjectResult>((await controller.Post(request)).Result);
        request=Request();request.FromDate=request.ToDate.AddDays(1);request.ToDate=request.FromDate;
        Assert.Empty((await Page(controller,request)).Data);
    }
    [Fact]
    public void Payment_users_inherit_access_without_import_licence_permissions()
    {
        Assert.Equal("report-payment",ReportAccessPolicy.CategoryForController("ApplicationNumberReport"));
        Assert.True(ReportAccessPolicy.Create("Account User",Array.Empty<UserDetail>()).CanAccess("ApplicationNumberReport"));
        Assert.False(ReportAccessPolicy.Create("Report",new[]{new UserDetail{Type="Import Licence",SubType="Oversea"}}).CanAccess("ApplicationNumberReport"));
    }
    private sealed class Sink:IExcelRowSink
    {
        public List<ApplicationNumberReportResult> Rows{get;}=new();
        public void Append<T>(IReadOnlyList<T> rows)=>Rows.AddRange(rows.Cast<ApplicationNumberReportResult>());
    }
}
