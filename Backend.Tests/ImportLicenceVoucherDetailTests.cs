using System.Text.RegularExpressions;
using API.DBContext;
using API.Model;
using API.Service.ExcelExport;
using API.StoredProcedureToLinq;
using API.Service.Reports;
using API.Model.TradeNet;
using Backend.Controllers.Report;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

namespace Backend.Tests;

public sealed class ImportLicenceVoucherDetailTests : IAsyncLifetime
{
    private readonly string _database = "TradeNet_VoucherDetails_Tests_" + Guid.NewGuid().ToString("N");
    private TradeNetDbContext CreateDb() => ReportTestHelper.CreateSqlServerDbContext(_database);

    public async Task InitializeAsync()
    {
        await using var db = CreateDb();
        await db.Database.GetService<IRelationalDatabaseCreator>().CreateAsync();
        await db.Database.ExecuteSqlRawAsync("""
            CREATE TABLE ImportLicence (Id varchar(36) PRIMARY KEY, ApplicationNo nvarchar(50), ApplicationDate datetime,
                ApproveUserId int, ExportImportSectionId int, ApplyType nvarchar(20), OldImportLicenceNo nvarchar(50),
                ImportLicenceNo nvarchar(50), CreatedDate datetime, PaThaKaId varchar(36), Status nvarchar(20),
                CommodityType nvarchar(100), ExchangeRate decimal(18,4), TotalCIF float);
            CREATE TABLE AccountTransaction (Id varchar(36) PRIMARY KEY, TransactionId varchar(36),
                TransactionFormType nvarchar(50), IsPayment bit, PaymentDate datetime, VoucherDate datetime,
                VoucherNo nvarchar(50), PaymentType nvarchar(20), TotalAmount float);
            CREATE TABLE AccountTransactionDetail (Id varchar(36) PRIMARY KEY, AccountTransactionId varchar(36),
                AccountTitleId int, Amount float, SortOrder int);
            CREATE TABLE AccountTitle (Id int PRIMARY KEY, Description nvarchar(max), Code nvarchar(50));
            CREATE TABLE PaThaKa (Id varchar(36) PRIMARY KEY, CompanyRegistrationNo nvarchar(50), CompanyName nvarchar(200));
            CREATE TABLE ExportImportSection (Id int PRIMARY KEY, Code nvarchar(50));
            CREATE TABLE Users (Id int PRIMARY KEY, FullName nvarchar(200));
            CREATE TABLE ImportLicenceItem (Id varchar(36), ImportLicenceId varchar(36), Amount decimal(18,4), CurrencyId int);
            CREATE TABLE Currency (Id int PRIMARY KEY, Code nvarchar(20));
            INSERT Users VALUES (1,N'Approver');
            INSERT ExportImportSection VALUES (1,'2');
            INSERT PaThaKa VALUES ('company','12345','Example Company');
            INSERT Currency VALUES (1,'USD');
            INSERT ImportLicence VALUES ('licence','IL001','2026-10-31',1,1,'New','','LIC001','2026-11-01',
                'company','Approved','Goods',2100,25);
            -- Multiple goods must not multiply fee detail rows.
            INSERT ImportLicenceItem VALUES ('item1','licence',10,1),('item2','licence',15,1);
            INSERT AccountTitle VALUES (1,N'လိုင်စင်ကြေး','A'),(2,N'Service fee','B'),(3,N'Other fee','C');
            INSERT AccountTransaction VALUES
                ('tx1','licence','Import Licence',1,'2026-11-01T23:59:00','2026-11-01','V001','Cash',10000),
                ('tx2','licence','Import Licence',1,'2026-11-02','2026-11-02','V002','MPU',5000),
                ('unpaid','licence','Import Licence',0,'2026-11-01','2026-11-01','V003','Cash',99),
                ('other-form','licence','Export Licence',1,'2026-11-01','2026-11-01','V004','Cash',99),
                ('outside','licence','Import Licence',1,'2026-10-31','2026-10-31','V005','Cash',99);
            INSERT AccountTransactionDetail VALUES
                ('d1','tx1',1,5000,1),('d2','tx1',2,3000,2),('d3','tx1',3,2000,3),
                ('d4','tx2',1,5000,1),('d5','unpaid',1,99,1),('d6','other-form',1,99,1),('d7','outside',1,99,1);
            """);
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir != null && !Directory.Exists(Path.Combine(dir.FullName,"StoredProcedureMigrations"))) dir = dir.Parent;
        var sql = File.ReadAllText(Path.Combine(dir!.FullName,"StoredProcedureMigrations","sp_ImportLicenceVoucherDetailReport_pagination.sql"));
        foreach (var batch in Regex.Split(sql,@"^\s*GO\s*$",RegexOptions.Multiline | RegexOptions.IgnoreCase))
            if (!string.IsNullOrWhiteSpace(batch)) await db.Database.ExecuteSqlRawAsync(batch);
        await db.Database.ExecuteSqlRawAsync(File.ReadAllText(Path.Combine(dir!.FullName,
            "StoredProcedureMigrations","sp_ImportLicenceVoucherCurrencyTotals.sql")));
    }

    public async Task DisposeAsync()
    {
        await using var db = CreateDb();
        await db.Database.EnsureDeletedAsync();
    }

    private static Task<List<DetailRow>> Read(TradeNetDbContext db, string options = "") =>
        db.Database.SqlQueryRaw<DetailRow>("EXEC dbo.sp_ImportLicenceVoucherDetailReport_pagination " +
            "@FromDate='2026-11-01', @ToDate='2026-11-02', @ApplyType=N'New'" + options).ToListAsync();

    [Fact]
    public async Task Each_fee_keeps_its_own_voucher_and_matches_account_summary_amounts()
    {
        await using var db = CreateDb();
        var rows = await Read(db);
        Assert.Equal(new[] {5000m,3000m,2000m,5000m},rows.Select(row=>row.Amount));
        Assert.Equal(new[] {"V001","V001","V001","V002"},rows.Select(row=>row.VoucherNo));
        Assert.Equal("လိုင်စင်ကြေး",rows[0].Description);
        Assert.All(rows,row => { Assert.Equal(4,row.TotalCount); Assert.Equal(15000m,row.AmountTotal); Assert.Equal(25m,row.TotalAmount); });
        var expected = await db.Database.SqlQueryRaw<decimal>("""
            SELECT CAST(SUM(d.Amount) AS decimal(38,6)) AS Value
            FROM AccountTransaction a JOIN AccountTransactionDetail d ON d.AccountTransactionId=a.Id
            JOIN AccountTitle t ON t.Id=d.AccountTitleId
            WHERE a.IsPayment=1 AND a.TransactionFormType='Import Licence'
                AND a.PaymentDate>='2026-11-01' AND a.PaymentDate<'2026-11-03'
            """).SingleAsync();
        Assert.Equal(expected,rows.Sum(row=>row.Amount));
    }

    [Fact]
    public async Task Paging_counts_details_and_totals_cover_the_entire_filtered_set()
    {
        await using var db = CreateDb();
        var first = await Read(db,", @PageIndex=0, @PageSize=2");
        var second = await Read(db,", @PageIndex=1, @PageSize=2");
        Assert.Equal(2,first.Count);
        Assert.Equal(2,second.Count);
        Assert.Equal(15000m,first[0].AmountTotal);
        Assert.Equal(new[] {"d1","d2","d3","d4"},first.Concat(second).Select(row=>row.DetailId));
        var fast = await Read(db,", @PageIndex=0, @PageSize=2, @IncludeTotalCount=0");
        Assert.Equal(3,fast.Count); // Extra row lets ApiResult detect the next page.
        Assert.All(fast,row=>Assert.Null(row.TotalCount));
    }

    [Theory]
    [InlineData(", @PaymentType=N'Cash'",3)]
    [InlineData(", @PaymentType=N'MPU'",1)]
    [InlineData(", @ExportImportSectionId=99",0)]
    [InlineData(", @CompanyRegistrationNo=N'wrong'",0)]
    public async Task Original_filters_apply_before_detail_paging(string options,int expected)
    {
        await using var db = CreateDb();
        Assert.Equal(expected,(await Read(db,options)).Count);
    }

    [Fact]
    public async Task Amount_sort_is_numeric_and_unrecognized_sort_input_is_safe()
    {
        await using var db = CreateDb();
        Assert.Equal(new[] {2000m,3000m,5000m,5000m},(await Read(db,", @SortColumn=N'Amount', @SortOrder=N'ASC'")).Select(row=>row.Amount));
        Assert.Equal(4,(await Read(db,", @SortColumn=N'Amount]; DROP TABLE AccountTitle;--'")).Count);
        Assert.Equal(4,(await Read(db)).Count);
    }

    [Fact]
    public async Task Controller_and_streaming_excel_return_the_same_detail_rows_and_full_total()
    {
        await using var db = CreateDb();
        var controller = (ImportLicenceVoucherDetailReportController)ReportTestHelper.CreateController(
            typeof(ImportLicenceVoucherDetailReportController),db);
        var request = new ImportLicenceVoucherReportRequest {
            FromDate=new DateTime(2026,11,1),ToDate=new DateTime(2026,11,2),
            ApplyType="New",IncludeTotalCount=true,PageSize=2,SortColumn="Amount",SortOrder="ASC"
        };
        var response = await controller.Post(request);
        var page = Assert.IsType<ApiResult<sp_ImportLicenceVoucherDetailReportResult>>(
            Assert.IsType<OkObjectResult>(response.Result).Value);
        Assert.Equal(4,page.TotalCount);
        Assert.Equal(2,page.Data.Count);
        Assert.Equal(15000m,page.ColumnTotals!["amount"]);
        Assert.Equal(2,page.CurrencyTotals!.GrandTotalLicences);
        Assert.Equal(50m,Assert.Single(page.CurrencyTotals.Currencies).TotalValue);
        Assert.Equal(new[] {2000m,3000m},page.Data.Select(row=>row.Amount));
        var sink = new CaptureSink();
        await controller.WriteRowsAsync(request,sink,1,CancellationToken.None);
        Assert.Equal(4,sink.Rows.Count);
        Assert.Equal(page.Data.Select(row=>row.DetailId),sink.Rows.Take(2).Select(row=>row.DetailId));
        Assert.Equal(15000m,sink.Rows.Sum(row=>row.Amount));
        Assert.All(sink.Rows,row=>Assert.False(string.IsNullOrWhiteSpace(row.Description)));
    }

    [Fact]
    public async Task Empty_page_and_invalid_dates_are_handled()
    {
        await using var db = CreateDb();
        var controller = (ImportLicenceVoucherDetailReportController)ReportTestHelper.CreateController(
            typeof(ImportLicenceVoucherDetailReportController),db);
        Assert.IsType<BadRequestObjectResult>((await controller.Post(null)).Result);
        Assert.IsType<BadRequestObjectResult>((await controller.Post(new() {
            FromDate=new DateTime(2026,11,2),ToDate=new DateTime(2026,11,1) })).Result);
        var response = await controller.Post(new() {
            FromDate=new DateTime(2026,11,1),ToDate=new DateTime(2026,11,2),ApplyType="Amend",IncludeTotalCount=true
        });
        var page = Assert.IsType<ApiResult<sp_ImportLicenceVoucherDetailReportResult>>(
            Assert.IsType<OkObjectResult>(response.Result).Value);
        Assert.Empty(page.Data);
        Assert.Equal(0,page.TotalCount);
    }

    [Fact]
    public void New_report_uses_existing_import_licence_access_rules()
    {
        var policy = ReportAccessPolicy.Create("Report",new[] {new UserDetail {Type="Import Licence",SubType="Oversea"}});
        Assert.True(policy.CanAccess("ImportLicenceVoucherDetailReport"));
        Assert.False(ReportAccessPolicy.Create("Account User",Array.Empty<UserDetail>()).CanAccess("ImportLicenceVoucherDetailReport"));
    }

    [Fact]
    public async Task Equal_fee_amounts_stay_as_separate_rows()
    {
        await using var db = CreateDb();
        await db.Database.ExecuteSqlRawAsync("UPDATE AccountTransactionDetail SET Amount=5000 WHERE Id='d2'; DELETE AccountTransactionDetail WHERE Id='d3';");
        var rows = await Read(db,", @PaymentType=N'Cash'");
        Assert.Equal(2,rows.Count);
        Assert.All(rows,row=>Assert.Equal(5000m,row.Amount));
        Assert.Equal(10000m,rows[0].AmountTotal);
    }

    [Fact]
    public async Task Payment_date_filter_preserves_the_original_voucher_timestamp_bounds()
    {
        await using var db = CreateDb();
        await db.Database.ExecuteSqlRawAsync("""
            INSERT AccountTransaction VALUES
                ('late','licence','Import Licence',1,'2026-11-02T12:00:00','2026-11-02','V006','Cash',100);
            INSERT AccountTransactionDetail VALUES ('late-detail','late',1,100,1);
            """);
        // The original voucher filter uses PaymentDate <= ToDate, not a different end-date rule.
        Assert.Equal(4,(await Read(db)).Count);
    }

    private sealed class CaptureSink : IExcelRowSink
    {
        public List<sp_ImportLicenceVoucherDetailReportResult> Rows { get; } = new();
        public void Append<T>(IReadOnlyList<T> rows) => Rows.AddRange(rows.Cast<sp_ImportLicenceVoucherDetailReportResult>());
    }

    public sealed class DetailRow
    {
        public string DetailId { get; set; } = "";
        public string VoucherNo { get; set; } = "";
        public string Description { get; set; } = "";
        public decimal Amount { get; set; }
        public decimal? TotalAmount { get; set; }
        public int? TotalCount { get; set; }
        public decimal AmountTotal { get; set; }
    }
}
