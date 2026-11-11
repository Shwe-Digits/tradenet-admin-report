using System.Collections;
using System.Reflection;
using System.Text.RegularExpressions;
using API.DBContext;
using API.Model;
using API.Service.ExcelExport;
using API.Service.Reports;
using API.StoredProcedureToLinq;
using Backend.Controllers.Report;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

namespace Backend.Tests;

public sealed class VoucherDetailDatabase : IAsyncLifetime
{
    public static readonly string[] Families = {
        "Import Permit", "Export Licence", "Export Permit", "Border Import Licence",
        "Border Import Permit", "Border Export Licence", "Border Export Permit"
    };
    private readonly string _database = "TradeNet_AllVoucherDetails_" + Guid.NewGuid().ToString("N");
    public TradeNetDbContext CreateDb() => ReportTestHelper.CreateSqlServerDbContext(_database);
    private static string Root {
        get {
            var dir = new DirectoryInfo(AppContext.BaseDirectory);
            while (dir != null && !Directory.Exists(Path.Combine(dir.FullName,"StoredProcedureMigrations"))) dir = dir.Parent;
            return dir!.FullName;
        }
    }
    public async Task InitializeAsync()
    {
        await using var db = CreateDb();
        await db.Database.GetService<IRelationalDatabaseCreator>().CreateAsync();
        await db.Database.OpenConnectionAsync();
        await db.Database.ExecuteSqlRawAsync("""
            CREATE TABLE dbo.PaThaKa (Id varchar(36) NOT NULL PRIMARY KEY,CompanyRegistrationNo nvarchar(50),CompanyName nvarchar(200));
            CREATE TABLE dbo.IndividualTrading (Id varchar(36) NOT NULL PRIMARY KEY,TINNo nvarchar(50),Name nvarchar(200));
            CREATE TABLE dbo.Users (Id int PRIMARY KEY,FullName nvarchar(200));
            CREATE TABLE dbo.ExportImportSection (Id int PRIMARY KEY,Code nvarchar(20));
            CREATE TABLE dbo.Sakhan (Id int PRIMARY KEY,Code nvarchar(20),Name nvarchar(100));
            CREATE TABLE dbo.Currency (Id int PRIMARY KEY,Code nvarchar(20));
            CREATE TABLE dbo.AccountTransaction (Id varchar(36) NOT NULL PRIMARY KEY,TransactionId varchar(36),
                TransactionFormType nvarchar(50),TotalAmount float,VoucherNo nvarchar(50),VoucherDate datetime,
                PaymentDate datetime,IsPayment bit,PaymentType nvarchar(20));
            CREATE TABLE dbo.AccountTransactionDetail (Id varchar(36) NOT NULL PRIMARY KEY,AccountTransactionId varchar(36),
                AccountTitleId int,Amount float,SortOrder int);
            CREATE TABLE dbo.AccountTitle (Id int PRIMARY KEY,Description nvarchar(max));
            CREATE INDEX IX_AccountTransaction_ExportLicenceVoucher ON dbo.AccountTransaction(TransactionId);
            CREATE INDEX IX_AccountTransaction_BorderImportLicenceVoucher ON dbo.AccountTransaction(TransactionId);
            INSERT dbo.PaThaKa VALUES ('company','12345',N'Example Company');
            INSERT dbo.IndividualTrading VALUES ('individual','TIN001',N'Individual Trader');
            INSERT dbo.Users VALUES (1,N'Approver');
            INSERT dbo.ExportImportSection VALUES (1,'2'),(2,'3');
            INSERT dbo.Sakhan VALUES (1,'MWD','Myawaddy'),(2,'MS','Muse');
            INSERT dbo.Currency VALUES (1,'USD'),(2,'CNY');
            INSERT dbo.AccountTitle VALUES (1,N'လိုင်စင်ကြေး'),(2,N'Service fee'),(3,N'Other fee');
            """);
        foreach (var form in Families)
        {
            var table = form.Replace(" ","");
            var number = (form.Contains("Import") ? "Import" : "Export") + (form.Contains("Permit") ? "PermitNo" : "LicenceNo");
            var border = form.StartsWith("Border");
            var individual = form is "Border Import Licence" or "Border Export Licence";
            var exchange = form is "Import Permit" or "Border Import Permit" or "Border Import Licence";
            // Identifiers below come only from the fixed Families list, never external input.
            var sql = $"""
                CREATE TABLE dbo.{table} (Id varchar(36) NOT NULL PRIMARY KEY,ApplicationNo nvarchar(100),ApplicationDate datetime,
                    ApproveUserId int,ExportImportSectionId int,ApplyType nvarchar(20),Old{number} nvarchar(50),
                    {number} nvarchar(50),CreatedDate datetime,PaThaKaId varchar(36),Status nvarchar(20),CommodityType nvarchar(100)
                    {(border ? ",SakhanId int" : "")}{(individual ? ",IndividualTradingId varchar(36),CardType nvarchar(30)" : "")}
                    {(exchange ? ",ExchangeRate decimal(18,4),TotalCIF float" : "")});
                CREATE TABLE dbo.{table}Item (Id varchar(36) NOT NULL,UniqueId int NOT NULL,{table}Id varchar(36) NOT NULL,
                    Amount decimal(18,4) NOT NULL,CurrencyId int NOT NULL,PRIMARY KEY(Id,UniqueId));
                INSERT dbo.{table} VALUES ('{table}-licence','{table}-001','2026-10-31',1,1,'New','OLD-001','LIC001','2026-11-01',
                    'company','Approved','Goods'{(border ? ",1" : "")}{(individual ? ",'individual','Pa Tha Ka'" : "")}{(exchange ? ",2100,25" : "")});
                INSERT dbo.{table}Item VALUES ('{table}-a',1,'{table}-licence',10,1),('{table}-z',2,'{table}-licence',15,2);
                INSERT dbo.AccountTransaction VALUES
                    ('{table}-tx1','{table}-licence','{form}',10000,'V001','2026-11-01','2026-11-01T10:00:00',1,'Cash'),
                    ('{table}-tx2','{table}-licence','{form}',5000,'V002','2026-11-02','2026-11-02T10:00:00',1,'MPU'),
                    ('{table}-unpaid','{table}-licence','{form}',999,'UNPAID','2026-11-01','2026-11-01',0,'Cash');
                INSERT dbo.AccountTransactionDetail VALUES
                    ('{table}-d1','{table}-tx1',1,5000,1),('{table}-d2','{table}-tx1',2,3000,2),
                    ('{table}-d3','{table}-tx1',3,2000,3),('{table}-d4','{table}-tx2',1,2500,1),
                    ('{table}-d5','{table}-tx2',2,2500,2),('{table}-unpaid-d','{table}-unpaid',1,999,1);
                """;
            await db.Database.ExecuteSqlRawAsync(sql);
            if (individual)
                await db.Database.ExecuteSqlRawAsync($"""
                    INSERT dbo.{table} SELECT '{table}-individual','{table}-IND',ApplicationDate,ApproveUserId,ExportImportSectionId,
                        ApplyType,Old{number},{number},CreatedDate,NULL,Status,CommodityType,2,'individual','Individual Trading'
                        {(exchange ? ",ExchangeRate,TotalCIF" : "")} FROM dbo.{table};
                    INSERT dbo.AccountTransaction VALUES ('{table}-ind-tx','{table}-individual','{form}',9000,'IND001','2026-11-01','2026-11-01',1,'Cash');
                    INSERT dbo.AccountTransactionDetail VALUES ('{table}-ind-d','{table}-ind-tx',1,9000,1);
                    """);
        }
        await db.Database.ExecuteSqlRawAsync("CREATE INDEX IX_BorderImportLicenceItem_VoucherReport ON dbo.BorderImportLicenceItem(BorderImportLicenceId)");
        foreach (var file in new[] {
            "Views/vw_ImportPermitItemTotalByCurrency.sql", "Views/vw_ExportPermitItemTotalByCurrency.sql",
            "sp_VoucherReport_pagination.sql", "sp_VoucherDetailReport_pagination.sql"
        })
        {
            var sql = File.ReadAllText(Path.Combine(Root,"StoredProcedureMigrations",file));
            foreach (var batch in Regex.Split(sql,@"^\s*GO\s*$",RegexOptions.Multiline | RegexOptions.IgnoreCase))
                if (!string.IsNullOrWhiteSpace(batch) && !Regex.IsMatch(batch,@"^\s*USE\s",RegexOptions.IgnoreCase))
                    await db.Database.ExecuteSqlRawAsync(batch);
        }
    }
    public async Task DisposeAsync()
    {
        await using var db = CreateDb();
        await db.Database.EnsureDeletedAsync();
    }
}

public sealed class AllVoucherDetailReportTests : IClassFixture<VoucherDetailDatabase>
{
    private readonly VoucherDetailDatabase _fixture;
    public AllVoucherDetailReportTests(VoucherDetailDatabase fixture) => _fixture=fixture;
    public static IEnumerable<object[]> Families => VoucherDetailDatabase.Families.Select(form=>new object[] {form});

    private static Type Controller(string form) => Assert.IsAssignableFrom<Type>(
        typeof(ImportLicenceVoucherDetailReportController).Assembly.GetType("Backend.Controllers.Report."+form.Replace(" ","")+"VoucherDetailReportController"));
    private static object Request(Type type,string company="12345",int page=0,int size=1000,bool exact=true)
    {
        var request=ReportTestHelper.CreateRequest(type);
        foreach (var (name,value) in new (string,object)[] {
            ("FromDate",new DateTime(2026,11,1)),("ToDate",new DateTime(2026,11,3)),
            ("ApplyType","New"),("CompanyRegistrationNo",company),("ExportImportSectionId",0),("SakhanId",0),
            ("PaymentType",""),("PageIndex",page),("PageSize",size),("IncludeTotalCount",exact),
            ("SortColumn","ApplicationNo"),("SortOrder","ASC")
        }) request.GetType().GetProperty(name)!.SetValue(request,value);
        return request;
    }
    private static async Task<object> Post(object controller,object request)
    {
        var task=(Task)controller.GetType().GetMethod("Post")!.Invoke(controller,new[] {request})!;
        await task;
        var result=ReportTestHelper.GetTaskResult(task)!;
        return Assert.IsType<OkObjectResult>(result.GetType().GetProperty("Result")!.GetValue(result)).Value!;
    }
    private static object? Value(object row,string name) => row.GetType().GetProperty(name)!.GetValue(row);
    private static List<object> Rows(object page) => ((IEnumerable)Value(page,"Data")!).Cast<object>().ToList();

    [Theory, MemberData(nameof(Families))]
    public async Task Detail_rows_preserve_all_original_voucher_fields_and_split_each_fee(string form)
    {
        await using var db=_fixture.CreateDb();
        var type=Controller(form);
        var controller=ReportTestHelper.CreateController(type,db);
        var page=await Post(controller,Request(type));
        var rows=Rows(page);
        Assert.Equal(5,rows.Count);
        Assert.Equal(5,Value(page,"TotalCount"));
        Assert.Equal(15000m,((IReadOnlyDictionary<string,decimal>)Value(page,"ColumnTotals")!)["amount"]);
        var original=await sp_VoucherReport.ExecuteAsync(db,new() {
            FormType=form,FromDate=new DateTime(2026,11,1),ToDate=new DateTime(2026,11,3),ApplyType="New",CompanyRegistrationNo="12345"
        });
        Assert.Equal(2,original.Count);
        foreach (var row in rows)
        {
            var voucher=Assert.Single(original,old=>old.VoucherNo==(string?)Value(row,"VoucherNo")).ToResult();
            foreach (var property in typeof(sp_VoucherReportResult).GetProperties().Where(p=>p.Name!="Amount"))
                Assert.Equal(property.GetValue(voucher),Value(row,property.Name));
            Assert.False(string.IsNullOrWhiteSpace((string?)Value(row,"Description")));
        }
        Assert.Equal(new[] {5000m,3000m,2000m,2500m,2500m},rows.Select(row=>(decimal)Value(row,"Amount")!));
        Assert.Equal("လိုင်စင်ကြေး",Value(rows[0],"Description"));
        var sink=new CaptureSink();
        await ((IStreamingExcelReport)controller).WriteRowsAsync(Request(type),sink,2,CancellationToken.None);
        Assert.Equal(rows.Select(row=>Value(row,"DetailId")),sink.Rows.Select(row=>Value(row,"DetailId")));
        Assert.Equal(rows.Select(row=>Value(row,"Amount")),sink.Rows.Select(row=>Value(row,"Amount")));
    }

    [Theory, MemberData(nameof(Families))]
    public async Task Paging_and_all_original_filters_apply_to_detail_rows(string form)
    {
        await using var db=_fixture.CreateDb();
        var type=Controller(form); var controller=ReportTestHelper.CreateController(type,db);
        var ids=new List<object?>();
        for(var index=0;index<3;index++) {
            var page=await Post(controller,Request(type,page:index,size:2));
            ids.AddRange(Rows(page).Select(row=>Value(row,"DetailId")));
            Assert.Equal(5,Value(page,"TotalCount"));
            Assert.Equal(15000m,((IReadOnlyDictionary<string,decimal>)Value(page,"ColumnTotals")!)["amount"]);
        }
        Assert.Equal(5,ids.Distinct().Count());
        var fast=await Post(controller,Request(type,size:2,exact:false));
        Assert.Equal(2,Rows(fast).Count);
        Assert.Equal(true,Value(fast,"HasNextPage"));
        foreach(var (name,value,expected) in new (string,object,int)[] {
            ("PaymentType","Cash",3),("PaymentType","MPU",2),("CompanyRegistrationNo","missing",0),
            ("ExportImportSectionId",99,0),("ApplyType","Amend",0),
            ("FromDate",new DateTime(2026,11,2),2)
        }) {
            var request=Request(type); request.GetType().GetProperty(name)!.SetValue(request,value);
            Assert.Equal(expected,Rows(await Post(controller,request)).Count);
        }
        if(form.StartsWith("Border")) {
            var request=Request(type); request.GetType().GetProperty("SakhanId")!.SetValue(request,99);
            Assert.Empty(Rows(await Post(controller,request)));
        }
    }

    [Theory]
    [InlineData("Border Import Licence")]
    [InlineData("Border Export Licence")]
    public async Task Individual_trading_and_sakhan_filters_match_the_original_report(string form)
    {
        await using var db=_fixture.CreateDb();
        var type=Controller(form); var controller=ReportTestHelper.CreateController(type,db);
        var request=Request(type,"TIN001");
        var row=Assert.Single(Rows(await Post(controller,request)));
        Assert.Equal("Individual Trader",Value(row,"CompanyName"));
        Assert.Equal("Muse",Value(row,"SakhanName"));
        Assert.Equal(9000m,Value(row,"Amount"));
        request.GetType().GetProperty("SakhanId")!.SetValue(request,1);
        Assert.Empty(Rows(await Post(controller,request)));
    }

    [Theory, MemberData(nameof(Families))]
    public async Task Request_identity_and_access_stay_in_the_original_report_family(string form)
    {
        var type=Controller(form); var original=form.Replace(" ","")+"VoucherReport";
        Assert.Equal(ReportAccessPolicy.CategoryForController(original),ReportAccessPolicy.CategoryForController(type.Name[..^10]));
        var procRequest=ReportTestHelper.CreateProcedureRequest(type);
        Assert.Equal(form,Value(procRequest,"FormType"));
        await using var db=_fixture.CreateDb();
        var controller=ReportTestHelper.CreateController(type,db);
        var task=(Task)type.GetMethod("Post")!.Invoke(controller,new object?[] {null})!;
        await task;
        Assert.IsType<BadRequestObjectResult>(ReportTestHelper.GetTaskResult(task)!.GetType().GetProperty("Result")!.GetValue(ReportTestHelper.GetTaskResult(task)));
    }

    [Theory, MemberData(nameof(Families))]
    public async Task Empty_apply_type_keeps_each_original_controller_default(string form)
    {
        await using var db=_fixture.CreateDb();
        var type=Controller(form); var controller=ReportTestHelper.CreateController(type,db);
        var request=Request(type); request.GetType().GetProperty("ApplyType")!.SetValue(request,"");
        request.GetType().GetProperty("FormType")!.SetValue(request,"spoofed form");
        var originalType=type.Assembly.GetType("Backend.Controllers.Report."+form.Replace(" ","")+"VoucherReportController")!;
        var original=ReportTestHelper.CreateController(originalType,db);
        object?[] originalArguments={request,null,null};
        object?[] detailArguments={request,null,null};
        Assert.Equal(true,ReportTestHelper.GetTryCreateReportRequest(originalType).Invoke(original,originalArguments));
        Assert.Equal(true,ReportTestHelper.GetTryCreateReportRequest(type).Invoke(controller,detailArguments));
        Assert.Equal(Value(originalArguments[1]!,"ApplyType"),Value(detailArguments[1]!,"ApplyType"));
        var expected=form is "Export Licence" or "Border Import Licence" or "Border Export Permit" ? 5 : 0;
        Assert.Equal(expected,Rows(await Post(controller,request)).Count);
    }

    [Theory, MemberData(nameof(Families))]
    public async Task Date_boundaries_match_the_existing_voucher_branch(string form)
    {
        await using var db=_fixture.CreateDb();
        await using var transaction=await db.Database.BeginTransactionAsync();
        var table=form.Replace(" ","");
        await db.Database.ExecuteSqlRawAsync("""
            INSERT dbo.AccountTransaction VALUES ('date-test',@p0,@p1,100,'LATE','2026-11-04','2026-11-04T06:00:00',1,'Cash');
            INSERT dbo.AccountTransactionDetail VALUES ('date-detail','date-test',1,100,1);
            """,table+"-licence",form);
        var type=Controller(form); var controller=ReportTestHelper.CreateController(type,db);
        var request=Request(type); var end=new DateTime(2026,11,3,12,0,0);
        request.GetType().GetProperty("ToDate")!.SetValue(request,end);
        var rows=Rows(await Post(controller,request));
        var original=await sp_VoucherReport.ExecuteAsync(db,new() {
            FormType=form,FromDate=new DateTime(2026,11,1),ToDate=end,ApplyType="New",CompanyRegistrationNo="12345"
        });
        Assert.Equal(original.Any(row=>row.VoucherNo=="LATE"),rows.Any(row=>(string?)Value(row,"VoucherNo")=="LATE"));
        Assert.Equal(form=="Border Export Permit" ? 6 : 5,rows.Count);
    }

    [Theory, MemberData(nameof(Families))]
    public async Task Missing_goods_do_not_remove_or_multiply_fees(string form)
    {
        await using var db=_fixture.CreateDb();
        await using var transaction=await db.Database.BeginTransactionAsync();
        var table=form.Replace(" ",""); // Fixed test identities only.
        await db.Database.ExecuteSqlRawAsync("SET ARITHABORT ON; DELETE dbo."+table+"Item;");
        var type=Controller(form); var controller=ReportTestHelper.CreateController(type,db);
        var rows=Rows(await Post(controller,Request(type)));
        Assert.Equal(5,rows.Count);
        Assert.All(rows,row=> { Assert.Null(Value(row,"Currency")); Assert.Null(Value(row,"TotalAmount")); });
    }

    [Fact]
    public async Task Shared_procedure_rejects_unknown_forms_and_allowlists_sorting()
    {
        await using var db=_fixture.CreateDb();
        await Assert.ThrowsAsync<Microsoft.Data.SqlClient.SqlException>(()=>
            db.Database.ExecuteSqlRawAsync("EXEC dbo.sp_VoucherDetailReport_pagination @FormType=N'Export Licence; DROP TABLE Users',@FromDate='20261101',@ToDate='20261103'"));
        var type=Controller("Export Permit"); var controller=ReportTestHelper.CreateController(type,db);
        var request=Request(type); request.GetType().GetProperty("SortColumn")!.SetValue(request,"Amount]; DROP TABLE Users;--");
        Assert.Equal(5,Rows(await Post(controller,request)).Count);
        request.GetType().GetProperty("SortColumn")!.SetValue(request,"Amount");
        Assert.Equal(new[] {2000m,2500m,2500m,3000m,5000m},Rows(await Post(controller,request)).Select(row=>(decimal)Value(row,"Amount")!));
    }
    private sealed class CaptureSink : IExcelRowSink
    {
        public List<object> Rows {get;}=new();
        public void Append<T>(IReadOnlyList<T> rows)=>Rows.AddRange(rows.Cast<object>());
    }
}
