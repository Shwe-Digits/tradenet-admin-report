using System;
using System.Collections.Generic;
using System.Linq;
using API.Model.TradeNet;

namespace API.Service.Reports;

public sealed class ReportAccessPolicy
{
    private readonly HashSet<string> _categories;

    private ReportAccessPolicy(bool isAdmin, HashSet<string> categories)
    {
        IsAdmin = isAdmin;
        _categories = categories;
    }

    public bool IsAdmin { get; }
    public IReadOnlyCollection<string> Categories => _categories;

    public static ReportAccessPolicy Create(string? userType, IEnumerable<UserDetail> details)
    {
        if (string.Equals(userType, "Super Administrator", StringComparison.OrdinalIgnoreCase))
            return new ReportAccessPolicy(true, new HashSet<string>(StringComparer.OrdinalIgnoreCase));

        if (string.Equals(userType, "ICT Report", StringComparison.OrdinalIgnoreCase))
            return new ReportAccessPolicy(false, new HashSet<string>(
                FamilyPrefixes.Select(family => family.Category).Concat(new[]
                {
                    "report-pathaka", "report-payment", "report-member",
                    "report-oga-recommendation", "report-eicc",
                }), StringComparer.OrdinalIgnoreCase));

        var categories = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        if (string.Equals(userType, "Account User", StringComparison.OrdinalIgnoreCase))
            categories.Add("report-payment");
        else if (userType is "Report" or "Check User" or "Approve User")
        {
            if (userType == "Report") categories.Add("report-oga-recommendation");
            foreach (var detail in details)
            {
                var category = CategoryForDetail(detail.Type, detail.SubType);
                if (category != null) categories.Add(category);
            }
        }

        return new ReportAccessPolicy(false, categories);
    }

    public bool CanAccess(string controllerName)
    {
        if (IsAdmin) return true;
        var category = CategoryForController(controllerName);
        return category != null && _categories.Contains(category);
    }

    public static string? CategoryForDetail(string? type, string? subType)
    {
        if (string.Equals(type, "Registration", StringComparison.OrdinalIgnoreCase))
            return subType?.Trim().ToLowerInvariant() switch
            {
                "pa tha ka" => "report-pathaka",
                "whole sale" => "report-wholesale",
                "retail" => "report-retail",
                "whole sale and retail" => "report-wholesale-retail",
                "wine importation" => "report-alcoholic-beverages",
                "duty free shop" => "report-duty-free-shop",
                "re-export" => "report-re-export",
                "business service agency" => "report-business-service-agency",
                "sale center" => "report-sale-center",
                "show room" => "report-show-room",
                "ev show room" => "report-ev-show-room",
                "ev cycle show room" => "report-evcycle-show-room",
                _ => null,
            };

        var prefix = string.Equals(subType, "Border", StringComparison.OrdinalIgnoreCase)
            ? "report-border-"
            : string.Equals(subType, "Oversea", StringComparison.OrdinalIgnoreCase)
                ? "report-" : null;
        if (prefix == null) return null;

        return type?.Trim().ToLowerInvariant() switch
        {
            "import licence" => prefix + "import-licence",
            "import permit" => prefix + "import-permit",
            "export licence" => prefix + "export-licence",
            "export permit" => prefix + "export-permit",
            _ => null,
        };
    }

    public static string? CategoryForController(string controllerName)
    {
        if (controllerName.StartsWith("AdvanceSearch", StringComparison.Ordinal))
            controllerName = controllerName["AdvanceSearch".Length..];

        foreach (var (prefix, category) in FamilyPrefixes)
            if (controllerName.StartsWith(prefix, StringComparison.Ordinal)) return category;

        if (PathakaControllers.Contains(controllerName)) return "report-pathaka";
        if (PaymentControllers.Contains(controllerName)) return "report-payment";
        if (controllerName == "MemberRegistrationReport") return "report-member";
        if (controllerName is "OGARecommendationReport" or "OGARecommendationHistoryReport")
            return "report-oga-recommendation";
        if (controllerName.StartsWith("EICC", StringComparison.Ordinal)) return "report-eicc";
        return null;
    }

    private static readonly (string Prefix, string Category)[] FamilyPrefixes =
    {
        ("BorderImportLicence", "report-border-import-licence"),
        ("BorderImportPermit", "report-border-import-permit"),
        ("BorderExportLicence", "report-border-export-licence"),
        ("BorderExportPermit", "report-border-export-permit"),
        ("ImportLicence", "report-import-licence"),
        ("ImportPermit", "report-import-permit"),
        ("ExportLicence", "report-export-licence"),
        ("ExportPermit", "report-export-permit"),
        ("WholeSaleAndRetail", "report-wholesale-retail"),
        ("WholeSale", "report-wholesale"),
        ("Retail", "report-retail"),
        ("AlcoholicBeveragesImportation", "report-alcoholic-beverages"),
        ("DutyFreeShop", "report-duty-free-shop"),
        ("ReExport", "report-re-export"),
        ("BusinessServiceAgency", "report-business-service-agency"),
        ("SaleCenter", "report-sale-center"),
        ("ShowRoom", "report-show-room"),
        ("EVShowRoom", "report-ev-show-room"),
        ("EVCycleShowRoom", "report-evcycle-show-room"),
    };

    private static readonly HashSet<string> PathakaControllers = new(StringComparer.Ordinal)
    {
        "PaThaKaRegisteredBusinessOrganizationReport", "ListOfValidAndInvalidCompany",
        "ListOfDirectorsByCompanyRegistrationNo", "ListOfTopCapitalCompany",
        "ListOfCompany", "ListOfDirectors", "RegistrationByVoucher",
        "RegistrationByBusinessType", "CompanyProfile", "EIRCardBindReport",
        "CardListsByCompanyRegistrationNumber",
    };

    private static readonly HashSet<string> PaymentControllers = new(StringComparer.Ordinal)
    {
        "MPUReport", "MPUReportV3", "ChequeNoReport", "ChequeNoDetailReport",
        "OnlineFeesReport", "AccountSummaryReport",
    };
}
