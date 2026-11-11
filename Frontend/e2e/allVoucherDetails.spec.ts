import { test, expect } from '@playwright/test';

test.use({ channel: process.env.E2E_BROWSER_CHANNEL });

for (const family of ['ImportPermit', 'ExportLicence', 'ExportPermit', 'BorderImportLicence',
  'BorderImportPermit', 'BorderExportLicence', 'BorderExportPermit']) {
  test(`${family} detail page renders separate fees and exports all original columns`, async ({ page }) => {
    const report = `${family}VoucherDetailReport`;
    await page.addInitScript(() => {
      localStorage.setItem('userid', 'test-admin');
      localStorage.setItem('permission', 'Admin');
      localStorage.setItem('token', 'browser-test-token');
    });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    let excel: { columns: { title: string; dataIndex: string }[] } | undefined;
    await page.route('**/api/**', async route => {
      const path = new URL(route.request().url()).pathname.split('/api/')[1];
      let data: unknown = [];
      if (path === 'Auth/permissions') data = { isAdmin: true, categories: [] };
      else if (path === report) data = {
        data: [5000, 3000, 2000].map((amount, index) => ({
          detailId: `detail-${index}`, applicationNo: 'APP001', licenceNo: 'LIC001',
          applicationDate: '2026-11-01', licenceDate: '2026-11-01', sLicenceDate: '01/11/2026',
          companyRegistrationNo: '12345', companyName: 'Example Company', sectionCode: '2',
          totalAmount: 25, currency: 'USD', voucherNo: 'V001', voucherDate: '2026-11-01', sVoucherDate: '01/11/2026',
          approvedUser: 'Approver', commodityType: 'Goods', totalCIF: 25, exchangeRate: 2100,
          sakhanId: 1, sakhanCode: 'MWD', sakhanName: 'Myawaddy',
          description: ['လိုင်စင်ကြေး', 'Service fee', 'Other fee'][index], amount,
        })),
        pageIndex: 0, pageSize: 10, totalCount: 3, totalPages: 1, hasNextPage: false,
        isTotalCountExact: true, columnTotals: { amount: 10000 },
      };
      else if (path === `${report}/Excel`) {
        excel = route.request().postDataJSON().excel;
        data = { jobId: '11111111-1111-1111-1111-111111111111', status: 'Queued' };
      }
      await route.fulfill({ json: data });
    });
    await page.goto(`/Report/${report}`);
    await page.getByRole('button', { name: /Filter$/ }).click();
    await expect(page.getByRole('cell', { name: 'လိုင်စင်ကြေး', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'V001', exact: true })).toHaveCount(3);
    await expect(page.getByRole('columnheader', { name: 'Account Title Description', exact: true })).toBeVisible();
    await page.getByRole('button', { name: /Excel$/ }).click();
    await expect.poll(() => excel).toBeDefined();
    const amount = excel!.columns.findIndex(column => column.dataIndex === 'amount');
    expect(excel!.columns[amount - 1]).toMatchObject({ title: 'Account Title Description', dataIndex: 'description' });
    expect(excel!.columns[amount].title).toBe('Amount');
    expect(excel!.columns.some(column => column.dataIndex === 'voucherNo')).toBe(true);
    expect(excel!.columns.some(column => column.dataIndex === 'companyName')).toBe(true);
    expect(errors).toEqual([]);
  });
}
