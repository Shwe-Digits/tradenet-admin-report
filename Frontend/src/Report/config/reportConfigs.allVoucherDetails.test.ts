import { describe, expect, it } from 'vitest';
import { reportConfigs } from './reportConfigs';
import { getReportCategoryKey } from '../reportNavItems';

const families = [
  'ImportPermit', 'ExportLicence', 'ExportPermit', 'BorderImportLicence',
  'BorderImportPermit', 'BorderExportLicence', 'BorderExportPermit',
];

describe.each(families)('%s Voucher Detail Report', family => {
  it('copies every original filter, column, header and footer setting', () => {
    const original = reportConfigs[`${family}VoucherReport`];
    const detail = reportConfigs[`${family}VoucherDetailReport`];
    expect(detail).toBeDefined();
    expect(detail.filters).toEqual(original.filters);
    expect(detail.columns.filter(column => column.key !== 'Description')).toEqual(
      original.columns.map(column => column.dataIndex === 'amount' ? { ...column, title: 'Amount' } : column)
    );
    expect(detail.columns.find(column => column.key === 'Description')).toMatchObject({
      title: 'Account Title Description', dataIndex: 'description',
    });
    for (const key of ['reportHeading', 'currencyTotalsColumns', 'initialSortColumn', 'showRowNumber', 'rowNumberTitle', 'resolveColumns'] as const) {
      expect(detail[key]).toEqual(original[key]);
    }
    expect(detail.controllerName).toBe(`${family}VoucherDetailReport`);
    expect(detail.apiRoute).toBe(detail.controllerName);
    expect(detail.excelRoute).toBe(`${detail.controllerName}/Excel`);
    expect(getReportCategoryKey(detail.controllerName)).toBe(getReportCategoryKey(original.controllerName));
    expect(detail.title).toBe(original.title.replace('Voucher', 'Voucher Detail'));
  });
});
