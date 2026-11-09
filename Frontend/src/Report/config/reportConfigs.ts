import dayjs from 'dayjs';
import {
  ReportColumnConfig,
  ReportFilterConfig,
  ReportFilterOption,
  ReportPageConfig,
} from './reportTypes';
import { newReportConfigs } from './newReportConfigs';
import { advanceSearchConfigs } from './advanceSearchConfigs';
import { turndownReportConfigs } from './turndownReportConfigs';

// Shared PaThaKa State/Status filter options. '--- All ---' = no filter ('').
const pathakaStateFilterOptions: ReportFilterOption[] = [
  { label: '--- All ---', value: '' },
  { label: 'Ayeyarwaddy Region', value: 'Ayeyarwaddy Region' },
  { label: 'Bago Region', value: 'Bago Region' },
  { label: 'Chin State', value: 'Chin State' },
  { label: 'Eastern Shan State', value: 'Eastern Shan State' },
  { label: 'Kachin State', value: 'Kachin State' },
  { label: 'Kayah State', value: 'Kayah State' },
  { label: 'Kayin State', value: 'Kayin State' },
  { label: 'Magway Region', value: 'Magway Region' },
  { label: 'Mandalay Region', value: 'Mandalay Region' },
  { label: 'Mon State', value: 'Mon State' },
  { label: 'Naypyitaw Region', value: 'Naypyitaw Region' },
  { label: 'Northern Shan State', value: 'Northern Shan State' },
  { label: 'Rakhine State', value: 'Rakhine State' },
  { label: 'Sagaing Region', value: 'Sagaing Region' },
  { label: 'Shan State', value: 'Shan State' },
  { label: 'Southern Shan State', value: 'Southern Shan State' },
  { label: 'Tanintharyi Region', value: 'Tanintharyi Region' },
  { label: 'Yangon Region', value: 'Yangon Region' },
];

const pathakaStatusFilterOptions: ReportFilterOption[] = [
  { label: '--- All ---', value: '' },
  { label: 'Suspension', value: 'Suspension' },
  { label: 'Extension', value: 'Extension' },
  { label: 'Un_suspension', value: 'Un_suspension' },
  { label: 'Blacklist', value: 'Blacklist' },
  { label: 'New', value: 'New' },
  { label: 'Amend', value: 'Amend' },
];

// Shared filter options for the registration/business-card report modules
// (WholeSale, Retail, Wine, Duty Free, Sale Center, Show Room, EV/EVCycle, BSA).
// Values match old MVC CommonRepository.GetApplyTypeList() (minus Fine).
const registrationApplyTypeOptions: ReportFilterOption[] = [
  { label: 'New', value: 'New' },
  { label: 'Amend', value: 'Amend' },
  { label: 'Extension', value: 'Extension' },
  { label: 'Cancel', value: 'Cancel' },
  { label: 'Actual Amend', value: 'Actual Amend' },
];

// Detail reports add Valid/Invalid (filtered by licence EndDate vs today).
const detailApplyTypeOptions: ReportFilterOption[] = [
  ...registrationApplyTypeOptions,
  { label: 'Valid', value: 'Valid' },
  { label: 'Invalid', value: 'Invalid' },
];

const voucherPaymentTypeOptions: ReportFilterOption[] = [
  { label: '--- All ---', value: '' },
  { label: 'Cash', value: 'Cash' },
  { label: 'MPU', value: 'MPU' },
  { label: 'Citizen Pay', value: 'Citizen Pay' },
];

const certificateTypeOptions: ReportFilterOption[] = [
  { label: '--- All ---', value: '' },
  { label: 'Member', value: 'Member' },
  { label: 'Pa Tha Ka', value: 'Pa Tha Ka' },
  { label: 'Import Licence', value: 'Import Licence' },
  { label: 'Import Permit', value: 'Import Permit' },
  { label: 'Export Licence', value: 'Export Licence' },
  { label: 'Export Permit', value: 'Export Permit' },
  { label: 'Border Import Licence', value: 'Border Import Licence' },
  { label: 'Border Import Permit', value: 'Border Import Permit' },
  { label: 'Border Export Licence', value: 'Border Export Licence' },
  { label: 'Border Export Permit', value: 'Border Export Permit' },
  { label: 'Business Service Agency', value: 'Business Service Agency' },
  { label: 'Duty Free Shop', value: 'Duty Free Shop' },
  { label: 'Re-Export', value: 'Re-Export' },
  { label: 'Sale Center', value: 'Sale Center' },
  { label: 'Show Room', value: 'Show Room' },
  { label: 'EV Show Room', value: 'EV Show Room' },
  { label: 'EV Cycle Show Room', value: 'EV Cycle Show Room' },
  { label: 'Whole Sale', value: 'Whole Sale' },
  { label: 'Retail', value: 'Retail' },
  { label: 'Whole Sale and Retail', value: 'Whole Sale and Retail' },
  { label: 'Alcoholic Beverages Importation', value: 'Wine Importation' },
];

const importLicenceDateRangeFilter: ReportFilterConfig = {
  name: 'dateRange',
  label: 'From Date / To Date',
  type: 'dateRange',
  fromName: 'FromDate',
  toName: 'ToDate',
  fromLabel: 'From Date',
  toLabel: 'To Date',
  required: true,
};

const importLicenceOverseaTypeFilter: ReportFilterConfig = {
  name: 'Type',
  label: 'Type',
  type: 'text',
  defaultValue: '',
};

const importLicenceFormTypeFilter: ReportFilterConfig = {
  name: 'FormType',
  label: 'Form Type',
  type: 'text',
  defaultValue: '',
};

const importLicencePaThaKaTypeFilter: ReportFilterConfig = {
  name: 'PaThaKaTypeId',
  label: 'EIR Card Type',
  type: 'number',
  defaultValue: 0,
  lookupName: 'paThaKaTypes',
};

const importLicenceSectionFilter: ReportFilterConfig = {
  name: 'ExportImportSectionId',
  label: 'Import Section',
  type: 'number',
  defaultValue: 0,
  lookupName: 'importLicenceSections',
};

const importLicenceMethodFilter: ReportFilterConfig = {
  name: 'ExportImportMethodId',
  label: 'Method of Import',
  type: 'number',
  defaultValue: 0,
  lookupName: 'importLicenceMethods',
};

const importLicenceCompanyMethodFilter: ReportFilterConfig = {
  ...importLicenceMethodFilter,
  label: 'Method of export',
};

const importLicenceIncotermFilter: ReportFilterConfig = {
  name: 'ExportImportIncotermId',
  label: 'Method of Import According to Incoterms',
  type: 'number',
  defaultValue: 0,
  lookupName: 'importLicenceIncoterms',
};

const exportLicenceMethodFilter: ReportFilterConfig = {
  name: 'ExportImportMethodId',
  label: 'Method of export',
  type: 'number',
  defaultValue: 0,
  lookupName: 'exportLicenceMethods',
};

const exportLicenceIncotermFilter: ReportFilterConfig = {
  name: 'ExportImportIncotermId',
  label: 'Method of export According to Incoterms',
  type: 'number',
  defaultValue: 0,
  lookupName: 'exportLicenceIncoterms',
};

const exportLicenceBuyerCountryFilter: ReportFilterConfig = {
  name: 'BuyerCountryId',
  label: 'Buyer Country',
  type: 'number',
  defaultValue: 0,
  lookupName: 'countries',
};

const importLicenceSellerCountryFilter: ReportFilterConfig = {
  name: 'SellerCountryId',
  label: 'Seller Country',
  type: 'number',
  defaultValue: 0,
};

const importLicenceCompanyRegistrationNoFilter: ReportFilterConfig = {
  name: 'CompanyRegistrationNo',
  label: 'Company Registration No',
  type: 'text',
  defaultValue: '',
};

const importLicenceCompanyNameFilter: ReportFilterConfig = {
  name: 'CompanyName',
  label: 'Company Name',
  type: 'readonlyText',
  defaultValue: '',
  excludeFromRequest: true,
  populateFromCompanyRegistrationNo: true,
};

const importLicenceAmendRemarkFilter: ReportFilterConfig = {
  name: 'AmendRemarkId',
  label: 'Remark',
  type: 'number',
  defaultValue: 0,
};

const importLicenceFilterTypeFilter: ReportFilterConfig = {
  name: 'FilterType',
  label: 'Filter By',
  type: 'select',
  defaultValue: 'Start',
  options: [
    { label: 'Start', value: 'Start' },
    { label: 'End', value: 'End' },
  ],
};

const importLicenceHSCodeFilter: ReportFilterConfig = {
  name: 'hsCode',
  label: 'HS Code',
  type: 'text',
  defaultValue: '',
};

const importLicenceAutoFilter: ReportFilterConfig = {
  name: 'Auto',
  label: 'Auto / None Auto',
  type: 'select',
  defaultValue: '',
  options: [
    { label: '--- All ---', value: '' },
    { label: 'auto', value: 'auto' },
    { label: 'none-auto', value: 'none-auto' },
  ],
};

const importLicenceQuotaFilter: ReportFilterConfig = {
  name: 'Quota',
  label: 'Quota',
  type: 'select',
  defaultValue: '',
  options: [
    { label: '--- All ---', value: '' },
    { label: 'quota', value: 'quota' },
    { label: 'no-quota', value: 'no-quota' },
  ],
};

const importLicenceVoucherApplyTypeFilter: ReportFilterConfig = {
  name: 'ApplyType',
  label: 'Apply Type',
  type: 'select',
  defaultValue: '',
  options: [
    { label: '--- All ---', value: '' },
    ...registrationApplyTypeOptions,
  ],
};

// The Import Licence Voucher report routes to the proc's strict-ApplyType (ELSE) branch of
// sp_VoucherReport_pagination, which has no `@ApplyType='' OR ...` all-pass guard -> an empty
// Apply Type ("--- All ---") returns 0 rows. Its columns also carry dynamic per-ApplyType
// headers (header2/header3), which assume a single selected type. So default to 'New' with no
// "--- All ---", mirroring the Import Permit Voucher report. The shared filter above keeps
// "--- All ---" for the Export/Border voucher reports, whose proc branches DO have the guard.
const importLicenceVoucherApplyTypeFilterNew: ReportFilterConfig = {
  name: 'ApplyType',
  label: 'Apply Type',
  type: 'select',
  defaultValue: 'New',
  options: [...registrationApplyTypeOptions],
};

const importLicenceVoucherPaymentTypeFilter: ReportFilterConfig = {
  name: 'PaymentType',
  label: 'Payment Type',
  type: 'select',
  defaultValue: '',
  // AccountTransaction.PaymentType stores the NAME (Cash/MPU/Citizen Pay), not the id.
  // The 'paymentTypes' lookup sends the numeric id ("1"/"2"/...), which never matches
  // the SP's `AccountTransaction.PaymentType = @PaymentType` filter -> no data.
  options: voucherPaymentTypeOptions,
};

const importLicenceAmendFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceFormTypeFilter,
  importLicenceSectionFilter,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
  importLicenceAmendRemarkFilter,
];

const importLicenceExtensionFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceFormTypeFilter,
  importLicenceSectionFilter,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
];

const importLicenceSummaryDetailFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceOverseaTypeFilter,
  importLicencePaThaKaTypeFilter,
  importLicenceSectionFilter,
  importLicenceMethodFilter,
  importLicenceIncotermFilter,
];

const importLicencePendingDetailFilters: ReportFilterConfig[] = [
  ...importLicenceSummaryDetailFilters,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
];

const importLicenceSectionMethodFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceOverseaTypeFilter,
  importLicencePaThaKaTypeFilter,
  importLicenceSectionFilter,
  importLicenceMethodFilter,
];

const importLicenceSellerCountryFilters: ReportFilterConfig[] = [
  ...importLicenceSectionMethodFilters,
  importLicenceSellerCountryFilter,
];

// Drill target reached from By Section / Method / Seller Country / Company. Carries
// every dimension filter so the seeded request reproduces the clicked cell exactly.
const importLicenceDetailByLicenceFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceOverseaTypeFilter,
  importLicencePaThaKaTypeFilter,
  importLicenceSectionFilter,
  importLicenceMethodFilter,
  importLicenceSellerCountryFilter,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
];

const importLicenceCompanyListFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceOverseaTypeFilter,
  importLicencePaThaKaTypeFilter,
  importLicenceSectionFilter,
  importLicenceCompanyMethodFilter,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
];

const importLicenceDailyFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceOverseaTypeFilter,
  importLicenceSectionFilter,
  importLicencePaThaKaTypeFilter,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
];

const importLicenceTotalValueFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceOverseaTypeFilter,
  importLicencePaThaKaTypeFilter,
  importLicenceSectionFilter,
];

const importPermitTotalValueFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceOverseaTypeFilter,
  importLicencePaThaKaTypeFilter,
  {
    ...importLicenceSectionFilter,
    lookupName: 'importPermitSections',
  },
];

const exportLicenceTotalValueFilters: ReportFilterConfig[] = [
  {
    ...importLicenceDateRangeFilter,
    defaultDateRangeMonths: 3,
  },
  importLicencePaThaKaTypeFilter,
  {
    ...importLicenceSectionFilter,
    label: 'Export Section',
    lookupName: 'exportLicenceSections',
  },
];

const exportLicenceSectionFilter: ReportFilterConfig = {
  ...importLicenceSectionFilter,
  label: 'Export Section',
  lookupName: 'exportLicenceSections',
};

// The old ExportPermitByHSCodeReport.cshtml:40-48 renders this dropdown from
// exportImportSectionRepository.GetAll(AppConfig.ExportPermit) (ReportsController.cs:7650).
const exportPermitSectionFilter: ReportFilterConfig = {
  ...importLicenceSectionFilter,
  label: 'Export Section',
  lookupName: 'exportPermitSections',
};

const exportLicenceVoucherFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceFormTypeFilter,
  exportLicenceSectionFilter,
  importLicenceVoucherApplyTypeFilter,
  importLicenceVoucherPaymentTypeFilter,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
];

// No Auto / None Auto box: ExportLicenceAmendmentReportRequest has no Auto property and
// sp_AmendReport_pagination's Export Licence branch has no @auto predicate, so the dropdown
// was a visible no-op.
const exportLicenceAmendFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceFormTypeFilter,
  exportLicenceSectionFilter,
  importLicenceAmendRemarkFilter,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
];

const exportLicenceActualAmendFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceFormTypeFilter,
  exportLicenceSectionFilter,
  importLicenceAmendRemarkFilter,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
];

const exportLicenceActionFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceFormTypeFilter,
  exportLicenceSectionFilter,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
];

// No Form Type box: the old ExportLicenceNewReport.cshtml carried FormType as a hidden field,
// and ExportLicenceNewReportNewReportController hardcodes FormType = "Export Licence" and never
// reads request.FormType -- so the input was a visible no-op.
const exportLicenceNewFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  exportLicenceSectionFilter,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
  importLicenceAutoFilter,
];

// Same reason as exportLicenceNewFilters: the old ExportLicenceCancelReport.cshtml exposes only
// From/To Date, the Export Section dropdown, Company Registration No and a readonly Company Name;
// FormType is an @Html.HiddenFor, and the controller hardcodes FormType = "Export Licence".
const exportLicenceCancellationFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  exportLicenceSectionFilter,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
];

const importLicenceHSCodeFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceFormTypeFilter,
  importLicenceSectionFilter,
  importLicenceFilterTypeFilter,
  importLicenceHSCodeFilter,
];

const hsCodeDetailColumns: ReportColumnConfig[] = [
  {
    key: 'hsCode',
    dataIndex: 'hsCode',
    title: 'HS Code',
  },
  {
    key: 'Description',
    dataIndex: 'hsDescription',
    title: 'Description',
  },
  {
    key: 'CompanyName',
    dataIndex: 'companyName',
    title: 'Company Name',
  },
  {
    key: 'NoOfLicences',
    dataIndex: 'noOfLicences',
    title: 'No of Licences',
  },
];

const importLicenceNewFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceFormTypeFilter,
  importLicenceSectionFilter,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
  importLicenceAutoFilter,
  importLicenceQuotaFilter,
];

const importLicencePendingFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceFormTypeFilter,
  importLicenceSectionFilter,
];

const importLicenceVoucherFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceFormTypeFilter,
  importLicenceSectionFilter,
  importLicenceVoucherApplyTypeFilterNew,
  importLicenceVoucherPaymentTypeFilter,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
];

const importLicenceVoucherHeaders: Record<string, [string, string]> = {
  New: ['Licence No', 'Licence Date'],
  Amend: ['Licence Amendment No', 'Amendment Date'],
  Extension: ['Licence Extension No', 'Extension Date'],
  Cancel: ['Licence Cancel No', 'Cancellation Date'],
  'Actual Amend': [
    'Licence Actual Amendment No',
    'Actual Amendment Date',
  ],
};

const borderImportLicenceSectionFilter: ReportFilterConfig = {
  ...importLicenceSectionFilter,
  lookupName: 'borderImportLicenceSections',
};

const borderImportLicenceMethodFilter: ReportFilterConfig = {
  name: 'ExportImportMethodId',
  label: 'Import Method',
  type: 'number',
  defaultValue: 0,
  lookupName: 'borderImportLicenceMethods',
};

const borderImportLicenceIncotermFilter: ReportFilterConfig = {
  name: 'ExportImportIncotermId',
  label: 'Import Incoterms',
  type: 'number',
  defaultValue: 0,
  lookupName: 'borderImportLicenceIncoterms',
};

const borderImportLicenceSakhanFilter: ReportFilterConfig = {
  name: 'SakhanId',
  label: 'Sakhan',
  type: 'number',
  defaultValue: 0,
  lookupName: 'sakhans',
};

const borderImportLicenceVoucherFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  borderImportLicenceSectionFilter,
  importLicenceVoucherApplyTypeFilterNew,
  importLicenceVoucherPaymentTypeFilter,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
  borderImportLicenceSakhanFilter,
];

const borderImportLicenceActionFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceFormTypeFilter,
  borderImportLicenceSakhanFilter,
  borderImportLicenceSectionFilter,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
];

const borderImportLicenceAmendActionFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicenceFormTypeFilter,
  borderImportLicenceSakhanFilter,
  borderImportLicenceSectionFilter,
  importLicenceAmendRemarkFilter,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
];

const borderExportLicenceMethodFilter: ReportFilterConfig = {
  ...exportLicenceMethodFilter,
  lookupName: 'borderExportLicenceMethods',
};

const borderExportLicenceIncotermFilter: ReportFilterConfig = {
  ...exportLicenceIncotermFilter,
  lookupName: 'borderExportLicenceIncoterms',
};

const borderImportLicenceSectionMethodFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  borderImportLicenceSakhanFilter,
  importLicencePaThaKaTypeFilter,
  borderImportLicenceSectionFilter,
  borderImportLicenceMethodFilter,
];

const borderImportLicenceSellerCountryFilters: ReportFilterConfig[] = [
  ...borderImportLicenceSectionMethodFilters,
  importLicenceSellerCountryFilter,
];

const borderImportLicenceCompanyListFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  importLicencePaThaKaTypeFilter,
  borderImportLicenceSakhanFilter,
  borderImportLicenceSectionFilter,
  borderImportLicenceMethodFilter,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
];

const borderImportLicenceDailyFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  borderImportLicenceSakhanFilter,
  borderImportLicenceSectionFilter,
  importLicencePaThaKaTypeFilter,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
];

const borderImportLicenceTotalValueFilters: ReportFilterConfig[] = [
  importLicenceDateRangeFilter,
  borderImportLicenceSakhanFilter,
  importLicencePaThaKaTypeFilter,
  borderImportLicenceSectionFilter,
];

const borderImportLicenceDetailFilters: ReportFilterConfig[] = [
  ...borderImportLicenceSectionMethodFilters,
  borderImportLicenceIncotermFilter,
];

const borderImportLicencePendingDetailFilters: ReportFilterConfig[] = [
  ...borderImportLicenceDetailFilters,
  importLicenceCompanyRegistrationNoFilter,
  importLicenceCompanyNameFilter,
];

const formatLegacyReportDate = (value: unknown) => {
  const parsed = dayjs(String(value ?? ''));
  return parsed.isValid() ? parsed.format('DD/MM/YYYY') : String(value ?? '');
};

const importLicenceRangeSubtitle =
  (label: string, includeFrom = false) =>
  (filters: Record<string, unknown>) => {
    const fromDate = formatLegacyReportDate(filters.FromDate);
    const toDate = formatLegacyReportDate(filters.ToDate);
    const fromText = includeFrom ? ' From' : '';

    return `${label}${fromText} (${fromDate}) To (${toDate})`;
  };

const reportDateRangeSubtitle =
  (label: string) => (filters: Record<string, unknown>) => {
    const fromDate = formatLegacyReportDate(filters.FromDate);
    const toDate = formatLegacyReportDate(filters.ToDate);

    return `${label} (${fromDate}) To (${toDate})`;
  };

// Legacy registration-report header: a static centered title block + a trailing
// date-range line (the old RDLC's header1/header2 parameter line).
const registrationDateRangeSubtitle = (filters: Record<string, unknown>) =>
  `(${formatLegacyReportDate(filters.FromDate)}) To (${formatLegacyReportDate(
    filters.ToDate
  )})`;

// Legacy RegistrationByVoucher header1: "<Family> <ApplyType> List (From) To (To)"
// (e.g. "Whole Sale " + model.ApplyType + " List (...)", ReportsController.cs:1088 on
// origin/master).
const registrationVoucherSubtitle =
  (listName: string) => (filters: Record<string, unknown>) =>
    reportDateRangeSubtitle(
      `${listName} ${String(filters.ApplyType ?? '').trim()} List`
    )(filters);

const resolveImportLicenceVoucherColumns = (
  filters: Record<string, unknown>,
  columns: ReportColumnConfig[]
): ReportColumnConfig[] => {
  const [licenceNoTitle, licenceDateTitle] =
    importLicenceVoucherHeaders[String(filters.ApplyType ?? 'New')] ??
    importLicenceVoucherHeaders.New;

  // Old rdlc hides the header2 (Licence No) column for ApplyType="New":
  // BorderVoucherReport.rdlc:1578 and VoucherReport.rdlc:1883 both carry exactly one
  // <Hidden>=IIF(Fields!ApplyType.Value="New",True,False)</Hidden>, on that column only.
  // Without this, ApplyType='New' renders two adjacent "Licence No" columns with identical
  // values, because OriginalLicenceNo falls back to licenceNo when oldLicenceNo is empty.
  const hideLicenceNo = String(filters.ApplyType ?? 'New') === 'New';

  return columns.map((column) => {
    if (column.key === 'LicenceNo') {
      return { ...column, title: licenceNoTitle, hidden: hideLicenceNo };
    }

    // The header3 (Licence Date) column stays visible for every ApplyType.
    if (column.key === 'LicenceDate') {
      return { ...column, title: licenceDateTitle };
    }

    return column;
  });
};

const resolveBorderImportLicenceVoucherColumns = (
  filters: Record<string, unknown>,
  columns: ReportColumnConfig[]
): ReportColumnConfig[] => {
  const resolved = resolveImportLicenceVoucherColumns(filters, columns);

  // BorderVoucherReport.rdlc hides its dynamic licence-number column for New.
  // OriginalLicenceNo already falls back to the current licence number, leaving
  // the single Licence No column shown by the old report.
  return String(filters.ApplyType ?? 'New') === 'New'
    ? resolved.filter((column) => column.key !== 'LicenceNo')
    : resolved;
};


// --- EICC reports ---------------------------------------------------------
// The old admin had ONE screen (Views/EICC/EICCReport.cshtml) reached from three
// sidebar entries that differ only by `type`: Certificates, Licence & Permit and
// Border Licence & Permit (_Layout.cshtml:2052, 2075, 2089 on origin/master). They
// are three reports here, because a report key names the route, the menu entry and
// the Excel job. All three print the same ten EICCReport.rdlc columns.

// EICCReport.rdlc:205-756 on origin/master, in tablix column order. The RDLC wraps
// four of the headers over two lines ("Application " / "Type"); the grid prints each
// as the one phrase it reads as.
const eiccReportColumns: ReportColumnConfig[] = [
  { key: 'EICCNo', dataIndex: 'eiccNo', title: 'EICC No' },
  {
    key: 'EICCDate',
    dataIndex: 'eiccDate',
    title: 'Date',
    dataType: 'date',
    // The old model formatted this in C# (`sEICCDate`), so the cell is dd/MM/yyyy,
    // not the grid's default YYYY-MM-DD.
    dateFormat: 'DD/MM/YYYY',
  },
  { key: 'EICCStatus', dataIndex: 'eiccStatus', title: 'Status' },
  { key: 'FormType', dataIndex: 'formType', title: 'Form Type' },
  { key: 'ApplyType', dataIndex: 'applyType', title: 'Application Type' },
  {
    key: 'PaThaKaNo',
    dataIndex: 'paThaKaNo',
    title: 'Company Registration No',
  },
  { key: 'CompanyName', dataIndex: 'companyName', title: 'Company Name' },
  {
    key: 'CompanyAddress',
    dataIndex: 'companyAddress',
    title: 'Company Address',
    fallbackDataIndexes: [
      'unitLevel',
      'streetNumberStreetName',
      'quarterCityTownship',
      'state',
      'country',
      'postalCode',
    ],
  },
  { key: 'EICCRemark', dataIndex: 'remark', title: 'Remark' },
];

// EICCReport.cshtml:26 — a single required date box, defaulted to today. Posted as
// `Date` rather than `EICCDate`: that is the name the Excel header block discovers a
// one-date report by, so the sheet prints its "Date: dd/MM/yyyy" line.
const eiccDateFilter: ReportFilterConfig = {
  name: 'Date',
  label: 'EICC Date',
  type: 'date',
  required: true,
};

// EICCReport.cshtml:32-49 — two options and no "all"; the procedure compares Status
// with `=`, so leaving it blank would return nothing.
const eiccStatusFilter: ReportFilterConfig = {
  name: 'EICCStatus',
  label: 'EICC Status',
  type: 'select',
  defaultValue: 'Pending',
  options: [
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
  ],
};

// Product Group / Product Item, shown only on the two Licence-Permit screens
// (eicc-reports.js:26-33 hides both for Certificates). Group narrows to the Import or
// Export side of the chosen card type; Item narrows to the chosen group.
const eiccProductFilters: ReportFilterConfig[] = [
  {
    name: 'ProductGroupId',
    label: 'Product Group',
    type: 'number',
    defaultValue: 0,
    lookupName: 'productGroups',
    dependsOn: 'FormType',
  },
  {
    name: 'ProductItemId',
    label: 'Product Item',
    type: 'number',
    defaultValue: 0,
    lookupName: 'productItems',
    dependsOn: 'ProductGroupId',
  },
];

// The RDLC's only header line, `header1` = "EICC " + type + " Report (" + date + ")"
// (EICCController.cs:505 on origin/master). The type word is the raw AppConfig value,
// so "LicencePermit" and "BorderLicencePermit" are printed unspaced, as they were.
const eiccReportSubtitle =
  (type: string) => (filters: Record<string, unknown>) => {
    const date = filters.Date
      ? dayjs(String(filters.Date)).format('DD/MM/YYYY')
      : '';
    return `EICC ${type} Report (${date})`;
  };

const eiccReportConfig = (
  controllerName: string,
  title: string,
  legacyType: string,
  filters: ReportFilterConfig[]
): ReportPageConfig => ({
  controllerName,
  title,
  apiRoute: controllerName,
  excelRoute: `${controllerName}/Excel`,
  excelFileName: `${controllerName}.xlsx`,
  showRowNumber: true,
  rowNumberTitle: 'No',
  // Kept out of the sidebar for now (owner's call, 2026-09-14). The route, the API and the
  // Excel export all still work, so /Report/<key> reaches the report directly; drop this
  // line to put the EICC group back in the menu.
  hideInMenu: true,
  // The RDLC printed every row on one scrolling page; a 10-row first page would read
  // as missing data next to the old report.
  defaultPageSize: 1000,
  reportSubtitle: eiccReportSubtitle(legacyType),
  filters,
  columns: eiccReportColumns,
});

export const eiccReportConfigs: Record<string, ReportPageConfig> = {
  EICCCertificateReport: eiccReportConfig(
    'EICCCertificateReport',
    'EICC Certificate Report',
    'Certificate',
    [
      eiccDateFilter,
      eiccStatusFilter,
      {
        name: 'FormType',
        label: 'Card Type',
        type: 'select',
        defaultValue: '',
        // Registration card types only — the old screen dropped Member and anything
        // named Licence or Permit (EICCController.cs:409), and showed Wine Importation
        // as "Alcoholic Beverages Importation". Both live in the `eiccCardTypes` lookup.
        lookupName: 'eiccCardTypes',
      },
    ]
  ),
  EICCLicencePermitReport: eiccReportConfig(
    'EICCLicencePermitReport',
    'EICC Licence and Permit Report',
    'LicencePermit',
    [
      eiccDateFilter,
      eiccStatusFilter,
      {
        name: 'FormType',
        label: 'Card Type',
        type: 'select',
        defaultValue: '',
        // Hardcoded in the old controller, not read from CardType (EICCController.cs:400).
        options: [
          { label: '--- All ---', value: '' },
          { label: 'Export Licence', value: 'Export Licence' },
          { label: 'Import Licence', value: 'Import Licence' },
          { label: 'Export Permit', value: 'Export Permit' },
          { label: 'Import Permit', value: 'Import Permit' },
        ],
      },
      ...eiccProductFilters,
    ]
  ),
  EICCBorderLicencePermitReport: eiccReportConfig(
    'EICCBorderLicencePermitReport',
    'EICC Border Licence and Permit Report',
    'BorderLicencePermit',
    [
      eiccDateFilter,
      eiccStatusFilter,
      {
        name: 'FormType',
        label: 'Card Type',
        type: 'select',
        defaultValue: '',
        // Hardcoded in the old controller (EICCController.cs:455).
        options: [
          { label: '--- All ---', value: '' },
          { label: 'Border Export Licence', value: 'Border Export Licence' },
          { label: 'Border Import Licence', value: 'Border Import Licence' },
          { label: 'Border Export Permit', value: 'Border Export Permit' },
          { label: 'Border Import Permit', value: 'Border Import Permit' },
        ],
      },
      ...eiccProductFilters,
    ]
  ),
};

export const reportConfigs: Record<string, ReportPageConfig> = {
  AccountSummaryReport: {
    controllerName: 'AccountSummaryReport',
    title: 'Account Summary Report',
    apiRoute: 'AccountSummaryReport',
    excelRoute: 'AccountSummaryReport/Excel',
    excelFileName: 'AccountSummaryReport.xlsx',
    // The old Tradenet 2.0 screen's black "Export" button produced a second,
    // differently shaped sheet that DCCA imports. Same endpoint and filters;
    // `ExportFormat` picks the layout on the controller.
    secondaryExcel: {
      label: 'DCCA Excel',
      fileName: 'AccountSummaryReport-DCCA.xlsx',
      title: 'Account Summary Report (DCCA)',
      requestOverrides: { ExportFormat: 'Dcca' },
    },
    initialSortColumn: 'VoucherDate',
    showRowNumber: true,
    reportSubtitle: reportDateRangeSubtitle('Account Summary Report'),
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        showTime: true,
        required: true,
      },
      {
        name: 'FormType',
        label: 'Certificate Type',
        type: 'select',
        defaultValue: '',
        options: certificateTypeOptions,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'EntryDate',
        dataIndex: 'voucherDate',
        title: 'Entry Date',
        dataType: 'date',
        dateFormat: 'MM/DD/YYYY',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'VoucherNo',
        dataIndex: 'voucherNo',
        title: 'Voucher No',
      },
      {
        key: 'TransactionTitle',
        dataIndex: 'transactionTitle',
        title: 'Transaction Title',
      },
      {
        key: 'DeductedFees',
        dataIndex: 'amount',
        title: 'Deducted Fees',
        dataType: 'number',
        numberFormat: '0.####',
      },
      {
        key: 'Remark',
        dataIndex: 'remark',
        title: 'Remark',
      },
    ],
  },
  BorderExportLicenceActualAmendmentReport: {
    controllerName: 'BorderExportLicenceActualAmendmentReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    title: 'Border Export Licence Actual Amendment Report',
    apiRoute: 'BorderExportLicenceActualAmendmentReport',
    excelRoute: 'BorderExportLicenceActualAmendmentReport/Excel',
    excelFileName: 'BorderExportLicenceActualAmendmentReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportLicenceSections',
      },
      {
        name: 'AmendRemarkId',
        label: 'Remark',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Licence Report'),
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
        fallbackDataIndexes: ['licenceNo'],
      },
      {
        key: 'LicenceAmendmentNo',
        dataIndex: 'licenceNo',
        title: 'Licence Amendment No',
      },
      {
        key: 'AmendmentDate',
        dataIndex: 'sDate',
        title: 'Amendment Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  BorderExportLicenceAmendmentReport: {
    controllerName: 'BorderExportLicenceAmendmentReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    title: 'Border Export Licence Amendment Report',
    apiRoute: 'BorderExportLicenceAmendmentReport',
    excelRoute: 'BorderExportLicenceAmendmentReport/Excel',
    excelFileName: 'BorderExportLicenceAmendmentReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportLicenceSections',
      },
      {
        name: 'AmendRemarkId',
        label: 'Remark',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Licence Report'),
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
        fallbackDataIndexes: ['licenceNo'],
      },
      {
        key: 'LicenceAmendmentNo',
        dataIndex: 'licenceNo',
        title: 'Licence Amendment No',
      },
      {
        key: 'AmendmentDate',
        dataIndex: 'sDate',
        title: 'Amendment Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  // One row per (HS code, currency) -- BorderHSCodeReport.rdlc's row group (rdlc:1158-1168).
  // The backend used to add the buyer company to that key, which printed one invisible row per
  // buyer with a partial Total Value (76 rows against the old report's 33 for 31/08-01/09/2026);
  // see sp_HSCodeReport_pagination.sql's Border Export Licence branch.
  BorderExportLicenceByHSCodeReport: {
    controllerName: 'BorderExportLicenceByHSCodeReport',
    title: 'Border Export Licence By HS Code Report',
    apiRoute: 'BorderExportLicenceByHSCodeReport',
    excelRoute: 'BorderExportLicenceByHSCodeReport/Excel',
    excelFileName: 'BorderExportLicenceByHSCodeReport.xlsx',
    initialSortColumn: 'SakhanId',
    // Legacy RDLC printed every row on one scrolling page; these summaries are a
    // handful of (HS code, currency) rows, so a 10-row page looked like missing data
    // next to the old report.
    defaultPageSize: 1000,
    showRowNumber: true,
    rowNumberTitle: 'Sr.No.',
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportLicenceSections',
      },
      {
        name: 'FilterType',
        label: 'Filter By',
        type: 'select',
        // The old form offers Start / End only, with Start first and no blank option
        // (Views/Reports/BorderExportLicenceByHSCodeReport.cshtml:57). An empty value also
        // put the procedure on its unanchored `LIKE '%'+@HSCode` arm.
        defaultValue: 'Start',
        options: [
          { label: 'Start', value: 'Start' },
          { label: 'End', value: 'End' },
        ],
      },
      {
        name: 'hsCode',
        label: 'HS Code',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Licences By HS Code', true),
    columns: [
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'HS Code',
        drilldown: {
          // The old screen's HS Code cell opens Reports/BorderHSCodeDetailReport
          // (ReportsController.cs:10489) -- HSCodeDetailReport.rdlc's (HS code, company)
          // list -- not the Border Export Licence Detail report.
          targetReportKey: 'BorderExportLicenceHSCodeDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'ExportImportSectionId', 'FilterType', 'SakhanId'],
          rowParams: { hsCode: 'hsCode' },
          openInNewTab: true,
        },
      },
      {
        key: 'Description',
        dataIndex: 'hsDescription',
        title: 'Description',
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
        dataType: 'number',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        // 'money' + '#,##0.0000' is the Money4 cell format in the .xlsx and the grid's N4
        // render, matching old BorderHSCodeReport.rdlc:713
        // =FORMAT(Sum(Fields!Amount.Value),"N4").
        dataType: 'money',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderExportLicenceHSCodeDetailReport: {
    // Drill target only, reached from the By HS Code summary's HS Code cell. Its
    // controllerName is deliberately the summary's (same endpoint), which is exactly why it
    // needs hideInMenu: createReportItem keys the menu off controllerName, so leaving it
    // visible rendered a second row with the summary's own key and link.
    hideInMenu: true,
    controllerName: 'BorderExportLicenceByHSCodeReport',
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Licences By HS Code', true),
    title: 'HS Code Detail Report',
    apiRoute: 'BorderExportLicenceByHSCodeReport',
    excelRoute: 'BorderExportLicenceByHSCodeReport/Excel',
    excelFileName: 'BorderExportLicenceHSCodeDetailReport.xlsx',
    initialSortColumn: 'hsCode',
    // Legacy RDLC printed every row on one scrolling page.
    defaultPageSize: 1000,
    showRowNumber: true,
    rowNumberTitle: 'Sr.No.',
    filters: [
      importLicenceDateRangeFilter,
      importLicenceFormTypeFilter,
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportLicenceSections',
      },
      importLicenceFilterTypeFilter,
      importLicenceHSCodeFilter,
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
      // This drill shares BorderExportLicenceByHSCodeReport's controller. The old
      // HSCodeDetailReport.rdlc groups on (HS code, company) (rdlc:1261-1265) while the
      // summary's BorderHSCodeReport.rdlc groups on (HS code, currency), and the two arrive
      // at the backend as the same parameters -- so the drill has to say which shape it
      // wants. Never rendered; always posted (see getDerivedFilterValues).
      {
        name: 'GroupBy',
        label: 'Group By',
        type: 'text',
        constantValue: 'Company',
      },
    ],
    columns: hsCodeDetailColumns,
  },
  BorderExportLicenceByMethodReport: {
    controllerName: 'BorderExportLicenceByMethodReport',
    title: 'Border Export Licence By Method Report',
    apiRoute: 'BorderExportLicenceByMethodReport',
    excelRoute: 'BorderExportLicenceByMethodReport/Excel',
    excelFileName: 'BorderExportLicenceByMethodReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportLicenceSections',
      },
      {
        ...borderExportLicenceMethodFilter,
      },
      {
        ...borderExportLicenceIncotermFilter,
      },
      {
        ...exportLicenceBuyerCountryFilter,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Licences By Method', true),
    columns: [
      {
        key: 'SaKhan',
        dataIndex: 'sakhanCode',
        title: 'SaKhan',
      },
      {
        key: 'Method',
        dataIndex: 'methodName',
        title: 'Method',
        drilldown: {
          targetReportKey: 'BorderExportLicenceDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId', 'SakhanId'],
          rowParams: { ExportImportMethodId: 'methodId' },
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderExportLicenceBySectionReport: {
    controllerName: 'BorderExportLicenceBySectionReport',
    title: 'Border Export Licence By Section Report',
    apiRoute: 'BorderExportLicenceBySectionReport',
    excelRoute: 'BorderExportLicenceBySectionReport/Excel',
    excelFileName: 'BorderExportLicenceBySectionReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportLicenceSections',
      },
      {
        ...borderExportLicenceMethodFilter,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Licences By Section', true),
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
        drilldown: {
          targetReportKey: 'BorderExportLicenceDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId'],
          rowParams: { ExportImportSectionId: 'sectionId' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderExportLicenceBySellerCountryReport: {
    controllerName: 'BorderExportLicenceBySellerCountryReport',
    title: 'Border Export Licence By Buyer Country Report',
    apiRoute: 'BorderExportLicenceBySellerCountryReport',
    excelRoute: 'BorderExportLicenceBySellerCountryReport/Excel',
    // The route keys stay "BySellerCountry" (they are the backend controller name and
    // the menu key), but an export licence has a BUYER — the downloaded file is named
    // after the report the user sees, not after the route.
    excelFileName: 'BorderExportLicenceByBuyerCountryReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportLicenceSections',
      },
      {
        ...borderExportLicenceMethodFilter,
      },
      {
        ...exportLicenceBuyerCountryFilter,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Export Licences By Buyer Country', true),
    columns: [
      {
        key: 'Country',
        dataIndex: 'country',
        title: 'Country',
        drilldown: {
          targetReportKey: 'BorderExportLicenceDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId', 'SakhanId'],
          rowParams: { BuyerCountryId: 'countryId' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderExportLicenceCancellationReport: {
    controllerName: 'BorderExportLicenceCancellationReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    title: 'Border Export Licence Cancellation Report',
    apiRoute: 'BorderExportLicenceCancellationReport',
    excelRoute: 'BorderExportLicenceCancellationReport/Excel',
    excelFileName: 'BorderExportLicenceCancellationReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportLicenceSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Licence Report'),
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
        fallbackDataIndexes: ['licenceNo'],
      },
      {
        key: 'CancellationNo',
        dataIndex: 'licenceNo',
        title: 'Cancellation No',
      },
      {
        key: 'CancellationDate',
        dataIndex: 'sDate',
        title: 'Cancellation Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Remark',
        dataIndex: 'remark',
        title: 'Remark',
      },
    ],
  },
  BorderExportLicenceCompanyListReport: {
    controllerName: 'BorderExportLicenceCompanyListReport',
    title: 'Border Export Licence Company List Report',
    apiRoute: 'BorderExportLicenceCompanyListReport',
    excelRoute: 'BorderExportLicenceCompanyListReport/Excel',
    excelFileName: 'BorderExportLicenceCompanyListReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportLicenceSections',
      },
      {
        ...borderExportLicenceMethodFilter,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      // BorderExportLicenceByCompanyReport.cshtml:76-77 -- a read-only companion box
      // that fills in from the registration no; it is display only, never a request field.
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Licences By Company', true),
    columns: [
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
        drilldown: {
          targetReportKey: 'BorderExportLicenceDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId', 'SakhanId'],
          rowParams: { CompanyRegistrationNo: 'companyRegistrationNo' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderExportLicenceDailyReportNewLicenceReport: {
    controllerName: 'BorderExportLicenceDailyReportNewLicenceReport',
    title: 'Border Export Licence Daily Report (New Licence Report)',
    apiRoute: 'BorderExportLicenceDailyReportNewLicenceReport',
    excelRoute: 'BorderExportLicenceDailyReportNewLicenceReport/Excel',
    excelFileName: 'BorderExportLicenceDailyReportNewLicenceReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    defaultPageSize: 1000,
    // BorderExportLicenceByDailyReport.rdlc:675 prints the serial column; blank header at
    // rdlc:285. Same false negative as BorderImportLicenceDailyReportNewLicenceReport.
    showRowNumber: true,
    rowNumberTitle: 'Sr.No.',
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportLicenceSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Licences By Daily', true),
    columns: [
      {
        key: 'Date',
        dataIndex: 'date',
        title: 'Date',
      },
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
        dataType: 'number',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalUSDValue',
        dataIndex: 'totalUSDValue',
        title: 'Total USD Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  BorderExportLicenceDetailReport: {
    controllerName: 'BorderExportLicenceDetailReport',
    title: 'Border Export Licence Detail Report',
    apiRoute: 'BorderExportLicenceDetailReport',
    excelRoute: 'BorderExportLicenceDetailReport/Excel',
    excelFileName: 'BorderExportLicenceDetailReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportLicenceSections',
      },
      {
        ...borderExportLicenceMethodFilter,
      },
      {
        ...borderExportLicenceIncotermFilter,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
      {
        name: 'hsCode',
        label: 'HS Code',
        type: 'text',
        defaultValue: '',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Licences By Detail', true),
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'ApplicationDate',
        dataIndex: 'applicationDate',
        title: 'Application Date',
        dataType: 'date',
      },
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'licenceDate',
        title: 'Licence Date',
        dataType: 'date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'BuyerName',
        dataIndex: 'buyerName',
        title: 'Buyer Name',
      },
      {
        key: 'BuyerAddress',
        dataIndex: 'buyerAddress',
        title: 'Buyer Address',
      },
      {
        key: 'BuyerCountry',
        dataIndex: 'buyerCountry',
        title: 'Buyer Country',
      },
      {
        key: 'PlacePortOfExport',
        dataIndex: 'portofExport',
        title: 'Place/Port of Export',
      },
      {
        key: 'PlacePortOfDischarge',
        dataIndex: 'portofDischarge',
        title: 'Place/Port of Discharge',
      },
      {
        key: 'LastDate',
        dataIndex: 'lastDate',
        title: 'Last Date',
        dataType: 'date',
      },
      {
        key: 'Method',
        dataIndex: 'methodName',
        title: 'Method',
      },
      {
        key: 'ConsignedCountry',
        dataIndex: 'consignedCountry',
        title: 'Consigned Country',
      },
      {
        key: 'CountryOfOrign',
        dataIndex: 'countryofOrigin',
        title: 'Country of Orign',
      },
      {
        key: 'CountryOfDestination',
        dataIndex: 'destinationCountry',
        title: 'Country of Destination',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'HSCode',
      },
      {
        key: 'Decription',
        dataIndex: 'hsDescription',
        title: 'Decription',
      },
      {
        key: 'AU',
        dataIndex: 'unit',
        title: 'A/U',
      },
      {
        key: 'Price',
        dataIndex: 'price',
        title: 'Price',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Qty',
        dataIndex: 'quantity',
        title: 'Qty',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Value',
        dataIndex: 'amount',
        title: 'Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        key: 'Conditions',
        dataIndex: 'conditions',
        title: 'Conditions',
      },
    ],
  },
  BorderExportLicenceExtensionReport: {
    controllerName: 'BorderExportLicenceExtensionReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    title: 'Border Export Licence Extension Report',
    apiRoute: 'BorderExportLicenceExtensionReport',
    excelRoute: 'BorderExportLicenceExtensionReport/Excel',
    excelFileName: 'BorderExportLicenceExtensionReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportLicenceSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Licence Report'),
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
        fallbackDataIndexes: ['licenceNo'],
      },
      {
        key: 'ExtensionNo',
        dataIndex: 'licenceNo',
        title: 'Extension No',
      },
      {
        key: 'ExtensionLastDate',
        dataIndex: 'sDate',
        title: 'Extension Last Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  BorderExportLicenceNewReportNewReport: {
    controllerName: 'BorderExportLicenceNewReportNewReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    title: 'Border Export Licence New Report (New Report )',
    apiRoute: 'BorderExportLicenceNewReportNewReport',
    excelRoute: 'BorderExportLicenceNewReportNewReport/Excel',
    excelFileName: 'BorderExportLicenceNewReportNewReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportLicenceSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
      {
        name: 'Auto',
        label: 'Auto',
        type: 'text',
        defaultValue: '',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Licence Report'),
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'licenceDate',
        title: 'Licence Date',
        dataType: 'date',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Auto',
        dataIndex: 'auto',
        title: 'auto',
      },
    ],
  },
  BorderExportLicenceTotalValueLicencesReport: {
    controllerName: 'BorderExportLicenceTotalValueLicencesReport',
    title: 'Border Export Licence Total Value & Licences Report',
    apiRoute: 'BorderExportLicenceTotalValueLicencesReport',
    excelRoute: 'BorderExportLicenceTotalValueLicencesReport/Excel',
    excelFileName: 'BorderExportLicenceTotalValueLicencesReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportLicenceSections',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('Border Export Licences Total Value & Licences'),
    columns: [
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalLicences',
        dataIndex: 'noOfLicences',
        title: 'Total Licences',
      },
    ],
  },
  BorderExportLicenceVoucherReport: {
    controllerName: 'BorderExportLicenceVoucherReport',
    resolveColumns: resolveImportLicenceVoucherColumns,
    title: 'Border Export Licence Voucher Report',
    apiRoute: 'BorderExportLicenceVoucherReport',
    excelRoute: 'BorderExportLicenceVoucherReport/Excel',
    excelFileName: 'BorderExportLicenceVoucherReport.xlsx',
    initialSortColumn: 'ApplicationNo',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportLicenceSections',
      },
      {
        name: 'PaymentType',
        label: 'Payment Type',
        type: 'select',
        defaultValue: '',
        options: [
          { label: 'All', value: '' },
          { label: 'MPU', value: 'MPU' },
          { label: 'Citizen Pay', value: 'CitizenPay' },
        ],
      },
      {
        name: 'ApplyType',
        label: 'Apply Type',
        type: 'select',
        defaultValue: 'New',
        options: [
          { label: 'New', value: 'New' },
          { label: 'Amend', value: 'Amend' },
          { label: 'Extension', value: 'Extension' },
          { label: 'Cancel', value: 'Cancel' },
          { label: 'Actual Amend', value: 'Actual Amend' },
          { label: 'De-Cancel', value: 'De-Cancel' },
        ],
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('Border Export Licence Voucher List'),
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'OriginalLicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
        fallbackDataIndexes: ['licenceNo'],
      },
      {
        key: 'ApplicationDate',
        dataIndex: 'applicationDate',
        title: 'Application Date',
        dataType: 'date',
      },
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'sLicenceDate',
        title: 'Licence Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'VoucherNo',
        dataIndex: 'voucherNo',
        title: 'Voucher No',
      },
      {
        key: 'VoucherDate',
        dataIndex: 'voucherDate',
        title: 'Voucher Date',
        dataType: 'date',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        // Old BorderVoucherReport.rdlc col 11 "Total Amount" = FORMAT(Fields!Amount.Value,"N0")
        // (rdlc:1399) -> AccountTransaction.TotalAmount, the MMK voucher fee. NOT the goods
        // value, which the proc also returns as TotalAmount and the old rdlc never renders.
        key: 'Amount',
        dataIndex: 'amount',
        title: 'Total Amount',
        dataType: 'number',
      },
    ],
  },
  BorderExportPermitActualAmendmentReport: {
    controllerName: 'BorderExportPermitActualAmendmentReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Permit Report'),
    title: 'Border Export Permit Actual Amendment Report',
    apiRoute: 'BorderExportPermitActualAmendmentReport',
    excelRoute: 'BorderExportPermitActualAmendmentReport/Excel',
    excelFileName: 'BorderExportPermitActualAmendmentReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportPermitSections',
      },
      {
        name: 'AmendRemarkId',
        label: 'Remark',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceAmendmentNo',
        dataIndex: 'licenceNo',
        title: 'Licence Amendment No',
      },
      {
        key: 'AmendmentDate',
        dataIndex: 'sDate',
        title: 'Amendment Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'HS Code',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  BorderExportPermitAmendmentReport: {
    controllerName: 'BorderExportPermitAmendmentReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Permit Report'),
    title: 'Border Export Permit Amendment Report',
    apiRoute: 'BorderExportPermitAmendmentReport',
    excelRoute: 'BorderExportPermitAmendmentReport/Excel',
    excelFileName: 'BorderExportPermitAmendmentReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportPermitSections',
      },
      {
        name: 'AmendRemarkId',
        label: 'Remark',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceAmendmentNo',
        dataIndex: 'licenceNo',
        title: 'Licence Amendment No',
      },
      {
        key: 'AmendmentDate',
        dataIndex: 'sDate',
        title: 'Amendment Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  // Bug-for-bug with Tradenet 2.0's Border Export Permit By HS Code screen (customer complaint
  // 2026-09-07 "record မကိုက်ပါ", same owner decision as the Border Import Permit twin on
  // 2026-09-05): the old screen posts FormType = "Export Permit" (legacy ReportsController.cs:14120
  // + a hidden field), so it lists the OVERSEA Export Permit rows and ignores its own Sakhan and
  // Export Section boxes. The controller now sends the same FormType; the two boxes stay as the
  // dead controls the old form had. Columns = BorderHSCodeReport.rdlc: Sr.No., HS Code,
  // Description, No of Licences (CountDistinct), Total Value (FORMAT(Sum(Amount),"N4")), Currency;
  // the HS Code cell opens BorderHSCodeDetailReport in a new window (rdlc:581 window.open _blank).
  BorderExportPermitByHSCodeReport: {
    controllerName: 'BorderExportPermitByHSCodeReport',
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Permit By HS Code', true),
    title: 'Border Export Permit By HS Code Report',
    apiRoute: 'BorderExportPermitByHSCodeReport',
    excelRoute: 'BorderExportPermitByHSCodeReport/Excel',
    excelFileName: 'BorderExportPermitByHSCodeReport.xlsx',
    // No initialSortColumn: 'SakhanId' is not a property of ReportAggregateResult, so it was only
    // ever inert (BasicTable declares the prop and never posts it) and was an HTTP 500 before the
    // sp_HSCodeReport.GridSortColumnOrNull guard. Removed 2026-09-10; keep that guard.
    // Legacy RDLC printed every row on one scrolling page; these summaries are a
    // handful of (HS code, currency) rows, so a 10-row page looked like missing data
    // next to the old report.
    defaultPageSize: 1000,
    showRowNumber: true,
    rowNumberTitle: 'Sr.No.',
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportPermitSections',
      },
      {
        name: 'FilterType',
        label: 'Filter By',
        type: 'select',
        defaultValue: 'Start',
        options: [
          { label: 'Start', value: 'Start' },
          { label: 'End', value: 'End' },
        ],
      },
      {
        name: 'hsCode',
        label: 'HS Code',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'HS Code',
        drilldown: {
          targetReportKey: 'BorderExportPermitHSCodeDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'ExportImportSectionId', 'FilterType', 'SakhanId'],
          rowParams: { hsCode: 'hsCode' },
          openInNewTab: true,
        },
      },
      {
        key: 'Description',
        dataIndex: 'hsDescription',
        title: 'Description',
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
        dataType: 'number',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        // 'money' + '#,##0.0000' is the Money4 cell format in the .xlsx and the grid's
        // N4 render, matching old BorderHSCodeReport.rdlc:713 =FORMAT(Sum(Fields!Amount.Value),"N4").
        dataType: 'money',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderExportPermitHSCodeDetailReport: {
    // Drill target only, reached from the By HS Code summary's HS Code cell. Its
    // controllerName is deliberately the summary's (same endpoint), which is exactly why it
    // needs hideInMenu: createReportItem keys the menu off controllerName, so leaving it
    // visible rendered a second row with the summary's own key and link.
    hideInMenu: true,
    controllerName: 'BorderExportPermitByHSCodeReport',
    // Legacy BorderHSCodeDetailReport builds header1 as "List of " + FormType + "s By HS Code
    // From (…) To (…)" from the FormType the summary posted. That rule is kept; the FormType it
    // reads changed to "Border Export Permit" on 2026-09-10, so the drill is now titled after the
    // border permits it actually lists instead of the oversea ones the old screen mislabelled it
    // with (ReportsController.cs, action BorderHSCodeDetailReport).
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Permits By HS Code', true),
    title: 'HS Code Detail Report',
    apiRoute: 'BorderExportPermitByHSCodeReport',
    excelRoute: 'BorderExportPermitByHSCodeReport/Excel',
    excelFileName: 'BorderExportPermitHSCodeDetailReport.xlsx',
    initialSortColumn: 'hsCode',
    // One scrolling page like the legacy report viewer (see the summary above).
    defaultPageSize: 1000,
    showRowNumber: true,
    rowNumberTitle: 'Sr.No.',
    filters: [
      importLicenceDateRangeFilter,
      importLicenceFormTypeFilter,
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportPermitSections',
      },
      importLicenceFilterTypeFilter,
      importLicenceHSCodeFilter,
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
      // This drill shares BorderExportPermitByHSCodeReport's controller. The old
      // HSCodeDetailReport.rdlc groups on (HS code, company) while the summary's
      // BorderHSCodeReport.rdlc groups on (HS code, currency), and the two arrive at
      // the backend as the same parameters -- so the drill has to say which shape it
      // wants. Never rendered; always posted (see getDerivedFilterValues).
      {
        name: 'GroupBy',
        label: 'Group By',
        type: 'text',
        constantValue: 'Company',
      },
    ],
    columns: hsCodeDetailColumns,
  },
  BorderExportPermitBySectionReport: {
    controllerName: 'BorderExportPermitBySectionReport',
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Permit By Section', true),
    title: 'Border Export Permit By Section Report',
    apiRoute: 'BorderExportPermitBySectionReport',
    excelRoute: 'BorderExportPermitBySectionReport/Excel',
    excelFileName: 'BorderExportPermitBySectionReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'Type',
        label: 'Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportPermitSections',
      },
      {
        name: 'BuyerCountryId',
        label: 'Buyer Country',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
        drilldown: {
          targetReportKey: 'BorderExportPermitDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'Type', 'PaThaKaTypeId'],
          rowParams: { ExportImportSectionId: 'sectionId' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderExportPermitBySellerCountryReport: {
    controllerName: 'BorderExportPermitBySellerCountryReport',
    reportSubtitle: importLicenceRangeSubtitle('List of Export Permit By Buyer Country', true),
    title: 'Border Export Permit By Buyer Country Report',
    apiRoute: 'BorderExportPermitBySellerCountryReport',
    excelRoute: 'BorderExportPermitBySellerCountryReport/Excel',
    excelFileName: 'BorderExportPermitByBuyerCountryReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'Type',
        label: 'Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportPermitSections',
      },
      {
        name: 'BuyerCountryId',
        label: 'Buyer Country',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'Country',
        dataIndex: 'country',
        title: 'Country',
        drilldown: {
          targetReportKey: 'BorderExportPermitDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId', 'SakhanId'],
          rowParams: { BuyerCountryId: 'countryId' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderExportPermitCancellationReport: {
    controllerName: 'BorderExportPermitCancellationReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Permit Report'),
    title: 'Border Export Permit Cancellation Report',
    apiRoute: 'BorderExportPermitCancellationReport',
    excelRoute: 'BorderExportPermitCancellationReport/Excel',
    excelFileName: 'BorderExportPermitCancellationReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportPermitSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
      },
      {
        key: 'CancellationNo',
        dataIndex: 'licenceNo',
        title: 'Cancellation No',
      },
      {
        key: 'CancellationDate',
        dataIndex: 'sDate',
        title: 'Cancellation Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'HS Code',
      },
      {
        key: 'Remark',
        dataIndex: 'remark',
        title: 'Remark',
      },
    ],
  },
  BorderExportPermitCompanyListReport: {
    controllerName: 'BorderExportPermitCompanyListReport',
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Permit By Company', true),
    title: 'Border Export Permit Company List Report',
    apiRoute: 'BorderExportPermitCompanyListReport',
    excelRoute: 'BorderExportPermitCompanyListReport/Excel',
    excelFileName: 'BorderExportPermitCompanyListReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'Type',
        label: 'Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportPermitSections',
      },
      {
        name: 'BuyerCountryId',
        label: 'Buyer Country',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      // BorderExportPermitByCompanyReport.cshtml:71 -- read-only, display only.
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
        drilldown: {
          targetReportKey: 'BorderExportPermitDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId', 'SakhanId'],
          rowParams: { CompanyRegistrationNo: 'companyRegistrationNo' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderExportPermitDailyReportNewPermitReport: {
    controllerName: 'BorderExportPermitDailyReportNewPermitReport',
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Permit By Daily', true),
    title: 'Border Export Permit Daily Report (New Permit Report)',
    apiRoute: 'BorderExportPermitDailyReportNewPermitReport',
    excelRoute: 'BorderExportPermitDailyReportNewPermitReport/Excel',
    excelFileName: 'BorderExportPermitDailyReportNewPermitReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    defaultPageSize: 1000,
    // BorderExportPermitByDailyReport.rdlc:616 prints the serial column; blank header at
    // rdlc:281. Same false negative as BorderImportLicenceDailyReportNewLicenceReport.
    showRowNumber: true,
    rowNumberTitle: 'Sr.No.',
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        defaultDateRangeMonths: 3,
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportPermitSections',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'Date',
        dataIndex: 'date',
        title: 'Date',
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
        dataType: 'number',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalUSDValue',
        dataIndex: 'totalUSDValue',
        title: 'Total USD Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  BorderExportPermitDetailReport: {
    controllerName: 'BorderExportPermitDetailReport',
    currencyTotalsColumns: { labelColumnKey: 'PermitNo', valueColumnKey: 'Value' },
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Permit By Detail', true),
    title: 'Border Export Permit Detail Report',
    apiRoute: 'BorderExportPermitDetailReport',
    excelRoute: 'BorderExportPermitDetailReport/Excel',
    excelFileName: 'BorderExportPermitDetailReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        defaultDateRangeMonths: 3,
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportPermitSections',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'PermitNo',
        dataIndex: 'licenceNo',
        title: 'Permit No',
      },
      {
        key: 'PermitDate',
        dataIndex: 'licenceDate',
        title: 'Permit Date',
        dataType: 'date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'UnionCitizenshipNo',
        dataIndex: 'nrcNo',
        title: 'Union Citizenship No',
      },
      {
        key: 'ConsigneeName',
        dataIndex: 'consigneeName',
        title: 'Consignee Name',
      },
      {
        key: 'ConsigneeAddress',
        dataIndex: 'consigneeAddress',
        title: 'Consignee Address',
      },
      {
        key: 'BuyerCountry',
        dataIndex: 'buyerCountry',
        title: 'Buyer Country',
      },
      {
        key: 'PlacePortOfExport',
        dataIndex: 'portofExport',
        title: 'Place/Port of Export',
      },
      {
        key: 'PlacePortOfDischarge',
        dataIndex: 'portofDischarge',
        title: 'Place/Port of Discharge',
      },
      {
        key: 'LastDate',
        dataIndex: 'lastDate',
        title: 'Last Date',
        dataType: 'date',
      },
      {
        key: 'CountryOfOrign',
        dataIndex: 'countryofOrigin',
        title: 'Country of Orign',
      },
      {
        key: 'ConsignedCountry',
        dataIndex: 'consignedCountry',
        title: 'Consigned Country',
      },
      {
        key: 'CountryOfDestination',
        dataIndex: 'destinationCountry',
        title: 'Country of Destination',
      },
      {
        key: 'TypeOfPermit',
        dataIndex: 'permitType',
        title: 'Type of Permit',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'HSCode',
      },
      {
        key: 'Decription',
        dataIndex: 'hsDescription',
        title: 'Decription',
      },
      {
        key: 'AU',
        dataIndex: 'unit',
        title: 'A/U',
      },
      {
        key: 'Price',
        dataIndex: 'price',
        title: 'Price',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Qty',
        dataIndex: 'quantity',
        title: 'Qty',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Value',
        dataIndex: 'amount',
        title: 'Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'Conditions',
        dataIndex: 'conditions',
        title: 'Conditions',
      },
    ],
  },
  BorderExportPermitExtensionReport: {
    controllerName: 'BorderExportPermitExtensionReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Permit Report'),
    title: 'Border Export Permit Extension Report',
    apiRoute: 'BorderExportPermitExtensionReport',
    excelRoute: 'BorderExportPermitExtensionReport/Excel',
    excelFileName: 'BorderExportPermitExtensionReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportPermitSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
      },
    ],
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
      },
      {
        key: 'ExtensionNo',
        dataIndex: 'licenceNo',
        title: 'Extension No',
      },
      {
        key: 'ExtensionLastDate',
        dataIndex: 'sDate',
        title: 'Extension Last Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  BorderExportPermitNewReportNewReport: {
    controllerName: 'BorderExportPermitNewReportNewReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Border Export Permit Report'),
    title: 'Border Export Permit New Report (New Report )',
    apiRoute: 'BorderExportPermitNewReportNewReport',
    excelRoute: 'BorderExportPermitNewReportNewReport/Excel',
    excelFileName: 'BorderExportPermitNewReportNewReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportPermitSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      importLicenceCompanyNameFilter,
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
      },
    ],
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'licenceDate',
        title: 'Licence Date',
        dataType: 'date',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  BorderExportPermitVoucherReport: {
    controllerName: 'BorderExportPermitVoucherReport',
    reportSubtitle: importLicenceRangeSubtitle('Border Export Permit Voucher List'),
    resolveColumns: resolveImportLicenceVoucherColumns,
    title: 'Border Export Permit Voucher Report',
    apiRoute: 'BorderExportPermitVoucherReport',
    excelRoute: 'BorderExportPermitVoucherReport/Excel',
    excelFileName: 'BorderExportPermitVoucherReport.xlsx',
    // Legacy dbo.sp_VoucherReport orders by AccountTransaction.PaymentDate = the 'Date' column
    // (the procedure's own default is ApplicationNo). Measured on UAT 2026-09-07: only 'Date'
    // reproduces the old report's row order.
    initialSortColumn: 'Date',
    showRowNumber: true,
    // BorderVoucherReport.rdlc:261 labels the row-number column "No.".
    rowNumberTitle: 'No.',
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderExportPermitSections',
      },
      {
        name: 'PaymentType',
        label: 'Payment Type',
        type: 'select',
        defaultValue: '',
        options: voucherPaymentTypeOptions,
      },
      {
        name: 'ApplyType',
        label: 'Apply Type',
        type: 'select',
        defaultValue: '',
        options: [
          { label: '--- All ---', value: '' },
          { label: 'New', value: 'New' },
          { label: 'Amend', value: 'Amend' },
          { label: 'Extension', value: 'Extension' },
          { label: 'Cancel', value: 'Cancel' },
          { label: 'Actual Amend', value: 'Actual Amend' },
          { label: 'De-Cancel', value: 'De-Cancel' },
        ],
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'OriginalLicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
        fallbackDataIndexes: ['licenceNo'],
      },
      {
        key: 'ApplicationDate',
        dataIndex: 'applicationDate',
        title: 'Application Date',
        dataType: 'date',
      },
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'sLicenceDate',
        title: 'Licence Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'VoucherNo',
        dataIndex: 'voucherNo',
        title: 'Voucher No',
      },
      {
        key: 'VoucherDate',
        dataIndex: 'voucherDate',
        title: 'Voucher Date',
        dataType: 'date',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        key: 'Amount',
        dataIndex: 'amount',
        title: 'Total Amount',
        dataType: 'number',
        // BorderVoucherReport.rdlc:1631 =FORMAT(Fields!Amount.Value,"N0") and the TOTAL footer
        // :1808 =FORMAT(SUM(Fields!Amount.Value),"N0"): thousands separators, no decimals --
        // the same string in the grid and (via the presentation spec) in the .xlsx.
        numberFormat: '#,##0',
      },
    ],
  },
  BorderImportLicenceActualAmendmentReport: {
    controllerName: 'BorderImportLicenceActualAmendmentReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Licence Report'),
    title: 'Border Import Licence Actual Amendment Report',
    apiRoute: 'BorderImportLicenceActualAmendmentReport',
    excelRoute: 'BorderImportLicenceActualAmendmentReport/Excel',
    excelFileName: 'BorderImportLicenceActualAmendmentReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: borderImportLicenceAmendActionFilters,
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
        fallbackDataIndexes: ['licenceNo'],
      },
      {
        key: 'LicenceAmendmentNo',
        dataIndex: 'licenceNo',
        title: 'Licence Amendment No',
      },
      {
        key: 'AmendmentDate',
        dataIndex: 'sDate',
        title: 'Amendment Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  BorderImportLicenceAmendmentReport: {
    controllerName: 'BorderImportLicenceAmendmentReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Licence Report'),
    title: 'Border Import Licence Amendment Report',
    apiRoute: 'BorderImportLicenceAmendmentReport',
    excelRoute: 'BorderImportLicenceAmendmentReport/Excel',
    excelFileName: 'BorderImportLicenceAmendmentReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: borderImportLicenceAmendActionFilters,
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
        fallbackDataIndexes: ['licenceNo'],
      },
      {
        key: 'LicenceAmendmentNo',
        dataIndex: 'licenceNo',
        title: 'Licence Amendment No',
      },
      {
        key: 'AmendmentDate',
        dataIndex: 'sDate',
        title: 'Amendment Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  // One row per (HS code, currency) -- BorderHSCodeReport.rdlc's row group (rdlc:1160-1161).
  // The backend used to add the buyer company to that key, which printed one invisible row per
  // buyer with a partial Total Value (9213 rows against the old report's 2881 for 2025; one
  // HS code in THB split into 95 rows); see sp_HSCodeReport_pagination.sql's Border Import
  // Licence branch.
  BorderImportLicenceByHSCodeReport: {
    controllerName: 'BorderImportLicenceByHSCodeReport',
    // Legacy header verbatim, plural "Licences" (ReportsController.cs:12432 on origin/master).
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Licences By HS Code', true),
    title: 'Border Import Licence By HS Code Report',
    apiRoute: 'BorderImportLicenceByHSCodeReport',
    excelRoute: 'BorderImportLicenceByHSCodeReport/Excel',
    excelFileName: 'BorderImportLicenceByHSCodeReport.xlsx',
    initialSortColumn: 'SakhanId',
    // Legacy RDLC printed every row on one scrolling page; these summaries are a
    // handful of (HS code, currency) rows, so a 10-row page looked like missing data
    // next to the old report.
    defaultPageSize: 1000,
    showRowNumber: true,
    // BorderHSCodeReport.rdlc:177 prints "Sr.No.".
    rowNumberTitle: 'Sr.No.',
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        ...borderImportLicenceSectionFilter,
      },
      {
        name: 'FilterType',
        label: 'Filter By',
        type: 'select',
        defaultValue: 'Start',
        options: [
          { label: 'Start', value: 'Start' },
          { label: 'End', value: 'End' },
        ],
      },
      {
        name: 'hsCode',
        label: 'HS Code',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'HS Code',
        drilldown: {
          // The old screen's HS Code cell opens Reports/BorderHSCodeDetailReport in a new tab
          // (BorderHSCodeReport.rdlc:581 window.open(...,'_blank'); ReportsController.cs:12430
          // on origin/master) -- HSCodeDetailReport.rdlc's (HS code, company) list, not the
          // Border Import Licence Detail report.
          targetReportKey: 'BorderImportLicenceHSCodeDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'ExportImportSectionId', 'FilterType', 'SakhanId'],
          rowParams: { hsCode: 'hsCode' },
          openInNewTab: true,
        },
      },
      {
        key: 'Description',
        dataIndex: 'hsDescription',
        title: 'Description',
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
        dataType: 'number',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        // 'money' + '#,##0.0000' is the Money4 cell format in the .xlsx and the grid's N4
        // render, matching old BorderHSCodeReport.rdlc:713
        // =FORMAT(Sum(Fields!Amount.Value),"N4").
        dataType: 'money',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderImportLicenceHSCodeDetailReport: {
    // Drill target only, reached from the By HS Code summary's HS Code cell. Its
    // controllerName is deliberately the summary's (same endpoint), which is exactly why it
    // needs hideInMenu: createReportItem keys the menu off controllerName, so leaving it
    // visible rendered a second row with the summary's own key and link.
    hideInMenu: true,
    controllerName: 'BorderImportLicenceByHSCodeReport',
    // Old BorderHSCodeDetailReport header is "List of " + FormType + "s By HS Code From (..) To
    // (..)" (ReportsController.cs:10589 on origin/master), i.e. plural "Licences".
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Licences By HS Code', true),
    title: 'HS Code Detail Report',
    apiRoute: 'BorderImportLicenceByHSCodeReport',
    excelRoute: 'BorderImportLicenceByHSCodeReport/Excel',
    excelFileName: 'BorderImportLicenceHSCodeDetailReport.xlsx',
    initialSortColumn: 'hsCode',
    // Legacy RDLC printed every row on one scrolling page.
    defaultPageSize: 1000,
    showRowNumber: true,
    // HSCodeDetailReport.rdlc:445 prints "Sr.No.".
    rowNumberTitle: 'Sr.No.',
    filters: [
      importLicenceDateRangeFilter,
      importLicenceFormTypeFilter,
      {
        ...borderImportLicenceSectionFilter,
        label: 'Import Section',
      },
      importLicenceFilterTypeFilter,
      importLicenceHSCodeFilter,
      borderImportLicenceSakhanFilter,
      // This drill shares BorderImportLicenceByHSCodeReport's controller. The old
      // HSCodeDetailReport.rdlc groups on (HS code, company) (rdlc:1263-1264) while the
      // summary's BorderHSCodeReport.rdlc groups on (HS code, currency) (rdlc:1160-1161), and
      // the two arrive at the backend as the same parameters -- so the drill has to say which
      // shape it wants. Never rendered; always posted (see getDerivedFilterValues in
      // reportPresentation.ts).
      {
        name: 'GroupBy',
        label: 'Group By',
        type: 'text',
        constantValue: 'Company',
      },
    ],
    columns: hsCodeDetailColumns,
  },
  BorderImportLicenceByMethodReport: {
    controllerName: 'BorderImportLicenceByMethodReport',
    title: 'Border Import Licence By Method Report',
    apiRoute: 'BorderImportLicenceByMethodReport',
    excelRoute: 'BorderImportLicenceByMethodReport/Excel',
    excelFileName: 'BorderImportLicenceByMethodReport.xlsx',
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Licences By Method', true),
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: borderImportLicenceSectionMethodFilters,
    columns: [
      {
        key: 'Method',
        dataIndex: 'methodName',
        title: 'Method',
        drilldown: {
          targetReportKey: 'BorderImportLicenceDetailReport',
          carryFilters: [
            'FromDate',
            'ToDate',
            'SakhanId',
            'PaThaKaTypeId',
            'ExportImportSectionId',
          ],
          rowParams: { ExportImportMethodId: 'methodId', Currency: 'currency' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderImportLicenceBySectionReport: {
    controllerName: 'BorderImportLicenceBySectionReport',
    title: 'Border Import Licence By Section Report',
    apiRoute: 'BorderImportLicenceBySectionReport',
    excelRoute: 'BorderImportLicenceBySectionReport/Excel',
    excelFileName: 'BorderImportLicenceBySectionReport.xlsx',
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Licences By Section', true),
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: borderImportLicenceSectionMethodFilters,
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
        drilldown: {
          targetReportKey: 'BorderImportLicenceDetailReport',
          carryFilters: [
            'FromDate',
            'ToDate',
            'SakhanId',
            'PaThaKaTypeId',
            'ExportImportMethodId',
          ],
          rowParams: { ExportImportSectionId: 'sectionId', Currency: 'currency' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderImportLicenceBySellerCountryReport: {
    controllerName: 'BorderImportLicenceBySellerCountryReport',
    title: 'Border Import Licence By Seller Country Report',
    apiRoute: 'BorderImportLicenceBySellerCountryReport',
    excelRoute: 'BorderImportLicenceBySellerCountryReport/Excel',
    excelFileName: 'BorderImportLicenceBySellerCountryReport.xlsx',
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Licences By Seller Country', true),
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: borderImportLicenceSellerCountryFilters,
    columns: [
      {
        key: 'Country',
        dataIndex: 'country',
        title: 'Country',
        drilldown: {
          targetReportKey: 'BorderImportLicenceDetailReport',
          carryFilters: [
            'FromDate',
            'ToDate',
            'SakhanId',
            'PaThaKaTypeId',
            'ExportImportSectionId',
            'ExportImportMethodId',
          ],
          rowParams: { SellerCountryId: 'countryId', Currency: 'currency' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderImportLicenceCancellationReport: {
    controllerName: 'BorderImportLicenceCancellationReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Licence Report'),
    title: 'Border Import Licence Cancellation Report',
    apiRoute: 'BorderImportLicenceCancellationReport',
    excelRoute: 'BorderImportLicenceCancellationReport/Excel',
    excelFileName: 'BorderImportLicenceCancellationReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: borderImportLicenceActionFilters,
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'CancellationNo',
        dataIndex: 'licenceNo',
        title: 'Cancellation No',
      },
      {
        key: 'CancellationDate',
        dataIndex: 'sDate',
        title: 'Cancellation Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'Remark',
        dataIndex: 'remark',
        title: 'Remark',
      },
    ],
  },
  BorderImportLicenceCompanyListReport: {
    controllerName: 'BorderImportLicenceCompanyListReport',
    title: 'Border Import Licence Company List Report',
    apiRoute: 'BorderImportLicenceCompanyListReport',
    excelRoute: 'BorderImportLicenceCompanyListReport/Excel',
    excelFileName: 'BorderImportLicenceCompanyListReport.xlsx',
    reportSubtitle: importLicenceRangeSubtitle('List of Border Licences By Company'),
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: borderImportLicenceCompanyListFilters,
    columns: [
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
        drilldown: {
          targetReportKey: 'BorderImportLicenceDetailReport',
          carryFilters: [
            'FromDate',
            'ToDate',
            'SakhanId',
            'PaThaKaTypeId',
            'ExportImportSectionId',
            'ExportImportMethodId',
          ],
          rowParams: { CompanyRegistrationNo: 'companyRegistrationNo', Currency: 'currency' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderImportLicenceDailyReportNewLicenceReport: {
    controllerName: 'BorderImportLicenceDailyReportNewLicenceReport',
    title: 'Border Import Licence Daily Report (New Licence Report)',
    apiRoute: 'BorderImportLicenceDailyReportNewLicenceReport',
    excelRoute: 'BorderImportLicenceDailyReportNewLicenceReport/Excel',
    excelFileName: 'BorderImportLicenceDailyReportNewLicenceReport.xlsx',
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Licences By Daily', true),
    initialSortColumn: 'PaThaKaTypeId',
    defaultPageSize: 1000,
    // BorderImportLicenceByDailyReport.rdlc:608 prints a leading serial column
    // (=Variables!GroupCountValue.Value, Code.getGroupCounter at rdlc:1329-1333), but its
    // header cell is EMPTY (rdlc:273) -- so the 2026-05-29 column-compare pass read "no
    // column" and switched the row number off on all eight Daily reports. Customer
    // complaint 2026-09-22: "ထိပ်ဆုံးမှာ Sr No column မပါလာလို့ပါတဲ့". Every other Border
    // Import Licence rdlc labels that slot Sr.No. (BorderImportLicenceBySectionReport.rdlc:261).
    showRowNumber: true,
    rowNumberTitle: 'Sr.No.',
    filters: borderImportLicenceDailyFilters,
    columns: [
      {
        key: 'Date',
        dataIndex: 'date',
        title: 'Date',
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
        dataType: 'number',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalUSDValue',
        dataIndex: 'totalUSDValue',
        title: 'Total USD Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  BorderImportLicenceDetailReport: {
    controllerName: 'BorderImportLicenceDetailReport',
    title: 'Border Import Licence Detail Report',
    apiRoute: 'BorderImportLicenceDetailReport',
    excelRoute: 'BorderImportLicenceDetailReport/Excel',
    excelFileName: 'BorderImportLicenceDetailReport.xlsx',
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Licences By Detail', true),
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: borderImportLicenceDetailFilters,
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'ApplicationDate',
        dataIndex: 'applicationDate',
        title: 'Application Date',
        dataType: 'date',
      },
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'licenceDate',
        title: 'Licence Date',
        dataType: 'date',
      },
      {
        key: 'ApproveDate',
        dataIndex: 'approveDate',
        title: 'Approve Date',
        dataType: 'date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'SellerName',
        dataIndex: 'sellerName',
        title: 'Seller Name',
      },
      {
        key: 'SellerAddress',
        dataIndex: 'sellerAddress',
        title: 'Seller Address',
      },
      {
        key: 'SellerCountry',
        dataIndex: 'sellerCountry',
        title: 'Seller Country',
      },
      {
        key: 'PlacePortOfDischarge',
        dataIndex: 'portofDischarge',
        title: 'Place/Port of Discharge',
      },
      {
        key: 'LastDate',
        dataIndex: 'lastDate',
        title: 'Last Date',
        dataType: 'date',
      },
      {
        key: 'Method',
        dataIndex: 'methodName',
        title: 'Method',
      },
      {
        key: 'ConsignedCountry',
        dataIndex: 'consignedCountry',
        title: 'Consigned Country',
      },
      {
        key: 'CountryOfOrign',
        dataIndex: 'countryofOrigin',
        title: 'Country of Orign',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'Decription',
        dataIndex: 'hsDescription',
        title: 'Decription',
      },
      {
        key: 'AU',
        dataIndex: 'unit',
        title: 'A/U',
      },
      {
        key: 'Price',
        dataIndex: 'price',
        title: 'Price',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Qty',
        dataIndex: 'quantity',
        title: 'Qty',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Value',
        dataIndex: 'amount',
        title: 'Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        key: 'Conditions',
        dataIndex: 'conditions',
        title: 'Conditions',
      },
    ],
  },
  BorderImportLicenceDetailReportPending: {
    controllerName: 'BorderImportLicenceDetailReportPending',
    title: 'Border Import Licence Detail Report (Pending)',
    apiRoute: 'BorderImportLicenceDetailReportPending',
    excelRoute: 'BorderImportLicenceDetailReportPending/Excel',
    excelFileName: 'BorderImportLicenceDetailReportPending.xlsx',
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Licences By Detail', true),
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: borderImportLicencePendingDetailFilters,
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'ApplicationDate',
        dataIndex: 'applicationDate',
        title: 'Application Date',
        dataType: 'date',
      },
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'licenceDate',
        title: 'Licence Date',
        dataType: 'date',
      },
      {
        key: 'ApproveDate',
        dataIndex: 'approveDate',
        title: 'Approve Date',
        dataType: 'date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'SellerName',
        dataIndex: 'sellerName',
        title: 'Seller Name',
      },
      {
        key: 'SellerAddress',
        dataIndex: 'sellerAddress',
        title: 'Seller Address',
      },
      {
        key: 'SellerCountry',
        dataIndex: 'sellerCountry',
        title: 'Seller Country',
      },
      {
        key: 'PlacePortOfDischarge',
        dataIndex: 'portofDischarge',
        title: 'Place/Port of Discharge',
      },
      {
        key: 'LastDate',
        dataIndex: 'lastDate',
        title: 'Last Date',
        dataType: 'date',
      },
      {
        key: 'Method',
        dataIndex: 'methodName',
        title: 'Method',
      },
      {
        key: 'ConsignedCountry',
        dataIndex: 'consignedCountry',
        title: 'Consigned Country',
      },
      {
        key: 'CountryOfOrign',
        dataIndex: 'countryofOrigin',
        title: 'Country of Orign',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'Decription',
        dataIndex: 'hsDescription',
        title: 'Decription',
      },
      {
        key: 'AU',
        dataIndex: 'unit',
        title: 'A/U',
      },
      {
        key: 'Price',
        dataIndex: 'price',
        title: 'Price',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Qty',
        dataIndex: 'quantity',
        title: 'Qty',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Value',
        dataIndex: 'amount',
        title: 'Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        key: 'Conditions',
        dataIndex: 'conditions',
        title: 'Conditions',
      },
    ],
  },
  BorderImportLicenceExtensionReport: {
    controllerName: 'BorderImportLicenceExtensionReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Licence Report'),
    title: 'Border Import Licence Extension Report',
    apiRoute: 'BorderImportLicenceExtensionReport',
    excelRoute: 'BorderImportLicenceExtensionReport/Excel',
    excelFileName: 'BorderImportLicenceExtensionReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: borderImportLicenceActionFilters,
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        // BorderExtensionReport.rdlc:374/993 - "Licence No" is the parent licence
        // (OldLicenceNo), not the extension's own E-number.
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
      },
      {
        key: 'ExtensionNo',
        dataIndex: 'licenceNo',
        title: 'Extension No',
      },
      {
        key: 'ExtensionLastDate',
        dataIndex: 'sDate',
        title: 'Extension Last Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  BorderImportLicenceNewReportNewReport: {
    controllerName: 'BorderImportLicenceNewReportNewReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    title: 'Border Import Licence New Report (New Report )',
    apiRoute: 'BorderImportLicenceNewReportNewReport',
    excelRoute: 'BorderImportLicenceNewReportNewReport/Excel',
    excelFileName: 'BorderImportLicenceNewReportNewReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      importLicenceDateRangeFilter,
      borderImportLicenceSakhanFilter,
      borderImportLicenceSectionFilter,
      importLicenceCompanyRegistrationNoFilter,
      importLicenceCompanyNameFilter,
    ],
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'licenceDate',
        title: 'Licence Date',
        dataType: 'date',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Curency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Auto',
        dataIndex: 'auto',
        title: 'auto',
      },
    ],
  },
  BorderImportLicencePendingReport: {
    controllerName: 'BorderImportLicencePendingReport',
    title: 'Border Import Licence Pending Report',
    apiRoute: 'BorderImportLicencePendingReport',
    excelRoute: 'BorderImportLicencePendingReport/Excel',
    excelFileName: 'BorderImportLicencePendingReport.xlsx',
    initialSortColumn: 'Status',
    showRowNumber: true,
    filters: [importLicenceDateRangeFilter, borderImportLicenceSectionFilter],
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'Status',
        dataIndex: 'status',
        title: 'Status',
      },
      {
        key: 'ApplyType',
        dataIndex: 'applyType',
        title: 'Apply Type',
      },
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        key: 'ApplicationDate',
        dataIndex: 'applicationDate',
        title: 'Application Date',
        dataType: 'date',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'licenceDate',
        title: 'Licence Date',
        dataType: 'date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        key: 'HSCode',
        dataIndex: 'hsCode',
        title: 'HSCode',
      },
      {
        key: 'AdditionalDescription',
        dataIndex: 'additionalDescription',
        title: 'Additional Description',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Curency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  BorderImportLicenceTotalValueLicencesReport: {
    controllerName: 'BorderImportLicenceTotalValueLicencesReport',
    title: 'Border Import Licence Total Value & Licences Report',
    apiRoute: 'BorderImportLicenceTotalValueLicencesReport',
    excelRoute: 'BorderImportLicenceTotalValueLicencesReport/Excel',
    excelFileName: 'BorderImportLicenceTotalValueLicencesReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: borderImportLicenceTotalValueFilters,
    reportSubtitle: importLicenceRangeSubtitle(
      'Border Import Licences Total Value & Licences'
    ),
    columns: [
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderImportLicenceVoucherReport: {
    controllerName: 'BorderImportLicenceVoucherReport',
    title: 'Border Import Licence Voucher Report',
    apiRoute: 'BorderImportLicenceVoucherReport',
    excelRoute: 'BorderImportLicenceVoucherReport/Excel',
    excelFileName: 'BorderImportLicenceVoucherReport.xlsx',
    initialSortColumn: 'ApplicationNo',
    showRowNumber: true,
    filters: borderImportLicenceVoucherFilters,
    reportSubtitle: importLicenceRangeSubtitle('Import Licence Voucher List'),
    resolveColumns: resolveBorderImportLicenceVoucherColumns,
    columns: [
      {
        key: 'OriginalLicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
        fallbackDataIndexes: ['licenceNo'],
      },
      {
        key: 'ApplicationDate',
        dataIndex: 'applicationDate',
        title: 'Application Date',
        dataType: 'date',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: '=Parameters!header2.Value',
      },
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'sLicenceDate',
        title: '=Parameters!header3.Value',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'LicValue',
        dataIndex: 'totalAmount',
        title: 'Lic Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'VoucherNo',
        dataIndex: 'voucherNo',
        title: 'Voucher No',
      },
      {
        key: 'VoucherDate',
        dataIndex: 'voucherDate',
        title: 'Voucher Date',
        dataType: 'date',
      },
      {
        key: 'ApprovedUser',
        dataIndex: 'approvedUser',
        title: 'Approved User',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        key: 'TotalCIF',
        dataIndex: 'totalCIF',
        title: 'Total CIF',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'ExchangeRate',
        dataIndex: 'exchangeRate',
        title: 'Exchange Rate',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Amount',
        dataIndex: 'amount',
        title: 'Total Amount',
        dataType: 'number',
      },
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
    ],
  },
  BorderImportPermitActualAmendmentReport: {
    controllerName: 'BorderImportPermitActualAmendmentReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Permit Report'),
    title: 'Border Import Permit Actual Amendment Report',
    apiRoute: 'BorderImportPermitActualAmendmentReport',
    excelRoute: 'BorderImportPermitActualAmendmentReport/Excel',
    excelFileName: 'BorderImportPermitActualAmendmentReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderImportPermitSections',
      },
      {
        name: 'AmendRemarkId',
        label: 'Remark',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
        fallbackDataIndexes: ['licenceNo'],
      },
      {
        key: 'LicenceAmendmentNo',
        dataIndex: 'licenceNo',
        title: 'Licence Amendment No',
      },
      {
        key: 'AmendmentDate',
        dataIndex: 'sDate',
        title: 'Amendment Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
    ],
  },
  BorderImportPermitAmendmentReport: {
    controllerName: 'BorderImportPermitAmendmentReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Permit Report'),
    title: 'Border Import Permit Amendment Report',
    apiRoute: 'BorderImportPermitAmendmentReport',
    excelRoute: 'BorderImportPermitAmendmentReport/Excel',
    excelFileName: 'BorderImportPermitAmendmentReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderImportPermitSections',
      },
      {
        name: 'AmendRemarkId',
        label: 'Remark',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceAmendmentNo',
        dataIndex: 'licenceNo',
        title: 'Licence Amendment No',
      },
      {
        key: 'AmendmentDate',
        dataIndex: 'sDate',
        title: 'Amendment Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
    ],
  },
  // Reproduces Tradenet 2.0 bug-for-bug (owner decision, 2026-09-05): the old screen ran
  // the OVERSEA Import Permit query (legacy ReportsController.cs:15465 sets FormType =
  // "Import Permit"), so the backend does too, and the Sakhan / Import Section dropdowns
  // below are the same dead controls the old form had -- kept for filter-box parity.
  BorderImportPermitByHSCodeReport: {
    controllerName: 'BorderImportPermitByHSCodeReport',
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Permit By HS Code', true),
    title: 'Border Import Permit By HS Code Report',
    apiRoute: 'BorderImportPermitByHSCodeReport',
    excelRoute: 'BorderImportPermitByHSCodeReport/Excel',
    excelFileName: 'BorderImportPermitByHSCodeReport.xlsx',
    // No initialSortColumn -- see the Border Export Permit twin: 'SakhanId' is not a property of
    // ReportAggregateResult, so it was inert at best and a 500 before the GridSortColumnOrNull guard.
    // Legacy RDLC printed every row on one scrolling page; these summaries are a
    // handful of (group, currency) rows, so a 10-row page looked like missing data
    // next to the old report (Company List: 13 rows, page 1 showed 10).
    defaultPageSize: 1000,
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderImportPermitSections',
      },
      {
        name: 'FilterType',
        label: 'Filter By',
        type: 'select',
        defaultValue: 'Start',
        options: [
          { label: 'Start', value: 'Start' },
          { label: 'End', value: 'End' },
        ],
      },
      {
        name: 'hsCode',
        label: 'HS Code',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'HS Code',
        drilldown: {
          targetReportKey: 'BorderImportPermitHSCodeDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'ExportImportSectionId', 'FilterType', 'SakhanId'],
          rowParams: { hsCode: 'hsCode' },
        },
      },
      {
        key: 'Description',
        dataIndex: 'hsDescription',
        title: 'Description',
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderImportPermitHSCodeDetailReport: {
    // Drill target only, reached from the By HS Code summary's HS Code cell. Its
    // controllerName is deliberately the summary's (same endpoint), which is exactly why it
    // needs hideInMenu: createReportItem keys the menu off controllerName, so leaving it
    // visible rendered a second row with the summary's own key and link.
    hideInMenu: true,
    controllerName: 'BorderImportPermitByHSCodeReport',
    title: 'HS Code Detail Report',
    // Legacy header1 is "List of " + <posted FormType> + "s By HS Code From (…) To (…)"; with the
    // 2026-09-10 switch that FormType is "Border Import Permit". Matches the Export twin.
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Permits By HS Code', true),
    apiRoute: 'BorderImportPermitByHSCodeReport',
    excelRoute: 'BorderImportPermitByHSCodeReport/Excel',
    excelFileName: 'BorderImportPermitHSCodeDetailReport.xlsx',
    initialSortColumn: 'hsCode',
    // Legacy RDLC printed every row on one scrolling page; these summaries are a
    // handful of (group, currency) rows, so a 10-row page looked like missing data
    // next to the old report (Company List: 13 rows, page 1 showed 10).
    defaultPageSize: 1000,
    showRowNumber: true,
    filters: [
      importLicenceDateRangeFilter,
      importLicenceFormTypeFilter,
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderImportPermitSections',
      },
      importLicenceFilterTypeFilter,
      importLicenceHSCodeFilter,
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
      // This drill shares BorderImportPermitByHSCodeReport's controller. The old
      // HSCodeDetailReport.rdlc groups on (HS code, company) while the summary's
      // BorderHSCodeReport.rdlc groups on (HS code, currency), and the two arrive at
      // the backend as the same parameters -- so the drill has to say which shape it
      // wants. Never rendered; always posted (see getDerivedFilterValues).
      {
        name: 'GroupBy',
        label: 'Group By',
        type: 'text',
        constantValue: 'Company',
      },
    ],
    columns: hsCodeDetailColumns,
  },
  // Byte-for-byte parity with Tradenet 2.0's BorderImportPermitBySectionReport.rdlc (owner
  // decision 2026-09-06, "even where the old code is wrong"). Same dbo.sp_ImportPermitDetailReport
  // 'Border' rows as the Detail report, grouped on (SectionName, Currency) with NO sort
  // (rdlc:1077-1089) -- so the API returns the groups in first-appearance order, not
  // alphabetically. Header = the old header1 line, row label "Sr.No." (the rdlc's Code
  // group counter), Total Value = FORMAT(Sum(Amount),"N4"), the TOTAL footer carries only
  // CountDistinct(LicenceNo) (rdlc:853-907), and the Section cell drills to the Detail report in a
  // new window (rdlc:610). Filter box = Views/Reports/BorderImportPermitBySectionReport.cshtml:25-59:
  // From Date, To Date, Sakhan, EIR Card Type, Import Section. Seller Country / Company
  // Registration No have no box there; they stay on the DTO for drill-downs.
  BorderImportPermitBySectionReport: {
    controllerName: 'BorderImportPermitBySectionReport',
    title: 'Border Import Permit By Section Report',
    apiRoute: 'BorderImportPermitBySectionReport',
    excelRoute: 'BorderImportPermitBySectionReport/Excel',
    excelFileName: 'BorderImportPermitBySectionReport.xlsx',
    // Legacy RDLC printed every row on one scrolling page; these summaries are a
    // handful of (group, currency) rows, so a 10-row page looked like missing data
    // next to the old report (Company List: 13 rows, page 1 showed 10).
    defaultPageSize: 1000,
    showRowNumber: true,
    rowNumberTitle: 'Sr.No.',
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Permit By Section', true),
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'Type',
        label: 'Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderImportPermitSections',
      },
    ],
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
        drilldown: {
          targetReportKey: 'BorderImportPermitDetailReport',
          // Old rdlc:610: url carries fdate, tdate, pathakatype, sakhan (+ the section box,
          // overridden by the clicked row's id via &header=section&filter=<ExportImportSectionId>).
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'SakhanId'],
          rowParams: { ExportImportSectionId: 'sectionId' },
          // Old rdlc:610 drills through with window.open(..., '_blank').
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        // 'money' + '#,##0.0000' is the Money4 cell format in the .xlsx and the grid's
        // N4 render, matching old rdlc:688 =FORMAT(Sum(Fields!Amount.Value),"N4").
        dataType: 'money',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderImportPermitBySellerCountryReport: {
    controllerName: 'BorderImportPermitBySellerCountryReport',
    title: 'Border Import Permit By Seller Country Report',
    apiRoute: 'BorderImportPermitBySellerCountryReport',
    excelRoute: 'BorderImportPermitBySellerCountryReport/Excel',
    excelFileName: 'BorderImportPermitBySellerCountryReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    // Legacy RDLC printed every row on one scrolling page; these summaries are a
    // handful of (group, currency) rows, so a 10-row page looked like missing data
    // next to the old report (Company List: 13 rows, page 1 showed 10).
    defaultPageSize: 1000,
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'Type',
        label: 'Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderImportPermitSections',
      },
      {
        name: 'SellerCountryId',
        label: 'Seller Country',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
      },
    ],
    columns: [
      {
        key: 'Country',
        dataIndex: 'country',
        title: 'Country',
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderImportPermitCancellationReport: {
    controllerName: 'BorderImportPermitCancellationReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Permit Report'),
    title: 'Border Import Permit Cancellation Report',
    apiRoute: 'BorderImportPermitCancellationReport',
    excelRoute: 'BorderImportPermitCancellationReport/Excel',
    excelFileName: 'BorderImportPermitCancellationReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderImportPermitSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'CancellationNo',
        dataIndex: 'licenceNo',
        title: 'Cancellation No',
      },
      {
        key: 'CancellationDate',
        dataIndex: 'sDate',
        title: 'Cancellation Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'Remark',
        dataIndex: 'remark',
        title: 'Remark',
      },
    ],
  },
  // Byte-for-byte parity with Tradenet 2.0's BorderImportPermitByCompanyReport.rdlc (owner
  // decision 2026-09-06, "even where the old code is wrong"). Same dbo.sp_ImportPermitDetailReport
  // 'Border' rows as the Detail report, grouped on (CompanyRegistrationNo, Currency) with NO sort
  // (rdlc:1076-1084) -- so the API returns the groups in first-appearance order, not
  // alphabetically, and shows each group's FIRST company name. The header is the old header1
  // line verbatim -- legacy ReportsController.cs:15425 builds "List of Import Permit By Company
  // (<from>) To (<to>)" for this BORDER screen, no "Border", no "From"; kept as is. Row label
  // "Sr.No." (the rdlc's Code group counter), Total Value = FORMAT(Sum(Amount),"N4"), the TOTAL
  // footer carries only CountDistinct(LicenceNo) (rdlc:851-905), and the Company Name cell drills
  // to the Detail report in a new window (rdlc:608). Filter box =
  // Views/Reports/BorderImportPermitByCompanyReport.cshtml:25-72: From Date, To Date, Sakhan,
  // EIR Card Type, Import Section, Company Registration No, Company Name (readonly). No Seller
  // Country box there; it stays on the DTO for drill-downs.
  BorderImportPermitCompanyListReport: {
    controllerName: 'BorderImportPermitCompanyListReport',
    title: 'Border Import Permit Company List Report',
    apiRoute: 'BorderImportPermitCompanyListReport',
    excelRoute: 'BorderImportPermitCompanyListReport/Excel',
    excelFileName: 'BorderImportPermitCompanyListReport.xlsx',
    // Legacy RDLC printed every row on one scrolling page; these summaries are a
    // handful of (group, currency) rows, so a 10-row page looked like missing data
    // next to the old report (Company List: 13 rows, page 1 showed 10).
    defaultPageSize: 1000,
    showRowNumber: true,
    rowNumberTitle: 'Sr.No.',
    reportSubtitle: reportDateRangeSubtitle('List of Import Permit By Company'),
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'Type',
        label: 'Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderImportPermitSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
    ],
    columns: [
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
        drilldown: {
          targetReportKey: 'BorderImportPermitDetailReport',
          // Old rdlc:608: url carries fdate, tdate, pathakatype, section, sakhan (+ the
          // registration box, overridden by the clicked row's number via
          // &header=company&filter=<CompanyRegistrationNo>).
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId', 'SakhanId'],
          rowParams: { CompanyRegistrationNo: 'companyRegistrationNo' },
          // Old rdlc:608 drills through with window.open(..., '_blank').
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        // 'money' + '#,##0.0000' is the Money4 cell format in the .xlsx and the grid's
        // N4 render, matching old rdlc:686 =FORMAT(Sum(Fields!Amount.Value),"N4").
        dataType: 'money',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  BorderImportPermitDailyReportNewPermitReport: {
    controllerName: 'BorderImportPermitDailyReportNewPermitReport',
    title: 'Border Import Permit Daily Report (New Permit Report)',
    apiRoute: 'BorderImportPermitDailyReportNewPermitReport',
    excelRoute: 'BorderImportPermitDailyReportNewPermitReport/Excel',
    excelFileName: 'BorderImportPermitDailyReportNewPermitReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    defaultPageSize: 1000,
    // BorderImportPermitByDailyReport.rdlc:608 prints the serial column; blank header at
    // rdlc:273. Same false negative as BorderImportLicenceDailyReportNewLicenceReport.
    showRowNumber: true,
    rowNumberTitle: 'Sr.No.',
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'Type',
        label: 'Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderImportPermitSections',
      },
      {
        name: 'SellerCountryId',
        label: 'Seller Country',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
      },
    ],
    columns: [
      {
        key: 'Date',
        dataIndex: 'date',
        title: 'Date',
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
        dataType: 'number',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalUSDValue',
        dataIndex: 'totalUSDValue',
        title: 'Total USD Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  // Byte-for-byte parity with Tradenet 2.0's BorderImportPermitDetailReport.rdlc (owner
  // decision 2026-09-06, "even where the old code is wrong"). The grid is served by the legacy
  // dbo.sp_ImportPermitDetailReport 'Border' query verbatim
  // (sp_BorderImportPermitDetailReport_pagination); the header is the old header1 line; the row
  // label is the RDLC's "Sr.No."; Permit Date / Last Date print as dd/MM/yyyy (the old model's
  // sLicenceDate / LastDate strings); Price and Value as FORMAT(..., "N4"), Qty as "N2"; every
  // row on one page like the old ReportViewer; Company Address is the old
  // CommonRepository.GetAddress string, now sent by the API. Filter box =
  // Views/Reports/BorderImportPermitDetailReport.cshtml:28-62: From Date, To Date, Sakhan,
  // EIR Card Type, Import Section. Seller Country / Company Registration No have no box there
  // either; a By-X drill-down still reaches the request with them (drill effect in
  // GenericReportPage). `Type` is the old hidden field; the controller pins it to Border.
  BorderImportPermitDetailReport: {
    controllerName: 'BorderImportPermitDetailReport',
    title: 'Border Import Permit Detail Report',
    apiRoute: 'BorderImportPermitDetailReport',
    excelRoute: 'BorderImportPermitDetailReport/Excel',
    excelFileName: 'BorderImportPermitDetailReport.xlsx',
    showRowNumber: true,
    rowNumberTitle: 'Sr.No.',
    defaultPageSize: 1000,
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Permit By Detail', true),
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'Type',
        label: 'Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderImportPermitSections',
      },
    ],
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'PermitNo',
        dataIndex: 'licenceNo',
        title: 'Permit No',
      },
      {
        key: 'PermitDate',
        dataIndex: 'licenceDate',
        title: 'Permit Date',
        dataType: 'date',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'UnionCitizenshipNo',
        dataIndex: 'nrcNo',
        title: 'Union Citizenship No',
      },
      {
        key: 'AgentName',
        dataIndex: 'authorisedAgentName',
        title: 'Agent Name',
      },
      {
        key: 'AgentAddress',
        dataIndex: 'authorisedAgentAddress',
        title: 'Agent Address',
      },
      {
        key: 'SellerCountry',
        dataIndex: 'sellerCountry',
        title: 'Seller Country',
      },
      {
        key: 'PortOfShipment',
        dataIndex: 'portofShipment',
        title: 'Port of Shipment',
      },
      {
        key: 'PlacePortOfDischarge',
        dataIndex: 'portofDischarge',
        title: 'Place/Port of Discharge',
      },
      {
        key: 'LastDate',
        dataIndex: 'lastDate',
        title: 'Last Date',
        dataType: 'date',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        key: 'CountryOfOrign',
        dataIndex: 'countryofOrigin',
        title: 'Country of Orign',
      },
      {
        key: 'TypeOfPermit',
        dataIndex: 'permitType',
        title: 'Type of Permit',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'HSCode',
      },
      {
        key: 'Decription',
        dataIndex: 'hsDescription',
        title: 'Decription',
      },
      {
        key: 'AU',
        dataIndex: 'unit',
        title: 'A/U',
      },
      {
        key: 'Price',
        dataIndex: 'price',
        title: 'Price',
        dataType: 'money',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Qty',
        dataIndex: 'quantity',
        title: 'Qty',
        dataType: 'money',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Value',
        dataIndex: 'amount',
        title: 'Value',
        dataType: 'money',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'Conditions',
        dataIndex: 'conditions',
        title: 'Conditions',
      },
    ],
  },
  BorderImportPermitExtensionReport: {
    controllerName: 'BorderImportPermitExtensionReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Permit Report'),
    title: 'Border Import Permit Extension Report',
    apiRoute: 'BorderImportPermitExtensionReport',
    excelRoute: 'BorderImportPermitExtensionReport/Excel',
    excelFileName: 'BorderImportPermitExtensionReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderImportPermitSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        // BorderExtensionReport.rdlc:374/993 - "Licence No" is the parent permit
        // (OldLicenceNo), not the extension's own E-number.
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
      },
      {
        key: 'ExtensionNo',
        dataIndex: 'licenceNo',
        title: 'Extension No',
      },
      {
        key: 'ExtensionLastDate',
        dataIndex: 'sDate',
        title: 'Extension Last Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  BorderImportPermitNewReportNewReport: {
    controllerName: 'BorderImportPermitNewReportNewReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Border Import Permit Report'),
    title: 'Border Import Permit New Report (New Report )',
    apiRoute: 'BorderImportPermitNewReportNewReport',
    excelRoute: 'BorderImportPermitNewReportNewReport/Excel',
    excelFileName: 'BorderImportPermitNewReportNewReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderImportPermitSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'licenceDate',
        title: 'Licence Date',
        dataType: 'date',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  BorderImportPermitVoucherReport: {
    controllerName: 'BorderImportPermitVoucherReport',
    reportSubtitle: importLicenceRangeSubtitle('Border Import Permit Voucher List'),
    title: 'Border Import Permit Voucher Report',
    apiRoute: 'BorderImportPermitVoucherReport',
    excelRoute: 'BorderImportPermitVoucherReport/Excel',
    excelFileName: 'BorderImportPermitVoucherReport.xlsx',
    initialSortColumn: 'ApplicationNo',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'borderImportPermitSections',
      },
      {
        name: 'PaymentType',
        label: 'Payment Type',
        type: 'select',
        // Same fix as Import Licence Voucher: filter compares the PaymentType NAME,
        // so the dropdown must send Cash/MPU/Citizen Pay, not the numeric lookup id.
        options: voucherPaymentTypeOptions,
        defaultValue: '',
      },
      {
        name: 'ApplyType',
        label: 'Apply Type',
        type: 'select',
        defaultValue: 'New',
        options: [
          { label: 'New', value: 'New' },
          { label: 'Amend', value: 'Amend' },
          { label: 'Extension', value: 'Extension' },
          { label: 'Cancel', value: 'Cancel' },
        ],
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhanCode',
        title: 'Sakhan',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'ApplicationDate',
        dataIndex: 'applicationDate',
        title: 'Application Date',
        dataType: 'date',
      },
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        key: 'ParametersHeader2Value',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'ParametersHeader3Value',
        dataIndex: 'sLicenceDate',
        title: 'Licence Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'VoucherNo',
        dataIndex: 'voucherNo',
        title: 'Voucher No',
      },
      {
        key: 'VoucherDate',
        dataIndex: 'voucherDate',
        title: 'Voucher Date',
        dataType: 'date',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        // Old BorderVoucherReport.rdlc col 11 "Total Amount" = FORMAT(Fields!Amount.Value,"N0")
        // (rdlc:1399) -> AccountTransaction.TotalAmount, the MMK voucher fee. NOT the goods
        // value, which the proc also returns as TotalAmount and the old rdlc never renders.
        key: 'Amount',
        dataIndex: 'amount',
        title: 'Total Amount',
        dataType: 'number',
      },
    ],
  },
  CardListsByCompanyRegistrationNumber: {
    controllerName: 'CardListsByCompanyRegistrationNumber',
    title: 'Card Lists By Company Registration Number',
    apiRoute: 'CardListsByCompanyRegistrationNumber',
    excelRoute: 'CardListsByCompanyRegistrationNumber/Excel',
    excelFileName: 'CardListsByCompanyRegistrationNumber.xlsx',
    initialSortColumn: 'MicpermitNo',
    showRowNumber: false,
    filters: [
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
    ],
    columns: [
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'StartDate',
        dataIndex: 'companyRegistrationDate',
        title: 'Start Date',
        dataType: 'date',
      },
      {
        key: 'ValidDate',
        dataIndex: 'endDate',
        title: 'Valid Date',
        dataType: 'date',
      },
      {
        key: 'BusinessType',
        dataIndex: 'businessType',
        title: 'Business Type',
      },
      {
        key: 'LineOfBusiness',
        dataIndex: 'lineofBusiness',
        title: 'Line Of Business',
      },
      {
        key: 'MICPermitNumber',
        dataIndex: 'micpermitNo',
        title: 'MIC Permit Number',
      },
    ],
  },
  ChequeNoReport: {
    controllerName: 'ChequeNoReport',
    title: 'Cheque No Report',
    apiRoute: 'ChequeNoReport',
    excelRoute: 'ChequeNoReport/Excel',
    excelFileName: 'ChequeNoReport.xlsx',
    initialSortColumn: 'ChequeId',
    showRowNumber: false,
    reportSubtitle: reportDateRangeSubtitle('Cheque No Report'),
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        showTime: true,
        required: true,
      },
      {
        name: 'ChequeNoId',
        label: 'Cheque No',
        type: 'number',
        defaultValue: 0,
      },
    ],
    columns: [
      {
        key: 'ChequeId',
        dataIndex: 'chequeId',
        title: 'Cheque Id',
        dataType: 'number',
      },
      {
        key: 'ChequeNo',
        dataIndex: 'chequeNo',
        title: 'Cheque No',
        drilldown: {
          targetReportKey: 'ChequeNoDetailReport',
          carryFilters: ['FromDate', 'ToDate'],
          rowParams: { ChequeNoId: 'chequeId' },
          openInNewTab: true,
        },
      },
      {
        key: 'Date',
        dataIndex: 'date',
        title: 'Date',
        dataType: 'date',
        dateFormat: 'MM/DD/YYYY',
      },
      {
        key: 'Amount',
        dataIndex: 'amount',
        title: 'Amount',
        dataType: 'number',
        numberFormat: '0.####',
      },
    ],
  },
  ChequeNoDetailReport: {
    controllerName: 'ChequeNoDetailReport',
    title: 'Cheque No Detail Report',
    apiRoute: 'ChequeNoDetailReport',
    excelRoute: 'ChequeNoDetailReport/Excel',
    excelFileName: 'ChequeNoDetailReport.xlsx',
    initialSortColumn: 'TransactionDateTime',
    showRowNumber: true,
    disableLazyTotalCount: true,
    reportSubtitle: reportDateRangeSubtitle('Cheque No Detail Report'),
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        showTime: true,
        required: true,
      },
      {
        name: 'ChequeNoId',
        label: 'Cheque No',
        type: 'number',
        required: true,
      },
    ],
    columns: [
      {
        key: 'ChequeNo',
        dataIndex: 'chequeNo',
        title: 'Cheque No',
      },
      {
        key: 'TransactionRefNo',
        dataIndex: 'transactionRefNo',
        title: 'Trxn Ref No.',
      },
      {
        key: 'TransactionDateTime',
        dataIndex: 'transactionDateTime',
        title: 'Trxn Date',
        dataType: 'dateTime',
        dateFormat: 'MM/DD/YYYY HH:mm:ss',
      },
      {
        key: 'FormType',
        dataIndex: 'formType',
        title: 'Form Type',
      },
      {
        key: 'CardNo',
        dataIndex: 'cardNo',
        title: 'Licence/Permit/Card No',
      },
      {
        key: 'Amount',
        dataIndex: 'amount',
        title: 'Amount',
        dataType: 'number',
        numberFormat: '0.####',
      },
      {
        key: 'PaThaKaNo',
        dataIndex: 'paThaKaNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
      },
    ],
  },
  // NOTE: CompanyProfile is rendered by a bespoke page (Report/Page/CompanyProfile.tsx),
  // NOT GenericReportPage, to reproduce the legacy Tradenet 2.0 layout (Myanmar
  // headers, combined RegNo/date + address cells, and the nested
  // "ဒါရိုက်တာအဖွဲ့၀င်များ" directors sub-grid). This config entry is kept only so the
  // report still appears in the nav (reportNavItems uses controllerName + title);
  // its columns/filters below are no longer the rendering source of truth.
  CompanyProfile: {
    controllerName: 'CompanyProfile',
    title: 'Company Profile',
    apiRoute: 'CompanyProfile',
    excelRoute: 'CompanyProfile/Excel',
    excelFileName: 'CompanyProfile.xlsx',
    initialSortColumn: 'CompanyRegistrationNo',
    showRowNumber: false,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
    ],
    columns: [
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyRegistrationDate',
        dataIndex: 'companyRegistrationDate',
        title: 'Company Registration Date',
        dataType: 'date',
      },
      {
        key: 'EndDate',
        dataIndex: 'endDate',
        title: 'End Date',
        dataType: 'date',
      },
      {
        key: 'BusinessType',
        dataIndex: 'businessType',
        title: 'Business Type',
      },
      {
        key: 'LineofBusiness',
        dataIndex: 'lineofBusiness',
        title: 'Line of Business',
      },
      {
        key: 'UnitLevel',
        dataIndex: 'unitLevel',
        title: 'Unit Level',
      },
      {
        key: 'StreetNumberStreetName',
        dataIndex: 'streetNumberStreetName',
        title: 'Street Number / Street Name',
      },
      {
        key: 'QuarterCityTownship',
        dataIndex: 'quarterCityTownship',
        title: 'Quarter / City / Township',
      },
      {
        key: 'State',
        dataIndex: 'state',
        title: 'State',
      },
      {
        key: 'Country',
        dataIndex: 'country',
        title: 'Country',
      },
      {
        key: 'PostalCode',
        dataIndex: 'postalCode',
        title: 'Postal Code',
      },
      {
        key: 'Capital',
        dataIndex: 'capital',
        title: 'Capital',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'DirectorName',
        dataIndex: 'directorName',
        title: 'Director Name',
      },
      {
        key: 'DirectorNrc',
        dataIndex: 'directorNrc',
        title: 'Director NRC',
      },
      {
        key: 'DirectorPosition',
        dataIndex: 'directorPosition',
        title: 'Director Position',
      },
      {
        key: 'PermitBusiness',
        dataIndex: 'permitBusiness',
        title: 'Permit Business',
      },
      {
        key: 'ExtensionCount',
        dataIndex: 'extensionCount',
        title: 'Extension Count',
        dataType: 'number',
      },
    ],
  },
  EIRCardBindReport: {
    controllerName: 'EIRCardBindReport',
    title: 'EIR Card bind Report',
    apiRoute: 'EIRCardBindReport',
    excelRoute: 'EIRCardBindReport/Excel',
    excelFileName: 'EIRCardBindReport.xlsx',
    initialSortColumn: 'ApplicationDate',
    showRowNumber: true,
    // Legacy header from PathakaBindReport controller (header1):
    // "Pa Tha Ka bind ({FromDate}) To ({ToDate})". Rendered here under the
    // standard Ministry of Commerce / Directorate of Trade heading.
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    reportSubtitle: (filters) => {
      const from = filters.FromDate
        ? dayjs(String(filters.FromDate)).format('DD/MM/YYYY')
        : '';
      const to = filters.ToDate
        ? dayjs(String(filters.ToDate)).format('DD/MM/YYYY')
        : '';
      return `Pa Tha Ka bind (${from}) To (${to})`;
    },
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
    ],
    columns: [
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        key: 'BindApplicationNo',
        dataIndex: 'bindApplicationNo',
        title: 'Bind Application No',
      },
      {
        key: 'PaThaKaNo',
        dataIndex: 'paThaKaNo',
        title: 'Pa Tha Ka No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'ApplicationDate',
        dataIndex: 'applicationDate',
        title: 'Application Date',
        dataType: 'date',
      },
      {
        key: 'ApproveDate',
        dataIndex: 'approveDate',
        title: 'Approve Date',
        dataType: 'date',
      },
      {
        key: 'Status',
        dataIndex: 'status',
        title: 'Status',
      },
      {
        key: 'MemberCode',
        dataIndex: 'memberCode',
        title: 'Member Code',
      },
      {
        key: 'Email',
        dataIndex: 'email',
        title: 'Email',
      },
    ],
  },
  ExportLicenceActualAmendmentReport: {
    controllerName: 'ExportLicenceActualAmendmentReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Export Licence Report'),
    title: 'Export Licence Actual Amendment Report',
    apiRoute: 'ExportLicenceActualAmendmentReport',
    excelRoute: 'ExportLicenceActualAmendmentReport/Excel',
    excelFileName: 'ExportLicenceActualAmendmentReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: exportLicenceActualAmendFilters,
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
        fallbackDataIndexes: ['licenceNo'],
      },
      {
        key: 'LicenceAmendmentNo',
        dataIndex: 'licenceNo',
        title: 'Licence Amendment No',
      },
      {
        key: 'AmendmentDate',
        dataIndex: 'sDate',
        title: 'Amendment Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'ItemHSCode',
        dataIndex: 'hsCode',
        title: 'HS Code',
      },
      {
        key: 'Description',
        dataIndex: 'description',
        title: 'Description',
      },
      {
        key: 'Quantity',
        dataIndex: 'quantity',
        title: 'QTY',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'HSCode',
        dataIndex: 'hsCode',
        title: 'HSCode',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  ExportLicenceAmendmentReport: {
    controllerName: 'ExportLicenceAmendmentReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Export Licence Report'),
    title: 'Export Licence Amendment Report',
    apiRoute: 'ExportLicenceAmendmentReport',
    excelRoute: 'ExportLicenceAmendmentReport/Excel',
    excelFileName: 'ExportLicenceAmendmentReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: exportLicenceAmendFilters,
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        // "Licence No" is the parent licence (OldLicenceNo); the amend number belongs to the
        // Licence Amendment No column below.
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
        fallbackDataIndexes: ['licenceNo'],
      },
      {
        key: 'LicenceAmendmentNo',
        dataIndex: 'licenceNo',
        title: 'Licence Amendment No',
      },
      {
        key: 'AmendmentDate',
        dataIndex: 'sDate',
        title: 'Amendment Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'ItemHSCode',
        dataIndex: 'hsCode',
        title: 'HS Code',
      },
      {
        key: 'Description',
        dataIndex: 'description',
        title: 'Description',
      },
      {
        key: 'Quantity',
        dataIndex: 'quantity',
        title: 'QTY',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  // One row per (HS code, currency) -- HSCodeReport.rdlc's row group (rdlc:1150-1160). The
  // backend used to add the buyer company to that key, which printed one invisible row per
  // buyer with a partial Total Value (1058 rows against the old report's 304 for
  // 31/08-01/09/2026); see sp_HSCodeReport_pagination.sql's Export Licence branch.
  ExportLicenceByHSCodeReport: {
    controllerName: 'ExportLicenceByHSCodeReport',
    // Legacy header1 is plural -- "List of Export Licences By HS Code From (…) To (…)"
    // (old ReportsController.cs:4289).
    reportSubtitle: importLicenceRangeSubtitle('List of Export Licences By HS Code', true),
    title: 'Export Licence By HS Code Report',
    apiRoute: 'ExportLicenceByHSCodeReport',
    excelRoute: 'ExportLicenceByHSCodeReport/Excel',
    excelFileName: 'ExportLicenceByHSCodeReport.xlsx',
    initialSortColumn: 'SakhanId',
    // Legacy RDLC printed every row on one scrolling page; these summaries are a
    // handful of (HS code, currency) rows, so a 10-row page looked like missing data
    // next to the old report.
    defaultPageSize: 1000,
    showRowNumber: true,
    rowNumberTitle: 'Sr.No.',
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        defaultDateRangeMonths: 3,
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        ...exportLicenceSectionFilter,
      },
      {
        name: 'FilterType',
        label: 'Filter By',
        type: 'select',
        defaultValue: 'Start',
        options: [
          { label: 'Start', value: 'Start' },
          { label: 'End', value: 'End' },
        ],
      },
      {
        name: 'hsCode',
        label: 'HS Code',
        type: 'text',
        defaultValue: '',
      },
    ],
    columns: [
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'HS Code',
        drilldown: {
          targetReportKey: 'ExportLicenceHSCodeDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'ExportImportSectionId', 'FilterType'],
          rowParams: { hsCode: 'hsCode' },
          // Legacy HSCodeReport.rdlc:570-576 hyperlink is
          // ="javascript:void(window.open('…','_blank'))" -- a new window.
          openInNewTab: true,
        },
      },
      {
        key: 'Description',
        dataIndex: 'hsDescription',
        title: 'Description',
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
        dataType: 'number',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        // 'money' + '#,##0.0000' is the Money4 cell format in the .xlsx and the grid's
        // N4 render, matching old HSCodeReport.rdlc:705 =FORMAT(Sum(Fields!Amount.Value),"N4").
        dataType: 'money',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ExportLicenceHSCodeDetailReport: {
    // Drill target only, reached from the By HS Code summary's HS Code cell. Its
    // controllerName is deliberately the summary's (same endpoint), which is exactly why it
    // needs hideInMenu: createReportItem keys the menu off controllerName, so leaving it
    // visible rendered a second row with the summary's own key and link.
    hideInMenu: true,
    controllerName: 'ExportLicenceByHSCodeReport',
    reportSubtitle: importLicenceRangeSubtitle('List of Export Licences By HS Code', true),
    title: 'HS Code Detail Report',
    apiRoute: 'ExportLicenceByHSCodeReport',
    excelRoute: 'ExportLicenceByHSCodeReport/Excel',
    excelFileName: 'ExportLicenceHSCodeDetailReport.xlsx',
    initialSortColumn: 'hsCode',
    // Legacy RDLC printed every row on one scrolling page.
    defaultPageSize: 1000,
    showRowNumber: true,
    rowNumberTitle: 'Sr.No.',
    filters: [
      {
        ...importLicenceDateRangeFilter,
        defaultDateRangeMonths: 3,
      },
      importLicenceFormTypeFilter,
      exportLicenceSectionFilter,
      importLicenceFilterTypeFilter,
      importLicenceHSCodeFilter,
      // This drill shares ExportLicenceByHSCodeReport's controller. The old
      // HSCodeDetailReport.rdlc groups on (HS code, company) (rdlc:1261-1265) while the
      // summary's HSCodeReport.rdlc groups on (HS code, currency), and the two arrive at
      // the backend as the same parameters -- so the drill has to say which shape it
      // wants. Never rendered; always posted (see getDerivedFilterValues).
      {
        name: 'GroupBy',
        label: 'Group By',
        type: 'text',
        constantValue: 'Company',
      },
    ],
    columns: hsCodeDetailColumns,
  },
  ExportLicenceByMethodReport: {
    controllerName: 'ExportLicenceByMethodReport',
    title: 'Export Licence By Method Report',
    apiRoute: 'ExportLicenceByMethodReport',
    excelRoute: 'ExportLicenceByMethodReport/Excel',
    excelFileName: 'ExportLicenceByMethodReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        defaultDateRangeMonths: 3,
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'exportLicenceSections',
      },
      {
        ...exportLicenceMethodFilter,
      },
      {
        ...importLicenceAutoFilter,
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Export Licences By Method', true),
    columns: [
      {
        key: 'Method',
        dataIndex: 'methodName',
        title: 'Method',
        drilldown: {
          targetReportKey: 'ExportLicenceDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId', 'Auto'],
          rowParams: { ExportImportMethodId: 'methodId' },
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ExportLicenceBySectionReport: {
    controllerName: 'ExportLicenceBySectionReport',
    title: 'Export Licence By Section Report',
    apiRoute: 'ExportLicenceBySectionReport',
    excelRoute: 'ExportLicenceBySectionReport/Excel',
    excelFileName: 'ExportLicenceBySectionReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        defaultDateRangeMonths: 3,
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'exportLicenceSections',
      },
      {
        ...exportLicenceMethodFilter,
      },
      {
        ...importLicenceAutoFilter,
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Export Licences By Section', true),
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
        drilldown: {
          targetReportKey: 'ExportLicenceDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportMethodId', 'Auto'],
          rowParams: { ExportImportSectionId: 'sectionId' },
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ExportLicenceBySellerCountryReport: {
    controllerName: 'ExportLicenceBySellerCountryReport',
    title: 'Export Licence By Buyer Country Report',
    apiRoute: 'ExportLicenceBySellerCountryReport',
    excelRoute: 'ExportLicenceBySellerCountryReport/Excel',
    excelFileName: 'ExportLicenceByBuyerCountryReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        defaultDateRangeMonths: 3,
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'exportLicenceSections',
      },
      {
        ...exportLicenceMethodFilter,
      },
      {
        ...exportLicenceBuyerCountryFilter,
      },
      {
        ...importLicenceAutoFilter,
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Export Licences By Buyer Country', true),
    columns: [
      {
        key: 'Country',
        dataIndex: 'country',
        title: 'Country',
        drilldown: {
          targetReportKey: 'ExportLicenceDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId', 'ExportImportMethodId', 'Auto'],
          rowParams: { BuyerCountryId: 'countryId' },
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ExportLicenceCancellationReport: {
    controllerName: 'ExportLicenceCancellationReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Export Licence Report'),
    title: 'Export Licence Cancellation Report',
    apiRoute: 'ExportLicenceCancellationReport',
    excelRoute: 'ExportLicenceCancellationReport/Excel',
    excelFileName: 'ExportLicenceCancellationReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    // The exact row count comes back with the page itself: the legacy report printed every
    // cancellation on one scrolling page, so a pager that cannot reach the last page reads as
    // missing data. The count is a three-table join with OPTION (RECOMPILE) over a few hundred
    // rows a month, so it is cheap enough to sit on the critical path.
    eagerTotalCount: true,
    filters: exportLicenceCancellationFilters,
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        // rdlc:1229 -- "Licence No" is the ORIGINAL licence, =Fields!OldLicenceNo.Value.
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
      },
      {
        // rdlc:1282 -- "Cancellation No" is =Fields!LicenceNo.Value.
        key: 'CancellationNo',
        dataIndex: 'licenceNo',
        title: 'Cancellation No',
      },
      {
        key: 'CancellationDate',
        dataIndex: 'sDate',
        title: 'Cancellation Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'ItemHSCode',
        dataIndex: 'hsCode',
        title: 'HS Code',
      },
      {
        key: 'Description',
        dataIndex: 'description',
        title: 'Description',
      },
      {
        key: 'Quantity',
        dataIndex: 'quantity',
        title: 'QTY',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        // rdlc:1600 -- =Fields!Amount.Value with no <Format>, so decimal(18,4) prints 4 dp.
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        // The November sample retains this original HS Code column beside Total Value;
        // the newly requested item columns appear before Currency.
        key: 'HSCode',
        dataIndex: 'hsCode',
        title: 'HS Code',
      },
      {
        key: 'Remark',
        dataIndex: 'remark',
        title: 'Remark',
      },
    ],
  },
  ExportLicenceCompanyListReport: {
    controllerName: 'ExportLicenceCompanyListReport',
    title: 'Export Licence Company List Report',
    apiRoute: 'ExportLicenceCompanyListReport',
    excelRoute: 'ExportLicenceCompanyListReport/Excel',
    excelFileName: 'ExportLicenceCompanyListReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        defaultDateRangeMonths: 3,
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'exportLicenceSections',
      },
      {
        ...exportLicenceMethodFilter,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceAutoFilter,
      },
      {
        ...importLicenceCompanyNameFilter,
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Export Licences By Company', true),
    columns: [
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
        drilldown: {
          targetReportKey: 'ExportLicenceDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId', 'ExportImportMethodId', 'Auto'],
          rowParams: { CompanyRegistrationNo: 'companyRegistrationNo' },
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ExportLicenceDailyReportNewLicenceReport: {
    controllerName: 'ExportLicenceDailyReportNewLicenceReport',
    title: 'Export Licence Daily Report (New Licence Report)',
    apiRoute: 'ExportLicenceDailyReportNewLicenceReport',
    excelRoute: 'ExportLicenceDailyReportNewLicenceReport/Excel',
    excelFileName: 'ExportLicenceDailyReportNewLicenceReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    defaultPageSize: 1000,
    // ExportLicenceByDailyReport.rdlc:616 prints the serial column; blank header at
    // rdlc:281. Same false negative as BorderImportLicenceDailyReportNewLicenceReport.
    showRowNumber: true,
    rowNumberTitle: 'Sr.No.',
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        defaultDateRangeMonths: 3,
        required: true,
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'exportLicenceSections',
      },
      {
        ...exportLicenceMethodFilter,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceAutoFilter,
      },
      {
        ...importLicenceCompanyNameFilter,
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Export Licences By Daily', true),
    columns: [
      {
        key: 'Date',
        dataIndex: 'date',
        title: 'Date',
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
        dataType: 'number',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalUSDValue',
        dataIndex: 'totalUSDValue',
        title: 'Total USD Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  ExportLicenceDetailReport: {
    controllerName: 'ExportLicenceDetailReport',
    title: 'Export Licence Detail Report',
    apiRoute: 'ExportLicenceDetailReport',
    excelRoute: 'ExportLicenceDetailReport/Excel',
    excelFileName: 'ExportLicenceDetailReport.xlsx',
    // ExportLicenceDetailReport.rdlc has no total row, so no footer. The grid is served by the
    // legacy procedure paginated at item grain; its count is a COUNT(*) over the materialised
    // key table, cheap enough to ride with the page so the pager is exact on first paint.
    eagerTotalCount: true,
    initialSortColumn: 'licenceDate',
    showRowNumber: true,
    reportSubtitle: importLicenceRangeSubtitle('List of Export Licences By Detail', true),
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        defaultDateRangeMonths: 3,
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'exportLicenceSections',
      },
      {
        ...exportLicenceMethodFilter,
      },
      {
        ...exportLicenceIncotermFilter,
      },
      {
        ...importLicenceCompanyRegistrationNoFilter,
      },
      // No Buyer Country / Auto boxes: ExportLicenceDetailReport.cshtml never had them. The
      // BuyerCountryId / Auto request fields stay on the DTO -- the By-Buyer-Country and
      // summary reports still carry them in on drill-down.
    ],
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'ApplicationDate',
        dataIndex: 'applicationDate',
        title: 'Application Date',
        dataType: 'date',
      },
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'licenceDate',
        title: 'Licence Date',
        dataType: 'date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'BuyerName',
        dataIndex: 'buyerName',
        title: 'Buyer Name',
      },
      {
        key: 'BuyerAddress',
        dataIndex: 'buyerAddress',
        title: 'Buyer Address',
      },
      {
        key: 'BuyerCountry',
        dataIndex: 'buyerCountry',
        title: 'Buyer Country',
      },
      {
        key: 'PlacePortOfExport',
        dataIndex: 'portofExport',
        title: 'Place/Port of Export',
      },
      {
        key: 'PlacePortOfDischarge',
        dataIndex: 'portofDischarge',
        title: 'Place/Port of Discharge',
      },
      {
        key: 'LastDate',
        dataIndex: 'lastDate',
        title: 'Last Date',
        dataType: 'date',
      },
      {
        key: 'Method',
        dataIndex: 'methodName',
        title: 'Method',
      },
      {
        key: 'ConsignedCountry',
        dataIndex: 'consignedCountry',
        title: 'Consigned Country',
      },
      {
        key: 'CountryOfOrign',
        dataIndex: 'countryofOrigin',
        title: 'Country of Orign',
      },
      {
        key: 'CountryOfDestination',
        dataIndex: 'destinationCountry',
        title: 'Country of Destination',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'Decription',
        dataIndex: 'hsDescription',
        title: 'Decription',
      },
      {
        key: 'AU',
        dataIndex: 'unit',
        title: 'Unit',
      },
      {
        key: 'Price',
        dataIndex: 'price',
        title: 'Price',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Qty',
        dataIndex: 'quantity',
        title: 'Qty',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Value',
        dataIndex: 'amount',
        title: 'Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        key: 'Conditions',
        dataIndex: 'conditions',
        title: 'Conditions',
      },
    ],
  },
  ExportLicenceExtensionReport: {
    controllerName: 'ExportLicenceExtensionReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Export Licence Report'),
    title: 'Export Licence Extension Report',
    apiRoute: 'ExportLicenceExtensionReport',
    excelRoute: 'ExportLicenceExtensionReport/Excel',
    excelFileName: 'ExportLicenceExtensionReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: exportLicenceActionFilters,
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        // ExtensionReport.rdlc:303/868 - "Licence No" is the parent licence
        // (OldLicenceNo), not the extension's own E-number.
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
      },
      {
        key: 'ExtensionNo',
        dataIndex: 'licenceNo',
        title: 'Extension No',
      },
      {
        key: 'ExtensionLastDate',
        dataIndex: 'sDate',
        title: 'Extension Last Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  ExportLicenceNewReportNewReport: {
    controllerName: 'ExportLicenceNewReportNewReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Export Licence Report'),
    title: 'Export Licence New Report (New Report )',
    apiRoute: 'ExportLicenceNewReportNewReport',
    excelRoute: 'ExportLicenceNewReportNewReport/Excel',
    excelFileName: 'ExportLicenceNewReportNewReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: exportLicenceNewFilters,
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'licenceDate',
        title: 'Licence Date',
        dataType: 'date',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        // NewLicenceReport.rdlc labels this column "HSCode"; 'hsCode' was the raw key.
        title: 'HSCode',
      },
      {
        key: 'Quota',
        dataIndex: 'quota',
        title: 'quota',
      },
      {
        key: 'Auto',
        dataIndex: 'auto',
        title: 'auto',
      },
    ],
  },
  ExportLicenceTotalValueLicencesReport: {
    controllerName: 'ExportLicenceTotalValueLicencesReport',
    title: 'Export Licence Total Value & Licences Report',
    apiRoute: 'ExportLicenceTotalValueLicencesReport',
    excelRoute: 'ExportLicenceTotalValueLicencesReport/Excel',
    excelFileName: 'ExportLicenceTotalValueLicencesReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: exportLicenceTotalValueFilters,
    reportSubtitle: importLicenceRangeSubtitle(
      'Export Licences Total Value & Licences'
    ),
    columns: [
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ExportLicenceVoucherReport: {
    controllerName: 'ExportLicenceVoucherReport',
    resolveColumns: resolveImportLicenceVoucherColumns,
    title: 'Export Licence Voucher Report',
    apiRoute: 'ExportLicenceVoucherReport',
    excelRoute: 'ExportLicenceVoucherReport/Excel',
    excelFileName: 'ExportLicenceVoucherReport.xlsx',
    initialSortColumn: 'ApplicationNo',
    showRowNumber: true,
    filters: exportLicenceVoucherFilters,
    reportSubtitle: importLicenceRangeSubtitle('Export Licence Voucher List'),
    columns: [
      {
        key: 'OriginalLicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
        fallbackDataIndexes: ['licenceNo'],
      },
      {
        key: 'ApplicationDate',
        dataIndex: 'applicationDate',
        title: 'Application Date',
        dataType: 'date',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: '=Parameters!header2.Value',
      },
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'sLicenceDate',
        title: '=Parameters!header3.Value',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'LicValue',
        dataIndex: 'totalAmount',
        title: 'Lic Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'VoucherNo',
        dataIndex: 'voucherNo',
        title: 'Voucher No',
      },
      {
        key: 'VoucherDate',
        dataIndex: 'voucherDate',
        title: 'Voucher Date',
        dataType: 'date',
      },
      {
        key: 'ApprovedUser',
        dataIndex: 'approvedUser',
        title: 'Approved User',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        key: 'Amount',
        dataIndex: 'amount',
        title: 'Total Amount',
        dataType: 'number',
      },
    ],
  },
  ExportPermitActualAmendmentReport: {
    controllerName: 'ExportPermitActualAmendmentReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Export Licence Report', true),
    title: 'Export Permit Actual Amendment Report',
    apiRoute: 'ExportPermitActualAmendmentReport',
    excelRoute: 'ExportPermitActualAmendmentReport/Excel',
    excelFileName: 'ExportPermitActualAmendmentReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'exportPermitSections',
      },
      {
        name: 'AmendRemarkId',
        label: 'Remark',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
    ],
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceAmendmentNo',
        dataIndex: 'licenceNo',
        title: 'Licence Amendment No',
      },
      {
        key: 'AmendmentDate',
        dataIndex: 'sDate',
        title: 'Amendment Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        // AmendReport.rdlc (origin/master) column 10: HSCode sits between Curency and
        // Total Value, not before Currency.
        key: 'HSCode',
        dataIndex: 'hsCode',
        title: 'HS Code',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  ExportPermitAmendmentReport: {
    controllerName: 'ExportPermitAmendmentReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Export Licence Report', true),
    title: 'Export Permit Amendment Report',
    apiRoute: 'ExportPermitAmendmentReport',
    excelRoute: 'ExportPermitAmendmentReport/Excel',
    excelFileName: 'ExportPermitAmendmentReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'exportPermitSections',
      },
      {
        name: 'AmendRemarkId',
        label: 'Remark',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
    ],
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceAmendmentNo',
        dataIndex: 'licenceNo',
        title: 'Licence Amendment No',
      },
      {
        key: 'AmendmentDate',
        dataIndex: 'sDate',
        title: 'Amendment Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        // AmendReport.rdlc (origin/master) column 10. The old app declares this column but
        // never fills it -- Business/Reports.cs::GetAmendReport omits the HSCode assignment
        // that GetActualAmendReport has -- so it renders blank there. Populated here.
        key: 'HSCode',
        dataIndex: 'hsCode',
        title: 'HS Code',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  ExportPermitByHSCodeReport: {
    controllerName: 'ExportPermitByHSCodeReport',
    reportSubtitle: importLicenceRangeSubtitle('List of Export Permit By HS Code', true),
    title: 'Export Permit By HS Code Report',
    apiRoute: 'ExportPermitByHSCodeReport',
    excelRoute: 'ExportPermitByHSCodeReport/Excel',
    excelFileName: 'ExportPermitByHSCodeReport.xlsx',
    initialSortColumn: 'hsCode',
    // Legacy RDLC printed every row on one scrolling page.
    defaultPageSize: 1000,
    showRowNumber: true,
    rowNumberTitle: 'Sr.No.',
    filters: [
      {
        ...importLicenceDateRangeFilter,
        defaultDateRangeMonths: 3,
      },
      // No Form Type box: the old ExportPermitByHSCodeReport.cshtml:21 carries FormType as an
      // @Html.HiddenFor and ExportPermitByHSCodeReportController hardcodes "Export Permit"
      // without ever reading request.FormType -- the input was a visible no-op.
      exportPermitSectionFilter,
      importLicenceFilterTypeFilter,
      importLicenceHSCodeFilter,
    ],
    columns: [
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'HS Code',
        // The old report's HS Code cell opens HSCodeDetailReport in a new window
        // (HSCodeReport.rdlc:573, ReportsController.cs:7702) -- the (HS code, company)
        // breakdown of the row, not the per-item permit detail.
        drilldown: {
          targetReportKey: 'ExportPermitHSCodeDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'ExportImportSectionId', 'FilterType'],
          rowParams: { hsCode: 'hsCode' },
          openInNewTab: true,
        },
      },
      {
        key: 'Description',
        dataIndex: 'hsDescription',
        title: 'Description',
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
        dataType: 'number',
      },
      {
        // HSCodeReport.rdlc:705 = FORMAT(Sum(Fields!Amount.Value),"N4").
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        dataType: 'money',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ExportPermitHSCodeDetailReport: {
    // Drill target only, reached from the By HS Code summary's HS Code cell. Its
    // controllerName is deliberately the summary's (same endpoint), which is exactly why it
    // needs hideInMenu: createReportItem keys the menu off controllerName, so leaving it
    // visible rendered a second row with the summary's own key and link.
    hideInMenu: true,
    controllerName: 'ExportPermitByHSCodeReport',
    reportSubtitle: importLicenceRangeSubtitle('List of Export Permit By HS Code', true),
    title: 'HS Code Detail Report',
    apiRoute: 'ExportPermitByHSCodeReport',
    excelRoute: 'ExportPermitByHSCodeReport/Excel',
    excelFileName: 'ExportPermitHSCodeDetailReport.xlsx',
    initialSortColumn: 'hsCode',
    // Legacy RDLC printed every row on one scrolling page.
    defaultPageSize: 1000,
    showRowNumber: true,
    rowNumberTitle: 'Sr.No.',
    filters: [
      {
        ...importLicenceDateRangeFilter,
        defaultDateRangeMonths: 3,
      },
      exportPermitSectionFilter,
      importLicenceFilterTypeFilter,
      importLicenceHSCodeFilter,
      // This drill shares ExportPermitByHSCodeReport's controller. The old
      // HSCodeDetailReport.rdlc groups on (HS code, company) (rdlc:1262-1265) while the
      // summary's HSCodeReport.rdlc groups on (HS code, currency), and the two arrive at
      // the backend as the same parameters -- so the drill has to say which shape it
      // wants. Never rendered; always posted (see getDerivedFilterValues).
      {
        name: 'GroupBy',
        label: 'Group By',
        type: 'text',
        constantValue: 'Company',
      },
    ],
    columns: hsCodeDetailColumns,
  },
  ExportPermitBySectionReport: {
    controllerName: 'ExportPermitBySectionReport',
    reportSubtitle: importLicenceRangeSubtitle('List of Export Permit By Section', true),
    title: 'Export Permit By Section Report',
    apiRoute: 'ExportPermitBySectionReport',
    excelRoute: 'ExportPermitBySectionReport/Excel',
    excelFileName: 'ExportPermitBySectionReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'exportPermitSections',
      },
    ],
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
        drilldown: {
          targetReportKey: 'ExportPermitDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId'],
          // The aggregate row exposes the section id as `sectionId`
          // (ReportAggregationService.ReportAggregateResult.SectionId); the old
          // `exportImportSectionId` matched nothing, so the drill carried undefined.
          rowParams: { ExportImportSectionId: 'sectionId' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ExportPermitBySellerCountryReport: {
    controllerName: 'ExportPermitBySellerCountryReport',
    reportSubtitle: importLicenceRangeSubtitle('List of Export Permit By Buyer Country', true),
    title: 'Export Permit By Buyer Country Report',
    apiRoute: 'ExportPermitBySellerCountryReport',
    excelRoute: 'ExportPermitBySellerCountryReport/Excel',
    excelFileName: 'ExportPermitByBuyerCountryReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'exportPermitSections',
      },
      {
        name: 'BuyerCountryId',
        label: 'Buyer Country',
        type: 'number',
        defaultValue: 0,
      },
    ],
    columns: [
      {
        key: 'Country',
        dataIndex: 'country',
        title: 'Country',
        drilldown: {
          targetReportKey: 'ExportPermitDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId'],
          rowParams: { BuyerCountryId: 'countryId' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ExportPermitCancellationReport: {
    controllerName: 'ExportPermitCancellationReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Export Permit Report'),
    title: 'Export Permit Cancellation Report',
    apiRoute: 'ExportPermitCancellationReport',
    excelRoute: 'ExportPermitCancellationReport/Excel',
    excelFileName: 'ExportPermitCancellationReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'exportPermitSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
    ],
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
      },
      {
        key: 'CancellationNo',
        dataIndex: 'licenceNo',
        title: 'Cancellation No',
      },
      {
        key: 'CancellationDate',
        dataIndex: 'sDate',
        title: 'Cancellation Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        // CancelReport.rdlc (origin/master) renders HSCode TWICE -- at column 2 and again
        // here at column 12. The duplicate is an old layout bug; we render it once, in the
        // position that reads naturally beside Total Value.
        key: 'HSCode',
        dataIndex: 'hsCode',
        title: 'HS Code',
      },
      {
        key: 'Remark',
        dataIndex: 'remark',
        title: 'Remark',
      },
    ],
  },
  ExportPermitCompanyListReport: {
    controllerName: 'ExportPermitCompanyListReport',
    reportSubtitle: importLicenceRangeSubtitle('List of Export Permit By Company', true),
    title: 'Export Permit Company List Report',
    apiRoute: 'ExportPermitCompanyListReport',
    excelRoute: 'ExportPermitCompanyListReport/Excel',
    excelFileName: 'ExportPermitCompanyListReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'exportPermitSections',
      },
      // ExportPermitByCompanyReport.cshtml:59-66 -- the old screen's last two boxes.
      // The controller request already carries CompanyRegistrationNo; Company Name is
      // read-only and display only.
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        ...importLicenceCompanyNameFilter,
      },
    ],
    columns: [
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
        drilldown: {
          targetReportKey: 'ExportPermitDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId'],
          rowParams: { CompanyRegistrationNo: 'companyRegistrationNo' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ExportPermitDailyReportNewPermitReport: {
    controllerName: 'ExportPermitDailyReportNewPermitReport',
    reportSubtitle: importLicenceRangeSubtitle('List of Export Permit By Daily', true),
    title: 'Export Permit Daily Report (New Permit Report)',
    apiRoute: 'ExportPermitDailyReportNewPermitReport',
    excelRoute: 'ExportPermitDailyReportNewPermitReport/Excel',
    excelFileName: 'ExportPermitDailyReportNewPermitReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    defaultPageSize: 1000,
    // ExportPermitByDailyReport.rdlc:616 prints the serial column; blank header at
    // rdlc:281. Same false negative as BorderImportLicenceDailyReportNewLicenceReport.
    showRowNumber: true,
    rowNumberTitle: 'Sr.No.',
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'Type',
        label: 'Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'exportPermitSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
    ],
    columns: [
      {
        key: 'Date',
        dataIndex: 'date',
        title: 'Date',
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
        dataType: 'number',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalUSDValue',
        dataIndex: 'totalUSDValue',
        title: 'Total USD Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  ExportPermitDetailReport: {
    controllerName: 'ExportPermitDetailReport',
    reportSubtitle: importLicenceRangeSubtitle('List of Export Permit By Detail', true),
    title: 'Export Permit Detail Report',
    apiRoute: 'ExportPermitDetailReport',
    excelRoute: 'ExportPermitDetailReport/Excel',
    excelFileName: 'ExportPermitDetailReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'Type',
        label: 'Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'exportPermitSections',
      },
      {
        name: 'BuyerCountryId',
        label: 'Buyer Country',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'hsCode',
        label: 'HS Code',
        type: 'text',
        defaultValue: '',
      },
    ],
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'PermitNo',
        dataIndex: 'licenceNo',
        title: 'Permit No',
      },
      {
        key: 'PermitDate',
        dataIndex: 'licenceDate',
        title: 'Permit Date',
        dataType: 'date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'UnionCitizenshipNo',
        dataIndex: 'nrcNo',
        title: 'Union Citizenship No',
      },
      {
        key: 'ConsigneeName',
        dataIndex: 'consigneeName',
        title: 'Consignee Name',
      },
      {
        key: 'ConsigneeAddress',
        dataIndex: 'consigneeAddress',
        title: 'Consignee Address',
      },
      {
        key: 'BuyerCountry',
        dataIndex: 'buyerCountry',
        title: 'Buyer Country',
      },
      {
        key: 'PlacePortOfExport',
        dataIndex: 'portofExport',
        title: 'Place/Port of Export',
      },
      {
        key: 'PlacePortOfDischarge',
        dataIndex: 'portofDischarge',
        title: 'Place/Port of Discharge',
      },
      {
        key: 'LastDate',
        dataIndex: 'lastDate',
        title: 'Last Date',
        dataType: 'date',
      },
      {
        key: 'CountryOfOrign',
        dataIndex: 'countryofOrigin',
        title: 'Country of Orign',
      },
      {
        key: 'ConsignedCountry',
        dataIndex: 'consignedCountry',
        title: 'Consigned Country',
      },
      {
        key: 'CountryOfDestination',
        dataIndex: 'destinationCountry',
        title: 'Country of Destination',
      },
      {
        key: 'TypeOfPermit',
        dataIndex: 'permitType',
        title: 'Type of Permit',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'Decription',
        dataIndex: 'hsDescription',
        title: 'Decription',
      },
      {
        key: 'AU',
        dataIndex: 'unit',
        title: 'A/U',
      },
      {
        key: 'Price',
        dataIndex: 'price',
        title: 'Price',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Qty',
        dataIndex: 'quantity',
        title: 'Qty',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Value',
        dataIndex: 'amount',
        title: 'Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'Conditions',
        dataIndex: 'conditions',
        title: 'Conditions',
      },
    ],
  },
  ExportPermitExtensionReport: {
    controllerName: 'ExportPermitExtensionReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Export Permit Report'),
    title: 'Export Permit Extension Report',
    apiRoute: 'ExportPermitExtensionReport',
    excelRoute: 'ExportPermitExtensionReport/Excel',
    excelFileName: 'ExportPermitExtensionReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'exportPermitSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
    ],
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        // ExtensionReport.rdlc:303/868 - "Licence No" is the parent permit
        // (OldLicenceNo), not the extension's own E-number.
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
      },
      {
        key: 'ExtensionNo',
        dataIndex: 'licenceNo',
        title: 'Extension No',
      },
      {
        key: 'ExtensionLastDate',
        dataIndex: 'sDate',
        title: 'Extension Last Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  ExportPermitNewReportNewReport: {
    controllerName: 'ExportPermitNewReportNewReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    reportSubtitle: importLicenceRangeSubtitle('List of Export Permit Report'),
    title: 'Export Permit New Report (New Report )',
    apiRoute: 'ExportPermitNewReportNewReport',
    excelRoute: 'ExportPermitNewReportNewReport/Excel',
    excelFileName: 'ExportPermitNewReportNewReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'exportPermitSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
    ],
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'licenceDate',
        title: 'Licence Date',
        dataType: 'date',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        key: 'HSCode',
        dataIndex: 'hsCode',
        title: 'HS Code',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  ExportPermitVoucherReport: {
    controllerName: 'ExportPermitVoucherReport',
    reportSubtitle: importLicenceRangeSubtitle('Export Permit Voucher List'),
    resolveColumns: resolveImportLicenceVoucherColumns,
    title: 'Export Permit Voucher Report',
    apiRoute: 'ExportPermitVoucherReport',
    excelRoute: 'ExportPermitVoucherReport/Excel',
    excelFileName: 'ExportPermitVoucherReport.xlsx',
    initialSortColumn: 'ApplicationNo',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Export Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'exportPermitSections',
      },
      {
        name: 'ApplyType',
        label: 'Apply Type',
        type: 'select',
        defaultValue: 'New',
        options: [
          { label: 'New', value: 'New' },
          { label: 'Amend', value: 'Amend' },
          { label: 'Extension', value: 'Extension' },
          { label: 'Cancel', value: 'Cancel' },
          { label: 'Actual Amend', value: 'Actual Amend' },
        ],
      },
      {
        name: 'PaymentType',
        label: 'Payment Type',
        type: 'select',
        defaultValue: '',
        options: [
          { label: '--- All ---', value: '' },
          { label: 'Cash', value: 'Cash' },
          { label: 'MPU', value: 'MPU' },
          { label: 'Citizen Pay', value: 'Citizen Pay' },
        ],
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
    ],
    // Column set + order mirror the PRODUCTION VoucherReport.rdlc
    // (tradenet-2.0-admin origin/master, 17 columns) -- NOT the 2022 OGA_Terminate copy
    // that the earlier audits read, which had 13 and lacked Application Date /
    // Commodity Type / Total CIF / Exchange Rate.
    columns: [
      {
        // rdlc:1321 =IIF(ApplyType="New", LicenceNo, OldLicenceNo)
        key: 'OriginalLicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
        fallbackDataIndexes: ['licenceNo'],
      },
      {
        key: 'ApplicationDate',
        dataIndex: 'applicationDate',
        title: 'Application Date',
        dataType: 'date',
      },
      {
        // header2: retitled per ApplyType and hidden for 'New' by resolveColumns.
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: '=Parameters!header2.Value',
      },
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        // header3: retitled per ApplyType by resolveColumns.
        key: 'LicenceDate',
        dataIndex: 'sLicenceDate',
        title: '=Parameters!header3.Value',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'LicValue',
        dataIndex: 'totalAmount',
        title: 'Lic Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'VoucherNo',
        dataIndex: 'voucherNo',
        title: 'Voucher No',
      },
      {
        key: 'VoucherDate',
        dataIndex: 'sVoucherDate',
        title: 'Voucher Date',
      },
      {
        key: 'ApprovedUser',
        dataIndex: 'approvedUser',
        title: 'Approved User',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        // Structurally 0 for Export Permit: the ExportPermit table has no TotalCIF /
        // ExchangeRate column, so the old app's non-nullable decimals defaulted to 0 and
        // the procedure selects a constant. Kept because the old report prints them.
        key: 'TotalCIF',
        dataIndex: 'totalCIF',
        title: 'Total CIF',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'ExchangeRate',
        dataIndex: 'exchangeRate',
        title: 'Exchange Rate',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Amount',
        dataIndex: 'amount',
        title: 'Total Amount',
        dataType: 'number',
      },
    ],
  },
  ImportLicenceActualAmendmentReport: {
    controllerName: 'ImportLicenceActualAmendmentReport',
    title: 'Import Licence Actual Amendment Report',
    apiRoute: 'ImportLicenceActualAmendmentReport',
    excelRoute: 'ImportLicenceActualAmendmentReport/Excel',
    excelFileName: 'ImportLicenceActualAmendmentReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: importLicenceAmendFilters,
    reportSubtitle: importLicenceRangeSubtitle('List of Import Licence Report'),
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceAmendmentNo',
        dataIndex: 'licenceNo',
        title: 'Licence Amendment No',
      },
      {
        key: 'AmendmentDate',
        dataIndex: 'sDate',
        title: 'Amendment Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Curency',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'HSCode',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  ImportLicenceAmendmentReport: {
    controllerName: 'ImportLicenceAmendmentReport',
    title: 'Import Licence Amendment Report',
    apiRoute: 'ImportLicenceAmendmentReport',
    excelRoute: 'ImportLicenceAmendmentReport/Excel',
    excelFileName: 'ImportLicenceAmendmentReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: importLicenceAmendFilters,
    reportSubtitle: importLicenceRangeSubtitle('List of Import Licence Report'),
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceAmendmentNo',
        dataIndex: 'licenceNo',
        title: 'Licence Amendment No',
      },
      {
        key: 'AmendmentDate',
        dataIndex: 'sDate',
        title: 'Amendment Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  ImportLicenceByHSCodeReport: {
    controllerName: 'ImportLicenceByHSCodeReport',
    title: 'Import Licence By HS Code Report',
    apiRoute: 'ImportLicenceByHSCodeReport',
    excelRoute: 'ImportLicenceByHSCodeReport/Excel',
    excelFileName: 'ImportLicenceByHSCodeReport.xlsx',
    initialSortColumn: 'hsCode',
    showRowNumber: true,
    filters: importLicenceHSCodeFilters,
    reportSubtitle: importLicenceRangeSubtitle(
      'List of Import Licences By HS Code',
      true
    ),
    columns: [
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'HS Code',
        drilldown: {
          targetReportKey: 'ImportLicenceByHSCodeReport',
          carryFilters: ['FromDate', 'ToDate', 'ExportImportSectionId', 'FilterType'],
          rowParams: { hsCode: 'hsCode' },
        },
      },
      {
        key: 'Description',
        dataIndex: 'hsDescription',
        title: 'Description',
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
    ],
  },
  ImportLicenceByMethodReport: {
    controllerName: 'ImportLicenceByMethodReport',
    title: 'Import Licence By Method Report',
    apiRoute: 'ImportLicenceByMethodReport',
    excelRoute: 'ImportLicenceByMethodReport/Excel',
    excelFileName: 'ImportLicenceByMethodReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: importLicenceSectionMethodFilters,
    reportSubtitle: importLicenceRangeSubtitle(
      'List of Import Licences By Method',
      true
    ),
    columns: [
      {
        key: 'Method',
        dataIndex: 'methodName',
        title: 'Method',
        drilldown: {
          targetReportKey: 'ImportLicenceDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId'],
          rowParams: { ExportImportMethodId: 'methodId' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ImportLicenceBySectionReport: {
    controllerName: 'ImportLicenceBySectionReport',
    title: 'Import Licence By Section Report',
    apiRoute: 'ImportLicenceBySectionReport',
    excelRoute: 'ImportLicenceBySectionReport/Excel',
    excelFileName: 'ImportLicenceBySectionReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: importLicenceSectionMethodFilters,
    reportSubtitle: importLicenceRangeSubtitle(
      'List of Import Licences By Section',
      true
    ),
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
        drilldown: {
          targetReportKey: 'ImportLicenceDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportMethodId'],
          rowParams: { ExportImportSectionId: 'sectionId' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ImportLicenceBySellerCountryReport: {
    controllerName: 'ImportLicenceBySellerCountryReport',
    title: 'Import Licence By Seller Country Report',
    apiRoute: 'ImportLicenceBySellerCountryReport',
    excelRoute: 'ImportLicenceBySellerCountryReport/Excel',
    excelFileName: 'ImportLicenceBySellerCountryReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: importLicenceSellerCountryFilters,
    reportSubtitle: importLicenceRangeSubtitle(
      'List of Import Licences By Seller Country',
      true
    ),
    columns: [
      {
        key: 'Country',
        dataIndex: 'country',
        title: 'Country',
        drilldown: {
          targetReportKey: 'ImportLicenceDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId', 'ExportImportMethodId'],
          rowParams: { SellerCountryId: 'countryId' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ImportLicenceCancellationReport: {
    controllerName: 'ImportLicenceCancellationReport',
    title: 'Import Licence Cancellation Report',
    apiRoute: 'ImportLicenceCancellationReport',
    excelRoute: 'ImportLicenceCancellationReport/Excel',
    excelFileName: 'ImportLicenceCancellationReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: importLicenceExtensionFilters,
    reportSubtitle: importLicenceRangeSubtitle('List of Import Licence Report'),
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    columns: [
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
      },
      {
        key: 'CancellationNo',
        dataIndex: 'licenceNo',
        title: 'Cancellation No',
      },
      {
        key: 'CancellationDate',
        dataIndex: 'sDate',
        title: 'Cancellation Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Remark',
        dataIndex: 'remark',
        title: 'Remark',
      },
    ],
  },
  ImportLicenceCompanyListReport: {
    controllerName: 'ImportLicenceCompanyListReport',
    title: 'Import Licence Company List Report',
    apiRoute: 'ImportLicenceCompanyListReport',
    excelRoute: 'ImportLicenceCompanyListReport/Excel',
    excelFileName: 'ImportLicenceCompanyListReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: importLicenceCompanyListFilters,
    reportSubtitle: importLicenceRangeSubtitle(
      'List of Import Licences By Company'
    ),
    columns: [
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
        drilldown: {
          targetReportKey: 'ImportLicenceDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId', 'ExportImportMethodId'],
          rowParams: { CompanyRegistrationNo: 'companyRegistrationNo' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ImportLicenceDailyReportNewLicenceReport: {
    controllerName: 'ImportLicenceDailyReportNewLicenceReport',
    title: 'Import Licence Daily Report (New Licence Report)',
    apiRoute: 'ImportLicenceDailyReportNewLicenceReport',
    excelRoute: 'ImportLicenceDailyReportNewLicenceReport/Excel',
    excelFileName: 'ImportLicenceDailyReportNewLicenceReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: importLicenceDailyFilters,
    reportSubtitle: importLicenceRangeSubtitle(
      'List of Import Licences By Daily',
      true
    ),
    columns: [
      {
        key: 'Date',
        dataIndex: 'date',
        title: 'Date',
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
        dataType: 'number',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalUSDValue',
        dataIndex: 'totalUSDValue',
        title: 'Total USD Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  DataImport: {
    controllerName: 'DataImport',
    title: 'Data Import',
    apiRoute: 'DataImport',
    excelRoute: '',
    excelFileName: '',
    filters: [],
    columns: [],
  },
  ImportLicenceDataImport: {
    controllerName: 'ImportLicenceDataImport',
    title: 'Data Import',
    apiRoute: 'DataImport',
    excelRoute: '',
    excelFileName: '',
    filters: [],
    columns: [],
  },
  // Licence-level view (one row per licence + currency). NO LONGER A DRILL TARGET.
  //
  // It was introduced so a drill's record count would equal the "No of Licences" of the
  // clicked cell, but that was never how Tradenet 2.0 behaved: all four By-X summaries
  // opened the per-item ImportLicenceDetailReport, which fans out per HS line
  // (ImportLicenceByCompanyReport.rdlc:592 -> ReportsController.cs:5915 on origin/master,
  // and :5101 / :5207 / :5806 for Section / Method / Seller Country). Customers read the
  // 9 columns here as "columns are missing", so the four summaries were re-pointed back at
  // ImportLicenceDetailReport and its 26 legacy columns.
  //
  // Retained, hidden and reachable by route only: its controller, proc and Excel spec
  // fixture are still wired, and deleting it would churn reportRoutes.tsx and the
  // Backend.Tests ExcelSpecs fixtures for no user-visible gain.
  ImportLicenceDetailByLicenceReport: {
    // Kept out of the sidebar: the sitemap has one "Import Licence Detail Report", the
    // per-item ImportLicenceDetailReport. Two identically titled menu rows is what a
    // customer reported before.
    hideInMenu: true,
    controllerName: 'ImportLicenceDetailByLicenceReport',
    title: 'Import Licence Detail Report',
    apiRoute: 'ImportLicenceDetailByLicenceReport',
    excelRoute: 'ImportLicenceDetailByLicenceReport/Excel',
    excelFileName: 'ImportLicenceDetailByLicenceReport.xlsx',
    initialSortColumn: 'licenceNo',
    showRowNumber: true,
    filters: importLicenceDetailByLicenceFilters,
    reportSubtitle: importLicenceRangeSubtitle(
      'List of Import Licences By Detail',
      true
    ),
    currencyTotalsColumns: {
      labelColumnKey: 'LicenceNo',
      valueColumnKey: 'TotalValue',
    },
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'licenceDate',
        title: 'Licence Date',
        dataType: 'date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'Method',
        dataIndex: 'methodName',
        title: 'Method',
      },
      {
        key: 'SellerCountry',
        dataIndex: 'sellerCountry',
        title: 'Seller Country',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ImportLicenceDetailReport: {
    controllerName: 'ImportLicenceDetailReport',
    title: 'Import Licence Detail Report',
    apiRoute: 'ImportLicenceDetailReport',
    excelRoute: 'ImportLicenceDetailReport/Excel',
    excelFileName: 'ImportLicenceDetailReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: importLicenceSummaryDetailFilters,
    reportSubtitle: importLicenceRangeSubtitle(
      'List of Import Licences By Detail',
      true
    ),
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'ApplicationDate',
        dataIndex: 'applicationDate',
        title: 'Application Date',
        dataType: 'date',
      },
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'licenceDate',
        title: 'Licence Date',
        dataType: 'date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'SellerName',
        dataIndex: 'sellerName',
        title: 'Seller Name',
      },
      {
        key: 'SellerAddress',
        dataIndex: 'sellerAddress',
        title: 'Seller Address',
      },
      {
        key: 'SellerCountry',
        dataIndex: 'sellerCountry',
        title: 'Seller Country',
      },
      {
        key: 'PlacePortOfDischarge',
        dataIndex: 'portofDischarge',
        title: 'Place/Port of Discharge',
      },
      {
        key: 'LastDate',
        dataIndex: 'lastDate',
        title: 'Last Date',
        dataType: 'date',
      },
      {
        key: 'Method',
        dataIndex: 'methodName',
        title: 'Method',
      },
      {
        key: 'ConsignedCountry',
        dataIndex: 'consignedCountry',
        title: 'Consigned Country',
      },
      {
        key: 'CountryOfOrign',
        dataIndex: 'countryofOrigin',
        title: 'Country of Orign',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'Decription',
        dataIndex: 'hsDescription',
        title: 'Decription',
      },
      {
        key: 'AU',
        dataIndex: 'unit',
        title: 'A/U',
      },
      {
        key: 'Price',
        dataIndex: 'price',
        title: 'Price',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Qty',
        dataIndex: 'quantity',
        title: 'Qty',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Value',
        dataIndex: 'amount',
        title: 'Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        key: 'Conditions',
        dataIndex: 'conditions',
        title: 'Conditions',
      },
    ],
  },
  ImportLicenceDetailReportPending: {
    controllerName: 'ImportLicenceDetailReportPending',
    title: 'Import Licence Detail Report (Pending)',
    apiRoute: 'ImportLicenceDetailReportPending',
    excelRoute: 'ImportLicenceDetailReportPending/Excel',
    excelFileName: 'ImportLicenceDetailReportPending.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: importLicencePendingDetailFilters,
    reportSubtitle: importLicenceRangeSubtitle(
      'List of Import Licences By Detail',
      true
    ),
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'ApplicationDate',
        dataIndex: 'applicationDate',
        title: 'Application Date',
        dataType: 'date',
      },
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'licenceDate',
        title: 'Licence Date',
        dataType: 'date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'SellerName',
        dataIndex: 'sellerName',
        title: 'Seller Name',
      },
      {
        key: 'SellerAddress',
        dataIndex: 'sellerAddress',
        title: 'Seller Address',
      },
      {
        key: 'SellerCountry',
        dataIndex: 'sellerCountry',
        title: 'Seller Country',
      },
      {
        key: 'PlacePortOfDischarge',
        dataIndex: 'portofDischarge',
        title: 'Place/Port of Discharge',
      },
      {
        key: 'LastDate',
        dataIndex: 'lastDate',
        title: 'Last Date',
        dataType: 'date',
      },
      {
        key: 'Method',
        dataIndex: 'methodName',
        title: 'Method',
      },
      {
        key: 'ConsignedCountry',
        dataIndex: 'consignedCountry',
        title: 'Consigned Country',
      },
      {
        key: 'CountryOfOrign',
        dataIndex: 'countryofOrigin',
        title: 'Country of Orign',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'Decription',
        dataIndex: 'hsDescription',
        title: 'Decription',
      },
      {
        key: 'AU',
        dataIndex: 'unit',
        title: 'A/U',
      },
      {
        key: 'Price',
        dataIndex: 'price',
        title: 'Price',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Qty',
        dataIndex: 'quantity',
        title: 'Qty',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Value',
        dataIndex: 'amount',
        title: 'Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        key: 'Conditions',
        dataIndex: 'conditions',
        title: 'Conditions',
      },
    ],
  },
  ImportLicenceExtensionReport: {
    controllerName: 'ImportLicenceExtensionReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    title: 'Import Licence Extension Report',
    apiRoute: 'ImportLicenceExtensionReport',
    excelRoute: 'ImportLicenceExtensionReport/Excel',
    excelFileName: 'ImportLicenceExtensionReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: importLicenceExtensionFilters,
    reportSubtitle: importLicenceRangeSubtitle('List of Import Licence Report'),
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
      },
      {
        key: 'ExtensionNo',
        dataIndex: 'licenceNo',
        title: 'Extension No',
      },
      {
        key: 'ExtensionLastDate',
        dataIndex: 'sDate',
        title: 'Extension Last Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  ImportLicenceNewReportNewReport: {
    controllerName: 'ImportLicenceNewReportNewReport',
    title: 'Import Licence New Report (New Report )',
    apiRoute: 'ImportLicenceNewReportNewReport',
    excelRoute: 'ImportLicenceNewReportNewReport/Excel',
    excelFileName: 'ImportLicenceNewReportNewReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: importLicenceNewFilters,
    reportSubtitle: importLicenceRangeSubtitle('List of Import Licence Report'),
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'licenceDate',
        title: 'Licence Date',
        dataType: 'date',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'Quota',
        dataIndex: 'quota',
        title: 'quota',
      },
      {
        key: 'Auto',
        dataIndex: 'auto',
        title: 'auto',
      },
    ],
  },
  ImportLicencePendingReport: {
    controllerName: 'ImportLicencePendingReport',
    title: 'Import Licence Pending Report',
    apiRoute: 'ImportLicencePendingReport',
    excelRoute: 'ImportLicencePendingReport/Excel',
    excelFileName: 'ImportLicencePendingReport.xlsx',
    initialSortColumn: 'Status',
    showRowNumber: true,
    filters: importLicencePendingFilters,
    reportSubtitle: importLicenceRangeSubtitle('List of Import Licence Report'),
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'Status',
        dataIndex: 'status',
        title: 'Status',
      },
      {
        key: 'ApplyType',
        dataIndex: 'applyType',
        title: 'Apply Type',
      },
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        key: 'ApplicationDate',
        dataIndex: 'applicationDate',
        title: 'Application Date',
        dataType: 'date',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'licenceDate',
        title: 'Licence Date',
        dataType: 'date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'AdditionalDescription',
        dataIndex: 'additionalDescription',
        title: 'Additional Description',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  ImportLicenceTotalValueLicencesReport: {
    controllerName: 'ImportLicenceTotalValueLicencesReport',
    title: 'Import Licence Total Value & Licences Report',
    apiRoute: 'ImportLicenceTotalValueLicencesReport',
    excelRoute: 'ImportLicenceTotalValueLicencesReport/Excel',
    excelFileName: 'ImportLicenceTotalValueLicencesReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: importLicenceTotalValueFilters,
    reportSubtitle: importLicenceRangeSubtitle(
      'Import Licences Total Value & Licences'
    ),
    columns: [
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ImportLicenceVoucherReport: {
    controllerName: 'ImportLicenceVoucherReport',
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    // labelColumnKey is OriginalLicenceNo, not LicenceNo: the shared resolver hides the
    // LicenceNo (header2) column for ApplyType='New' the way VoucherReport.rdlc:1883 does,
    // so LicenceNo is not always present in the rendered/exported column set.
    currencyTotalsColumns: { labelColumnKey: 'OriginalLicenceNo', valueColumnKey: 'LicValue' },
    title: 'Import Licence Voucher Report',
    apiRoute: 'ImportLicenceVoucherReport',
    excelRoute: 'ImportLicenceVoucherReport/Excel',
    excelFileName: 'ImportLicenceVoucherReport.xlsx',
    initialSortColumn: 'ApplicationNo',
    showRowNumber: true,
    filters: importLicenceVoucherFilters,
    reportSubtitle: importLicenceRangeSubtitle('Import Licence Voucher List'),
    resolveColumns: resolveImportLicenceVoucherColumns,
    columns: [
      {
        key: 'OriginalLicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
        fallbackDataIndexes: ['licenceNo'],
      },
      {
        key: 'ApplicationDate',
        dataIndex: 'applicationDate',
        title: 'Application Date',
        dataType: 'date',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: '=Parameters!header2.Value',
      },
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'sLicenceDate',
        title: '=Parameters!header3.Value',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'LicValue',
        dataIndex: 'totalAmount',
        title: 'Lic Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'VoucherNo',
        dataIndex: 'voucherNo',
        title: 'Voucher No',
      },
      {
        key: 'VoucherDate',
        dataIndex: 'sVoucherDate',
        title: 'Voucher Date',
      },
      {
        key: 'ApprovedUser',
        dataIndex: 'approvedUser',
        title: 'Approved User',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        key: 'TotalCIF',
        dataIndex: 'totalCIF',
        title: 'Total CIF',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'ExchangeRate',
        dataIndex: 'exchangeRate',
        title: 'Exchange Rate',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Amount',
        dataIndex: 'amount',
        title: 'Total Amount',
        dataType: 'number',
      },
    ],
  },
  ImportPermitActualAmendmentReport: {
    controllerName: 'ImportPermitActualAmendmentReport',
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    title: 'Import Permit Actual Amendment Report',
    apiRoute: 'ImportPermitActualAmendmentReport',
    excelRoute: 'ImportPermitActualAmendmentReport/Excel',
    excelFileName: 'ImportPermitActualAmendmentReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'importPermitSections',
      },
      {
        name: 'AmendRemarkId',
        label: 'Remark',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Import Permit Report'),
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
        fallbackDataIndexes: ['licenceNo'],
      },
      {
        key: 'LicenceAmendmentNo',
        dataIndex: 'licenceNo',
        title: 'Licence Amendment No',
      },
      {
        key: 'AmendmentDate',
        dataIndex: 'sDate',
        title: 'Amendment Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  ImportPermitAmendmentReport: {
    controllerName: 'ImportPermitAmendmentReport',
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    title: 'Import Permit Amendment Report',
    apiRoute: 'ImportPermitAmendmentReport',
    excelRoute: 'ImportPermitAmendmentReport/Excel',
    excelFileName: 'ImportPermitAmendmentReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'importPermitSections',
      },
      {
        name: 'AmendRemarkId',
        label: 'Remark',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Import Permit Report'),
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceAmendmentNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence Amendment No',
      },
      {
        key: 'AmendmentDate',
        dataIndex: 'sDate',
        title: 'Amendment Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  ImportPermitByHSCodeReport: {
    controllerName: 'ImportPermitByHSCodeReport',
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    title: 'Import Permit By HS Code Report',
    apiRoute: 'ImportPermitByHSCodeReport',
    excelRoute: 'ImportPermitByHSCodeReport/Excel',
    excelFileName: 'ImportPermitByHSCodeReport.xlsx',
    initialSortColumn: 'hsCode',
    showRowNumber: true,
    // Old HSCodeReport.rdlc:162 heads the row-number column 'Sr.No.'.
    rowNumberTitle: 'Sr.No.',
    // Old filter box (Views/Reports/ImportPermitByHSCodeReport.cshtml:26-63): From Date,
    // To Date, Import Section, Filter By, HS Code. FormType is a hidden field there (:21)
    // and the controller hard-codes FormType = "Import Permit".
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'importPermitSections',
      },
      {
        name: 'FilterType',
        label: 'Filter By',
        type: 'select',
        defaultValue: 'Start',
        options: [
          { label: 'Start', value: 'Start' },
          { label: 'End', value: 'End' },
        ],
      },
      {
        name: 'hsCode',
        label: 'HS Code',
        type: 'text',
        defaultValue: '',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Import Permit By HS Code', true),
    columns: [
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'HS Code',
        drilldown: {
          targetReportKey: 'ImportPermitByHSCodeReport',
          carryFilters: ['FromDate', 'ToDate', 'FilterType', 'ExportImportSectionId'],
          rowParams: { hsCode: 'hsCode' },
          // Old rdlc:573 drills through with window.open(..., '_blank').
          openInNewTab: true,
        },
      },
      {
        key: 'Description',
        dataIndex: 'hsDescription',
        title: 'Description',
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        // Old rdlc:698 renders =FORMAT(Sum(Fields!Amount.Value),"N4").
        dataType: 'money',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ImportPermitBySectionReport: {
    controllerName: 'ImportPermitBySectionReport',
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    title: 'Import Permit By Section Report',
    apiRoute: 'ImportPermitBySectionReport',
    excelRoute: 'ImportPermitBySectionReport/Excel',
    excelFileName: 'ImportPermitBySectionReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    // Old ImportPermitBySectionReport.rdlc:249 heads the row-number column 'Sr.No.'.
    rowNumberTitle: 'Sr.No.',
    // Old filter box (Views/Reports/ImportPermitBySectionReport.cshtml:25-53): From Date,
    // To Date, EIR Card Type, Import Section. `Type` is a hidden field there (:21) and the
    // controller hard-codes Type = "Oversea", so it is not a user filter.
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'importPermitSections',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Import Permit By Section', true),
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
        drilldown: {
          targetReportKey: 'ImportPermitDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId'],
          rowParams: { ExportImportSectionId: 'sectionId' },
          // Old rdlc:598 drills through with window.open(..., '_blank').
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        // 'money' + '#,##0.0000' is the Money4 cell format in the .xlsx and the grid's
        // N4 render, matching old rdlc:676 =FORMAT(Sum(Fields!Amount.Value),"N4").
        dataType: 'money',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ImportPermitBySellerCountryReport: {
    controllerName: 'ImportPermitBySellerCountryReport',
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    title: 'Import Permit By Seller Country Report',
    apiRoute: 'ImportPermitBySellerCountryReport',
    excelRoute: 'ImportPermitBySellerCountryReport/Excel',
    excelFileName: 'ImportPermitBySellerCountryReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    // Old ImportPermitBySellerCountryReport.rdlc:249 heads the row-number column 'Sr.No.'.
    rowNumberTitle: 'Sr.No.',
    // Old filter box (Views/Reports/ImportPermitBySellerCountryReport.cshtml:25-60): From
    // Date, To Date, EIR Card Type, Import Section, Seller Country. `Type` is hidden (:21).
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'importPermitSections',
      },
      {
        name: 'SellerCountryId',
        label: 'Seller Country',
        type: 'number',
        defaultValue: 0,
        lookupName: 'countries',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Import Permit By Buyer Country', true),
    columns: [
      {
        key: 'Country',
        dataIndex: 'country',
        title: 'Country',
        drilldown: {
          targetReportKey: 'ImportPermitDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId'],
          rowParams: { SellerCountryId: 'countryId' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        // 'money' + '#,##0.0000' is the Money4 cell format in the .xlsx and the grid's
        // N4 render, matching old rdlc:667 =FORMAT(Sum(Fields!Amount.Value),"N4").
        dataType: 'money',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ImportPermitCancellationReport: {
    controllerName: 'ImportPermitCancellationReport',
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    // Old CancelReport.rdlc Tablix2 (:1497-1857) groups on Currency (:1837): one
    // "<CUR>:N licence(s)" (:1557) + "<CUR>:Sum(Amount) N4" (:1611) row per currency,
    // then a grand "Total:N licence(s)" (:1723) with the money cell blank (:1778).
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    title: 'Import Permit Cancellation Report',
    apiRoute: 'ImportPermitCancellationReport',
    excelRoute: 'ImportPermitCancellationReport/Excel',
    excelFileName: 'ImportPermitCancellationReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    // Old CancelReport.rdlc:256 heads the row-number column 'No.'.
    rowNumberTitle: 'No.',
    // Old filter box (Views/Reports/ImportPermitCancelReport.cshtml:25-61): From Date,
    // To Date, Import Section, Company Registration No, readonly Company Name. FormType is
    // a hidden field there (:21) and the controller hard-codes FormType = "Import Permit".
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'importPermitSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      importLicenceCompanyNameFilter,
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Import Permit Report'),
    // Old CancelReport.rdlc Tablix1 has exactly 11 columns (headers at :256, :311, :366,
    // :421, :476, :531/:545, :600, :655, :710, :765, :820) and no HS Code column at all —
    // the previous leading `hsCode` column was not in the old report.
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        // Old rdlc binds header 'Licence No' (:366) to =Fields!OldLicenceNo.Value (:986)
        // and 'Cancellation No' (:421) to =Fields!LicenceNo.Value (:1039) — the new config
        // had the two the wrong way round.
        key: 'LicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
      },
      {
        key: 'CancellationNo',
        dataIndex: 'licenceNo',
        title: 'Cancellation No',
      },
      {
        key: 'CancellationDate',
        dataIndex: 'sDate',
        title: 'Cancellation Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        // Old rdlc:710 misspells this header 'Curency'; keeping the correct spelling
        // rather than reproducing the typo.
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        // The per-currency footer prints FORMAT(Sum(Amount),"N4") (rdlc:1611), so the
        // column it sits under uses the same 4-decimal format.
        dataType: 'money',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Remark',
        dataIndex: 'remark',
        title: 'Remark',
      },
    ],
  },
  ImportPermitCompanyListReport: {
    controllerName: 'ImportPermitCompanyListReport',
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    title: 'Import Permit Company List Report',
    apiRoute: 'ImportPermitCompanyListReport',
    excelRoute: 'ImportPermitCompanyListReport/Excel',
    excelFileName: 'ImportPermitCompanyListReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    // Old ImportPermitByCompanyReport.rdlc:249 heads the row-number column 'Sr.No.'.
    rowNumberTitle: 'Sr.No.',
    // Old filter box (Views/Reports/ImportPermitByCompanyReport.cshtml:25-66): From Date,
    // To Date, EIR Card Type, Import Section, Company Registration No, readonly Company
    // Name. `Type` is hidden (:21) and the controller hard-codes Type = "Oversea".
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'importPermitSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      importLicenceCompanyNameFilter,
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Import Permit By Company'),
    columns: [
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
        drilldown: {
          targetReportKey: 'ImportPermitDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId'],
          rowParams: { CompanyRegistrationNo: 'companyRegistrationNo' },
          openInNewTab: true,
        },
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        // 'money' + '#,##0.0000' is the Money4 cell format in the .xlsx and the grid's
        // N4 render, matching old rdlc:667 =FORMAT(Sum(Fields!Amount.Value),"N4").
        dataType: 'money',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ImportPermitDailyReportNewPermitReport: {
    controllerName: 'ImportPermitDailyReportNewPermitReport',
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    title: 'Import Permit Daily Report (New Permit Report)',
    apiRoute: 'ImportPermitDailyReportNewPermitReport',
    excelRoute: 'ImportPermitDailyReportNewPermitReport/Excel',
    excelFileName: 'ImportPermitDailyReportNewPermitReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    defaultPageSize: 1000,
    // ImportPermitByDailyReport.rdlc:608 prints the serial column; blank header at
    // rdlc:273. Same false negative as BorderImportLicenceDailyReportNewLicenceReport.
    showRowNumber: true,
    rowNumberTitle: 'Sr.No.',
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'importPermitSections',
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      importLicenceCompanyNameFilter,
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Import Permit By Daily', true),
    columns: [
      {
        key: 'Date',
        dataIndex: 'date',
        title: 'Date',
      },
      {
        key: 'NoOfLicences',
        dataIndex: 'noOfLicences',
        title: 'No of Licences',
        dataType: 'number',
      },
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        dataType: 'money',
        // Old ImportPermitByDailyReport.rdlc:760 = FORMAT(Sum(Fields!Amount.Value),"N4").
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalUSDValue',
        dataIndex: 'totalUSDValue',
        title: 'Total USD Value',
        dataType: 'money',
        // Old rdlc:866 = FORMAT(Sum(Fields!totalUSDAmount.Value), "N4").
        numberFormat: '#,##0.0000',
      },
    ],
  },
  ImportPermitTotalValuePermitsReport: {
    controllerName: 'ImportPermitTotalValuePermitsReport',
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    title: 'Import Permit Total Value & Permits Report',
    apiRoute: 'ImportPermitTotalValuePermitsReport',
    excelRoute: 'ImportPermitTotalValuePermitsReport/Excel',
    excelFileName: 'ImportPermitTotalValuePermitsReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    filters: importPermitTotalValueFilters,
    reportSubtitle: importLicenceRangeSubtitle(
      'Import Permits Total Value & Permits'
    ),
    columns: [
      {
        key: 'TotalValue',
        dataIndex: 'totalValue',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
    ],
  },
  ImportPermitDetailReport: {
    controllerName: 'ImportPermitDetailReport',
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    title: 'Import Permit Detail Report',
    apiRoute: 'ImportPermitDetailReport',
    excelRoute: 'ImportPermitDetailReport/Excel',
    excelFileName: 'ImportPermitDetailReport.xlsx',
    initialSortColumn: 'PaThaKaTypeId',
    showRowNumber: true,
    // Old filter box (Views/Reports/ImportPermitDetailReport.cshtml:28-56): From Date,
    // To Date, EIR Card Type, Import Section. `Type` is a hidden field there (:21) and
    // ImportPermitDetailReportController.cs:120 hard-codes Type = "Oversea". This is the
    // report the By-X drill-downs land on, so its filter box must match theirs.
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'PaThaKaTypeId',
        label: 'EIR Card Type',
        type: 'number',
        defaultValue: 0,
        lookupName: 'paThaKaTypes',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'importPermitSections',
      },
      // No Seller Country / Company Registration No box: the old view has none either,
      // and a drill-down's params reach the request whether or not a filter box exists
      // for them (see the drill effect in Report/Page/GenericReportPage.tsx).
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Import Permit By Detail', true),
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'PermitNo',
        dataIndex: 'licenceNo',
        title: 'Permit No',
      },
      {
        key: 'PermitDate',
        dataIndex: 'licenceDate',
        title: 'Permit Date',
        dataType: 'date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'UnionCitizenshipNo',
        dataIndex: 'nrcNo',
        title: 'Union Citizenship No',
      },
      {
        key: 'AgentName',
        dataIndex: 'authorisedAgentName',
        title: 'Agent Name',
      },
      {
        key: 'AgentAddress',
        dataIndex: 'authorisedAgentAddress',
        title: 'Agent Address',
      },
      {
        key: 'SellerCountry',
        dataIndex: 'sellerCountry',
        title: 'Seller Country',
      },
      {
        key: 'PortOfShipment',
        dataIndex: 'portofShipment',
        title: 'Port of Shipment',
      },
      {
        key: 'PlacePortOfDischarge',
        dataIndex: 'portofDischarge',
        title: 'Place/Port of Discharge',
      },
      {
        key: 'LastDate',
        dataIndex: 'lastDate',
        title: 'Last Date',
        dataType: 'date',
      },
      {
        key: 'CountryOfOrign',
        dataIndex: 'countryofOrigin',
        title: 'Country of Orign',
      },
      {
        key: 'TypeOfPermit',
        dataIndex: 'permitType',
        title: 'Type of Permit',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'Decription',
        dataIndex: 'hsDescription',
        title: 'Decription',
      },
      {
        key: 'AU',
        dataIndex: 'unit',
        title: 'A/U',
      },
      {
        key: 'Price',
        dataIndex: 'price',
        title: 'Price',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Qty',
        dataIndex: 'quantity',
        title: 'Qty',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Value',
        dataIndex: 'amount',
        title: 'Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'Conditions',
        dataIndex: 'conditions',
        title: 'Conditions',
      },
    ],
  },
  ImportPermitExtensionReport: {
    controllerName: 'ImportPermitExtensionReport',
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    title: 'Import Permit Extension Report',
    apiRoute: 'ImportPermitExtensionReport',
    excelRoute: 'ImportPermitExtensionReport/Excel',
    excelFileName: 'ImportPermitExtensionReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'importPermitSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Import Permit Report'),
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'ExtensionNo',
        dataIndex: 'oldLicenceNo',
        title: 'Extension No',
      },
      {
        key: 'ExtensionLastDate',
        dataIndex: 'sDate',
        title: 'Extension Last Date',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  ImportPermitNewReportNewReport: {
    controllerName: 'ImportPermitNewReportNewReport',
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    currencyTotalsColumns: { labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' },
    title: 'Import Permit New Report (New Report )',
    apiRoute: 'ImportPermitNewReportNewReport',
    excelRoute: 'ImportPermitNewReportNewReport/Excel',
    excelFileName: 'ImportPermitNewReportNewReport.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'FormType',
        label: 'Form Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'importPermitSections',
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
    ],
    reportSubtitle: importLicenceRangeSubtitle('List of Import Permit Report'),
    columns: [
      {
        key: 'Section',
        dataIndex: 'sectionName',
        title: 'Section',
      },
      {
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: 'Licence No',
      },
      {
        key: 'LicenceDate',
        dataIndex: 'licenceDate',
        title: 'Licence Date',
        dataType: 'date',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'TotalValue',
        dataIndex: 'amount',
        title: 'Total Value',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        key: 'hsCode',
        dataIndex: 'hsCode',
        title: 'hsCode',
      },
      {
        key: 'Quota',
        dataIndex: 'quota',
        title: 'quota',
      },
      {
        key: 'Auto',
        dataIndex: 'auto',
        title: 'auto',
      },
    ],
  },
  ImportPermitVoucherReport: {
    controllerName: 'ImportPermitVoucherReport',
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    // No currencyTotalsColumns: VoucherReport.rdlc has a single TOTAL row summing the
    // voucher fee (rdlc:1828), and no per-currency block anywhere in the file.
    title: 'Import Permit Voucher Report',
    apiRoute: 'ImportPermitVoucherReport',
    excelRoute: 'ImportPermitVoucherReport/Excel',
    excelFileName: 'ImportPermitVoucherReport.xlsx',
    initialSortColumn: 'ApplicationNo',
    showRowNumber: true,
    // Old VoucherReport.rdlc:253 heads the row-number column 'No.'.
    rowNumberTitle: 'No.',
    resolveColumns: resolveImportLicenceVoucherColumns,
    // Old filter box (Views/Reports/ImportPermitVoucherReport.cshtml:25-72): From Date,
    // To Date, Import Section, Apply Type, Payment Type, Company Registration No, readonly
    // Company Name. FormType is a hidden field there (:21) and the controller hard-codes
    // FormType = "Import Permit".
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'ExportImportSectionId',
        label: 'Import Section',
        type: 'number',
        defaultValue: 0,
        lookupName: 'importPermitSections',
      },
      {
        name: 'ApplyType',
        label: 'Apply Type',
        type: 'select',
        defaultValue: 'New',
        options: [
          { label: 'New', value: 'New' },
          { label: 'Amend', value: 'Amend' },
          { label: 'Extension', value: 'Extension' },
          { label: 'Cancel', value: 'Cancel' },
          { label: 'Actual Amend', value: 'Actual Amend' },
          { label: 'De-Cancel', value: 'De-Cancel' },
        ],
      },
      {
        name: 'PaymentType',
        label: 'Payment Type',
        type: 'select',
        defaultValue: '',
        options: [
          { label: '--- All ---', value: '' },
          { label: 'Cash', value: 'Cash' },
          { label: 'MPU', value: 'MPU' },
          { label: 'Citizen Pay', value: 'Citizen Pay' },
        ],
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      importLicenceCompanyNameFilter,
    ],
    reportSubtitle: importLicenceRangeSubtitle('Import Permit Voucher List'),
    // Column order mirrors VoucherReport.rdlc (headers at :253, :308, :363, :418, :473,
    // :528, :597, :652, :721, :790, :845, :900, :955) and its sibling
    // ImportLicenceVoucherReport, which was already brought to parity.
    columns: [
      {
        // Old rdlc col 2 (header 'Licence No', :308) renders
        // =IIF(ApplyType="New", LicenceNo, OldLicenceNo) at :1068 — the original licence.
        key: 'OriginalLicenceNo',
        dataIndex: 'oldLicenceNo',
        title: 'Licence No',
        fallbackDataIndexes: ['licenceNo'],
      },
      {
        key: 'ApplicationDate',
        dataIndex: 'applicationDate',
        title: 'Application Date',
        dataType: 'date',
      },
      {
        // Old rdlc col 3 header is =Parameters!header2.Value, set per ApplyType at
        // ReportsController.cs:8240-8260; resolveImportLicenceVoucherColumns fills it in
        // and hides the column for ApplyType='New' (rdlc:1883).
        key: 'LicenceNo',
        dataIndex: 'licenceNo',
        title: '=Parameters!header2.Value',
      },
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        // Old rdlc col 5 header is =Parameters!header3.Value (ReportsController.cs:8241-8261).
        key: 'LicenceDate',
        dataIndex: 'sLicenceDate',
        title: '=Parameters!header3.Value',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'LicValue',
        dataIndex: 'totalAmount',
        title: 'Lic Value',
        dataType: 'money',
        // Old sLicenceValue = TotalAmount.ToString("N4") (Business/Reports.cs:1577).
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'VoucherNo',
        dataIndex: 'voucherNo',
        title: 'Voucher No',
      },
      {
        key: 'VoucherDate',
        dataIndex: 'sVoucherDate',
        title: 'Voucher Date',
      },
      {
        key: 'ApprovedUser',
        dataIndex: 'approvedUser',
        title: 'Approved User',
      },
      {
        key: 'CommodityType',
        dataIndex: 'commodityType',
        title: 'Commodity Type',
      },
      {
        key: 'TotalCIF',
        dataIndex: 'totalCIF',
        title: 'Total CIF',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'ExchangeRate',
        dataIndex: 'exchangeRate',
        title: 'Exchange Rate',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        // The MMK voucher fee (AccountTransaction.TotalAmount), the only column the old
        // TOTAL row sums: =FORMAT(SUM(Fields!Amount.Value),"N0") at rdlc:1828.
        key: 'Amount',
        dataIndex: 'amount',
        title: 'Total Amount',
        dataType: 'number',
        numberFormat: '#,##0',
      },
    ],
  },
  ListOfCompany: {
    controllerName: 'ListOfCompany',
    title: 'List of Company',
    apiRoute: 'ListOfCompany',
    excelRoute: 'ListOfCompany/Excel',
    excelFileName: 'ListOfCompany.xlsx',
    initialSortColumn: 'CompanyRegistrationNo',
    showRowNumber: true,
    // Legacy RDLC report header (PaThaKaAllReport): Ministry of Commerce /
    // Directorate of Trade / "Company Business Organization" (static header1).
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    reportSubtitle: () => 'Company Business Organization',
    filters: [
      {
        name: 'BusinessTypeId',
        label: 'Business Type',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'LineofBusinessId',
        label: 'Line of Business',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'State',
        label: 'State',
        type: 'select',
        defaultValue: '',
        options: pathakaStateFilterOptions,
      },
      {
        name: 'Status',
        label: 'Status',
        type: 'select',
        defaultValue: '',
        options: pathakaStatusFilterOptions,
      },
    ],
    columns: [
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'OwnerName',
        dataIndex: 'ownerName',
        title: 'Owner Name',
      },
      {
        key: 'OwnerNRCNo',
        dataIndex: 'ownerNRC',
        title: 'Owner NRC No',
      },
      {
        key: 'CompanyRegistrationDate',
        dataIndex: 'companyRegistrationDate',
        title: 'Company Registration Date',
        dataType: 'date',
      },
      {
        key: 'ValidDate',
        dataIndex: 'endDate',
        title: 'Valid Date',
        dataType: 'date',
      },
      {
        key: 'BusinessType',
        dataIndex: 'businessType',
        title: 'Business Type',
      },
      {
        key: 'LineOfBusiness',
        dataIndex: 'lineofBusiness',
        title: 'Line of Business',
      },
      {
        key: 'MICPermitNo',
        dataIndex: 'micPermitNo',
        title: 'MICPermit No',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'Mobile',
        dataIndex: 'mobile1',
        title: 'Mobile',
      },
      {
        key: 'Fax',
        dataIndex: 'fax',
        title: 'Fax',
      },
      {
        key: 'Email',
        dataIndex: 'email',
        title: 'Email',
      },
      {
        key: 'Capital',
        dataIndex: 'capital',
        title: 'Capital',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'Currency',
        dataIndex: 'currency',
        title: 'Currency',
      },
      {
        key: 'RegistrationTerm',
        dataIndex: 'terms',
        title: 'Registration Term',
        dataType: 'number',
      },
      {
        key: 'DecisionDate',
        dataIndex: 'decisionDate',
        title: 'Decision Date',
        dataType: 'date',
      },
      {
        key: 'DecisionMaker',
        dataIndex: 'decisionName',
        title: 'Decision Maker',
      },
      {
        key: 'Status',
        dataIndex: 'status',
        title: 'Status',
      },
    ],
  },
  ListOfDirectorsByCompanyRegistrationNo: {
    controllerName: 'ListOfDirectorsByCompanyRegistrationNo',
    title: 'List of Directors By Company Registration No',
    apiRoute: 'ListOfDirectorsByCompanyRegistrationNo',
    excelRoute: 'ListOfDirectorsByCompanyRegistrationNo/Excel',
    excelFileName: 'ListOfDirectorsByCompanyRegistrationNo.xlsx',
    initialSortColumn: 'CompanyRegistrationNo',
    showRowNumber: false,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'Name',
        label: 'Name',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'Nationality',
        label: 'Nationality',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'NRCType',
        label: 'NRC Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'NRCPrefixId',
        label: 'NRC Prefix',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'NRCPrefixCodeId',
        label: 'NRC Prefix Code',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'nrcNo',
        label: 'NRC No',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'Type',
        label: 'Type',
        type: 'text',
        defaultValue: '',
      },
    ],
    columns: [
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'CompanyRegistrationDate',
        dataIndex: 'companyRegistrationDate',
        title: 'Company Registration Date',
        dataType: 'date',
      },
      {
        key: 'ValidDate',
        dataIndex: 'endDate',
        title: 'Valid Date',
        dataType: 'date',
      },
      {
        key: 'BusinessType',
        dataIndex: 'businessType',
        title: 'Business Type',
      },
      {
        key: 'LineOfBusiness',
        dataIndex: 'lineofBusiness',
        title: 'Line of Business',
      },
    ],
  },
  ListOfDirectors: {
    controllerName: 'ListOfDirectors',
    title: 'List of Directors',
    apiRoute: 'ListOfDirectors',
    excelRoute: 'ListOfDirectors/Excel',
    excelFileName: 'ListOfDirectors.xlsx',
    initialSortColumn: 'CompanyRegistrationNo',
    showRowNumber: true,
    // The page passes rowNumberTitle="No." to BasicTable (DirectorListReport.rdlc:550);
    // declare it here too so the sheet's first header matches the grid's.
    rowNumberTitle: 'No.',
    // Legacy RDLC report header: Ministry of Commerce / Directorate of Trade /
    // "Directors List ({FromDate}) To ({ToDate})" (ReportsController.cs:597).
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    reportSubtitle: reportDateRangeSubtitle('Directors List'),
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'CompanyRegistrationNo',
        label: 'Company Registration No',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'Name',
        label: 'Name',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'Nationality',
        label: 'Nationality',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'NRCType',
        label: 'NRC Type',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'NRCPrefixId',
        label: 'NRC Prefix',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'NRCPrefixCodeId',
        label: 'NRC Prefix Code',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'nrcNo',
        label: 'NRC No',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'Type',
        label: 'Type',
        type: 'text',
        defaultValue: '',
      },
    ],
    columns: [
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'Name',
        dataIndex: 'directorName',
        title: 'Name',
      },
      {
        key: 'Position',
        dataIndex: 'directorPosition',
        title: 'Position',
      },
      {
        key: 'nrcNo',
        dataIndex: 'directorNRC',
        title: 'NRC No.',
      },
      {
        key: 'Nationality',
        dataIndex: 'directorNationality',
        title: 'Nationality',
      },
      {
        key: 'Status',
        dataIndex: 'directorBlackList',
        title: 'Status',
      },
    ],
  },
  ListOfTopCapitalCompany: {
    controllerName: 'ListOfTopCapitalCompany',
    title: 'List of Top Capital Company',
    apiRoute: 'ListOfTopCapitalCompany',
    excelRoute: 'ListOfTopCapitalCompany/Excel',
    excelFileName: 'ListOfTopCapitalCompany.xlsx',
    initialSortColumn: 'CompanyRegistrationNo',
    showRowNumber: true,
    // Legacy RDLC report header: Ministry of Commerce / Directorate of Trade /
    // "Top Capital Company Report ({FromDate}) To ({ToDate})".
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    reportSubtitle: (filters) => {
      const from = filters.FromDate
        ? dayjs(String(filters.FromDate)).format('DD/MM/YYYY')
        : '';
      const to = filters.ToDate
        ? dayjs(String(filters.ToDate)).format('DD/MM/YYYY')
        : '';
      return `Top Capital Company Report (${from}) To (${to})`;
    },
    // The old report had no sortable headers: the ranking IS the report (top N by
    // Capital), so the controller ignores the grid's sort. See
    // ListOfTopCapitalCompanyController.Post.
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'BusinessTypeId',
        label: 'Business Type',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'LineofBusinessId',
        label: 'Line of Business',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'State',
        label: 'State',
        type: 'select',
        defaultValue: '',
        options: pathakaStateFilterOptions,
      },
      {
        name: 'Status',
        label: 'Status',
        type: 'select',
        defaultValue: '',
        options: pathakaStatusFilterOptions,
      },
      {
        // The old screen's required "No of List" box (model.TotalRecords, default 10 —
        // PaThaKaTopCapitalCompanyReport.cshtml:61-68, ReportsController.cs:418). It is
        // what makes this a TOP-capital report: the controller ranks by Capital DESC and
        // returns only this many companies.
        name: 'TotalRecords',
        label: 'No of List',
        type: 'number',
        defaultValue: 10,
        required: true,
      },
    ],
    columns: [
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyRegistrationDate',
        dataIndex: 'companyRegistrationDate',
        title: 'Company Registration Date',
        dataType: 'date',
      },
      {
        key: 'ValidDate',
        dataIndex: 'endDate',
        title: 'Valid Date',
        dataType: 'date',
      },
      {
        key: 'BusinessType',
        dataIndex: 'businessType',
        title: 'Business Type',
      },
      {
        key: 'LineOfBusiness',
        dataIndex: 'lineofBusiness',
        title: 'Line of Business',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'CapitalAmount',
        dataIndex: 'capital',
        title: 'Capital Amount',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
    ],
  },
  ListOfValidAndInvalidCompany: {
    controllerName: 'ListOfValidAndInvalidCompany',
    title: 'List of Valid and Invalid Company',
    apiRoute: 'ListOfValidAndInvalidCompany',
    excelRoute: 'ListOfValidAndInvalidCompany/Excel',
    excelFileName: 'ListOfValidAndInvalidCompany.xlsx',
    initialSortColumn: 'CompanyRegistrationNo',
    showRowNumber: true,
    // Legacy RDLC report header: Ministry of Commerce / Directorate of Trade /
    // "{Valid|Invalid} Company Business Organization ({date})".
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    reportSubtitle: (filters) => {
      const type =
        String(filters.Type).toLowerCase() === 'invalid' ? 'Invalid' : 'Valid';
      const date = filters.Date
        ? dayjs(String(filters.Date)).format('DD/MM/YYYY')
        : '';
      return `${type} Company Business Organization (${date})`;
    },
    filters: [
      {
        name: 'Date',
        label: 'Date',
        type: 'date',
      },
      {
        name: 'BusinessTypeId',
        label: 'Business Type',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'LineofBusinessId',
        label: 'Line of Business',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'State',
        label: 'State',
        type: 'select',
        defaultValue: '',
        options: pathakaStateFilterOptions,
      },
      {
        name: 'Status',
        label: 'Status',
        type: 'select',
        defaultValue: '',
        options: pathakaStatusFilterOptions,
      },
      {
        name: 'Type',
        label: 'Type',
        type: 'select',
        defaultValue: 'valid',
        options: [
          { label: 'Valid', value: 'valid' },
          { label: 'Invalid', value: 'invalid' },
        ],
      },
    ],
    columns: [
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyRegistrationDate',
        dataIndex: 'companyRegistrationDate',
        title: 'Company Registration Date',
        dataType: 'date',
      },
      {
        key: 'IssuedDate',
        dataIndex: 'issuedDate',
        title: 'Issued Date',
        dataType: 'date',
      },
      {
        key: 'ValidDate',
        dataIndex: 'endDate',
        title: 'Valid Date',
        dataType: 'date',
      },
      {
        key: 'BusinessType',
        dataIndex: 'businessType',
        title: 'Business Type',
      },
      {
        key: 'LineOfBusiness',
        dataIndex: 'lineofBusiness',
        title: 'Line of Business',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
    ],
  },
  MemberRegistrationReport: {
    controllerName: 'MemberRegistrationReport',
    title: 'Member Registration Report',
    apiRoute: 'MemberRegistrationReport',
    excelRoute: 'MemberRegistrationReport/Excel',
    excelFileName: 'MemberRegistrationReport.xlsx',
    initialSortColumn: 'ApplyType',
    showRowNumber: true,
    rowNumberTitle: 'No.',
    // Legacy RDLC report header: Ministry of Commerce / Directorate of Trade /
    // "Member Registration ({FromDate}) To ({ToDate})" (the old header1 parameter,
    // ReportsController.cs:168).
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    reportSubtitle: reportDateRangeSubtitle('Member Registration'),
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'ApplyType',
        label: 'Apply Type',
        type: 'text',
        defaultValue: '',
      },
    ],
    columns: [
      {
        key: 'ApplyType',
        dataIndex: 'applyType',
        title: 'Apply Type',
      },
      {
        key: 'MemberCode',
        dataIndex: 'memberCode',
        title: 'Member Code',
      },
      {
        key: 'Email',
        dataIndex: 'email',
        title: 'Email',
      },
      {
        key: 'FullName',
        dataIndex: 'fullName',
        title: 'Full Name',
      },
      {
        key: 'Mobile',
        dataIndex: 'mobile',
        title: 'Mobile',
      },
      {
        key: 'nrcNo',
        dataIndex: 'nrcNo',
        title: 'NRC No.',
      },
      {
        key: 'IssuedDate',
        dataIndex: 'issuedDate',
        title: 'Issued Date',
        dataType: 'date',
      },
      {
        key: 'ValidDate',
        dataIndex: 'endDate',
        title: 'Valid Date',
        dataType: 'date',
      },
    ],
  },
  MPUReport: {
    controllerName: 'MPUReport',
    title: 'MPU Report',
    apiRoute: 'MPUReport',
    excelRoute: 'MPUReport/Excel',
    excelFileName: 'MPUReport.xlsx',
    initialSortColumn: 'Sakhan',
    showRowNumber: true,
    reportSubtitle: reportDateRangeSubtitle('MPU Report'),
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        showTime: true,
        required: true,
      },
      {
        name: 'FormType',
        label: 'Certificate Type',
        type: 'select',
        defaultValue: '',
        options: certificateTypeOptions,
      },
      {
        name: 'PaymentType',
        label: 'Payment Type',
        type: 'select',
        defaultValue: '',
        options: [
          { label: 'All', value: '' },
          { label: 'MPU', value: 'MPU' },
          { label: 'Citizen Pay', value: 'CitizenPay' },
        ],
      },
    ],
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhan',
        title: 'Sakhan',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        key: 'TrxnDate',
        dataIndex: 'transactionDateTime',
        title: 'Trxn Date',
        dataType: 'dateTime',
        dateFormat: 'MM/DD/YYYY HH:mm:ss',
      },
      {
        key: 'FormType',
        dataIndex: 'formType',
        title: 'Form Type',
      },
      {
        key: 'ApplicationType',
        dataIndex: 'applyType',
        title: 'Application Type',
      },
      {
        key: 'MID',
        dataIndex: 'merchantId',
        title: 'MID',
      },
      {
        key: 'CardNo',
        dataIndex: 'accountNo',
        title: 'Card No',
      },
      {
        key: 'InvoiceNo',
        dataIndex: 'invoiceNo',
        title: 'Invoice No',
      },
      {
        key: 'APPCode',
        dataIndex: 'approvalCode',
        title: 'APP Code',
      },
      {
        key: 'TrxnRefNo',
        dataIndex: 'transactionRefNo',
        title: 'Trxn Ref No.',
      },
      {
        key: 'TrxnAmount',
        dataIndex: 'transactionAmount',
        title: 'Trxn Amount',
        dataType: 'money',
        numberFormat: '0.####',
      },
      {
        key: 'MOC',
        dataIndex: 'mocAmount',
        title: 'MOC',
        dataType: 'money',
        numberFormat: '0.####',
      },
      {
        key: 'IM',
        dataIndex: 'imAmount',
        title: 'IM',
        dataType: 'money',
        numberFormat: '0.####',
      },
      {
        key: 'MPU',
        dataIndex: 'mpuAmount',
        title: 'MPU',
        dataType: 'money',
        numberFormat: '0.####',
      },
      {
        key: 'VoucherNo',
        dataIndex: 'voucherNo',
        title: 'Voucher No',
      },
      {
        key: 'TotalAmount',
        dataIndex: 'totalAmount',
        title: 'Total Amount',
        dataType: 'money',
        numberFormat: '0.####',
      },
      {
        key: 'AmountDiff',
        dataIndex: 'amountDiff',
        title: 'Amount Diff',
        dataType: 'money',
        numberFormat: '0.####',
      },
    ],
  },
  MPUReportV3: {
    controllerName: 'MPUReportV3',
    title: 'MPU Report V3',
    apiRoute: 'MPUReportV3',
    excelRoute: 'MPUReportV3/Excel',
    excelFileName: 'MPUReportV3.xlsx',
    initialSortColumn: 'Sakhan',
    showRowNumber: true,
    reportSubtitle: reportDateRangeSubtitle('MPU Report'),
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        showTime: true,
        required: true,
      },
      {
        name: 'FormType',
        label: 'Certificate Type',
        type: 'select',
        defaultValue: '',
        options: certificateTypeOptions,
      },
      {
        name: 'PaymentType',
        label: 'Payment Type',
        type: 'select',
        defaultValue: '',
        options: [
          { label: 'All', value: '' },
          { label: 'MPU', value: 'MPU' },
          { label: 'Citizen Pay', value: 'CitizenPay' },
        ],
      },
    ],
    columns: [
      {
        key: 'Sakhan',
        dataIndex: 'sakhan',
        title: 'Sakhan',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'ApplicationNo',
        dataIndex: 'applicationNo',
        title: 'Application No',
      },
      {
        key: 'TrxnDate',
        dataIndex: 'transactionDateTime',
        title: 'Trxn Date',
        dataType: 'dateTime',
        dateFormat: 'MM/DD/YYYY HH:mm:ss',
      },
      {
        key: 'FormType',
        dataIndex: 'formType',
        title: 'Form Type',
      },
      {
        key: 'ApplicationType',
        dataIndex: 'applyType',
        title: 'Application Type',
      },
      {
        key: 'MID',
        dataIndex: 'merchantId',
        title: 'MID',
      },
      {
        key: 'CardNo',
        dataIndex: 'accountNo',
        title: 'Card No',
      },
      {
        key: 'InvoiceNo',
        dataIndex: 'invoiceNo',
        title: 'Invoice No',
      },
      {
        key: 'APPCode',
        dataIndex: 'approvalCode',
        title: 'APP Code',
      },
      {
        key: 'TrxnRefNo',
        dataIndex: 'transactionRefNo',
        title: 'Trxn Ref No.',
      },
      {
        key: 'TrxnAmount',
        dataIndex: 'transactionAmount',
        title: 'Trxn Amount',
        dataType: 'money',
        numberFormat: '0.####',
      },
      {
        key: 'MOC',
        dataIndex: 'mocAmount',
        title: 'MOC',
        dataType: 'money',
        numberFormat: '0.####',
      },
      {
        key: 'IM',
        dataIndex: 'imAmount',
        title: 'IM',
        dataType: 'money',
        numberFormat: '0.####',
      },
      {
        key: 'MPU',
        dataIndex: 'mpuAmount',
        title: 'MPU',
        dataType: 'money',
        numberFormat: '0.####',
      },
      {
        key: 'VoucherNo',
        dataIndex: 'voucherNo',
        title: 'Voucher No',
      },
      {
        key: 'TotalAmount',
        dataIndex: 'totalAmount',
        title: 'Total Amount',
        dataType: 'money',
        numberFormat: '0.####',
      },
      {
        key: 'AmountDiff',
        dataIndex: 'amountDiff',
        title: 'Amount Diff',
        dataType: 'money',
        numberFormat: '0.####',
      },
    ],
  },
  OnlineFeesReport: {
    controllerName: 'OnlineFeesReport',
    title: 'Online Fees Report',
    apiRoute: 'OnlineFeesReport',
    excelRoute: 'OnlineFeesReport/Excel',
    excelFileName: 'OnlineFeesReport.xlsx',
    initialSortColumn: 'SakhanId',
    showRowNumber: true,
    reportSubtitle: reportDateRangeSubtitle('Online Fees Report'),
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        showTime: true,
        required: true,
      },
      {
        name: 'FormType',
        label: 'Certificate Type',
        type: 'select',
        defaultValue: '',
        options: certificateTypeOptions,
      },
      {
        name: 'SakhanId',
        label: 'Sakhan',
        type: 'number',
        defaultValue: 0,
        lookupName: 'sakhans',
      },
    ],
    columns: [
      {
        key: 'EntryDate',
        dataIndex: 'voucherDate',
        title: 'Entry Date',
        dataType: 'date',
        dateFormat: 'MM/DD/YYYY',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'TransactionTitle',
        dataIndex: 'formType',
        title: 'Transaction Title',
      },
      {
        key: 'DeductedFees',
        dataIndex: 'amount',
        title: 'Deducted Fees',
        dataType: 'number',
        numberFormat: '0.####',
      },
      {
        key: 'Remark',
        dataIndex: 'remark',
        title: 'Remark',
      },
    ],
  },
  PaThaKaRegisteredBusinessOrganizationReport: {
    controllerName: 'PaThaKaRegisteredBusinessOrganizationReport',
    title: 'PaThaKa Registered Business Organization Report',
    apiRoute: 'PaThaKaRegisteredBusinessOrganizationReport',
    excelRoute: 'PaThaKaRegisteredBusinessOrganizationReport/Excel',
    excelFileName: 'PaThaKaRegisteredBusinessOrganizationReport.xlsx',
    initialSortColumn: 'CompanyRegistrationNo',
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'BusinessTypeId',
        label: 'Business Type',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'LineofBusinessId',
        label: 'Line of Business',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'State',
        label: 'State',
        type: 'select',
        defaultValue: '',
        options: pathakaStateFilterOptions,
      },
      {
        name: 'Status',
        label: 'Status',
        type: 'select',
        defaultValue: '',
        options: pathakaStatusFilterOptions,
      },
    ],
    columns: [
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyRegistrationDate',
        dataIndex: 'companyRegistrationDate',
        title: 'Company Registration Date',
        dataType: 'date',
      },
      {
        key: 'ValidDate',
        dataIndex: 'endDate',
        title: 'Valid Date',
        dataType: 'date',
      },
      {
        key: 'BusinessType',
        dataIndex: 'businessType',
        title: 'Business Type',
      },
      {
        key: 'LineOfBusiness',
        dataIndex: 'lineofBusiness',
        title: 'Line of Business',
      },
      {
        key: 'MICPermitNo',
        dataIndex: 'micPermitNo',
        title: 'MICPermit No',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
    ],
  },
  RegistrationByBusinessType: {
    controllerName: 'RegistrationByBusinessType',
    title: 'Registration By Business Type',
    apiRoute: 'RegistrationByBusinessType',
    excelRoute: 'RegistrationByBusinessType/Excel',
    excelFileName: 'RegistrationByBusinessType.xlsx',
    initialSortColumn: 'BusinessType',
    showRowNumber: true,
    // Legacy RDLC report header (PaThaKaRegistrationByBusinessTypeReport): Ministry of
    // Commerce / Directorate of Trade / "Registration List ({FromDate}) To ({ToDate})".
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    reportSubtitle: (filters) => {
      const from = filters.FromDate
        ? dayjs(String(filters.FromDate)).format('DD/MM/YYYY')
        : '';
      const to = filters.ToDate
        ? dayjs(String(filters.ToDate)).format('DD/MM/YYYY')
        : '';
      return `Registration List (${from}) To (${to})`;
    },
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'BusinessTypeId',
        label: 'Business Type',
        type: 'number',
        defaultValue: 0,
      },
    ],
    columns: [
      {
        key: 'BusinessType',
        dataIndex: 'businessType',
        title: 'Business Type',
      },
      {
        key: 'Total',
        dataIndex: 'companyCount',
        title: 'Total',
        dataType: 'number',
      },
    ],
  },
  RegistrationByVoucher: {
    controllerName: 'RegistrationByVoucher',
    title: 'Registration By Voucher',
    apiRoute: 'RegistrationByVoucher',
    excelRoute: 'RegistrationByVoucher/Excel',
    excelFileName: 'RegistrationByVoucher.xlsx',
    initialSortColumn: 'Date',
    showRowNumber: true,
    // Legacy RDLC report header (PaThaKaRegistrationByVoucherReport): Ministry of
    // Commerce / Directorate of Trade /
    // "Pa Tha Ka {ApplyType} List ({FromDate}) To ({ToDate})".
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    reportSubtitle: (filters) => {
      const applyType = filters.ApplyType ? String(filters.ApplyType) : '';
      const from = filters.FromDate
        ? dayjs(String(filters.FromDate)).format('DD/MM/YYYY')
        : '';
      const to = filters.ToDate
        ? dayjs(String(filters.ToDate)).format('DD/MM/YYYY')
        : '';
      return `Pa Tha Ka ${applyType} List (${from}) To (${to})`;
    },
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
        displayFormat: 'DD/MM/YYYY',
      },
      {
        name: 'PaymentType',
        label: 'Payment Type',
        type: 'select',
        defaultValue: '',
        options: [
          { label: '--- All ---', value: '' },
          { label: 'Cash', value: 'Cash' },
          { label: 'MPU', value: 'MPU' },
          { label: 'Citizen Pay', value: 'Citizen Pay' },
        ],
      },
      {
        name: 'ApplyType',
        label: 'Apply Type',
        type: 'select',
        defaultValue: 'New',
        options: [
          { label: 'New', value: 'New' },
          { label: 'Amend', value: 'Amend' },
          { label: 'Extension', value: 'Extension' },
          { label: 'Cancel', value: 'Cancel' },
          { label: 'Actual Amend', value: 'Actual Amend' },
          { label: 'De-Cancel', value: 'De-Cancel' },
        ],
      },
    ],
    columns: [
      {
        key: 'Date',
        dataIndex: 'date',
        title: 'Date',
        dataType: 'date',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'CompanyName',
        dataIndex: 'companyName',
        title: 'Company Name',
      },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'TotalAmount',
        dataIndex: 'totalAmount',
        title: 'Total Amount',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'PaymentType',
        dataIndex: 'paymentType',
        title: 'Payment Type',
      },
      {
        key: 'VoucherNo',
        dataIndex: 'voucherNo',
        title: 'Voucher No',
      },
      {
        key: 'VoucherDate',
        dataIndex: 'voucherDate',
        title: 'Voucher Date',
        dataType: 'date',
        dateFormat: 'DD/MM/YYYY',
      },
    ],
  },
  WholeSaleSummaryReport: {
    controllerName: 'WholeSaleSummaryReport',
    title: 'Whole Sale Summary Report',
    apiRoute: 'WholeSaleSummaryReport',
    excelRoute: 'WholeSaleSummaryReport/Excel',
    excelFileName: 'WholeSaleSummaryReport.xlsx',
    reportHeading: ['Statement of Registered', 'Whole Sale at', 'Ministry of Commerce'],
    reportSubtitle: registrationDateRangeSubtitle,
    showRowNumber: false,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
    ],
    columns: [
      { key: 'NewCount', dataIndex: 'newCount', title: 'Number of Register', dataType: 'number' },
      { key: 'CancelCount', dataIndex: 'cancelCount', title: 'Number of De-Register', dataType: 'number' },
      { key: 'ExtensionCount', dataIndex: 'extensionCount', title: 'Number of Extension', dataType: 'number' },
      { key: 'ValidCount', dataIndex: 'validCount', title: 'Total Number Still Valid', dataType: 'number' },
      { key: 'InvalidCount', dataIndex: 'invalidCount', title: 'Total Number Invalid', dataType: 'number' },
      { key: 'TotalNumber', dataIndex: 'totalNumber', title: 'Total Number', dataType: 'number' },
    ],
  },
  WholeSaleDetailReport: {
    controllerName: 'WholeSaleDetailReport',
    title: 'Whole Sale Detail Report',
    apiRoute: 'WholeSaleDetailReport',
    excelRoute: 'WholeSaleDetailReport/Excel',
    excelFileName: 'WholeSaleDetailReport.xlsx',
    reportHeading: ['Statement of Registered', 'Whole Sale', 'Ministry of Commerce'],
    reportSubtitle: registrationDateRangeSubtitle,
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'ApplyType',
        label: 'Apply Type',
        type: 'select',
        defaultValue: 'New',
        options: detailApplyTypeOptions,
      },
    ],
    columns: [
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'WholeSaleRetailNo',
        dataIndex: 'wholeSaleRetailNo',
        title: 'Whole Sale No',
      },
      { key: 'CompanyName', dataIndex: 'companyName', title: 'Company Name' },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'WholeSaleRetailAddress',
        dataIndex: 'wholeSaleRetailAddress',
        title: 'Whole Sale Address',
        fallbackDataIndexes: [
          'wholeSaleRetailUnitLevel',
          'wholeSaleRetailStreetNumberStreetName',
          'wholeSaleRetailQuarterCityTownship',
          'wholeSaleRetailState',
          'wholeSaleRetailCountry',
          'wholeSaleRetailostalCode',
        ],
      },
      {
        key: 'IssuedDate',
        dataIndex: 'issuedDate',
        title: 'Issued Date',
        dataType: 'date',
      },
      {
        key: 'EndDate',
        dataIndex: 'endDate',
        title: 'Valid Date',
        dataType: 'date',
      },
    ],
  },
  WholeSaleRegistrationByVoucher: {
    controllerName: 'WholeSaleRegistrationByVoucher',
    title: 'WholeSale Registration By Voucher',
    apiRoute: 'WholeSaleRegistrationByVoucher',
    excelRoute: 'WholeSaleRegistrationByVoucher/Excel',
    excelFileName: 'WholeSaleRegistrationByVoucher.xlsx',
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    reportSubtitle: registrationVoucherSubtitle('Whole Sale'),
    initialSortColumn: 'Date',
    showRowNumber: true,
    rowNumberTitle: 'No.',
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
        displayFormat: 'DD/MM/YYYY',
      },
      {
        name: 'ApplyType',
        label: 'Apply Type',
        type: 'select',
        defaultValue: 'New',
        options: registrationApplyTypeOptions,
      },
      {
        name: 'PaymentType',
        label: 'Payment Type',
        type: 'select',
        defaultValue: '',
        options: voucherPaymentTypeOptions,
      },
    ],
    columns: [
      {
        key: 'Date',
        dataIndex: 'date',
        title: 'Date',
        dataType: 'date',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      { key: 'CompanyName', dataIndex: 'companyName', title: 'Company Name' },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'WholeSaleRetailNo',
        dataIndex: 'wholeSaleRetailNo',
        title: 'Whole Sale No',
      },
      {
        key: 'WholeSaleRetailAddress',
        dataIndex: 'wholeSaleRetailAddress',
        title: 'Whole Sale Address',
        fallbackDataIndexes: [
          'wholeSaleRetailUnitLevel',
          'wholeSaleRetailStreetNumberStreetName',
          'wholeSaleRetailQuarterCityTownship',
          'wholeSaleRetailState',
          'wholeSaleRetailCountry',
          'wholeSaleRetailPostalCode',
        ],
      },
      {
        key: 'TotalAmount',
        dataIndex: 'totalAmount',
        title: 'Total Amount',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'PaymentType',
        dataIndex: 'paymentType',
        title: 'Payment Type',
      },
      { key: 'VoucherNo', dataIndex: 'voucherNo', title: 'Voucher No' },
      {
        key: 'VoucherDate',
        dataIndex: 'voucherDate',
        title: 'Voucher Date',
        dataType: 'date',
        dateFormat: 'DD/MM/YYYY',
      },
    ],
  },
  RetailSummaryReport: {
    controllerName: 'RetailSummaryReport',
    title: 'Retail Summary Report',
    apiRoute: 'RetailSummaryReport',
    excelRoute: 'RetailSummaryReport/Excel',
    excelFileName: 'RetailSummaryReport.xlsx',
    reportHeading: ['Statement of Registered', 'Retail at', 'Ministry of Commerce'],
    reportSubtitle: registrationDateRangeSubtitle,
    showRowNumber: false,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
    ],
    columns: [
      { key: 'NewCount', dataIndex: 'newCount', title: 'Number of Register', dataType: 'number' },
      { key: 'CancelCount', dataIndex: 'cancelCount', title: 'Number of De-Register', dataType: 'number' },
      { key: 'ExtensionCount', dataIndex: 'extensionCount', title: 'Number of Extension', dataType: 'number' },
      { key: 'ValidCount', dataIndex: 'validCount', title: 'Total Number Still Valid', dataType: 'number' },
      { key: 'InvalidCount', dataIndex: 'invalidCount', title: 'Total Number Invalid', dataType: 'number' },
      { key: 'TotalNumber', dataIndex: 'totalNumber', title: 'Total Number', dataType: 'number' },
    ],
  },
  RetailDetailReport: {
    controllerName: 'RetailDetailReport',
    title: 'Retail Detail Report',
    apiRoute: 'RetailDetailReport',
    excelRoute: 'RetailDetailReport/Excel',
    excelFileName: 'RetailDetailReport.xlsx',
    reportHeading: ['Statement of Registered', 'Retail', 'Ministry of Commerce'],
    reportSubtitle: registrationDateRangeSubtitle,
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'ApplyType',
        label: 'Apply Type',
        type: 'select',
        defaultValue: 'New',
        options: detailApplyTypeOptions,
      },
    ],
    columns: [
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'WholeSaleRetailNo',
        dataIndex: 'wholeSaleRetailNo',
        title: 'Retail No',
      },
      { key: 'CompanyName', dataIndex: 'companyName', title: 'Company Name' },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'WholeSaleRetailAddress',
        dataIndex: 'wholeSaleRetailAddress',
        title: 'Retail Address',
        fallbackDataIndexes: [
          'wholeSaleRetailUnitLevel',
          'wholeSaleRetailStreetNumberStreetName',
          'wholeSaleRetailQuarterCityTownship',
          'wholeSaleRetailState',
          'wholeSaleRetailCountry',
          'wholeSaleRetailostalCode',
        ],
      },
      {
        key: 'IssuedDate',
        dataIndex: 'issuedDate',
        title: 'Issued Date',
        dataType: 'date',
      },
      {
        key: 'EndDate',
        dataIndex: 'endDate',
        title: 'Valid Date',
        dataType: 'date',
      },
    ],
  },
  RetailRegistrationByVoucher: {
    controllerName: 'RetailRegistrationByVoucher',
    title: 'Retail Registration By Voucher',
    apiRoute: 'RetailRegistrationByVoucher',
    excelRoute: 'RetailRegistrationByVoucher/Excel',
    excelFileName: 'RetailRegistrationByVoucher.xlsx',
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    reportSubtitle: registrationVoucherSubtitle('Retail'),
    initialSortColumn: 'Date',
    showRowNumber: true,
    rowNumberTitle: 'No.',
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
        displayFormat: 'DD/MM/YYYY',
      },
      {
        name: 'ApplyType',
        label: 'Apply Type',
        type: 'select',
        defaultValue: 'New',
        options: registrationApplyTypeOptions,
      },
      {
        name: 'PaymentType',
        label: 'Payment Type',
        type: 'select',
        defaultValue: '',
        options: voucherPaymentTypeOptions,
      },
    ],
    columns: [
      {
        key: 'Date',
        dataIndex: 'date',
        title: 'Date',
        dataType: 'date',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      { key: 'CompanyName', dataIndex: 'companyName', title: 'Company Name' },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'WholeSaleRetailNo',
        dataIndex: 'wholeSaleRetailNo',
        title: 'Retail No',
      },
      {
        key: 'WholeSaleRetailAddress',
        dataIndex: 'wholeSaleRetailAddress',
        title: 'Retail Address',
        fallbackDataIndexes: [
          'wholeSaleRetailUnitLevel',
          'wholeSaleRetailStreetNumberStreetName',
          'wholeSaleRetailQuarterCityTownship',
          'wholeSaleRetailState',
          'wholeSaleRetailCountry',
          'wholeSaleRetailPostalCode',
        ],
      },
      {
        key: 'TotalAmount',
        dataIndex: 'totalAmount',
        title: 'Total Amount',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'PaymentType',
        dataIndex: 'paymentType',
        title: 'Payment Type',
      },
      { key: 'VoucherNo', dataIndex: 'voucherNo', title: 'Voucher No' },
      {
        key: 'VoucherDate',
        dataIndex: 'voucherDate',
        title: 'Voucher Date',
        dataType: 'date',
        dateFormat: 'DD/MM/YYYY',
      },
    ],
  },
  WholeSaleAndRetailSummaryReport: {
    controllerName: 'WholeSaleAndRetailSummaryReport',
    title: 'Whole Sale and Retail Summary Report',
    apiRoute: 'WholeSaleAndRetailSummaryReport',
    excelRoute: 'WholeSaleAndRetailSummaryReport/Excel',
    excelFileName: 'WholeSaleAndRetailSummaryReport.xlsx',
    reportHeading: ['Statement of Registered', 'Whole Sale & Retail at', 'Ministry of Commerce'],
    reportSubtitle: registrationDateRangeSubtitle,
    showRowNumber: false,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
    ],
    columns: [
      { key: 'NewCount', dataIndex: 'newCount', title: 'Number of Register', dataType: 'number' },
      { key: 'CancelCount', dataIndex: 'cancelCount', title: 'Number of De-Register', dataType: 'number' },
      { key: 'ExtensionCount', dataIndex: 'extensionCount', title: 'Number of Extension', dataType: 'number' },
      { key: 'ValidCount', dataIndex: 'validCount', title: 'Total Number Still Valid', dataType: 'number' },
      { key: 'InvalidCount', dataIndex: 'invalidCount', title: 'Total Number Invalid', dataType: 'number' },
      { key: 'TotalNumber', dataIndex: 'totalNumber', title: 'Total Number', dataType: 'number' },
    ],
  },
  WholeSaleAndRetailDetailReport: {
    controllerName: 'WholeSaleAndRetailDetailReport',
    title: 'Whole Sale and Retail Detail Report',
    apiRoute: 'WholeSaleAndRetailDetailReport',
    excelRoute: 'WholeSaleAndRetailDetailReport/Excel',
    excelFileName: 'WholeSaleAndRetailDetailReport.xlsx',
    reportHeading: ['Statement of Registered', 'Whole Sale & Retail', 'Ministry of Commerce'],
    reportSubtitle: registrationDateRangeSubtitle,
    showRowNumber: true,
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
      },
      {
        name: 'ApplyType',
        label: 'Apply Type',
        type: 'select',
        defaultValue: 'New',
        options: detailApplyTypeOptions,
      },
    ],
    columns: [
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      {
        key: 'WholeSaleRetailNo',
        dataIndex: 'wholeSaleRetailNo',
        title: 'Whole Sale & Retail No',
      },
      { key: 'CompanyName', dataIndex: 'companyName', title: 'Company Name' },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'WholeSaleRetailAddress',
        dataIndex: 'wholeSaleRetailAddress',
        title: 'Whole Sale & Retail Address',
        fallbackDataIndexes: [
          'wholeSaleRetailUnitLevel',
          'wholeSaleRetailStreetNumberStreetName',
          'wholeSaleRetailQuarterCityTownship',
          'wholeSaleRetailState',
          'wholeSaleRetailCountry',
          'wholeSaleRetailostalCode',
        ],
      },
      {
        key: 'IssuedDate',
        dataIndex: 'issuedDate',
        title: 'Issued Date',
        dataType: 'date',
      },
      {
        key: 'EndDate',
        dataIndex: 'endDate',
        title: 'Valid Date',
        dataType: 'date',
      },
    ],
  },
  WholeSaleAndRetailRegistrationByVoucher: {
    controllerName: 'WholeSaleAndRetailRegistrationByVoucher',
    title: 'WS and R Registration By Voucher',
    apiRoute: 'WholeSaleAndRetailRegistrationByVoucher',
    excelRoute: 'WholeSaleAndRetailRegistrationByVoucher/Excel',
    excelFileName: 'WholeSaleAndRetailRegistrationByVoucher.xlsx',
    reportHeading: ['Ministry of Commerce', 'Directorate of Trade'],
    reportSubtitle: registrationVoucherSubtitle('Whole Sale & Retail'),
    initialSortColumn: 'Date',
    showRowNumber: true,
    rowNumberTitle: 'No.',
    filters: [
      {
        name: 'dateRange',
        label: 'From Date / To Date',
        type: 'dateRange',
        fromName: 'FromDate',
        toName: 'ToDate',
        fromLabel: 'From Date',
        toLabel: 'To Date',
        required: true,
        displayFormat: 'DD/MM/YYYY',
      },
      {
        name: 'ApplyType',
        label: 'Apply Type',
        type: 'select',
        defaultValue: 'New',
        options: registrationApplyTypeOptions,
      },
      {
        name: 'PaymentType',
        label: 'Payment Type',
        type: 'select',
        defaultValue: '',
        options: voucherPaymentTypeOptions,
      },
    ],
    columns: [
      {
        key: 'Date',
        dataIndex: 'date',
        title: 'Date',
        dataType: 'date',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        key: 'CompanyRegistrationNo',
        dataIndex: 'companyRegistrationNo',
        title: 'Company Registration No',
      },
      { key: 'CompanyName', dataIndex: 'companyName', title: 'Company Name' },
      {
        key: 'CompanyAddress',
        dataIndex: 'companyAddress',
        title: 'Company Address',
        fallbackDataIndexes: [
          'unitLevel',
          'streetNumberStreetName',
          'quarterCityTownship',
          'state',
          'country',
          'postalCode',
        ],
      },
      {
        key: 'WholeSaleRetailNo',
        dataIndex: 'wholeSaleRetailNo',
        title: 'Whole Sale & Retail No',
      },
      {
        key: 'WholeSaleRetailAddress',
        dataIndex: 'wholeSaleRetailAddress',
        title: 'Whole Sale & Retail Address',
        fallbackDataIndexes: [
          'wholeSaleRetailUnitLevel',
          'wholeSaleRetailStreetNumberStreetName',
          'wholeSaleRetailQuarterCityTownship',
          'wholeSaleRetailState',
          'wholeSaleRetailCountry',
          'wholeSaleRetailPostalCode',
        ],
      },
      {
        key: 'TotalAmount',
        dataIndex: 'totalAmount',
        title: 'Total Amount',
        dataType: 'number',
        numberFormat: '#,##0.0000',
      },
      {
        key: 'PaymentType',
        dataIndex: 'paymentType',
        title: 'Payment Type',
      },
      { key: 'VoucherNo', dataIndex: 'voucherNo', title: 'Voucher No' },
      {
        key: 'VoucherDate',
        dataIndex: 'voucherDate',
        title: 'Voucher Date',
        dataType: 'date',
        dateFormat: 'DD/MM/YYYY',
      },
    ],
  },
  ...newReportConfigs,
  ...eiccReportConfigs,
  ...advanceSearchConfigs,
  ...turndownReportConfigs,
};

export const reportConfigList = Object.values(reportConfigs);
