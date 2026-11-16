import { test, expect } from '@playwright/test';
test.use({ channel: process.env.E2E_BROWSER_CHANNEL });
test('Payment report displays recovered numbers and exports the same columns', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('userid', 'test-account'); localStorage.setItem('permission', 'Admin');
    localStorage.setItem('token', 'browser-test-token');
  });
  let exported: { columns: { dataIndex: string }[] } | undefined;
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname.split('/api/')[1];
    let data: unknown = [];
    if (path === 'Auth/permissions') data = { isAdmin: false, categories: ['report-payment'] };
    if (path === 'ApplicationNumberReport') data = {
      data: [{ id: 1, applicationNo: 'OIL-001', mpuApplicationNo: null,
        formType: 'Import Licence', transactionDateTime: '2025-11-16T01:18:39',
        responseCode: '00', status: 'AP', transactionAmount: '1120000' }],
      pageIndex: 0, pageSize: 10, totalCount: 1, totalPages: 1, hasNextPage: false, isTotalCountExact: true,
    };
    if (path === 'ApplicationNumberReport/Excel') {
      exported = route.request().postDataJSON().excel;
      data = { jobId: '11111111-1111-1111-1111-111111111111', status: 'Queued' };
    }
    await route.fulfill({ json: data });
  });
  await page.goto('/Report/ApplicationNumberReport');
  await page.getByRole('button', { name: /Filter$/ }).click();
  await expect(page.getByRole('cell', { name: 'OIL-001', exact: true })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'MPU Application No', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Excel$/ }).click();
  await expect.poll(() => exported).toBeDefined();
  expect(exported!.columns.map(column => column.dataIndex)).toEqual(expect.arrayContaining(['applicationNo','mpuApplicationNo','transactionDateTime']));
});
