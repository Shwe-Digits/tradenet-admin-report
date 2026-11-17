using System.Text.RegularExpressions;
using API.StoredProcedureToLinq;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using API.Model;
using API.Model.TradeNet;
using API.Service.ExcelExport;
using API.Service.Reports;
using Backend.Controllers.Report;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using System.Xml.Linq;

namespace Backend.Tests;

public sealed class PermitPendingReportTests : IAsyncLifetime
{
    private readonly string _database="TradeNet_PermitPending_"+Guid.NewGuid().ToString("N");
    private API.DBContext.TradeNetDbContext Db()=>ReportTestHelper.CreateSqlServerDbContext(_database);
    public static IEnumerable<object[]> Families => new[] { "ImportPermit","ExportPermit","BorderImportPermit","BorderExportPermit" }
        .Select(name=>new object[]{name,Regex.Replace(name,"([a-z])([A-Z])","$1 $2")});

    public async Task InitializeAsync()
    {
        await using var db=Db();
        await db.Database.GetService<IRelationalDatabaseCreator>().CreateAsync();
        await db.Database.ExecuteSqlRawAsync("""
            CREATE TABLE PaThaKa(Id char(36) PRIMARY KEY,CompanyRegistrationNo nvarchar(50),CompanyName nvarchar(200));
            CREATE TABLE ExportImportSection(Id int PRIMARY KEY,Code nvarchar(50),Name nvarchar(200));
            CREATE TABLE Currency(Id int PRIMARY KEY,Code nvarchar(10));
            INSERT PaThaKa VALUES('company','100','Company A');
            INSERT ExportImportSection VALUES(1,'1','Section 1'),(2,'2','Section 2');
            INSERT Currency VALUES(1,'USD'),(2,'CNY');
            """);
        foreach(var family in Families.Select(row=>(string)row[0]))
        {
            // All identifiers below come from this fixed test-family list.
            var schema=$"""
                CREATE TABLE {family}(Id char(36) PRIMARY KEY,Status nvarchar(100),ApplyType nvarchar(20),
                    ApplicationDate datetime,IssuedDate datetime NULL,ApplicationNo nvarchar(50),PaThaKaId char(36),
                    ExportImportSectionId int,CommodityType nvarchar(250));
                CREATE TABLE {family}Item(Id char(36),UniqueId int,{family}Id char(36),ItemNo int,
                    HSCode nvarchar(100),Description nvarchar(max),CurrencyId int,Amount decimal(18,4),PRIMARY KEY(Id,UniqueId));
                CREATE INDEX IX_Items ON {family}Item({family}Id,ItemNo,Id,UniqueId) INCLUDE(HSCode,CurrencyId,Amount);
                CREATE INDEX IX_Dates ON {family}(Status,ApplicationDate,ApplicationNo,Id)
                    INCLUDE(PaThaKaId,ExportImportSectionId,ApplyType,IssuedDate,CommodityType);
                INSERT {family} VALUES
                    ('one','Pending','New','2026-11-01',NULL,'{family}-1','company',1,'Goods'),
                    ('two','Reject','Amend','2026-11-17T23:59:59',NULL,'{family}-2','company',1,'Goods'),
                    ('empty','Pending','New','2026-11-15',NULL,'{family}-3','company',2,'Goods'),
                    ('approved','Approved','New','2026-11-15',NULL,'{family}-4','company',1,'Goods'),
                    ('payment','Payment Ready','New','2026-11-15',NULL,'{family}-5','company',1,'Goods'),
                    ('before','Pending','New','2026-10-31T23:59:59',NULL,'{family}-6','company',1,'Goods'),
                    ('after','Pending','New','2026-11-18',NULL,'{family}-7','company',1,'Goods'),
                    ('orphan','Pending','New','2026-11-15',NULL,'{family}-8','missing',1,'Goods');
                INSERT {family}Item VALUES
                    ('shared',1,'one',2,'SECOND','Second item',2,20),
                    ('shared',2,'one',1,'FIRST','First item',1,10),
                    ('shared',3,'one',3,'THIRD','Third item',1,5),
                    ('reject-item',1,'two',1,'REJECT','Rejected item',1,30);
                """;
            await db.Database.ExecuteSqlRawAsync(schema);
        }
        var dir=new DirectoryInfo(AppContext.BaseDirectory);
        while(dir!=null && !Directory.Exists(Path.Combine(dir.FullName,"StoredProcedureMigrations")))dir=dir.Parent;
        var sql=File.ReadAllText(Path.Combine(dir!.FullName,"StoredProcedureMigrations","sp_PermitPendingReport_pagination.sql"));
        foreach(var batch in Regex.Split(sql,@"^\s*GO\s*$",RegexOptions.Multiline|RegexOptions.IgnoreCase))
            if(!string.IsNullOrWhiteSpace(batch))await db.Database.ExecuteSqlRawAsync(batch);
    }
    public async Task DisposeAsync(){await using var db=Db();await db.Database.EnsureDeletedAsync();}

    private async Task<List<sp_PendingReportRow>> Rows(string form,string sort="ApplicationDate",string direction="ASC",int? size=null,int page=0,bool count=true,int section=0)
    {
        await using var db=Db();
        return await db.Database.SqlQueryRaw<sp_PendingReportRow>("""
            EXEC dbo.sp_PermitPendingReport_pagination @FromDate='2026-11-01',@ToDate='2026-11-17T23:59:59',
                @FormType=@form,@ExportImportSectionId=@section,@SortColumn=@sort,@SortOrder=@direction,
                @PageIndex=@page,@PageSize=@size,@IncludeTotalCount=@count
            """,new SqlParameter("@form",form),new SqlParameter("@section",section),new SqlParameter("@sort",sort),
            new SqlParameter("@direction",direction),new SqlParameter("@page",page),new SqlParameter("@size",(object?)size??DBNull.Value),
            new SqlParameter("@count",count)).ToListAsync();
    }

    [Theory,MemberData(nameof(Families))]
    public async Task Family_status_dates_company_and_items_match_pending_report(string family,string form)
    {
        var rows=await Rows(form);
        Assert.Equal(new[]{family+"-1",family+"-3",family+"-2"},rows.Select(row=>row.ApplicationNo));
        Assert.All(rows,row=>Assert.Equal(3,row.TotalCount));
        Assert.Equal("Pending",rows[0].Status);Assert.Equal("Reject",rows[2].Status);
        Assert.Equal("USD",rows[0].Currency);Assert.Equal("FIRST",rows[0].HSCode);
        Assert.Equal("First item",rows[0].AdditionalDescription);Assert.Equal(35m,rows[0].Amount);
        Assert.Equal(0m,rows[1].Amount);Assert.Null(rows[1].HSCode);Assert.Null(rows[1].Currency);
        Assert.Equal("100",rows[0].CompanyRegistrationNo);Assert.Null(rows[0].LicenceDate);
        Assert.Equal("Section 1",rows[0].SectionName);
        Assert.Equal(2,(await Rows(form,section:1)).Count);
        Assert.Single(await Rows(form,section:2));
        Assert.Empty(await Rows(form,section:999));
    }

    [Theory,MemberData(nameof(Families))]
    public async Task Fast_pages_counts_sorts_and_exports_return_the_same_rows(string family,string form)
    {
        foreach(var sort in new[]{"ApplicationDate","Status","CompanyName","Amount","HSCode","Currency","AdditionalDescription"})
        foreach(var direction in new[]{"ASC","DESC"})
        {
            var all=await Rows(form,sort,direction);
            var first=await Rows(form,sort,direction,1,count:false);
            var second=await Rows(form,sort,direction,1,page:1,count:false);
            Assert.Equal(all.Take(2).Select(row=>row.ApplicationNo),first.Select(row=>row.ApplicationNo));
            Assert.Equal(all.Skip(1).Take(2).Select(row=>row.ApplicationNo),second.Select(row=>row.ApplicationNo));
            Assert.All(first,row=>Assert.Null(row.TotalCount));
            var exact=await Rows(form,sort,direction,1);
            Assert.Single(exact);Assert.Equal(3,exact[0].TotalCount);
        }
        Assert.Equal(new[]{family+"-3",family+"-2",family+"-1"},(await Rows(form,"Amount")).Select(row=>row.ApplicationNo));
        Assert.Equal(3,(await Rows(form,"Status]; DROP TABLE PaThaKa;--")).Count);
    }

    [Fact]
    public async Task Unknown_family_is_rejected_instead_of_reading_import_data()
    {
        await Assert.ThrowsAsync<SqlException>(()=>Rows("Import Licence"));
        await Assert.ThrowsAsync<SqlException>(()=>Rows("ImportPermit]; DROP TABLE PaThaKa;--"));
    }

    [Theory,MemberData(nameof(Families))]
    public async Task Controllers_grid_streaming_excel_validation_and_family_access_work(string family,string form)
    {
        await using var db=Db();
        var type=typeof(ImportPermitPendingReportController).Assembly.GetType("Backend.Controllers.Report."+family+"PendingReportController")!;
        var controller=(PermitPendingReportControllerBase)ReportTestHelper.CreateController(type,db);
        var request=new PermitPendingReportRequest { FromDate=new(2026,11,1),ToDate=new(2026,11,17,23,59,59),
            IncludeTotalCount=true,SortColumn="ApplicationDate",PageSize=1 };
        var page=Assert.IsType<ApiResult<sp_PendingReportResult>>(Assert.IsType<OkObjectResult>((await controller.Post(request)).Result).Value);
        Assert.Equal(3,page.TotalCount);Assert.Equal(family+"-1",Assert.Single(page.Data).ApplicationNo);
        request.IncludeTotalCount=false;
        var fast=Assert.IsType<ApiResult<sp_PendingReportResult>>(Assert.IsType<OkObjectResult>((await controller.Post(request)).Result).Value);
        Assert.Single(fast.Data);Assert.True(fast.HasNextPage);Assert.False(fast.IsTotalCountExact);
        var sink=new Sink();await controller.WriteRowsAsync(request,sink,2,CancellationToken.None);
        Assert.Equal(new[]{family+"-1",family+"-3",family+"-2"},sink.Rows.Select(row=>row.ApplicationNo));
        Assert.Equal(typeof(sp_PendingReportResult),ExcelRowTypeResolver.Resolve(type));
        Assert.IsType<OkObjectResult>(await controller.Excel(request));
        // The export worker probes footer/count metadata on a controller without HttpContext.
        controller.ControllerContext=new ControllerContext();
        request.IncludeTotalCount=true;
        var headless=Assert.IsType<ApiResult<sp_PendingReportResult>>(Assert.IsType<OkObjectResult>((await controller.Post(request)).Result).Value);
        Assert.Equal(3,headless.TotalCount);
        Assert.IsType<BadRequestObjectResult>((await controller.Post(null)).Result);
        request.ToDate=request.FromDate.AddDays(-1);
        Assert.IsType<BadRequestObjectResult>((await controller.Post(request)).Result);
        var subType=family.StartsWith("Border")?"Border":"Oversea";
        var detailType=form.Replace("Border ","");
        Assert.True(ReportAccessPolicy.Create("Report",new[]{new UserDetail { Type=detailType,SubType=subType }}).CanAccess(family+"PendingReport"));
        Assert.False(ReportAccessPolicy.Create("Account User",Array.Empty<UserDetail>()).CanAccess(family+"PendingReport"));
        Assert.False(ReportAccessPolicy.Create("Report",new[]{new UserDetail { Type="Import Licence",SubType="Oversea" }}).CanAccess(family+"PendingReport"));
    }

    [Fact]
    public async Task First_page_does_not_read_items_from_unrelated_applications()
    {
        await using var db=Db();
        await db.Database.ExecuteSqlRawAsync("""
            WITH numbers AS (SELECT TOP(20000) ROW_NUMBER() OVER(ORDER BY (SELECT NULL)) AS n
                FROM sys.all_objects a CROSS JOIN sys.all_objects b)
            INSERT ImportPermitItem(Id,UniqueId,ImportPermitId,ItemNo,HSCode,Description,CurrencyId,Amount)
            SELECT CONVERT(varchar(36),n),1,'approved',n,'UNRELATED','Unrelated item',1,100 FROM numbers;
            """);
        var connection=(SqlConnection)db.Database.GetDbConnection();await connection.OpenAsync();
        await using var command=connection.CreateCommand();
        command.CommandText="""
            SET STATISTICS XML ON;
            EXEC dbo.sp_PermitPendingReport_pagination @FromDate='2026-11-01',@ToDate='2026-11-17T23:59:59',
                @FormType=N'Import Permit',@SortColumn=N'Status',@SortOrder=N'DESC',
                @PageIndex=0,@PageSize=1,@IncludeTotalCount=0;
            SET STATISTICS XML OFF;
            """;
        var itemRowsRead=0d;var returnedRows=0;
        XNamespace ns="http://schemas.microsoft.com/sqlserver/2004/07/showplan";
        await using var reader=await command.ExecuteReaderAsync();
        do
        {
            var isPlan=reader.FieldCount==1 && reader.GetName(0).Contains("Showplan",StringComparison.OrdinalIgnoreCase);
            while(await reader.ReadAsync())
            {
                if(!isPlan){returnedRows++;continue;}
                foreach(var op in XDocument.Parse(reader.GetString(0)).Descendants(ns+"RelOp"))
                {
                    var source=op.Elements().SelectMany(element=>element.Elements(ns+"Object")).FirstOrDefault();
                    if((string?)source?.Attribute("Table")!="[ImportPermitItem]")continue;
                    foreach(var runtime in op.Elements(ns+"RunTimeInformation").Elements(ns+"RunTimeCountersPerThread"))
                        itemRowsRead+=double.Parse((string?)runtime.Attribute("ActualRowsRead")??"0",CultureInfo.InvariantCulture);
                }
            }
        }while(await reader.NextResultAsync());
        Assert.Equal(2,returnedRows);
        Assert.InRange(itemRowsRead,1,99);
    }

    private sealed class Sink : IExcelRowSink
    {
        public List<sp_PendingReportResult> Rows { get; }=new();
        public void Append<T>(IReadOnlyList<T> rows)=>Rows.AddRange(rows.Cast<sp_PendingReportResult>());
    }
}
