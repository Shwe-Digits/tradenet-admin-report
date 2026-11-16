using System.Text.RegularExpressions;
using System.Globalization;
using System.Xml.Linq;
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
using Microsoft.Data.SqlClient;

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

    [Theory]
    [InlineData("ASC")]
    [InlineData("DESC")]
    public async Task Date_pages_preserve_timestamp_ties_without_reading_the_entire_history(string direction)
    {
        await using var db=Db();
        await db.Database.ExecuteSqlRawAsync("""
            CREATE INDEX IX_PaymentDate ON dbo.MPUPaymentTransaction(TransactionDateTime)
                INCLUDE(TransactionId,FormType,ApplicationNo,ResponseCode,Status);
            WITH numbers AS (
                SELECT TOP(25000) ROW_NUMBER() OVER(ORDER BY (SELECT NULL)) AS n
                FROM sys.all_objects a CROSS JOIN sys.all_objects b
            )
            INSERT dbo.MPUPaymentTransaction(Id,TransactionId,FormType,ApplicationNo,ResponseCode,Status,TransactionDateTime)
            SELECT 100+n,CASE WHEN n%5=0 THEN 'border' ELSE 'oversea' END,
                CASE WHEN n%5=0 THEN 'Border Import Licence' ELSE 'Import Licence' END,
                CASE WHEN n%2=0 THEN NULL ELSE '' END,'00','AP',DATEADD(second,n/4,'2026-11-01')
            FROM numbers;
            """);
        var expected=Enumerable.Range(1,25000);
        var ordered=direction=="ASC" ? expected.OrderBy(n=>n/4) : expected.OrderByDescending(n=>n/4);
        var expectedIds=ordered.ThenBy(n=>n).Take(11).Select(n=>n+100).ToArray();
        var connection=(SqlConnection)db.Database.GetDbConnection();
        await connection.OpenAsync();
        await using var command=connection.CreateCommand();
        command.CommandText="""
            SET STATISTICS XML ON;
            EXEC dbo.sp_ApplicationNumberReport_pagination @FromDate='2026-11-01',@ToDate='2026-12-01',
                @SortColumn=N'TransactionDateTime',@SortOrder=@direction,@PageIndex=0,@PageSize=10,@IncludeTotalCount=0;
            SET STATISTICS XML OFF;
            """;
        command.Parameters.AddWithValue("@direction",direction);
        var ids=new List<int>();
        var paymentRowsRead=0d;
        XNamespace showplan="http://schemas.microsoft.com/sqlserver/2004/07/showplan";
        await using(var reader=await command.ExecuteReaderAsync())
        {
            do
            {
                var isPlan=reader.FieldCount==1 && reader.GetName(0).Contains("Showplan",StringComparison.OrdinalIgnoreCase);
                while(await reader.ReadAsync())
                {
                    if(isPlan)
                    {
                        var plan=XDocument.Parse(reader.GetString(0));
                        foreach(var operation in plan.Descendants(showplan+"RelOp"))
                        {
                            var source=operation.Elements().SelectMany(element=>element.Elements(showplan+"Object"))
                                .FirstOrDefault();
                            if((string?)source?.Attribute("Table")!="[MPUPaymentTransaction]")continue;
                            foreach(var counters in operation.Elements(showplan+"RunTimeInformation")
                                .Elements(showplan+"RunTimeCountersPerThread"))
                                paymentRowsRead+=double.Parse((string?)counters.Attribute("ActualRowsRead")??"0",CultureInfo.InvariantCulture);
                        }
                    }
                    else if(reader.FieldCount>1)ids.Add(reader.GetInt32(reader.GetOrdinal("Id")));
                }
            }while(await reader.NextResultAsync());
        }
        Assert.Equal(expectedIds,ids);
        Assert.InRange(paymentRowsRead,1,999);
        await connection.CloseAsync();

        var request=new ApplicationNumberReportRequest { FromDate=new(2026,11,1),ToDate=new(2026,12,1),
            SortColumn="TransactionDateTime",SortOrder=direction,PageSize=10,IncludeTotalCount=false };
        var controller=Controller(db);
        var first=await Page(controller,request);
        request.PageIndex=1;
        var second=await Page(controller,request);
        Assert.Equal(ordered.ThenBy(n=>n).Take(20).Select(n=>n+100),first.Data.Concat(second.Data).Select(row=>row.Id));
        Assert.True(first.HasNextPage);
        Assert.True(second.HasNextPage);
    }
    private sealed class Sink:IExcelRowSink
    {
        public List<ApplicationNumberReportResult> Rows{get;}=new();
        public void Append<T>(IReadOnlyList<T> rows)=>Rows.AddRange(rows.Cast<ApplicationNumberReportResult>());
    }
}
