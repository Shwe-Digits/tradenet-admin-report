import { describe, expect, it } from 'vitest';
import { reportConfigs } from './reportConfigs';
import { getReportCategoryKey } from '../reportNavItems';

describe('Import Licence Voucher Detail Report', () => {
  it('keeps the original filters and columns, adds account description, and shows detail amounts', () => {
    const original = reportConfigs.ImportLicenceVoucherReport;
    const detail = reportConfigs.ImportLicenceVoucherDetailReport;
    expect(detail).toBeDefined();
    expect(detail.filters).toEqual(original.filters);
    expect(detail.columns.filter(column => column.key !== 'Description'))
      .toEqual(original.columns.map(column => column.key === 'Amount' ? { ...column, title: 'Amount' } : column));
    expect(detail.reportHeading).toEqual(original.reportHeading);
    expect(detail.currencyTotalsColumns).toEqual(original.currencyTotalsColumns);
    expect(detail.initialSortColumn).toBe(original.initialSortColumn);
    expect(detail.showRowNumber).toBe(original.showRowNumber);
    expect(detail.columns.find(column => column.key === 'Description'))
      .toMatchObject({ dataIndex: 'description', title: 'Account Title Description' });
    expect(detail.columns.find(column => column.key === 'Amount'))
      .toMatchObject({ dataIndex: 'amount', title: 'Amount' });
    expect(detail.resolveColumns).toBe(original.resolveColumns);
    expect(getReportCategoryKey(detail.controllerName)).toBe('report-import-licence');
    expect(original.columns.find(column => column.key === 'Amount')?.title).toBe('Total Amount');
  });
});
