import { describe, expect, it } from 'vitest';
import { reportConfigs } from './reportConfigs';
import { canAccessReportRoute, getReportCategoryKey } from '../reportNavItems';

/**
 * The Payment group (ငွေစာရင်းဌာန). Two behaviours in GenericReportPage key off
 * `showTime`, and both are meant for these reports ONLY:
 *
 *  - the date filter renders as two separate From Date / To Date boxes, the shape
 *    the old Tradenet 2.0 screens had (the staff rejected one combined range box);
 *  - the To edge is widened to :59, because the picker offers no seconds.
 *
 * So `showTime` is not a cosmetic flag — it is the switch that says "this is a
 * Payment report". Adding it to any other config silently changes that report's
 * filter box, which is why the set is pinned here.
 */
const PAYMENT_REPORT_KEYS = [
  'AccountSummaryReport',
  'ChequeNoDetailReport',
  'ChequeNoReport',
  'MPUReport',
  'MPUReportV3',
  'MPUReportV4',
  'OnlineFeesReport',
];

describe('Payment report configs', () => {
  it('adds only the licence number to the V4 grid and Excel column layout', () => {
    const v3 = reportConfigs.MPUReportV3;
    const v4 = reportConfigs.MPUReportV4;
    const index = v4.columns.findIndex(column => column.key === 'ApplicationNo');
    expect(v4.columns[index + 1]).toEqual({
      key: 'LicenceApplicationNo', dataIndex: 'licenceApplicationNo', title: 'Licence Application No',
    });
    expect(v4.columns.filter(column => column.key !== 'LicenceApplicationNo')).toEqual(v3.columns);
    expect(v4.filters).toEqual(v3.filters);
    expect(v4.excelRoute).toBe('MPUReportV4/Excel');
    expect(getReportCategoryKey(v4.controllerName)).toBe('report-payment');
    expect(canAccessReportRoute({ isAdmin: false, categories: ['report-import-licence'] }, v4.controllerName)).toBe(false);
  });

  it('showTime marks exactly the Payment reports, and nothing else', () => {
    const withShowTime = Object.entries(reportConfigs)
      .filter(([, config]) =>
        config.filters.some(
          (filter) => filter.type === 'dateRange' && filter.showTime
        )
      )
      .map(([key]) => key)
      .sort();

    expect(withShowTime).toEqual([...PAYMENT_REPORT_KEYS, 'ApplicationNumberReport'].sort());
  });

  it('every Payment date column prints mm/dd/yyyy and every amount is 4 decimals, comma-less', () => {
    for (const key of PAYMENT_REPORT_KEYS) {
      const config = reportConfigs[key];

      for (const column of config.columns) {
        if (column.dataType === 'date') {
          expect(column.dateFormat, `${key}.${column.key}`).toBe('MM/DD/YYYY');
        }

        if (column.dataType === 'dateTime') {
          expect(column.dateFormat, `${key}.${column.key}`).toBe(
            'MM/DD/YYYY HH:mm:ss'
          );
        }

        // The money columns, plus the 'number' columns that hold an amount.
        // A plain identifier (ChequeNoReport's Cheque Id) keeps no format.
        // '0.####' prints the value as stored — the department asked for no
        // padding at all on 2026-09-17 — and carries no comma, as ever.
        if (column.dataType === 'money' || column.dataIndex === 'amount') {
          expect(column.numberFormat, `${key}.${column.key}`).toBe('0.####');
          expect(column.numberFormat).not.toContain(',');
        }
      }
    }
  });
});
