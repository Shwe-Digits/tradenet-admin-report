using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DBContext;
using Microsoft.EntityFrameworkCore;

namespace API.StoredProcedureToLinq;

public sealed class sp_MPUReport_V4Result : sp_MPUReport_V3Result
{
    public string LicenceApplicationNo { get; set; } = string.Empty;
}

public sealed class sp_MPUReport_V4Row : sp_MPUReport_V3Row
{
    public string LicenceApplicationNo { get; set; } = string.Empty;

    public sp_MPUReport_V4Result ToV4Result()
    {
        var result = ToResult<sp_MPUReport_V4Result>();
        result.LicenceApplicationNo = LicenceApplicationNo;
        return result;
    }
}

public static class sp_MPUReport_V4
{
    public static async Task<List<sp_MPUReport_V4Row>> ExecuteAsync(TradeNetDbContext db,
        sp_MPUReport_V3Request request, string? sortColumn, string? sortOrder,
        int pageIndex, int pageSize, bool includeTotalCount)
    {
        var previousTimeout = db.Database.GetCommandTimeout();
        try
        {
            return await ExecuteQueryable(db, request, sortColumn, sortOrder, pageIndex, pageSize, includeTotalCount)
                .ToListAsync();
        }
        finally
        {
            db.Database.SetCommandTimeout(previousTimeout);
        }
    }

    public static IQueryable<sp_MPUReport_V4Row> ExecuteQueryable(TradeNetDbContext db,
        sp_MPUReport_V3Request request, string? sortColumn = null, string? sortOrder = null,
        int? pageIndex = null, int? pageSize = null, bool includeTotalCount = true)
    {
        const string sql =
            "EXEC dbo.sp_MPUReport_V4_pagination @FromDate, @ToDate, @FormType, @PaymentType, " +
            "@SortColumn, @SortOrder, @PageIndex, @PageSize, @IncludeTotalCount";

        db.Database.SetCommandTimeout(sp_MPUReport_V3.CommandTimeoutSeconds);
        return db.Database.SqlQueryRaw<sp_MPUReport_V4Row>(sql,
            sp_MPUReport_V3.CreatePageParameters(request, sortColumn, sortOrder, pageIndex, pageSize, includeTotalCount));
    }
}
