using System.Data;
using System.Text.RegularExpressions;
using API.DBContext;
using API.Model;
using API.Service.ExcelExport;
using API.Service.Reports;
using API.StoredProcedureToLinq;
using Backend.Controllers.Report;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

namespace Backend.Tests;

public sealed class MPUReportV4Tests : IAsyncLifetime
{
    private readonly string _database = "TradeNet_MPUV4_" + Guid.NewGuid().ToString("N");
    private TradeNetDbContext Db() => ReportTestHelper.CreateSqlServerDbContext(_database);

    public async Task InitializeAsync()
    {
        await using var db = Db();
        await db.Database.GetService<IRelationalDatabaseCreator>().CreateAsync();
        await db.Database.ExecuteSqlRawAsync("""
            CREATE TABLE dbo.ImportLicence(Id char(36) PRIMARY KEY,ApplicationNo nvarchar(50));
            CREATE TABLE dbo.BorderImportLicence(Id char(36) PRIMARY KEY,ApplicationNo nvarchar(50));
            CREATE TABLE dbo.PaThaKa(Id int PRIMARY KEY,PaThaKaNo nvarchar(50),
                CompanyRegistrationNo nvarchar(50),CompanyName nvarchar(200));
            CREATE TABLE dbo.AccountTransaction(Id int PRIMARY KEY,TransactionId char(36),VoucherNo nvarchar(50),
                TotalAmount float,PaymentDate datetime,CreatedDate datetime,IsPayment bit);
            CREATE TABLE dbo.MPUPaymentTransaction(Id int PRIMARY KEY,TransactionId char(36),Sakhan nvarchar(200),
                PaThaKaNo nvarchar(50),ApplyType nvarchar(50),FormType nvarchar(50),ApplicationNo nvarchar(50),
                InvoiceNo nvarchar(50),MOCAmount nvarchar(50),IMAmount nvarchar(50),TransactionAmount nvarchar(50),
                MerchantId nvarchar(50),ResponseCode nvarchar(50),AccountNo nvarchar(50),TransactionRefNo nvarchar(50),
                ApprovalCode nvarchar(50),TransactionDateTime datetime,Status nvarchar(50),PaymentType nvarchar(50));
            INSERT dbo.PaThaKa VALUES (1,'p1','reg1','Test company');
            INSERT dbo.ImportLicence VALUES ('oversea','OIL-100'),('other','WRONG-TYPE');
            INSERT dbo.BorderImportLicence VALUES ('border','BIL-200'),('oversea','WRONG-FAMILY');
            INSERT dbo.MPUPaymentTransaction(Id,TransactionId,Sakhan,PaThaKaNo,ApplyType,FormType,ApplicationNo,
                ResponseCode,Status,TransactionDateTime,TransactionAmount,MOCAmount,IMAmount,PaymentType)
            VALUES (1,'oversea','A','p1','New','Import Licence',NULL,'00','AP','2026-11-15','150000','1450','10','MPU'),
                (2,'oversea','A','p1','Amend','Import Licence','','00','AP','2026-11-16','250000','2450','20','MPU'),
                (3,'border','B','p1','New','Border Import Licence','PAYMENT-200','00','AP','2026-11-16','350000','3450','30','Citizen Pay'),
                (4,'other','A','p1','New','Export Permit','EP-300','00','AP','2026-11-16','450000','4450','40','MPU'),
                (5,'missing','A','p1','New','Import Licence',NULL,'00','AP','2026-11-16','550000','5450','50','MPU'),
                (6,'oversea','A','p1','Amend','Import Licence',NULL,'05','AP','2026-11-16','9800','0','0','MPU'),
                (7,'unpaired','A','p1','New','Import Licence','','00','AP','2026-11-16','9800','0','0','MPU');
            INSERT dbo.AccountTransaction VALUES
                (1,'oversea','V-OLD',1500,'2026-11-15','2026-11-15',1),
                (2,'oversea','V-NEW',2500,'2026-11-16','2026-11-16',1),
                (3,'border','V-BORDER',3500,'2026-11-16','2026-11-16',1),
                (4,'other','V-EXPORT',4500,'2026-11-16','2026-11-16',1),
                (5,'missing','V-MISSING',5500,'2026-11-16','2026-11-16',1),
                (6,'oversea','V-UNRELATED',1,'2026-10-10','2026-10-10',1);
            """);
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory != null && !Directory.Exists(Path.Combine(directory.FullName,"StoredProcedureMigrations")))
            directory = directory.Parent;
        foreach (var version in new[] { "V3", "V4" })
        {
            var source = await File.ReadAllTextAsync(Path.Combine(directory!.FullName, "StoredProcedureMigrations",
                $"sp_MPUReport_{version}_pagination.sql"));
            foreach (var batch in Regex.Split(source, @"^\s*GO\s*$", RegexOptions.IgnoreCase | RegexOptions.Multiline))
                if (!string.IsNullOrWhiteSpace(batch)) await db.Database.ExecuteSqlRawAsync(batch);
        }
    }

    public async Task DisposeAsync()
    {
        await using var db = Db();
        await db.Database.EnsureDeletedAsync();
    }

    [Theory]
    [InlineData("", "", "Sakhan", 0, null, true)]
    [InlineData("", "MPU", "Sakhan", 1, 1, false)]
    [InlineData("Border Import Licence", "CitizenPay", "ApplicationNo", 0, 10, true)]
    public async Task V4_matches_every_V3_field_and_looks_up_the_linked_licence(string form, string payment,
        string sort, int page, int? size, bool count)
    {
        var before = await Read(false, form, payment, sort, page, size, count);
        var after = await Read(true, form, payment, sort, page, size, count);
        Assert.NotEmpty(before.Rows.Cast<DataRow>());
        Assert.Equal(before.Rows.Count, after.Rows.Count);
        Assert.Equal(before.Columns.Count + 1, after.Columns.Count);
        for (var i = 0; i < before.Rows.Count; i++)
        {
            foreach (DataColumn column in before.Columns)
                Assert.Equal(before.Rows[i][column], after.Rows[i][column.ColumnName]);
            var row = after.Rows[i];
            var expected = (int)row["Id"] switch { 2 => "OIL-100", 3 => "BIL-200", _ => "" };
            Assert.Equal(expected,row["LicenceApplicationNo"]);
            if ((int)row["Id"] == 2) Assert.Equal("V-NEW",row["VoucherNo"]);
        }
    }

    [Fact]
    public async Task New_column_sort_is_applied_before_paging()
    {
        var first = await Read(true, "", "", "LicenceApplicationNo", 0, 1, false);
        var second = await Read(true, "", "", "LicenceApplicationNo", 1, 1, false);
        Assert.Equal(new[] { "OIL-100", "BIL-200" }, first.Rows.Cast<DataRow>().Select(row => row.Field<string>("LicenceApplicationNo")));
        Assert.Equal(new[] { "BIL-200", "" }, second.Rows.Cast<DataRow>().Select(row => row.Field<string>("LicenceApplicationNo")));
    }

    [Fact]
    public async Task Fast_page_fills_from_the_full_range_when_early_payments_lack_vouchers()
    {
        await using var db = Db();
        await db.Database.ExecuteSqlRawAsync("""
            WITH numbers AS (
                SELECT TOP (100) ROW_NUMBER() OVER (ORDER BY object_id) AS n FROM sys.all_objects
            )
            INSERT dbo.MPUPaymentTransaction (Id,TransactionId,Sakhan,FormType,ResponseCode,TransactionDateTime,PaymentType)
            SELECT 1000+n,CONVERT(varchar(36),1000+n),'Z','Import Licence','00','2026-11-16','MPU'
            FROM numbers;
            """);

        var full = await Read(true, "", "", "Sakhan", 0, null, true);
        var first = await Read(true, "", "", "Sakhan", 0, 1, false);
        var second = await Read(true, "", "", "Sakhan", 1, 1, false);
        Assert.Equal(4, full.Rows.Count);
        Assert.Equal(full.Rows.Cast<DataRow>().Take(2).Select(row => row.Field<int>("Id")),
            first.Rows.Cast<DataRow>().Select(row => row.Field<int>("Id")));
        Assert.Equal(full.Rows.Cast<DataRow>().Skip(1).Take(2).Select(row => row.Field<int>("Id")),
            second.Rows.Cast<DataRow>().Select(row => row.Field<int>("Id")));
        Assert.All(first.Rows.Cast<DataRow>(), row => Assert.True(row.IsNull("TotalCount")));
        Assert.Equal("V-NEW", full.Rows.Cast<DataRow>().Single(row => row.Field<int>("Id") == 2).Field<string>("VoucherNo"));
    }

    [Fact]
    public async Task Grid_and_streamed_Excel_include_both_numbers_with_V3_totals()
    {
        await using var db = Db();
        var v3 = (MPUReportV3Controller)ReportTestHelper.CreateController(typeof(MPUReportV3Controller), db);
        var v4 = (MPUReportV4Controller)ReportTestHelper.CreateController(typeof(MPUReportV4Controller), db);
        var request = new MPUReportV3Request
        {
            FromDate = new DateTime(2026, 11, 16), ToDate = new DateTime(2026, 11, 16, 23, 59, 59),
            FormType = "Border Import Licence", PaymentType = "CitizenPay", PageSize = 10, IncludeTotalCount = true,
        };

        var oldPage = Assert.IsType<ApiResult<sp_MPUReport_V3Result>>(Assert.IsType<OkObjectResult>((await v3.Post(request)).Result).Value);
        var newPage = Assert.IsType<ApiResult<sp_MPUReport_V4Result>>(Assert.IsType<OkObjectResult>((await v4.Post(request)).Result).Value);
        Assert.Equal(oldPage.ColumnTotals!.ToArray(), newPage.ColumnTotals!.ToArray());
        Assert.Equal(oldPage.TotalCount, newPage.TotalCount);
        var result = Assert.Single(newPage.Data);
        Assert.Equal("PAYMENT-200", result.ApplicationNo);
        Assert.Equal("BIL-200", result.LicenceApplicationNo);
        Assert.Equal("V-BORDER", result.VoucherNo);

        Assert.IsType<OkObjectResult>(await v4.Excel(request));
        var sink = new Sink();
        await v4.WriteRowsAsync(request, sink, 1, CancellationToken.None);
        var exported = Assert.Single(sink.Rows);
        Assert.Equal(result.ApplicationNo, exported.ApplicationNo);
        Assert.Equal(result.LicenceApplicationNo, exported.LicenceApplicationNo);
        var totals = await v4.GetExcelFooterTotalsAsync(request, CancellationToken.None);
        Assert.Equal(newPage.ColumnTotals!.ToArray(), totals!.ColumnTotals!.ToArray());
        Assert.Equal(typeof(sp_MPUReport_V4Result), ExcelRowTypeResolver.Resolve(typeof(MPUReportV4Controller)));
    }

    [Fact]
    public void V4_uses_the_same_payment_access_as_V3()
    {
        Assert.Equal(ReportAccessPolicy.CategoryForController("MPUReportV3"), ReportAccessPolicy.CategoryForController("MPUReportV4"));
        Assert.True(ReportAccessPolicy.Create("Account User", []).CanAccess("MPUReportV4"));
        Assert.False(ReportAccessPolicy.Create("Report", []).CanAccess("MPUReportV4"));
    }

    private sealed class Sink : IExcelRowSink
    {
        public List<sp_MPUReport_V4Result> Rows { get; } = [];
        public void Append<T>(IReadOnlyList<T> rows) => Rows.AddRange(rows.Cast<sp_MPUReport_V4Result>());
    }

    private async Task<DataTable> Read(bool v4, string form, string payment, string sort, int page, int? size, bool count)
    {
        await using var db = Db();
        var connection = (SqlConnection)db.Database.GetDbConnection();
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = v4 ? "dbo.sp_MPUReport_V4_pagination" : "dbo.sp_MPUReport_V3_pagination";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.AddWithValue("@FromDate", new DateTime(2026,11,16));
        command.Parameters.AddWithValue("@ToDate", new DateTime(2026,11,16,23,59,59));
        command.Parameters.AddWithValue("@FormType", form);
        command.Parameters.AddWithValue("@PaymentType", payment);
        command.Parameters.AddWithValue("@SortColumn", sort);
        command.Parameters.AddWithValue("@SortOrder", "DESC");
        command.Parameters.AddWithValue("@PageIndex", page);
        command.Parameters.AddWithValue("@PageSize", (object?)size ?? DBNull.Value);
        command.Parameters.AddWithValue("@IncludeTotalCount", count);
        await using var reader = await command.ExecuteReaderAsync();
        var table = new DataTable();
        table.Load(reader);
        return table;
    }
}
