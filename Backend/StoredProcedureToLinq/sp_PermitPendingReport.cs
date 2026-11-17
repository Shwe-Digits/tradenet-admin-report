using System;
using System.Linq;
using API.DBContext;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace API.StoredProcedureToLinq;

public static class sp_PermitPendingReport
{
    public static IQueryable<sp_PendingReportRow> ExecuteQueryable(TradeNetDbContext db,
        sp_PendingReportRequest request,string? sortColumn=null,string? sortOrder=null,
        int? pageIndex=null,int? pageSize=null,bool includeTotalCount=true)
        => db.Database.SqlQueryRaw<sp_PendingReportRow>(
            "EXEC dbo.sp_PermitPendingReport_pagination @FromDate,@ToDate,@FormType,@ExportImportSectionId,"+
            "@SortColumn,@SortOrder,@PageIndex,@PageSize,@IncludeTotalCount",
            new SqlParameter("@FromDate",request.FromDate),new SqlParameter("@ToDate",request.ToDate),
            new SqlParameter("@FormType",request.FormType),new SqlParameter("@ExportImportSectionId",request.ExportImportSectionId),
            new SqlParameter("@SortColumn",(object?)sortColumn??DBNull.Value),new SqlParameter("@SortOrder",(object?)sortOrder??DBNull.Value),
            new SqlParameter("@PageIndex",(object?)pageIndex??DBNull.Value),new SqlParameter("@PageSize",(object?)pageSize??DBNull.Value),
            new SqlParameter("@IncludeTotalCount",includeTotalCount));
}
