import { describe, expect, it } from 'vitest';
import { reportConfigs } from './reportConfigs';

describe('Export Licence requested item columns', () => {
  it.each([
    'ExportLicenceCancellationReport',
    'ExportLicenceAmendmentReport',
    'ExportLicenceActualAmendmentReport',
  ])('%s includes the new item fields after Company Address in table/Excel order', (key) => {
    const config = reportConfigs[key];
    const address = config.columns.findIndex(column => column.key === 'CompanyAddress');
    expect(config.columns.slice(address + 1, address + 5).map(column => [column.title, column.dataIndex])).toEqual([
      ['HS Code', 'hsCode'], ['Description', 'description'], ['QTY', 'quantity'], ['Currency', 'currency'],
    ]);
    expect(config.columns.find(column => column.key === 'Quantity')?.dataType).toBe('number');
    expect(new Set(config.columns.map(column => column.key)).size).toBe(config.columns.length);
    expect(config.currencyTotalsColumns).toEqual({ labelColumnKey: 'LicenceNo', valueColumnKey: 'TotalValue' });
  });
});
