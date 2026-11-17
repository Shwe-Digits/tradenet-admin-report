import { describe, expect, it } from 'vitest';
import { reportConfigs } from './reportConfigs';
import { canAccessReportRoute, getReportCategoryKey, getReportNavItems } from '../reportNavItems';

const families = ['ImportPermit', 'ExportPermit', 'BorderImportPermit', 'BorderExportPermit'];

describe.each(families)('%s Pending Report', family => {
  it('uses the licence pending columns and the correct permit section filter', () => {
    const name = `${family}PendingReport`;
    const config = reportConfigs[name];
    expect(config).toBeDefined();
    expect(config.columns).toEqual(reportConfigs.ImportLicencePendingReport.columns);
    expect(config.showRowNumber).toBe(true);
    expect(config.initialSortColumn).toBe('Status');
    expect(config.filters.map(filter => filter.name)).toEqual(['dateRange', 'ExportImportSectionId']);
    const lookupName = `${family[0].toLowerCase()}${family.slice(1)}Sections`;
    expect(config.filters[1]).toMatchObject({ lookupName, label: family.includes('Export') ? 'Export Section' : 'Import Section' });
    expect(config.apiRoute).toBe(name);
    expect(config.excelRoute).toBe(`${name}/Excel`);
    expect(config.excelFileName).toBe(`${name}.xlsx`);
    expect(config.title).toBe(family.replace(/([a-z])([A-Z])/g, '$1 $2') + ' Pending Report');
    const category = getReportCategoryKey(`${family}VoucherReport`)!;
    expect(getReportCategoryKey(name)).toBe(category);
    expect(canAccessReportRoute({ isAdmin: false, categories: [category] }, name)).toBe(true);
    expect(canAccessReportRoute({ isAdmin: false, categories: ['report-payment'] }, name)).toBe(false);
    const menu = getReportNavItems({ isAdmin: false, categories: [category] });
    const parent = menu.find(item => item?.key === category);
    expect(parent && 'children' in parent && parent.children?.some(item => item?.key === name)).toBe(true);
  });
});
