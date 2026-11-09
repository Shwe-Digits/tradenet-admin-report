# Report Column Comparison

Generated: 2026-06-05T13:08:19.721Z

Old source: `C:\Code\Ministry of Commerce\Tradenet\tradenet-2.0-admin\TradenetAdmin\ReportControl\*.rdlc` from the old Tradenet 2.0 Admin project.
New source: `Frontend\src\Report\config\reportConfigs.ts` plus the conditional `No` column rendered by `BasicTable`.

Comparison uses visible RDLC table headers from the old report viewer and visible React table columns from the new frontend config. `Need in new` means the old report showed the column but the new table does not. `Extra in new` means the new table shows a column that was not visible in the old RDLC table.

## Summary

- New frontend report configs checked: 134
- New reports matched to an old RDLC source: 129
- New reports without an old RDLC match: 5
- Reports with old columns missing in new: 9
- Reports with extra new columns: 15
- Old RDLC files not mapped to current frontend reports: 38

## New Reports Without Old Match

- `WholeSaleRegistrationByVoucher`
- `RetailRegistrationByVoucher`
- `WholeSaleAndRetailSummaryReport`
- `WholeSaleAndRetailDetailReport`
- `WholeSaleAndRetailRegistrationByVoucher`

## Per-Report Comparison

### AccountSummaryReport

Title: Account Summary Report
Old source: `AccountSummaryReport.rdlc`
Old columns (8): `No`, `Entry Date`, `Company Registration No`, `Company Name`, `Voucher No`, `Transaction Title`, `Deducted Fees`, `Remark`
New columns (8): `No`, `Entry Date`, `Company Registration No`, `Company Name`, `Voucher No`, `Transaction Title`, `Deducted Fees`, `Remark`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportLicenceActualAmendmentReport

Title: Border Export Licence Actual Amendment Report
Old source: `BorderAmendReport.rdlc`
Old columns (11): `No.`, `Sakhan`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
New columns (11): `No`, `Sakhan`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Currency`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_
_2026-09-04: old columns re-read from the RDLC. Neither `AmendReport.rdlc` nor `BorderAmendReport.rdlc` contains an HSCode textbox (`grep -ic hscode` = 0 on both), so the earlier `HSCode` entry here was a generator artefact. The old `Curency` header typo is counted as the same column as the new `Currency`. All eight reports now render the legacy per-currency footer, and `Licence No` binds to the ORIGINAL licence number (`oldLicenceNo`) while `Licence Amendment No` binds to the amendment number._


### BorderExportLicenceAmendmentReport

Title: Border Export Licence Amendment Report
Old source: `BorderAmendReport.rdlc`
Old columns (12): `No.`, `Sakhan`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `HSCode`, `Total Value`
New columns (12): `No`, `Sakhan`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `HSCode`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportLicenceByHSCodeReport

Title: Border Export Licence By HS Code Report
Old source: `BorderHSCodeReport.rdlc`, `HSCodeDetailReport.rdlc`
Old columns (7): `Sr.No.`, `HS Code`, `Description`, `No of Licences`, `Total Value`, `Currency`, `Company Name`
New columns (7): `No`, `HS Code`, `Description`, `No of Licences`, `Total Value`, `Currency`, `Company Name`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportLicenceByMethodReport

Title: Border Export Licence By Method Report
Old source: `BorderExportLicenceByMethodReport.rdlc`
Old columns (6): `Sr.No.`, `SaKhan`, `Method`, `No of Licences`, `Total Value`, `Currency`
New columns (6): `No`, `SaKhan`, `Method`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportLicenceBySectionReport

Title: Border Export Licence By Section Report
Old source: `BorderExportLicenceBySectionReport.rdlc`
Old columns (5): `Sr.No.`, `Section`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Section`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportLicenceBySellerCountryReport

Title: Border Export Licence By Seller Country Report
Old source: `BorderExportLicenceByBuyerCountryReport.rdlc`
Old columns (5): `Sr.No.`, `Country`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Country`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportLicenceCancellationReport

Title: Border Export Licence Cancellation Report
Old source: `BorderCancelReport.rdlc`
Old columns (13): `No.`, `Sakhan`, `Section`, `Licence No`, `Cancellation No`, `Cancellation Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `HSCode`, `Remark`
New columns (13): `No`, `Sakhan`, `Section`, `Licence No`, `Cancellation No`, `Cancellation Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `HSCode`, `Remark`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportLicenceCompanyListReport

Title: Border Export Licence Company List Report
Old source: `BorderExportLicenceByCompanyReport.rdlc`
Old columns (5): `Sr.No.`, `Company Name`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Company Name`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportLicenceDailyReportNewLicenceReport

Title: Border Export Licence Daily Report (New Licence Report)
Old source: `BorderExportLicenceByDailyReport.rdlc`
Old columns (6): `Date`, `Sakhan`, `No of Licences`, `Total Value`, `Currency`, `Total USD Value`
New columns (6): `Date`, `Sakhan`, `No of Licences`, `Total Value`, `Currency`, `Total USD Value`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportLicenceDetailReport

Title: Border Export Licence Detail Report
Old source: `BorderExportLicenceDetailReport.rdlc`
Old columns (29): `Sr.No.`, `Sakhan`, `Section`, `Application Date`, `Application No`, `Licence No`, `Licence Date`, `Company Registration No`, `Company Name`, `Company Address`, `Buyer Name`, `Buyer Address`, `Buyer Country`, `Place/Port of Export`, `Place/Port of Discharge`, `Last Date`, `Method`, `Consigned Country`, `Country of Orign`, `Country of Destination`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Commodity Type`, `Conditions`
New columns (29): `No`, `Sakhan`, `Section`, `Application Date`, `Application No`, `Licence No`, `Licence Date`, `Company Registration No`, `Company Name`, `Company Address`, `Buyer Name`, `Buyer Address`, `Buyer Country`, `Place/Port of Export`, `Place/Port of Discharge`, `Last Date`, `Method`, `Consigned Country`, `Country of Orign`, `Country of Destination`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Commodity Type`, `Conditions`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportLicenceExtensionReport

Title: Border Export Licence Extension Report
Old source: `BorderExtensionReport.rdlc`
Old columns (11): `No.`, `Sakhan`, `Section`, `Licence No`, `Extension No`, `Extension Last Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
New columns (11): `No`, `Sakhan`, `Section`, `Licence No`, `Extension No`, `Extension Last Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportLicenceNewReportNewReport

Title: Border Export Licence New Report (New Report )
Old source: `BorderNewReport.rdlc`
Old columns (10): `No.`, `Sakhan`, `Section`, `Licence No`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `auto`
New columns (11): `No`, `Sakhan`, `Section`, `Licence No`, `Licence Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `auto`
Need in new (0): _None_
Extra in new (1): `Licence Date`

`Licence Date` is an intentional all-application extension and maps to `BorderExportLicence.IssuedDate`.

### BorderExportLicenceTotalValueLicencesReport

Title: Border Export Licence Total Value & Licences Report
Old source: `BorderExportLicenceByTotalValueLicenceReport.rdlc`
Old columns (3): `Sr.No.`, `Total Value`, `Currency`
New columns (3): `No`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportLicenceVoucherReport

Title: Border Export Licence Voucher Report
Old source: `BorderVoucherReport.rdlc`
Old columns (11): `No.`, `Sakhan`, `Licence No`, `Application No`, `=Parameters!header2.Value`, `=Parameters!header3.Value`, `Company Registration No`, `Company Name`, `Voucher No`, `Voucher Date`, `Total Amount`
New columns (12 + row number): `No`, `Sakhan`, `Licence No`, `Application Date`, `Application No`, `Licence No` (header2), `Licence Date` (header3), `Company Registration No`, `Company Name`, `Voucher No`, `Voucher Date`, `Commodity Type`, `Total Amount`
Need in new (0): _None_
Extra in new (2): `Application Date`, `Commodity Type`

> **Corrected 2026-09-04.** The previous entry was wrong on both axes and is what let the
> "Total Amount" regression through. Verified directly against the RDLC XML: `BorderVoucherReport.rdlc`
> has 11 `<TablixColumn>` elements, a title cell with `ColSpan 11`, no `Application Date` column and no
> `Commodity Type` column (`grep -ic commodity` = 0), and English-only headers (no non-ASCII text). The
> old "13" list was the new config's column set with two fabricated entries; the old "New (13)" list was
> the **non-border** `VoucherReport.rdlc` header set, not this report's config.
>
> - `Total Amount` (rdlc:1399) binds `=FORMAT(Fields!Amount.Value,"N0")` -> `sp_VoucherReport`'s `Amount`
>   column = `AccountTransaction.TotalAmount`, the **MMK voucher fee**. It is NOT the proc's `TotalAmount`
>   column (`SUM(BorderExportLicenceItem.Amount)`, the goods value in the licence's own currency). Binding
>   the goods value here was the 2026-09 customer complaint (`CNY:4,305,000.0000` vs the old `100,000`).
> - `Lic Value` / `Currency` / `Approved User` are **not** old columns of this report. The RDLC declares
>   `LicenceValue`/`sLicenceValue`/`sCurrency` as fields (rdlc:88-99) and references them zero times.
> - The `=Parameters!header2.Value` column (rdlc col 5) is **hidden** when `ApplyType="New"`
>   (rdlc:1578) - the only `<Hidden>` expression in the file. The header3 / Licence Date column is not.
> - Footer: one static row, `TOTAL` spanning columns 1-10 (rdlc:1457) +
>   `=FORMAT(SUM(Fields!Amount.Value),"N0")` (rdlc:1521). Single MMK grand total, zero decimals,
>   **no per-currency grouping** and no total on the goods value.
> - Drill-down: **none**. `grep -rli drillthrough` over the whole `tradenet-2.0-admin` tree returns 0
>   files, so the standing drill-down-parity rule is discharged with nothing owed.

### BorderExportPermitActualAmendmentReport

Title: Border Export Permit Actual Amendment Report
Old source: `BorderAmendReport.rdlc`
Old columns (11): `No.`, `Sakhan`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
New columns (12): `No`, `Sakhan`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Currency`, `HS Code`, `Total Value`
Need in new (0): _None_
Extra in new (1): `HS Code`
_2026-09-04: old columns re-read from the RDLC. Neither `AmendReport.rdlc` nor `BorderAmendReport.rdlc` contains an HSCode textbox (`grep -ic hscode` = 0 on both), so the earlier `HSCode` entry here was a generator artefact. The old `Curency` header typo is counted as the same column as the new `Currency`. All eight reports now render the legacy per-currency footer, and `Licence No` binds to the ORIGINAL licence number (`oldLicenceNo`) while `Licence Amendment No` binds to the amendment number._


### BorderExportPermitAmendmentReport

Title: Border Export Permit Amendment Report
Old source: `BorderAmendReport.rdlc`
Old columns (12): `No.`, `Sakhan`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `HSCode`, `Total Value`
New columns (12): `No`, `Sakhan`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `HSCode`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportPermitByHSCodeReport

Title: Border Export Permit By HS Code Report
Old source: `BorderHSCodeReport.rdlc`, `HSCodeDetailReport.rdlc`
Old columns (7): `Sr.No.`, `HS Code`, `Description`, `No of Licences`, `Total Value`, `Currency`, `Company Name`
New columns (7): `No`, `HS Code`, `Description`, `No of Licences`, `Total Value`, `Currency`, `Company Name`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportPermitBySectionReport

Title: Border Export Permit By Section Report
Old source: `BorderExportPermitBySectionReport.rdlc`
Old columns (5): `Sr.No.`, `Section`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Section`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportPermitBySellerCountryReport

Title: Border Export Permit By Seller Country Report
Old source: `BorderExportPermitByBuyerCountryReport.rdlc`
Old columns (5): `Sr.No.`, `Country`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Country`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportPermitCancellationReport

Title: Border Export Permit Cancellation Report
Old source: `BorderCancelReport.rdlc`
Old columns (13): `No.`, `Sakhan`, `Section`, `Licence No`, `Cancellation No`, `Cancellation Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `HSCode`, `Remark`
New columns (13): `No`, `Sakhan`, `Section`, `Licence No`, `Cancellation No`, `Cancellation Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `HSCode`, `Remark`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportPermitCompanyListReport

Title: Border Export Permit Company List Report
Old source: `BorderExportPermitByCompanyReport.rdlc`
Old columns (5): `Sr.No.`, `Company Name`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Company Name`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportPermitDailyReportNewPermitReport

Title: Border Export Permit Daily Report (New Permit Report)
Old source: `BorderExportPermitByDailyReport.rdlc`
Old columns (5): `Date`, `No of Licences`, `Total Value`, `Currency`, `Total USD Value`
New columns (5): `Date`, `No of Licences`, `Total Value`, `Currency`, `Total USD Value`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportPermitDetailReport

Title: Border Export Permit Detail Report
Old source: `BorderExportPermitDetailReport.rdlc`
Old columns (26): `Sr.No.`, `Section`, `Permit No`, `Permit Date`, `Company Registration No`, `Company Name`, `Company Address`, `Union Citizenship No`, `Consignee Name`, `Consignee Address`, `Buyer Country`, `Place/Port of Export`, `Place/Port of Discharge`, `Last Date`, `Country of Orign`, `Consigned Country`, `Country of Destination`, `Type of Permit`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Conditions`
New columns (26): `No`, `Section`, `Permit No`, `Permit Date`, `Company Registration No`, `Company Name`, `Company Address`, `Union Citizenship No`, `Consignee Name`, `Consignee Address`, `Buyer Country`, `Place/Port of Export`, `Place/Port of Discharge`, `Last Date`, `Country of Orign`, `Consigned Country`, `Country of Destination`, `Type of Permit`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Conditions`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportPermitExtensionReport

Title: Border Export Permit Extension Report
Old source: `BorderExtensionReport.rdlc`
Old columns (11): `No.`, `Sakhan`, `Section`, `Licence No`, `Extension No`, `Extension Last Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
New columns (11): `No`, `Sakhan`, `Section`, `Licence No`, `Extension No`, `Extension Last Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_

### BorderExportPermitNewReportNewReport

Title: Border Export Permit New Report (New Report )
Old source: `BorderNewReport.rdlc`
Old columns (10): `No.`, `Sakhan`, `Section`, `Licence No`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `auto`
New columns (11): `No`, `Sakhan`, `Section`, `Licence No`, `Licence Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `auto`
Need in new (0): _None_
Extra in new (1): `Licence Date`

`Licence Date` is an intentional all-application extension and maps to `BorderExportPermit.IssuedDate`.

### BorderExportPermitVoucherReport

Title: Border Export Permit Voucher Report
Old source: `BorderVoucherReport.rdlc`
Old columns (13): `No.`, `Sakhan`, `Licence No`, `Application Date`, `Application No`, `=Parameters!header2.Value`, `=Parameters!header3.Value`, `Company Registration No`, `Company Name`, `Voucher No`, `Voucher Date`, `Commodity Type`, `Total Amount`
New columns (13): `No`, `Sakhan`, `Licence No`, `Application Date`, `Application No`, `=Parameters!header2.Value`, `=Parameters!header3.Value`, `Company Registration No`, `Company Name`, `Voucher No`, `Voucher Date`, `Commodity Type`, `Total Amount`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportLicenceActualAmendmentReport

Title: Border Import Licence Actual Amendment Report
Old source: `BorderAmendReport.rdlc`
Old columns (11): `No.`, `Sakhan`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
New columns (11): `No`, `Sakhan`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Currency`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_
_2026-09-04: old columns re-read from the RDLC. Neither `AmendReport.rdlc` nor `BorderAmendReport.rdlc` contains an HSCode textbox (`grep -ic hscode` = 0 on both), so the earlier `HSCode` entry here was a generator artefact. The old `Curency` header typo is counted as the same column as the new `Currency`. All eight reports now render the legacy per-currency footer, and `Licence No` binds to the ORIGINAL licence number (`oldLicenceNo`) while `Licence Amendment No` binds to the amendment number._


### BorderImportLicenceAmendmentReport

Title: Border Import Licence Amendment Report
Old source: `BorderAmendReport.rdlc`
Old columns (12): `No.`, `Sakhan`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `HSCode`, `Total Value`
New columns (12): `No`, `Sakhan`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `HSCode`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportLicenceByHSCodeReport

Title: Border Import Licence By HS Code Report
Old source: `BorderHSCodeReport.rdlc` (summary; the `Company Name` column belongs to the `HSCodeDetailReport.rdlc` drill, `BorderImportLicenceHSCodeDetailReport`)
Old columns (6): `Sr.No.`, `HS Code`, `Description`, `No of Licences`, `Total Value`, `Currency`
New columns (6): `Sr.No.`, `HS Code`, `Description`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_
Grain: one row per (HS code, currency) since 2026-09-14 (`BorderHSCodeReport.rdlc:1160-1161`); see `docs/BorderImportLicenceByHSCodeComplaints_2026-09-14.md`.

### BorderImportLicenceByMethodReport

Title: Border Import Licence By Method Report
Old source: `BorderImportLicenceByMethodReport.rdlc`
Old columns (5): `Sr.No.`, `Method`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Method`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportLicenceBySectionReport

Title: Border Import Licence By Section Report
Old source: `BorderImportLicenceBySectionReport.rdlc`
Old columns (5): `Sr.No.`, `Section`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Section`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportLicenceBySellerCountryReport

Title: Border Import Licence By Seller Country Report
Old source: `BorderImportLicenceBySellerCountryReport.rdlc`
Old columns (5): `Sr.No.`, `Country`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Country`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportLicenceCancellationReport

Title: Border Import Licence Cancellation Report
Old source: `BorderCancelReport.rdlc`
Old columns (13): `No.`, `Sakhan`, `Section`, `Licence No`, `Cancellation No`, `Cancellation Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `HSCode`, `Remark`
New columns (13): `No`, `Sakhan`, `Section`, `Licence No`, `Cancellation No`, `Cancellation Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `HSCode`, `Remark`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportLicenceCompanyListReport

Title: Border Import Licence Company List Report
Old source: `BorderImportLicenceByCompanyReport.rdlc`
Old columns (5): `Sr.No.`, `Company Name`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Company Name`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportLicenceDailyReportNewLicenceReport

Title: Border Import Licence Daily Report (New Licence Report)
Old source: `BorderImportLicenceByDailyReport.rdlc`
Old columns (5): `Date`, `No of Licences`, `Total Value`, `Currency`, `Total USD Value`
New columns (5): `Date`, `No of Licences`, `Total Value`, `Currency`, `Total USD Value`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportLicenceDetailReport

Title: Border Import Licence Detail Report
Old source: `BorderImportLicenceDetailReport.rdlc`
Corrected 2026-09-21 against the RDLC XML on `origin/master`: the old column list below previously
read `Create Date`, `Approve Date` here. Both were wrong. The RDLC header row (`rdlc:353`) has 26
columns; column 6 is `Licence Date` (`rdlc:643`, bound to `=Fields!sLicenceDate.Value` at
`rdlc:2116`), and the RDLC has no `Create Date` and no `Approve Date` cell anywhere.
Old columns (26): `Sr.No.`, `Section`, `Application Date`, `Application No`, `Licence No`, `Licence Date`, `Company Registration No`, `Company Name`, `Company Address`, `Seller Name`, `Seller Address`, `Seller Country`, `Place/Port of Discharge`, `Last Date`, `Method`, `Consigned Country`, `Country of Orign`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Commodity Type`, `Conditions`
New columns (27): `No`, `Section`, `Application Date`, `Application No`, `Licence No`, `Licence Date`, `Approve Date`, `Company Registration No`, `Company Name`, `Company Address`, `Seller Name`, `Seller Address`, `Seller Country`, `Place/Port of Discharge`, `Last Date`, `Method`, `Consigned Country`, `Country of Orign`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Commodity Type`, `Conditions`
Need in new (0): _None_
Extra in new (1): `Approve Date` — kept deliberately, pending customer confirmation; not in the legacy RDLC.

### BorderImportLicenceDetailReportPending

Title: Border Import Licence Detail Report (Pending)
Old source: `BorderImportLicenceDetailReport.rdlc` (the legacy Pending binder points at the same
RDLC — `ReportsController.cs:11335`), so its columns are identical to the Detail report above.
Corrected 2026-09-21: see the note under `BorderImportLicenceDetailReport`.
Old columns (26): `Sr.No.`, `Section`, `Application Date`, `Application No`, `Licence No`, `Licence Date`, `Company Registration No`, `Company Name`, `Company Address`, `Seller Name`, `Seller Address`, `Seller Country`, `Place/Port of Discharge`, `Last Date`, `Method`, `Consigned Country`, `Country of Orign`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Commodity Type`, `Conditions`
New columns (27): `No`, `Section`, `Application Date`, `Application No`, `Licence No`, `Licence Date`, `Approve Date`, `Company Registration No`, `Company Name`, `Company Address`, `Seller Name`, `Seller Address`, `Seller Country`, `Place/Port of Discharge`, `Last Date`, `Method`, `Consigned Country`, `Country of Orign`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Commodity Type`, `Conditions`
Need in new (0): _None_
Extra in new (1): `Approve Date` — kept deliberately, pending customer confirmation; not in the legacy RDLC.

### BorderImportLicenceExtensionReport

Title: Border Import Licence Extension Report
Old source: `BorderExtensionReport.rdlc`
Old columns (11): `No.`, `Sakhan`, `Section`, `Licence No`, `Extension No`, `Extension Last Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
New columns (11): `No`, `Sakhan`, `Section`, `Licence No`, `Extension No`, `Extension Last Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportLicenceNewReportNewReport

Title: Border Import Licence New Report (New Report )
Old source: `BorderNewReport.rdlc`
Old columns (10): `No.`, `Sakhan`, `Section`, `Licence No`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `auto`
New columns (11): `No`, `Sakhan`, `Section`, `Licence No`, `Licence Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `auto`
Need in new (0): _None_
Extra in new (1): `Licence Date`

`Licence Date` is an intentional all-application extension and maps to `BorderImportLicence.IssuedDate`.

### BorderImportLicencePendingReport

Title: Border Import Licence Pending Report
Old source: `PendingLicenceReport.rdlc`
Old columns (13): `No.`, `Section`, `Status`, `Apply Type`, `Application No`, `Application Date`, `Company Registration No`, `Company Name`, `Commodity Type`, `HSCode`, `Additional Description`, `Curency`, `Total Value`
New columns (13): `No`, `Section`, `Status`, `Apply Type`, `Application No`, `Application Date`, `Company Registration No`, `Company Name`, `Commodity Type`, `HSCode`, `Additional Description`, `Curency`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportLicenceTotalValueLicencesReport

Title: Border Import Licence Total Value & Licences Report
Old source: `BorderImportLicenceByTotalValueLicenceReport.rdlc`
Old columns (7): `Sr.No.`, `Total Value`, `Currency`, `Sr.No.`, `Total Licences`, `Pa Tha Ka Type`, `Totol USD Value`
New columns (7): `Sr.No.`, `Total Value`, `Currency`, `Sr.No.`, `Total Licences`, `Pa Tha Ka Type`, `Total USD Value`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportLicenceVoucherReport

Title: Border Import Licence Voucher Report
Old source: `VoucherReport.rdlc`, `BorderVoucherReport.rdlc`
Old columns (18): `No.`, `Licence No`, `Application Date`, `=Parameters!header2.Value`, `Application No`, `=Parameters!header3.Value`, `Company Registration No`, `Company Name`, `Lic Value`, `Currency`, `Voucher No`, `Voucher Date`, `Approved User`, `Commodity Type`, `Total CIF`, `Exchange Rate`, `Total Amount`, `Sakhan`
New columns (18): `No`, `Licence No`, `Application Date`, `=Parameters!header2.Value`, `Application No`, `=Parameters!header3.Value`, `Company Registration No`, `Company Name`, `Lic Value`, `Currency`, `Voucher No`, `Voucher Date`, `Approved User`, `Commodity Type`, `Total CIF`, `Exchange Rate`, `Total Amount`, `Sakhan`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportPermitActualAmendmentReport

Title: Border Import Permit Actual Amendment Report
Old source: `BorderAmendReport.rdlc`
Old columns (11): `No.`, `Sakhan`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
New columns (12): `No`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Currency`, `hsCode`, `Total Value`, `Sakhan`
Need in new (0): _None_
Extra in new (1): `hsCode`
_2026-09-04: old columns re-read from the RDLC. Neither `AmendReport.rdlc` nor `BorderAmendReport.rdlc` contains an HSCode textbox (`grep -ic hscode` = 0 on both), so the earlier `HSCode` entry here was a generator artefact. The old `Curency` header typo is counted as the same column as the new `Currency`. All eight reports now render the legacy per-currency footer, and `Licence No` binds to the ORIGINAL licence number (`oldLicenceNo`) while `Licence Amendment No` binds to the amendment number._


### BorderImportPermitAmendmentReport

Title: Border Import Permit Amendment Report
Old source: `AmendReport.rdlc`, `BorderAmendReport.rdlc`
Old columns (12): `No.`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `HSCode`, `Total Value`, `Sakhan`
New columns (12): `No`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `HSCode`, `Total Value`, `Sakhan`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportPermitByHSCodeReport

Title: Border Import Permit By HS Code Report
Old source: `BorderHSCodeReport.rdlc`, `HSCodeDetailReport.rdlc`
Old columns (7): `Sr.No.`, `HS Code`, `Description`, `No of Licences`, `Total Value`, `Currency`, `Company Name`
New columns (7): `No`, `HS Code`, `Description`, `No of Licences`, `Total Value`, `Currency`, `Company Name`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportPermitBySectionReport

Title: Border Import Permit By Section Report
Old source: `BorderImportPermitBySectionReport.rdlc`
Old columns (5): `Sr.No.`, `Section`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Section`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportPermitBySellerCountryReport

Title: Border Import Permit By Seller Country Report
Old source: `BorderImportPermitBySellerCountryReport.rdlc`
Old columns (5): `Sr.No.`, `Country`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Country`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportPermitCancellationReport

Title: Border Import Permit Cancellation Report
Old source: `BorderCancelReport.rdlc`
Old columns (13): `No.`, `Sakhan`, `Section`, `Licence No`, `Cancellation No`, `Cancellation Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `HSCode`, `Remark`
New columns (13): `No`, `Sakhan`, `Section`, `Licence No`, `Cancellation No`, `Cancellation Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `HSCode`, `Remark`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportPermitCompanyListReport

Title: Border Import Permit Company List Report
Old source: `BorderImportPermitByCompanyReport.rdlc`
Old columns (5): `Sr.No.`, `Company Name`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Company Name`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportPermitDailyReportNewPermitReport

Title: Border Import Permit Daily Report (New Permit Report)
Old source: `BorderImportPermitByDailyReport.rdlc`
Old columns (5): `Date`, `No of Licences`, `Total Value`, `Currency`, `Total USD Value`
New columns (5): `Date`, `No of Licences`, `Total Value`, `Currency`, `Total USD Value`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportPermitDetailReport

Title: Border Import Permit Detail Report
Old source: `BorderImportPermitDetailReport.rdlc`
Old columns (24): `Sr.No.`, `Section`, `Permit No`, `Permit Date`, `Company Registration No`, `Company Name`, `Company Address`, `Union Citizenship No`, `Agent Name`, `Agent Address`, `Seller Country`, `Port of Shipment`, `Place/Port of Discharge`, `Last Date`, `Country of Orign`, `Type of Permit`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Conditions`
New columns (24): `No`, `Section`, `Permit No`, `Permit Date`, `Company Registration No`, `Company Name`, `Company Address`, `Union Citizenship No`, `Agent Name`, `Agent Address`, `Seller Country`, `Port of Shipment`, `Place/Port of Discharge`, `Last Date`, `Country of Orign`, `Type of Permit`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Conditions`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportPermitExtensionReport

Title: Border Import Permit Extension Report
Old source: `BorderExtensionReport.rdlc`
Old columns (11): `No.`, `Sakhan`, `Section`, `Licence No`, `Extension No`, `Extension Last Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
New columns (11): `No`, `Sakhan`, `Section`, `Licence No`, `Extension No`, `Extension Last Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_

### BorderImportPermitNewReportNewReport

Title: Border Import Permit New Report (New Report )
Old source: `BorderNewReport.rdlc`
Old columns (10): `No.`, `Sakhan`, `Section`, `Licence No`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `auto`
New columns (11): `No`, `Sakhan`, `Section`, `Licence No`, `Licence Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `auto`
Need in new (0): _None_
Extra in new (1): `Licence Date`

`Licence Date` is an intentional all-application extension and maps to `BorderImportPermit.IssuedDate`.

### BorderImportPermitVoucherReport

Title: Border Import Permit Voucher Report
Old source: `BorderVoucherReport.rdlc`
Old columns (13): `No.`, `Sakhan`, `Licence No`, `Application Date`, `Application No`, `=Parameters!header2.Value`, `=Parameters!header3.Value`, `Company Registration No`, `Company Name`, `Voucher No`, `Voucher Date`, `Commodity Type`, `Total Amount`
New columns (13): `No`, `Sakhan`, `Licence No`, `Application Date`, `Application No`, `=Parameters!header2.Value`, `=Parameters!header3.Value`, `Company Registration No`, `Company Name`, `Voucher No`, `Voucher Date`, `Commodity Type`, `Total Amount`
Need in new (0): _None_
Extra in new (0): _None_

### CardListsByCompanyRegistrationNumber

Title: Card Lists By Company Registration Number
Old source: `CardListsByPaThaKa.rdlc`
Old columns (8): `Company Registration No`, `Company Name`, `Company Address`, `Start Date`, `Valid Date`, `Business Type`, `Line Of Business`, `MIC Permit Number`
New columns (8): `Company Registration No`, `Company Name`, `Company Address`, `Start Date`, `Valid Date`, `Business Type`, `Line Of Business`, `MIC Permit Number`
Need in new (0): _None_
Extra in new (0): _None_

### ChequeNoReport

Title: Cheque No Report
Old source: `ChequeNoReport.rdlc`
Old columns (4): `Cheque Id`, `Cheque No`, `Date`, `Amount`
New columns (4): `Cheque Id`, `Cheque No`, `Date`, `Amount`
Need in new (0): _None_
Extra in new (0): _None_

### ChequeNoDetailReport

Title: Cheque No Detail Report
Old source: `ChequeNoDetailReport.rdlc`
Old columns (10): `No.`, `Cheque No`, `Trxn Ref No.`, `Trxn Date`, `Form Type`, `Licence/Permit/Card No`, `Amount`, `Company Registration No`, `Company Name`, `Company Address`
New columns (10): `No`, `Cheque No`, `Trxn Ref No.`, `Trxn Date`, `Form Type`, `Licence/Permit/Card No`, `Amount`, `Company Registration No`, `Company Name`, `Company Address`
Need in new (0): _None_
Extra in new (0): _None_

### CompanyProfile

Title: Company Profile
Old source: `CompanyProfileReport.rdlc`
Old columns (0): _None_
New columns (18): `Company Registration No`, `Company Name`, `Company Registration Date`, `End Date`, `Business Type`, `Line of Business`, `Unit Level`, `Street Number / Street Name`, `Quarter / City / Township`, `State`, `Country`, `Postal Code`, `Capital`, `Director Name`, `Director NRC`, `Director Position`, `Permit Business`, `Extension Count`
Need in new (0): _None_
Extra in new (18): `Company Registration No`, `Company Name`, `Company Registration Date`, `End Date`, `Business Type`, `Line of Business`, `Unit Level`, `Street Number / Street Name`, `Quarter / City / Township`, `State`, `Country`, `Postal Code`, `Capital`, `Director Name`, `Director NRC`, `Director Position`, `Permit Business`, `Extension Count`

### EIRCardBindReport

Title: EIR Card bind Report
Old source: `PathakaBindReport.rdlc`
Old columns (10): `No`, `Application No`, `Bind Application No`, `Pa Tha Ka No`, `Company Name`, `Application Date`, `Approve Date`, `Status`, `Member Code`, `Email`
New columns (10): `No`, `Application No`, `Bind Application No`, `Pa Tha Ka No`, `Company Name`, `Application Date`, `Approve Date`, `Status`, `Member Code`, `Email`
Need in new (0): _None_
Extra in new (0): _None_

### ExportLicenceActualAmendmentReport

_2026-11-09 request (`Export Reports.pdf`): add `HS Code`, `Description`, and `QTY`
after Company Address, before Currency, in the table and Excel. This intentionally
extends the legacy layout; the existing right-hand HSCode column remains. Filters
and one-row-per-licence behavior are unchanged._

Title: Export Licence Actual Amendment Report
Old source: `AmendReport.rdlc`
Old columns (10): `No.`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
New columns (10): `No`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Currency`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_
_2026-09-04: old columns re-read from the RDLC. Neither `AmendReport.rdlc` nor `BorderAmendReport.rdlc` contains an HSCode textbox (`grep -ic hscode` = 0 on both), so the earlier `HSCode` entry here was a generator artefact. The old `Curency` header typo is counted as the same column as the new `Currency`. All eight reports now render the legacy per-currency footer, and `Licence No` binds to the ORIGINAL licence number (`oldLicenceNo`) while `Licence Amendment No` binds to the amendment number._


### ExportLicenceAmendmentReport

_2026-11-09 request (`Export Reports.pdf`): add `HS Code`, `Description`, and `QTY`
after Company Address, before Currency, in the table and Excel. This intentionally
extends the legacy layout. Filters and one-row-per-licence behavior are unchanged._

Title: Export Licence Amendment Report
Old source: `AmendReport.rdlc`
Old columns (11): `No.`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `HSCode`, `Total Value`
New columns (11): `No`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `HSCode`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_

### ExportLicenceByHSCodeReport

Title: Export Licence By HS Code Report
Old source: `HSCodeReport.rdlc`, `HSCodeDetailReport.rdlc`
Old columns (7): `Sr.No.`, `HS Code`, `Description`, `No of Licences`, `Total Value`, `Currency`, `Company Name`
New columns (7): `No`, `HS Code`, `Description`, `No of Licences`, `Total Value`, `Currency`, `Company Name`
Need in new (0): _None_
Extra in new (0): _None_

### ExportLicenceByMethodReport

Title: Export Licence By Method Report
Old source: `ExportLicenceByMethodReport.rdlc`
Old columns (5): `Sr.No.`, `Method`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Method`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### ExportLicenceBySectionReport

Title: Export Licence By Section Report
Old source: `ExportLicenceBySectionReport.rdlc`
Old columns (5): `Sr.No.`, `Section`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Section`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### ExportLicenceBySellerCountryReport

Title: Export Licence By Seller Country Report
Old source: `ExportLicenceByBuyerCountryReport.rdlc`
Old columns (5): `Sr.No.`, `Country`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Country`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### ExportLicenceCancellationReport

_2026-11-09 request (`Export Reports.pdf`): add `HS Code`, `Description`, and `QTY`
after Company Address, before Currency, in the table and Excel. The sample retains
the existing HS Code column beside Total Value; both positions are preserved.
Filters, licence counts, and currency totals are unchanged._

Title: Export Licence Cancellation Report
Old source: `CancelReport.rdlc`
Old columns (12): `No.`, `HSCode`, `Section`, `Licence No`, `Cancellation No`, `Cancellation Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `Remark`
New columns (12): `No`, `HSCode`, `Section`, `Licence No`, `Cancellation No`, `Cancellation Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `Remark`
Need in new (0): _None_
Extra in new (0): _None_

### ExportLicenceCompanyListReport

Title: Export Licence Company List Report
Old source: `ExportLicenceByCompanyReport.rdlc`
Old columns (5): `Sr.No.`, `Company Name`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Company Name`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### ExportLicenceDailyReportNewLicenceReport

Title: Export Licence Daily Report (New Licence Report)
Old source: `ExportLicenceByDailyReport.rdlc`
Old columns (5): `Date`, `No of Licences`, `Total Value`, `Currency`, `Total USD Value`
New columns (5): `Date`, `No of Licences`, `Total Value`, `Currency`, `Total USD Value`
Need in new (0): _None_
Extra in new (0): _None_

### ExportLicenceDetailReport

Title: Export Licence Detail Report
Old source: `ExportLicenceDetailReport.rdlc`
Old columns (28): `Sr.No.`, `Section`, `Application Date`, `Application No`, `Licence No`, `Licence Date`, `Company Registration No`, `Company Name`, `Company Address`, `Buyer Name`, `Buyer Address`, `Buyer Country`, `Place/Port of Export`, `Place/Port of Discharge`, `Last Date`, `Method`, `Consigned Country`, `Country of Orign`, `Country of Destination`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Commodity Type`, `Conditions`
New columns (28): `No`, `Section`, `Application Date`, `Application No`, `Licence No`, `Licence Date`, `Company Registration No`, `Company Name`, `Company Address`, `Buyer Name`, `Buyer Address`, `Buyer Country`, `Place/Port of Export`, `Place/Port of Discharge`, `Last Date`, `Method`, `Consigned Country`, `Country of Orign`, `Country of Destination`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Commodity Type`, `Conditions`
Need in new (0): _None_
Extra in new (0): _None_

### ExportLicenceExtensionReport

Title: Export Licence Extension Report
Old source: `ExtensionReport.rdlc`
Old columns (10): `No.`, `Section`, `Licence No`, `Extension No`, `Extension Last Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
New columns (10): `No`, `Section`, `Licence No`, `Extension No`, `Extension Last Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_

### ExportLicenceNewReportNewReport

Title: Export Licence New Report (New Report )
Old source: `NewLicenceReport.rdlc`
Old columns (12): `No.`, `Section`, `Licence No`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `Commodity Type`, `HSCode`, `quota`, `auto`
New columns (13): `No`, `Section`, `Licence No`, `Licence Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `Commodity Type`, `HSCode`, `quota`, `auto`
Need in new (0): _None_
Extra in new (1): `Licence Date`

`Licence Date` is an intentional all-application extension and maps to `ExportLicence.IssuedDate`.

### ExportLicenceTotalValueLicencesReport

Title: Export Licence Total Value & Licences Report
Old source: `ExportLicenceByTotalValueLicenceReport.rdlc`
Old columns (3): `Sr.No.`, `Total Value`, `Currency`
New columns (3): `No`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### ExportLicenceVoucherReport

Title: Export Licence Voucher Report
Old source: `VoucherReport_Export.rdlc`
Old columns (15): `No.`, `Licence No`, `Application Date`, `=Parameters!header2.Value`, `Application No`, `=Parameters!header3.Value`, `Company Registration No`, `Company Name`, `Lic Value`, `Currency`, `Voucher No`, `Voucher Date`, `Approved User`, `Commodity Type`, `Total Amount`
New columns (15): `No`, `Licence No`, `Application Date`, `=Parameters!header2.Value`, `Application No`, `=Parameters!header3.Value`, `Company Registration No`, `Company Name`, `Lic Value`, `Currency`, `Voucher No`, `Voucher Date`, `Approved User`, `Commodity Type`, `Total Amount`
Need in new (0): _None_
Extra in new (0): _None_

### ExportPermitActualAmendmentReport

Title: Export Permit Actual Amendment Report
Old source: `AmendReport.rdlc`
Old columns (10): `No.`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
New columns (11): `No`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `HS Code`, `Currency`, `Total Value`
Need in new (0): _None_
Extra in new (1): `HS Code`
_2026-09-04: old columns re-read from the RDLC. Neither `AmendReport.rdlc` nor `BorderAmendReport.rdlc` contains an HSCode textbox (`grep -ic hscode` = 0 on both), so the earlier `HSCode` entry here was a generator artefact. The old `Curency` header typo is counted as the same column as the new `Currency`. All eight reports now render the legacy per-currency footer, and `Licence No` binds to the ORIGINAL licence number (`oldLicenceNo`) while `Licence Amendment No` binds to the amendment number._


### ExportPermitAmendmentReport

Title: Export Permit Amendment Report
Old source: `AmendReport.rdlc`
Old columns (11): `No.`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `HSCode`, `Total Value`
New columns (11): `No`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `HSCode`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_

### ExportPermitByHSCodeReport

Title: Export Permit By HS Code Report
Old source: `HSCodeReport.rdlc`, `HSCodeDetailReport.rdlc`
Old columns (7): `Sr.No.`, `HS Code`, `Description`, `No of Licences`, `Total Value`, `Currency`, `Company Name`
New columns (7): `No`, `HS Code`, `Description`, `No of Licences`, `Total Value`, `Currency`, `Company Name`
Need in new (0): _None_
Extra in new (0): _None_

### ExportPermitBySectionReport

Title: Export Permit By Section Report
Old source: `ExportPermitBySectionReport.rdlc`
Old columns (5): `Sr.No.`, `Section`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Section`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### ExportPermitBySellerCountryReport

Title: Export Permit By Seller Country Report
Old source: `ExportPermitByBuyerCountryReport.rdlc`
Old columns (5): `Sr.No.`, `Country`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Country`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### ExportPermitCancellationReport

Title: Export Permit Cancellation Report
Old source: `CancelReport.rdlc`
Old columns (12): `No.`, `HSCode`, `Section`, `Licence No`, `Cancellation No`, `Cancellation Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `Remark`
New columns (12): `No`, `HSCode`, `Section`, `Licence No`, `Cancellation No`, `Cancellation Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `Remark`
Need in new (0): _None_
Extra in new (0): _None_

### ExportPermitCompanyListReport

Title: Export Permit Company List Report
Old source: `ExportPermitByCompanyReport.rdlc`
Old columns (5): `Sr.No.`, `Company Name`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Company Name`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### ExportPermitDailyReportNewPermitReport

Title: Export Permit Daily Report (New Permit Report)
Old source: `ExportPermitByDailyReport.rdlc`
Old columns (5): `Date`, `No of Licences`, `Total Value`, `Currency`, `Total USD Value`
New columns (5): `Date`, `No of Licences`, `Total Value`, `Currency`, `Total USD Value`
Need in new (0): _None_
Extra in new (0): _None_

### ExportPermitDetailReport

Title: Export Permit Detail Report
Old source: `ExportPermitDetailReport.rdlc`
Old columns (26): `Sr.No.`, `Section`, `Permit No`, `Permit Date`, `Company Registration No`, `Company Name`, `Company Address`, `Union Citizenship No`, `Consignee Name`, `Consignee Address`, `Buyer Country`, `Place/Port of Export`, `Place/Port of Discharge`, `Last Date`, `Country of Orign`, `Consigned Country`, `Country of Destination`, `Type of Permit`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Conditions`
New columns (26): `No`, `Section`, `Permit No`, `Permit Date`, `Company Registration No`, `Company Name`, `Company Address`, `Union Citizenship No`, `Consignee Name`, `Consignee Address`, `Buyer Country`, `Place/Port of Export`, `Place/Port of Discharge`, `Last Date`, `Country of Orign`, `Consigned Country`, `Country of Destination`, `Type of Permit`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Conditions`
Need in new (0): _None_
Extra in new (0): _None_

### ExportPermitExtensionReport

Title: Export Permit Extension Report
Old source: `ExtensionReport.rdlc`
Old columns (10): `No.`, `Section`, `Licence No`, `Extension No`, `Extension Last Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
New columns (10): `No`, `Section`, `Licence No`, `Extension No`, `Extension Last Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_

### ExportPermitNewReportNewReport

Title: Export Permit New Report (New Report )
Old source: `NewLicenceReport.rdlc`
Old columns (12): `No.`, `Section`, `Licence No`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `Commodity Type`, `HSCode`, `quota`, `auto`
New columns (13): `No`, `Section`, `Licence No`, `Licence Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `Commodity Type`, `HSCode`, `quota`, `auto`
Need in new (0): _None_
Extra in new (1): `Licence Date`

`Licence Date` is an intentional all-application extension and maps to `ExportPermit.IssuedDate`.

### ExportPermitVoucherReport

Title: Export Permit Voucher Report
Old source: `VoucherReport.rdlc`
Old columns (17): `No.`, `Licence No`, `Application Date`, `=Parameters!header2.Value`, `Application No`, `=Parameters!header3.Value`, `Company Registration No`, `Company Name`, `Lic Value`, `Currency`, `Voucher No`, `Voucher Date`, `Approved User`, `Commodity Type`, `Total CIF`, `Exchange Rate`, `Total Amount`
New columns (12): `No`, `Licence No`, `Application No`, `Licence Date`, `Company Registration No`, `Company Name`, `Lic Value`, `Currency`, `Voucher No`, `Voucher Date`, `Approved User`, `Total Amount`
Need in new (6): `Application Date`, `=Parameters!header2.Value`, `=Parameters!header3.Value`, `Commodity Type`, `Total CIF`, `Exchange Rate`
Extra in new (1): `Licence Date`

### ImportLicenceActualAmendmentReport

Title: Import Licence Actual Amendment Report
Old source: `AmendReport.rdlc`
Old columns (10): `No.`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
New columns (11): `No`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Currency`, `hsCode`, `Total Value`
Need in new (0): _None_
Extra in new (1): `hsCode`
_2026-09-04: old columns re-read from the RDLC. Neither `AmendReport.rdlc` nor `BorderAmendReport.rdlc` contains an HSCode textbox (`grep -ic hscode` = 0 on both), so the earlier `HSCode` entry here was a generator artefact. The old `Curency` header typo is counted as the same column as the new `Currency`. All eight reports now render the legacy per-currency footer, and `Licence No` binds to the ORIGINAL licence number (`oldLicenceNo`) while `Licence Amendment No` binds to the amendment number._


### ImportLicenceAmendmentReport

Title: Import Licence Amendment Report
Old source: `AmendReport.rdlc`
Old columns (11): `No.`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `HSCode`, `Total Value`
New columns (11): `No`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `HSCode`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_

### ImportLicenceByHSCodeReport

Title: Import Licence By HS Code Report
Old source: `HSCodeReport.rdlc`, `HSCodeDetailReport.rdlc`
Old columns (7): `Sr.No.`, `HS Code`, `Description`, `No of Licences`, `Total Value`, `Currency`, `Company Name`
New columns (7): `No`, `HS Code`, `Description`, `No of Licences`, `Total Value`, `Currency`, `Company Name`
Need in new (0): _None_
Extra in new (0): _None_

### ImportLicenceByMethodReport

Title: Import Licence By Method Report
Old source: `ImportLicenceByMethodReport.rdlc`
Old columns (5): `Sr.No.`, `Method`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Method`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### ImportLicenceBySectionReport

Title: Import Licence By Section Report
Old source: `ImportLicenceBySectionReport.rdlc`
Old columns (5): `Sr.No.`, `Section`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Section`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### ImportLicenceBySellerCountryReport

Title: Import Licence By Seller Country Report
Old source: `ImportLicenceBySellerCountryReport.rdlc`
Old columns (5): `Sr.No.`, `Country`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Country`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### ImportLicenceCancellationReport

Title: Import Licence Cancellation Report
Old source: `CancelReport.rdlc`
Old columns (12): `No.`, `HSCode`, `Section`, `Licence No`, `Cancellation No`, `Cancellation Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `Remark`
New columns (12): `No`, `HSCode`, `Section`, `Licence No`, `Cancellation No`, `Cancellation Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `Remark`
Need in new (0): _None_
Extra in new (0): _None_

### ImportLicenceCompanyListReport

Title: Import Licence Company List Report
Old source: `ImportLicenceByCompanyReport.rdlc`
Old columns (5): `Sr.No.`, `Company Name`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Company Name`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### ImportLicenceDailyReportNewLicenceReport

Title: Import Licence Daily Report (New Licence Report)
Old source: `ImportLicenceByDailyReport.rdlc`
Old columns (5): `Date`, `No of Licences`, `Total Value`, `Currency`, `Total USD Value`
New columns (5): `Date`, `No of Licences`, `Total Value`, `Currency`, `Total USD Value`
Need in new (0): _None_
Extra in new (0): _None_

### ImportLicenceDetailReport

Title: Import Licence Detail Report
Old source: `ImportLicenceDetailReport.rdlc`
Old columns (26): `Sr.No.`, `Section`, `Application Date`, `Application No`, `Licence No`, `Licence Date`, `Company Registration No`, `Company Name`, `Company Address`, `Seller Name`, `Seller Address`, `Seller Country`, `Place/Port of Discharge`, `Last Date`, `Method`, `Consigned Country`, `Country of Orign`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Commodity Type`, `Conditions`
New columns (26): `No`, `Section`, `Application Date`, `Application No`, `Licence No`, `Licence Date`, `Company Registration No`, `Company Name`, `Company Address`, `Seller Name`, `Seller Address`, `Seller Country`, `Place/Port of Discharge`, `Last Date`, `Method`, `Consigned Country`, `Country of Orign`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Commodity Type`, `Conditions`
Need in new (0): _None_
Extra in new (0): _None_

### ImportLicenceDetailReportPending

Title: Import Licence Detail Report (Pending)
Old source: `ImportLicenceDetailReport.rdlc`
Old columns (26): `Sr.No.`, `Section`, `Application Date`, `Application No`, `Licence No`, `Licence Date`, `Company Registration No`, `Company Name`, `Company Address`, `Seller Name`, `Seller Address`, `Seller Country`, `Place/Port of Discharge`, `Last Date`, `Method`, `Consigned Country`, `Country of Orign`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Commodity Type`, `Conditions`
New columns (26): `No`, `Section`, `Application Date`, `Application No`, `Licence No`, `Licence Date`, `Company Registration No`, `Company Name`, `Company Address`, `Seller Name`, `Seller Address`, `Seller Country`, `Place/Port of Discharge`, `Last Date`, `Method`, `Consigned Country`, `Country of Orign`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Commodity Type`, `Conditions`
Need in new (0): _None_
Extra in new (0): _None_

### ImportLicenceExtensionReport

Title: Import Licence Extension Report
Old source: `ExtensionReport.rdlc`
Old columns (10): `No.`, `Section`, `Licence No`, `Extension No`, `Extension Last Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
New columns (10): `No`, `Section`, `Licence No`, `Extension No`, `Extension Last Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_

### ImportLicenceNewReportNewReport

Title: Import Licence New Report (New Report )
Old source: `NewLicenceReport.rdlc`
Old columns (12): `No.`, `Section`, `Licence No`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `Commodity Type`, `HSCode`, `quota`, `auto`
New columns (13): `No`, `Section`, `Licence No`, `Licence Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `Commodity Type`, `HSCode`, `quota`, `auto`
Need in new (0): _None_
Extra in new (1): `Licence Date`

`Licence Date` is the requested all-application extension beyond the old RDLC layout. It maps to `ImportLicence.IssuedDate`, the issued/date-of-issue value shown in Tradenet 2.0, rather than the similarly named database `LicenceDate` timestamp. The previously added `Online No`, `Online Date`, and `Remark` columns were removed from the visible table and Excel output. The existing filter set and values are unchanged.

### ImportLicencePendingReport

Title: Import Licence Pending Report
Old source: `PendingLicenceReport.rdlc`
Old columns (13): `No.`, `Section`, `Status`, `Apply Type`, `Application No`, `Application Date`, `Company Registration No`, `Company Name`, `Commodity Type`, `HSCode`, `Additional Description`, `Curency`, `Total Value`
New columns (13): `No`, `Section`, `Status`, `Apply Type`, `Application No`, `Application Date`, `Company Registration No`, `Company Name`, `Commodity Type`, `HSCode`, `Additional Description`, `Curency`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_

### ImportLicenceTotalValueLicencesReport

Title: Import Licence Total Value & Licences Report
Old source: `ImportLicenceByTotalValueLicenceReport.rdlc`
Old columns (3): `Sr.No.`, `Total Value`, `Currency`
New columns (3): `No`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### ImportLicenceVoucherReport

Title: Import Licence Voucher Report
Old source: `VoucherReport.rdlc`
Old columns (17): `No.`, `Licence No`, `Application Date`, `=Parameters!header2.Value`, `Application No`, `=Parameters!header3.Value`, `Company Registration No`, `Company Name`, `Lic Value`, `Currency`, `Voucher No`, `Voucher Date`, `Approved User`, `Commodity Type`, `Total CIF`, `Exchange Rate`, `Total Amount`
New columns (17): `No`, `Licence No`, `Application Date`, `=Parameters!header2.Value`, `Application No`, `=Parameters!header3.Value`, `Company Registration No`, `Company Name`, `Lic Value`, `Currency`, `Voucher No`, `Voucher Date`, `Approved User`, `Commodity Type`, `Total CIF`, `Exchange Rate`, `Total Amount`
Need in new (0): _None_
Extra in new (0): _None_

### ImportPermitActualAmendmentReport

Title: Import Permit Actual Amendment Report
Old source: `AmendReport.rdlc`
Old columns (10): `No.`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
New columns (11): `No`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Currency`, `hsCode`, `Total Value`
Need in new (0): _None_
Extra in new (1): `hsCode`
_2026-09-04: old columns re-read from the RDLC. Neither `AmendReport.rdlc` nor `BorderAmendReport.rdlc` contains an HSCode textbox (`grep -ic hscode` = 0 on both), so the earlier `HSCode` entry here was a generator artefact. The old `Curency` header typo is counted as the same column as the new `Currency`. All eight reports now render the legacy per-currency footer, and `Licence No` binds to the ORIGINAL licence number (`oldLicenceNo`) while `Licence Amendment No` binds to the amendment number._


### ImportPermitAmendmentReport

Title: Import Permit Amendment Report
Old source: `AmendReport.rdlc`
Old columns (11): `No.`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `HSCode`, `Total Value`
New columns (11): `No`, `Section`, `Licence No`, `Licence Amendment No`, `Amendment Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `HSCode`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_

### ImportPermitByHSCodeReport

Title: Import Permit By HS Code Report
Old source: `HSCodeReport.rdlc`, `HSCodeDetailReport.rdlc`
Old columns (7): `Sr.No.`, `HS Code`, `Description`, `No of Licences`, `Total Value`, `Currency`, `Company Name`
New columns (7): `No`, `HS Code`, `Description`, `No of Licences`, `Total Value`, `Currency`, `Company Name`
Need in new (0): _None_
Extra in new (0): _None_

### ImportPermitBySectionReport

Title: Import Permit By Section Report
Old source: `ImportPermitBySectionReport.rdlc`
Old columns (5): `Sr.No.`, `Section`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Section`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### ImportPermitBySellerCountryReport

Title: Import Permit By Seller Country Report
Old source: `ImportPermitBySellerCountryReport.rdlc`
Old columns (5): `Sr.No.`, `Country`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Country`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### ImportPermitCancellationReport

Title: Import Permit Cancellation Report
Old source: `CancelReport.rdlc`
Old columns (12): `No.`, `HSCode`, `Section`, `Licence No`, `Cancellation No`, `Cancellation Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `Remark`
New columns (12): `No`, `HSCode`, `Section`, `Licence No`, `Cancellation No`, `Cancellation Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `Remark`
Need in new (0): _None_
Extra in new (0): _None_

### ImportPermitCompanyListReport

Title: Import Permit Company List Report
Old source: `ImportPermitByCompanyReport.rdlc`
Old columns (5): `Sr.No.`, `Company Name`, `No of Licences`, `Total Value`, `Currency`
New columns (5): `No`, `Company Name`, `No of Licences`, `Total Value`, `Currency`
Need in new (0): _None_
Extra in new (0): _None_

### ImportPermitDailyReportNewPermitReport

Title: Import Permit Daily Report (New Permit Report)
Old source: `ImportPermitByDailyReport.rdlc`
Old columns (5): `Date`, `No of Licences`, `Total Value`, `Currency`, `Total USD Value`
New columns (5): `Date`, `No of Licences`, `Total Value`, `Currency`, `Total USD Value`
Need in new (0): _None_
Extra in new (0): _None_

### ImportPermitTotalValuePermitsReport

Title: Import Permit Total Value & Permits Report
Reference source: `ImportLicenceByTotalValueLicenceReport.rdlc` (Tradenet 2.0 has no Permit counterpart; this is the assignment's requested sibling report)
Reference filters (4): `From Date`, `To Date`, `EIR Card Type`, `Import Section` (`Type=Oversea` is hidden)
New filters (4): `From Date`, `To Date`, `EIR Card Type`, `Import Section` (`Type=Oversea` is hidden)
Reference table 1 columns (3): `Sr.No.`, `Total Value`, `Currency`
New table 1 columns (3): `Sr.No.`, `Total Value`, `Currency`
Reference table 2 columns (3): `Sr.No.`, `Total Licences`, `Pa Tha Ka Type`
New table 2 columns (3): `Sr.No.`, `Total Permits`, `Pa Tha Ka Type`
Summary line: `Total USD Value`
Need in new (0): _None_
Extra in new (0): _None_

### ImportPermitDetailReport

Title: Import Permit Detail Report
Old source: `ImportPermitDetailReport.rdlc`
Old columns (24): `Sr.No.`, `Section`, `Permit No`, `Permit Date`, `Company Registration No`, `Company Name`, `Company Address`, `Union Citizenship No`, `Agent Name`, `Agent Address`, `Seller Country`, `Port of Shipment`, `Place/Port of Discharge`, `Last Date`, `Country of Orign`, `Type of Permit`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Conditions`
New columns (24): `No`, `Section`, `Permit No`, `Permit Date`, `Company Registration No`, `Company Name`, `Company Address`, `Union Citizenship No`, `Agent Name`, `Agent Address`, `Seller Country`, `Port of Shipment`, `Place/Port of Discharge`, `Last Date`, `Country of Orign`, `Type of Permit`, `HSCode`, `Decription`, `A/U`, `Price`, `Qty`, `Value`, `Currency`, `Conditions`
Need in new (0): _None_
Extra in new (0): _None_

### ImportPermitExtensionReport

Title: Import Permit Extension Report
Old source: `ExtensionReport.rdlc`
Old columns (10): `No.`, `Section`, `Licence No`, `Extension No`, `Extension Last Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
New columns (10): `No`, `Section`, `Licence No`, `Extension No`, `Extension Last Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`
Need in new (0): _None_
Extra in new (0): _None_

### ImportPermitNewReportNewReport

Title: Import Permit New Report (New Report )
Old source: `NewLicenceReport.rdlc`
Old columns (12): `No.`, `Section`, `Licence No`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `Commodity Type`, `HSCode`, `quota`, `auto`
New columns (13): `No`, `Section`, `Licence No`, `Licence Date`, `Company Registration No`, `Company Name`, `Company Address`, `Curency`, `Total Value`, `Commodity Type`, `HSCode`, `quota`, `auto`
Need in new (0): _None_
Extra in new (1): `Licence Date`

`Licence Date` is an intentional all-application extension and maps to `ImportPermit.IssuedDate`.

### ImportPermitVoucherReport

Title: Import Permit Voucher Report
Old source: `VoucherReport.rdlc`
Old columns (17): `No.`, `Licence No`, `Application Date`, `=Parameters!header2.Value`, `Application No`, `=Parameters!header3.Value`, `Company Registration No`, `Company Name`, `Lic Value`, `Currency`, `Voucher No`, `Voucher Date`, `Approved User`, `Commodity Type`, `Total CIF`, `Exchange Rate`, `Total Amount`
New columns (12): `No`, `Licence No`, `Application No`, `Licence Date`, `Company Registration No`, `Company Name`, `Lic Value`, `Currency`, `Voucher No`, `Voucher Date`, `Approved User`, `Total Amount`
Need in new (6): `Application Date`, `=Parameters!header2.Value`, `=Parameters!header3.Value`, `Commodity Type`, `Total CIF`, `Exchange Rate`
Extra in new (1): `Licence Date`

### ListOfCompany

Title: List of Company
Old source: `PaThaKaAllReport.rdlc`
Old columns (20): `No.`, `Company Registration No`, `Company Name`, `Owner Name`, `Owner NRC No`, `Company Registration Date`, `Valid Date`, `Business Type`, `Line of Business`, `MICPermit No`, `Company Address`, `Mobile`, `Fax`, `Email`, `Capital`, `Currency`, `Registration Term`, `Decision Date`, `Decision Maker`, `Status`
New columns (20): `No`, `Company Registration No`, `Company Name`, `Owner Name`, `Owner NRC No`, `Company Registration Date`, `Valid Date`, `Business Type`, `Line of Business`, `MICPermit No`, `Company Address`, `Mobile`, `Fax`, `Email`, `Capital`, `Currency`, `Registration Term`, `Decision Date`, `Decision Maker`, `Status`
Need in new (0): _None_
Extra in new (0): _None_

### ListOfDirectorsByCompanyRegistrationNo

Title: List of Directors By Company Registration No
Old source: `DirectorListByCompanyRegistrationNoReport.rdlc`
Old columns (7): `Company Registration No`, `Company Name`, `Company Address`, `Company Registration Date`, `Valid Date`, `Business Type`, `Line of Business`
New columns (7): `Company Registration No`, `Company Name`, `Company Address`, `Company Registration Date`, `Valid Date`, `Business Type`, `Line of Business`
Need in new (0): _None_
Extra in new (0): _None_

### ListOfDirectors

Title: List of Directors
Old source: `DirectorListReport.rdlc`
Old columns (8): `No.`, `Company Registration No`, `Company Name`, `Name`, `Position`, `NRC No.`, `Nationality`, `Status`
New columns (8): `No`, `Company Registration No`, `Company Name`, `Name`, `Position`, `NRC No.`, `Nationality`, `Status`
Need in new (0): _None_
Extra in new (0): _None_

### ListOfTopCapitalCompany

Title: List of Top Capital Company
Old source: `TopCapitalCompanyReport.rdlc`
Old columns (9): `No.`, `Company Registration No`, `Company Name`, `Company Registration Date`, `Valid Date`, `Business Type`, `Line of Business`, `Company Address`, `Capital Amount`
New columns (9): `No`, `Company Registration No`, `Company Name`, `Company Registration Date`, `Valid Date`, `Business Type`, `Line of Business`, `Company Address`, `Capital Amount`
Need in new (0): _None_
Extra in new (0): _None_

### ListOfValidAndInvalidCompany

Title: List of Valid and Invalid Company
Old source: `ValidInvalidCompanyReport.rdlc`
Old columns (9): `No.`, `Company Registration No`, `Company Name`, `Company Registration Date`, `Issued Date`, `Valid Date`, `Business Type`, `Line of Business`, `Company Address`
New columns (9): `No`, `Company Registration No`, `Company Name`, `Company Registration Date`, `Issued Date`, `Valid Date`, `Business Type`, `Line of Business`, `Company Address`
Need in new (0): _None_
Extra in new (0): _None_

### MemberRegistrationReport

Title: Member Registration Report
Old source: `MemberRegistrationReport.rdlc`
Old columns (9): `No.`, `Apply Type`, `Member Code`, `Email`, `Full Name`, `Mobile`, `NRC No.`, `Issued Date`, `Valid Date`
New columns (9): `No`, `Apply Type`, `Member Code`, `Email`, `Full Name`, `Mobile`, `NRC No.`, `Issued Date`, `Valid Date`
Need in new (0): _None_
Extra in new (0): _None_

### MPUReport

Title: MPU Report
Old source: `MPUReport.rdlc`
Old columns (19): `No.`, `Sakhan`, `Company Name`, `Company Registration No`, `Application No`, `Trxn Date`, `Form Type`, `Application Type`, `MID`, `Card No`, `Invoice No`, `APP Code`, `Trxn Ref No.`, `Trxn Amount`, `MOC`, `IM`, `MPU`, `Voucher No`, `Amount Diff`
New columns (19): `No`, `Sakhan`, `Company Name`, `Company Registration No`, `Application No`, `Trxn Date`, `Form Type`, `Application Type`, `MID`, `Card No`, `Invoice No`, `APP Code`, `Trxn Ref No.`, `Trxn Amount`, `MOC`, `IM`, `MPU Amount`, `Voucher No`, `Amount Diff`
Need in new (1): `MPU`
Extra in new (1): `MPU Amount`

### MPUReportV3

Title: MPU Report V3
Old source: `MPUReport.rdlc`
Old columns (19): `No.`, `Sakhan`, `Company Name`, `Company Registration No`, `Application No`, `Trxn Date`, `Form Type`, `Application Type`, `MID`, `Card No`, `Invoice No`, `APP Code`, `Trxn Ref No.`, `Trxn Amount`, `MOC`, `IM`, `MPU`, `Voucher No`, `Amount Diff`
New columns (19): `No`, `Sakhan`, `Company Name`, `Company Registration No`, `Application No`, `Trxn Date`, `Form Type`, `Application Type`, `MID`, `Card No`, `Invoice No`, `APP Code`, `Trxn Ref No.`, `Trxn Amount`, `MOC`, `IM`, `MPU Amount`, `Voucher No`, `Amount Diff`
Need in new (1): `MPU`
Extra in new (1): `MPU Amount`

### OnlineFeesReport

Title: Online Fees Report
Old source: `OnlineFeesReport.rdlc`
Old columns (7): `No`, `Entry Date`, `Company Registration No`, `Company Name`, `Transaction Title`, `Deducted Fees`, `Remark`
New columns (7): `No`, `Entry Date`, `Company Registration No`, `Company Name`, `Transaction Title`, `Deducted Fees`, `Remark`
Need in new (0): _None_
Extra in new (0): _None_

### PaThaKaRegisteredBusinessOrganizationReport

Title: PaThaKa Registered Business Organization Report
Old source: `RegisteredBusinessOrganizationReport.rdlc`
Old columns (9): `No.`, `Company Registration No`, `Company Name`, `Company Registration Date`, `Valid Date`, `Business Type`, `Line of Business`, `MICPermit No`, `Company Address`
New columns (9): `No`, `Company Registration No`, `Company Name`, `Company Registration Date`, `Valid Date`, `Business Type`, `Line of Business`, `MICPermit No`, `Company Address`
Need in new (0): _None_
Extra in new (0): _None_

### RegistrationByBusinessType

Title: Registration By Business Type
Old source: `PaThaKaRegistrationByBusinessTypeReport.rdlc`
Old columns (3): `No.`, `Business Type`, `Total`
New columns (3): `No`, `Business Type`, `Total`
Need in new (0): _None_
Extra in new (0): _None_

### RegistrationByVoucher

Title: Registration By Voucher
Old source: `PaThaKaRegistrationByVoucherReport.rdlc`
Old columns (9): `No.`, `Date`, `Company Registration No`, `Company Name`, `Company Address`, `Total Amount`, `Payment Type`, `Voucher No`, `Voucher Date`
New columns (9): `No`, `Date`, `Company Registration No`, `Company Name`, `Company Address`, `Total Amount`, `Payment Type`, `Voucher No`, `Voucher Date`
Need in new (0): _None_
Extra in new (0): _None_

### WholeSaleSummaryReport

Title: Whole Sale Summary Report
Old source: `WholeSaleSummaryReport.rdlc`
Old columns (1): `Total Number`
New columns (3): `No`, `Apply Type`, `Application Count`
Need in new (1): `Total Number`
Extra in new (3): `No`, `Apply Type`, `Application Count`

### WholeSaleDetailReport

Title: Whole Sale Detail Report
Old source: `WholeSaleDetailReport.rdlc`
Old columns (8): `No.`, `Company Registration No`, `Whole Sale No`, `Company Name`, `Company Address`, `Whole Sale Address`, `Issued Date`, `Valid Date`
New columns (8): `No`, `Company Registration No`, `Whole Sale Retail No`, `Company Name`, `Company Address`, `Whole Sale Retail Address`, `Issued Date`, `End Date`
Need in new (2): `Whole Sale No`, `Whole Sale Address`
Extra in new (2): `Whole Sale Retail No`, `Whole Sale Retail Address`

### WholeSaleRegistrationByVoucher

Title: WholeSale Registration By Voucher
Old source: _No match found_
Old columns (0): _None_
New columns (12): `No`, `Date`, `Company Registration No`, `Company Name`, `Company Address`, `Whole Sale Retail No`, `Whole Sale Retail Name`, `Whole Sale Retail Address`, `Payment Type`, `Voucher No`, `Voucher Date`, `Total Amount`
Need in new (0): _None_
Extra in new (12): `No`, `Date`, `Company Registration No`, `Company Name`, `Company Address`, `Whole Sale Retail No`, `Whole Sale Retail Name`, `Whole Sale Retail Address`, `Payment Type`, `Voucher No`, `Voucher Date`, `Total Amount`

### RetailSummaryReport

Title: Retail Summary Report
Old source: `RetailSummaryReport.rdlc`
Old columns (1): `Total Number`
New columns (3): `No`, `Apply Type`, `Application Count`
Need in new (1): `Total Number`
Extra in new (3): `No`, `Apply Type`, `Application Count`

### RetailDetailReport

Title: Retail Detail Report
Old source: `RetailDetailReport.rdlc`
Old columns (8): `No.`, `Company Registration No`, `Retail No`, `Company Name`, `Company Address`, `Retail Address`, `Issued Date`, `Valid Date`
New columns (8): `No`, `Company Registration No`, `Whole Sale Retail No`, `Company Name`, `Company Address`, `Whole Sale Retail Address`, `Issued Date`, `End Date`
Need in new (2): `Retail No`, `Retail Address`
Extra in new (2): `Whole Sale Retail No`, `Whole Sale Retail Address`

### RetailRegistrationByVoucher

Title: Retail Registration By Voucher
Old source: _No match found_
Old columns (0): _None_
New columns (12): `No`, `Date`, `Company Registration No`, `Company Name`, `Company Address`, `Whole Sale Retail No`, `Whole Sale Retail Name`, `Whole Sale Retail Address`, `Payment Type`, `Voucher No`, `Voucher Date`, `Total Amount`
Need in new (0): _None_
Extra in new (12): `No`, `Date`, `Company Registration No`, `Company Name`, `Company Address`, `Whole Sale Retail No`, `Whole Sale Retail Name`, `Whole Sale Retail Address`, `Payment Type`, `Voucher No`, `Voucher Date`, `Total Amount`

### WholeSaleAndRetailSummaryReport

Title: Whole Sale and Retail Summary Report
Old source: _No match found_
Old columns (0): _None_
New columns (3): `No`, `Apply Type`, `Application Count`
Need in new (0): _None_
Extra in new (3): `No`, `Apply Type`, `Application Count`

### WholeSaleAndRetailDetailReport

Title: Whole Sale and Retail Detail Report
Old source: _No match found_
Old columns (0): _None_
New columns (8): `No`, `Company Registration No`, `Whole Sale Retail No`, `Company Name`, `Company Address`, `Whole Sale Retail Address`, `Issued Date`, `End Date`
Need in new (0): _None_
Extra in new (8): `No`, `Company Registration No`, `Whole Sale Retail No`, `Company Name`, `Company Address`, `Whole Sale Retail Address`, `Issued Date`, `End Date`

### WholeSaleAndRetailRegistrationByVoucher

Title: WS and R Registration By Voucher
Old source: _No match found_
Old columns (0): _None_
New columns (12): `No`, `Date`, `Company Registration No`, `Company Name`, `Company Address`, `Whole Sale Retail No`, `Whole Sale Retail Name`, `Whole Sale Retail Address`, `Payment Type`, `Voucher No`, `Voucher Date`, `Total Amount`
Need in new (0): _None_
Extra in new (12): `No`, `Date`, `Company Registration No`, `Company Name`, `Company Address`, `Whole Sale Retail No`, `Whole Sale Retail Name`, `Whole Sale Retail Address`, `Payment Type`, `Voucher No`, `Voucher Date`, `Total Amount`

## Old RDLC Files Not Mapped To New Frontend

- `BordeExtensionReport.rdlc`
- `BusinessServiceAgencyDetailReport.rdlc`
- `BusinessServiceAgencyRegistrationByVoucherReport.rdlc`
- `BusinessServiceAgencySummaryReport.rdlc`
- `ChequeNoDetailReport.rdlc`
- `DutyFreeShopDetailReport.rdlc`
- `DutyFreeShopRegistrationByVoucherReport.rdlc`
- `DutyFreeShopSummaryReport.rdlc`
- ~~`EICCReport.rdlc`~~ — mapped 2026-09-14 to `EICCCertificateReport`, `EICCLicencePermitReport` and
  `EICCBorderLicencePermitReport` (one RDLC, three screens). See `docs/EICCReport_Port_2026-09-14.md`.
- `EVShowRoomBrandNewDetailReport.rdlc`
- `EVShowRoomBrandNewSummaryReport.rdlc`
- `EVShowRoomDetailReport.rdlc`
- `EVShowRoomRegistrationByVoucherReport.rdlc`
- `EVShowRoomSummaryReport.rdlc`
- `OGARecommendationGroupByReport.rdlc`
- `OGARecommendationHistoryReport.rdlc`
- `OGARecommendationListReport.rdlc`
- `OGARecommendationReport.rdlc`
- `ReExportDetailReport.rdlc`
- `ReExportSummaryReport.rdlc`
- `RetailRegistrationByVoucherReport.rdlc`
- `SaleCenterCommercialVehiclesDetailReport.rdlc`
- `SaleCenterCommercialVehiclesSummaryReport.rdlc`
- `SaleCenterMotorVehiclesDetailReport.rdlc`
- `SaleCenterMotorVehiclesSummaryReport.rdlc`
- `SaleCenterRegistrationByVoucherReport.rdlc`
- `ShowRoomBrandNewDetailReport.rdlc`
- `ShowRoomBrandNewSummaryReport.rdlc`
- `ShowRoomMachineryDetailReport.rdlc`
- `ShowRoomMachinerySummaryReport.rdlc`
- `ShowRoomRegistrationByVoucherReport.rdlc`
- `WholeSaleRegistrationByVoucherReport.rdlc`
- `WholeSaleRetailDetailReport.rdlc`
- `WholeSaleRetailRegistrationByVoucherReport.rdlc`
- `WholeSaleRetailSummaryReport.rdlc`
- `WineImportationDetailReport.rdlc`
- `WineImportationRegistrationByVoucherReport.rdlc`
- `WineImportationSummaryReport.rdlc`

## Wai Phyo Recheck Against Old Admin - 2026-06-22

The following current-config differences were verified directly against the old Tradenet 2.0 report views and RDLC files. Generated row-number headers (`No`, `No.`, `Sr.No.`) are treated as equivalent.

| Report | Verified current difference |
|---|---|
| Border Import Licence By HS Code | The summary RDLC (`BorderHSCodeReport.rdlc`) never had a `Company Name` column — it belongs to the `HSCodeDetailReport.rdlc` drill, which the new `BorderImportLicenceHSCodeDetailReport` renders. Since 2026-09-14 the summary also groups on (HS code, currency) like the RDLC, not per buyer. |
| Border Import Licence New Report | Missing old readonly Company Name filter; new has an Auto filter not present in old admin. |
| Border Export Permit Actual Amendment | Missing old readonly Company Name filter; `HS Code` header differs from old `HSCode`. |
| Border Export Permit Amendment | Missing old readonly Company Name filter and old HSCode column. |
| Border Export Permit Cancellation | Missing old readonly Company Name filter; `HS Code` header differs from old `HSCode`. |
| Border Export Permit Extension | Missing old readonly Company Name filter. |
| Border Export Permit By HS Code | Old `Company Name` column is intentionally removed by newer customer feedback. |
| Border Export Permit New Report | Missing old readonly Company Name filter and old `auto` output column. |
| Export Licence Actual Amendment | ~~Missing old HSCode column~~ -> corrected 2026-09-04: the old AmendReport.rdlc has no HSCode column. |
| Export Licence Amendment | ~~Missing old HSCode column~~ -> corrected 2026-09-04: the old AmendReport.rdlc has no HSCode column; adds feedback-requested Auto/None-Auto filter absent from old admin. |
| Export Licence Cancellation | ~~Missing old HSCode column~~ -> corrected 2026-09-04: the old AmendReport.rdlc has no HSCode column. |
| Export Licence By HS Code | Old `Company Name` column is intentionally removed by newer customer feedback. |
| Export Licence New Report | Adds feedback-requested Auto/None-Auto filter absent from old admin. |

Reports verified with matching old filters and visible columns: Border Import Licence Actual Amendment, Amendment, Cancellation, Extension, and Voucher; Border Export Permit Voucher at runtime; Export Licence Extension and Voucher at runtime.
