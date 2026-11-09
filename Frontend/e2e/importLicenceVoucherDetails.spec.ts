import { test, expect } from '@playwright/test';

test.use({ channel: process.env.E2E_BROWSER_CHANNEL });

test('Voucher Detail shows separate fees and exports the detail presentation', async ({ page }) => {
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
    else if (path === 'ImportLicenceVoucherDetailReport') data = {
      data: [5000, 3000, 2000].map((amount, index) => ({
        detailId: `detail-${index}`, applicationNo: 'IL001', licenceNo: 'LIC001',
        applicationDate: '2026-11-01', sLicenceDate: '01/11/2026',
        companyRegistrationNo: '12345', companyName: 'Example Company',
        totalAmount: 25, currency: 'USD', voucherNo: 'V001', sVoucherDate: '01/11/2026',
        approvedUser: 'Approver', description: ['လိုင်စင်ကြေး', 'Service fee', 'Other fee'][index], amount,
      })),
      pageIndex: 0, pageSize: 10, totalCount: 3, totalPages: 1, hasNextPage: false,
      isTotalCountExact: true, columnTotals: { amount: 10000 },
    };
    else if (path === 'ImportLicenceVoucherDetailReport/Excel') {
      excel = route.request().postDataJSON().excel;
      data = { jobId: '11111111-1111-1111-1111-111111111111', status: 'Queued' };
    }
    await route.fulfill({ json: data });
  });
  await page.goto('/Report/ImportLicenceVoucherDetailReport');
  await page.getByRole('button', { name: /Filter$/ }).click();
  await expect(page.getByRole('cell', { name: 'လိုင်စင်ကြေး', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'V001', exact: true })).toHaveCount(3);
  await expect(page.getByRole('cell', { name: '5,000.00', exact: true })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Account Title Description', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Excel$/ }).click();
  await expect.poll(() => excel).toBeDefined();
  expect(excel!.columns.slice(-2)).toMatchObject([
    { title: 'Account Title Description', dataIndex: 'description' },
    { title: 'Amount', dataIndex: 'amount' },
  ]);
  expect(errors).toEqual([]);
});
