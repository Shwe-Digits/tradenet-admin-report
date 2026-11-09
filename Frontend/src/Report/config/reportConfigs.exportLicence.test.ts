import { describe, expect, it } from 'vitest';
import { reportConfigs } from './reportConfigs';

describe('Export Licence report configs', () => {
  it('summary reports match old admin filter boxes and legacy titles', () => {
    const expected = {
      ExportLicenceByMethodReport: {
        filters: [
          'dateRange',
          'PaThaKaTypeId',
          'ExportImportSectionId',
          'ExportImportMethodId',
          'Auto',
        ],
        subtitle: 'List of Export Licences By Method From (01/02/2026) To (03/02/2026)',
      },
      ExportLicenceBySectionReport: {
        filters: [
          'dateRange',
          'PaThaKaTypeId',
          'ExportImportSectionId',
          'ExportImportMethodId',
          'Auto',
        ],
        subtitle: 'List of Export Licences By Section From (01/02/2026) To (03/02/2026)',
      },
      ExportLicenceBySellerCountryReport: {
        filters: [
          'dateRange',
          'PaThaKaTypeId',
          'ExportImportSectionId',
          'ExportImportMethodId',
          'BuyerCountryId',
          'Auto',
        ],
        subtitle: 'List of Export Licences By Buyer Country From (01/02/2026) To (03/02/2026)',
      },
      ExportLicenceCompanyListReport: {
        filters: [
          'dateRange',
          'PaThaKaTypeId',
          'ExportImportSectionId',
          'ExportImportMethodId',
          'CompanyRegistrationNo',
          'Auto',
          'CompanyName',
        ],
        subtitle: 'List of Export Licences By Company From (01/02/2026) To (03/02/2026)',
      },
      ExportLicenceDailyReportNewLicenceReport: {
        filters: [
          'dateRange',
          'ExportImportSectionId',
          'ExportImportMethodId',
          'PaThaKaTypeId',
          'CompanyRegistrationNo',
          'Auto',
          'CompanyName',
        ],
        subtitle: 'List of Export Licences By Daily From (01/02/2026) To (03/02/2026)',
      },
    } as const;

    for (const [key, { filters, subtitle }] of Object.entries(expected)) {
      const cfg = reportConfigs[key];

      expect(
        cfg.filters.map((filter) => filter.name),
        key
      ).toEqual(filters);
      expect(
        cfg.reportSubtitle?.({ FromDate: '2026-02-01', ToDate: '2026-02-03' }),
        key
      ).toBe(subtitle);
    }
  });

  it('Seller Country route displays Buyer Country report title for export licence', () => {
    expect(reportConfigs.ExportLicenceBySellerCountryReport.title).toBe(
      'Export Licence By Buyer Country Report'
    );
  });

  it('Total Value & Licences report keeps the old three-filter box', () => {
    const cfg = reportConfigs.ExportLicenceTotalValueLicencesReport;

    expect(cfg.filters.map((filter) => filter.name)).toEqual([
      'dateRange',
      'PaThaKaTypeId',
      'ExportImportSectionId',
    ]);
    expect(cfg.filters.find((filter) => filter.name === 'PaThaKaTypeId')?.lookupName).toBe(
      'paThaKaTypes'
    );
    expect(
      cfg.filters.find((filter) => filter.name === 'ExportImportSectionId')?.lookupName
    ).toBe('exportLicenceSections');
  });

  it('summary links drill into Export Licence Detail with clicked values applied', () => {
    const expected = {
      ExportLicenceByMethodReport: {
        columnKey: 'Method',
        drilldown: {
          targetReportKey: 'ExportLicenceDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId', 'Auto'],
          rowParams: { ExportImportMethodId: 'methodId' },
        },
      },
      ExportLicenceBySectionReport: {
        columnKey: 'Section',
        drilldown: {
          targetReportKey: 'ExportLicenceDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportMethodId', 'Auto'],
          rowParams: { ExportImportSectionId: 'sectionId' },
        },
      },
      ExportLicenceBySellerCountryReport: {
        columnKey: 'Country',
        drilldown: {
          targetReportKey: 'ExportLicenceDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId', 'ExportImportMethodId', 'Auto'],
          rowParams: { BuyerCountryId: 'countryId' },
        },
      },
      ExportLicenceCompanyListReport: {
        columnKey: 'CompanyName',
        drilldown: {
          targetReportKey: 'ExportLicenceDetailReport',
          carryFilters: ['FromDate', 'ToDate', 'PaThaKaTypeId', 'ExportImportSectionId', 'ExportImportMethodId', 'Auto'],
          rowParams: { CompanyRegistrationNo: 'companyRegistrationNo' },
        },
      },
    };

    for (const [reportKey, { columnKey, drilldown }] of Object.entries(expected)) {
      const column = reportConfigs[reportKey].columns.find((item) => item.key === columnKey);

      expect(column?.drilldown, reportKey).toEqual(drilldown);
    }
  });

  it('list and detail reports open with a data-bearing three-month date range by default', () => {
    for (const key of [
      'ExportLicenceByHSCodeReport',
      'ExportLicenceByMethodReport',
      'ExportLicenceBySectionReport',
      'ExportLicenceBySellerCountryReport',
      'ExportLicenceCompanyListReport',
      'ExportLicenceDailyReportNewLicenceReport',
      'ExportLicenceDetailReport',
      'ExportLicenceTotalValueLicencesReport',
    ]) {
      const cfg = reportConfigs[key];
      const dateRange = cfg.filters.find((filter) => filter.name === 'dateRange');

      expect(dateRange?.type, key).toBe('dateRange');
      expect(dateRange?.fromName, key).toBe('FromDate');
      expect(dateRange?.toName, key).toBe('ToDate');
      expect(dateRange?.defaultDateRangeMonths, key).toBe(3);
    }
  });

  it('Detail columns are bound to backend result fields used by the UI table', () => {
    const indexes = new Set(
      reportConfigs.ExportLicenceDetailReport.columns.map((column) => column.dataIndex)
    );

    for (const field of [
      'sectionName',
      'applicationDate',
      'applicationNo',
      'licenceNo',
      'licenceDate',
      'companyRegistrationNo',
      'buyerName',
      'portofExport',
      'destinationCountry',
      'hsCode',
      'amount',
      'commodityType',
    ]) {
      expect(indexes.has(field), field).toBe(true);
    }
  });

  it('Detail report keeps lazy exact row counts enabled for paged UI totals', () => {
    expect(reportConfigs.ExportLicenceDetailReport.disableLazyTotalCount).not.toBe(true);
  });

  it('Detail report shows the legacy date-range report title', () => {
    expect(
      reportConfigs.ExportLicenceDetailReport.reportSubtitle?.({
        FromDate: '2026-02-01',
        ToDate: '2026-02-03',
      })
    ).toBe('List of Export Licences By Detail From (01/02/2026) To (03/02/2026)');
  });

  it('Detail report keeps the old filter box: no Buyer Country, no Auto / None Auto', () => {
    // ExportLicenceDetailReport.cshtml never offered either box. The BuyerCountryId / Auto
    // request fields stay on the DTO for drill-downs; only the visible controls are gone.
    expect(reportConfigs.ExportLicenceDetailReport.filters.map((filter) => filter.name)).toEqual([
      'dateRange',
      'PaThaKaTypeId',
      'ExportImportSectionId',
      'ExportImportMethodId',
      'ExportImportIncotermId',
      'CompanyRegistrationNo',
    ]);
  });

  it('Detail report has no footer (ExportLicenceDetailReport.rdlc has no total row)', () => {
    expect(reportConfigs.ExportLicenceDetailReport.currencyTotalsColumns).toBeUndefined();
  });

  it('Detail report asks for the exact item count with the page', () => {
    // The legacy-shaped procedure counts its materialised key table, so the count is cheap
    // and the pager is right on first paint (no lower-bound estimate, no stranded last page).
    expect(reportConfigs.ExportLicenceDetailReport.eagerTotalCount).toBe(true);
  });

  it('action reports keep the old oversea filter shape and do not expose Sakhan', () => {
    const expected = {
      ExportLicenceActualAmendmentReport: [
        'dateRange',
        'FormType',
        'ExportImportSectionId',
        'AmendRemarkId',
        'CompanyRegistrationNo',
        'CompanyName',
      ],
      ExportLicenceAmendmentReport: [
        'dateRange',
        'FormType',
        'ExportImportSectionId',
        'AmendRemarkId',
        'CompanyRegistrationNo',
        'CompanyName',
      ],
      // No FormType, same as the New report: ExportLicenceCancelReport.cshtml keeps it
      // hidden and the controller hardcodes "Export Licence".
      ExportLicenceCancellationReport: [
        'dateRange',
        'ExportImportSectionId',
        'CompanyRegistrationNo',
        'CompanyName',
      ],
      ExportLicenceExtensionReport: [
        'dateRange',
        'FormType',
        'ExportImportSectionId',
        'CompanyRegistrationNo',
        'CompanyName',
      ],
      // No FormType: the old view kept it hidden and the controller hardcodes
      // "Export Licence", so the box filtered nothing.
      ExportLicenceNewReportNewReport: [
        'dateRange',
        'ExportImportSectionId',
        'CompanyRegistrationNo',
        'CompanyName',
        'Auto',
      ],
      ExportLicenceVoucherReport: [
        'dateRange',
        'FormType',
        'ExportImportSectionId',
        'ApplyType',
        'PaymentType',
        'CompanyRegistrationNo',
        'CompanyName',
      ],
    } as const;

    for (const [key, filters] of Object.entries(expected)) {
      const cfg = reportConfigs[key];
      expect(cfg.filters.map((filter) => filter.name), key).toEqual(filters);
      expect(cfg.filters.some((filter) => filter.name === 'SakhanId'), `${key} should not expose Sakhan`).toBe(false);
      expect(
        cfg.filters.find((filter) => filter.name === 'ExportImportSectionId')?.lookupName,
        `${key} should use Export Licence sections`
      ).toBe('exportLicenceSections');
      expect(
        cfg.filters.find((filter) => filter.name === 'CompanyName')?.type,
        `${key} should keep readonly company name lookup`
      ).toBe('readonlyText');
    }
  });

  it('action report subtitles keep the legacy Export Licence wording', () => {
    const sample = { FromDate: '2026-02-01', ToDate: '2026-02-03' };

    expect(
      reportConfigs.ExportLicenceActualAmendmentReport.reportSubtitle?.(sample)
    ).toBe('List of Export Licence Report From (01/02/2026) To (03/02/2026)');
    expect(
      reportConfigs.ExportLicenceAmendmentReport.reportSubtitle?.(sample)
    ).toBe('List of Export Licence Report From (01/02/2026) To (03/02/2026)');
    expect(
      reportConfigs.ExportLicenceCancellationReport.reportSubtitle?.(sample)
    ).toBe('List of Export Licence Report From (01/02/2026) To (03/02/2026)');
    expect(
      reportConfigs.ExportLicenceExtensionReport.reportSubtitle?.(sample)
    ).toBe('List of Export Licence Report From (01/02/2026) To (03/02/2026)');
    expect(
      reportConfigs.ExportLicenceNewReportNewReport.reportSubtitle?.(sample)
    ).toBe('List of Export Licence Report From (01/02/2026) To (03/02/2026)');
    expect(
      reportConfigs.ExportLicenceVoucherReport.reportSubtitle?.(sample)
    ).toBe('Export Licence Voucher List (01/02/2026) To (03/02/2026)');
  });

  it('Amendment includes the HS Code requested in the November export-report sample', () => {
    // The new request intentionally extends the old layout with item fields.
    expect(
      reportConfigs.ExportLicenceAmendmentReport.columns.some(
        (column) => column.dataIndex === 'hsCode'
      )
    ).toBe(true);
  });

  it('Actual Amendment shows HSCode and the parent licence number', () => {
    const cfg = reportConfigs.ExportLicenceActualAmendmentReport;
    const column = (key: string) => cfg.columns.find((c) => c.key === key);

    // Customer-requested extra column; sp_ActualAmendReport_pagination already selects it as a
    // TOP 1 scalar subquery, so it adds no rows.
    expect(column('HSCode')?.dataIndex).toBe('hsCode');
    expect(column('LicenceNo')?.dataIndex).toBe('oldLicenceNo');
    expect(column('LicenceAmendmentNo')?.dataIndex).toBe('licenceNo');
  });

  it('Amendment Licence No is the parent licence, not the amendment number', () => {
    const cfg = reportConfigs.ExportLicenceAmendmentReport;
    const column = (key: string) => cfg.columns.find((c) => c.key === key);

    expect(column('LicenceNo')?.dataIndex).toBe('oldLicenceNo');
    expect(column('LicenceNo')?.fallbackDataIndexes).toEqual(['licenceNo']);
    expect(column('LicenceAmendmentNo')?.dataIndex).toBe('licenceNo');
  });

  it('cancellation preserves the old columns alongside the requested item columns', () => {
    const cfg = reportConfigs.ExportLicenceCancellationReport;
    const column = (key: string) => cfg.columns.find((c) => c.key === key);

    // rdlc:1229 "Licence No" = OldLicenceNo, rdlc:1282 "Cancellation No" = LicenceNo.
    expect(column('LicenceNo')?.dataIndex).toBe('oldLicenceNo');
    expect(column('CancellationNo')?.dataIndex).toBe('licenceNo');

    // The November sample adds HS before Currency and retains the original HS Code on the right.
    expect(cfg.columns.filter((c) => c.dataIndex === 'hsCode')).toHaveLength(2);
    expect(column('ItemHSCode')?.dataIndex).toBe('hsCode');
    expect(cfg.columns.slice(-4).map((c) => c.key)).toEqual([
      'Currency',
      'TotalValue',
      'HSCode',
      'Remark',
    ]);

    // rdlc:1600 is =Fields!Amount.Value with no <Format>, so decimal(18,4) prints 4 dp.
    expect(column('TotalValue')?.numberFormat).toBe('#,##0.0000');

    // The per-currency footer (rdlc Tablix2) must land on real columns.
    expect(column(cfg.currencyTotalsColumns!.labelColumnKey)).toBeDefined();
    expect(column(cfg.currencyTotalsColumns!.valueColumnKey)).toBeDefined();

    // The pager needs a real total, or there is no last page to jump to.
    expect(cfg.eagerTotalCount).toBe(true);
  });

  it('voucher keeps dynamic licence headers and no Sakhan filter', () => {
    const cfg = reportConfigs.ExportLicenceVoucherReport;
    const resolvedForAmend = cfg.resolveColumns?.(
      { ApplyType: 'Amend' },
      cfg.columns
    ) ?? cfg.columns;
    const resolvedForCancel = cfg.resolveColumns?.(
      { ApplyType: 'Cancel' },
      cfg.columns
    ) ?? cfg.columns;

    expect(cfg.filters.some((filter) => filter.name === 'SakhanId')).toBe(false);
    expect(
      cfg.filters.find((filter) => filter.name === 'PaymentType')?.lookupName
    ).toBe('paymentTypes');
    expect(
      resolvedForAmend.find((column) => column.key === 'LicenceNo')?.title
    ).toBe('Amendment No');
    expect(
      resolvedForAmend.find((column) => column.key === 'LicenceDate')?.title
    ).toBe('Amendment Date');
    expect(
      resolvedForCancel.find((column) => column.key === 'LicenceNo')?.title
    ).toBe('Cancellation No');
    expect(
      resolvedForCancel.find((column) => column.key === 'LicenceDate')?.title
    ).toBe('Cancellation Date');
    expect(
      cfg.columns.some((column) => column.key === 'CommodityType'),
      'voucher should keep Commodity Type per PM feedback'
    ).toBe(true);
    // Dead config removed: this controller populates no footer at all (no CurrencyTotals /
    // ColumnTotals call), so a currencyTotalsColumns placement pointed at nothing. The old
    // VoucherReport.rdlc's only aggregate is its single TOTAL row (:1709 + :1828
    // =FORMAT(SUM(Fields!Amount.Value),"N0")), which this report still owes.
    expect(cfg.currencyTotalsColumns).toBeUndefined();
  });

  // Extension report Licence No / Extension No bindings live in
  // reportConfigs.extension.test.ts, which covers the whole Extension family at once.

  it('new report keeps PM-requested auto filter and visible business columns', () => {
    const cfg = reportConfigs.ExportLicenceNewReportNewReport;

    // FormType is absent by design: the old ExportLicenceNewReport.cshtml kept it hidden and
    // the controller hardcodes "Export Licence", so a visible box filtered nothing.
    expect(cfg.filters.map((filter) => filter.name)).toEqual([
      'dateRange',
      'ExportImportSectionId',
      'CompanyRegistrationNo',
      'CompanyName',
      'Auto',
    ]);

    expect(cfg.filters.some((filter) => filter.name === 'SakhanId')).toBe(false);

    // NewLicenceReport.rdlc's Currency row-group footer: the controller populates
    // CurrencyTotals, so this placement must stay wired.
    expect(cfg.currencyTotalsColumns).toEqual({
      labelColumnKey: 'LicenceNo',
      valueColumnKey: 'TotalValue',
    });
    expect(
      cfg.columns.map((column) => column.key)
    ).toEqual([
      'Section',
      'LicenceNo',
      'CompanyRegistrationNo',
      'CompanyName',
      'CompanyAddress',
      'Currency',
      'TotalValue',
      'CommodityType',
      'hsCode',
      'Quota',
      'Auto',
    ]);
  });

  it('By HS Code prints the old rdlc shape, one row per (HS code, currency)', () => {
    // Complaint 2026-09-08: 31/08-01/09/2026 gave 1058 rows against the old report's 304 because
    // the backend also grouped on the buyer company -- invisibly, since HSCodeReport.rdlc has no
    // company column (rdlc:169-444) and groups on HSCodeId + Currency only (rdlc:1150-1160).
    // Company Name belongs to the HS Code DETAIL drill, which asks for that grain explicitly.
    const cfg = reportConfigs.ExportLicenceByHSCodeReport;

    expect(cfg.columns.map((column) => column.title)).toEqual([
      'HS Code',
      'Description',
      'No of Licences',
      'Total Value',
      'Currency',
    ]);
    // HSCodeReport.rdlc:169 prints "Sr.No.", :705 prints Total Value as FORMAT(...,"N4").
    expect(cfg.rowNumberTitle).toBe('Sr.No.');
    expect(cfg.columns.find((column) => column.key === 'TotalValue')?.numberFormat).toBe(
      '#,##0.0000'
    );
    // The legacy header1 is plural ("Export Licences"), old ReportsController.cs:4289.
    expect(
      cfg.reportSubtitle?.({ FromDate: '2026-02-01', ToDate: '2026-02-03' })
    ).toBe('List of Export Licences By HS Code From (01/02/2026) To (03/02/2026)');
    // The RDLC scrolled every row on one page; 304 rows over 10-row pages is what made the
    // customer report "pagination goes to 106 but data stops at 97".
    expect(cfg.defaultPageSize).toBe(1000);
    // rdlc:570-576 opens the drill with window.open(..., '_blank').
    expect(cfg.columns.find((column) => column.key === 'hsCode')?.drilldown).toEqual({
      targetReportKey: 'ExportLicenceHSCodeDetailReport',
      carryFilters: ['FromDate', 'ToDate', 'ExportImportSectionId', 'FilterType'],
      rowParams: { hsCode: 'hsCode' },
      openInNewTab: true,
    });
  });

  it('HS Code detail drill pins the company grouping its controller cannot infer', () => {
    // The drill shares ExportLicenceByHSCodeReport's controller and arrives with the same
    // parameters as a summary that has an HS code typed, so the shape has to be posted.
    const detail = reportConfigs.ExportLicenceHSCodeDetailReport;

    expect(detail.controllerName).toBe('ExportLicenceByHSCodeReport');
    expect(detail.filters.find((filter) => filter.name === 'GroupBy')?.constantValue).toBe(
      'Company'
    );
    expect(
      reportConfigs.ExportLicenceByHSCodeReport.filters.some(
        (filter) => filter.name === 'GroupBy'
      )
    ).toBe(false);
    // HSCodeDetailReport.rdlc:445-665 -- Company Name, and no Currency / Total Value.
    expect(detail.columns.map((column) => column.title)).toEqual([
      'HS Code',
      'Description',
      'Company Name',
      'No of Licences',
    ]);
    expect(detail.rowNumberTitle).toBe('Sr.No.');
    expect(detail.defaultPageSize).toBe(1000);
  });
});
