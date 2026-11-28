import { describe, expect, it } from 'vitest';

import { reportConfigs } from './reportConfigs';

const titles: Record<string, string> = {
  ImportLicenceNewReportNewReport: 'Method of Import',
  ImportLicencePendingReport: 'Method of Import',
  ImportLicenceVoucherReport: 'Method of Import',
  BorderImportLicenceNewReportNewReport: 'Method of Import',
  BorderImportLicencePendingReport: 'Method of Import',
  BorderImportLicenceVoucherReport: 'Method of Import',
  ExportLicenceNewReportNewReport: 'Method of Export',
  ExportLicenceVoucherReport: 'Method of Export',
  BorderExportLicenceNewReportNewReport: 'Method of Export',
  BorderExportLicenceVoucherReport: 'Method of Export',
};

describe('Licence trade method columns', () => {
  it('adds one method column to each requested report after Licence Date', () => {
    const withMethod = Object.keys(reportConfigs).filter(key =>
      reportConfigs[key].columns.some(column => column.key === 'TradeMethod')
    );
    expect(withMethod.sort()).toEqual(Object.keys(titles).sort());

    for (const [key, title] of Object.entries(titles)) {
      const config = reportConfigs[key];
      for (const ApplyType of ['New', 'Amend']) {
        const columns = config.resolveColumns?.({ ApplyType }, config.columns) ?? config.columns;
        const method = { key: 'TradeMethod', dataIndex: 'tradeMethod', title };
        expect(columns.filter(column => column.key === 'TradeMethod'), key).toEqual([method]);
        const dateIndex = columns.findIndex(column => column.key === 'LicenceDate');
        expect(dateIndex, key).toBeGreaterThanOrEqual(0);
        expect(columns[dateIndex + 1], key).toEqual(method);
      }
    }
  });
});
