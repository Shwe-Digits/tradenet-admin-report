import { test, expect } from '@playwright/test';

test.use({ channel: process.env.E2E_BROWSER_CHANNEL });

for (const report of ['ExportLicenceCancellationReport', 'ExportLicenceAmendmentReport', 'ExportLicenceActualAmendmentReport']) {
  test(`${report} renders and exports the requested item columns`, async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('userid', 'test-admin');
      localStorage.setItem('permission', 'Admin');
      localStorage.setItem('token', 'browser-test-token');
    });
    let excel: { columns: { title: string; dataIndex: string }[] } | undefined;
    await page.route('**/api/**', async route => {
      const path = new URL(route.request().url()).pathname.split('/api/')[1];
      let data: unknown = [];
      if (path === 'Auth/permissions') data = { isAdmin: true, categories: [] };
      else if (path?.startsWith('ReportLookups/')) data = [];
      else if (path === report) data = {
        data: [{ sectionName: 'Section Two', oldLicenceNo: 'OLD-001', licenceNo: 'ACTION-001',
          sDate: '07/10/2026', companyRegistrationNo: '12345', companyName: 'Example Company',
          companyAddress: 'Test address', hsCode: '0101210000', description: 'ကုန်ပစ္စည်း & description',
          quantity: 12.3456, currency: 'USD', amount: 20, remark: 'Example remark' }],
        pageIndex: 0, pageSize: 10, totalCount: 1, totalPages: 1, hasNextPage: false,
        isTotalCountExact: true,
      };
      else if (path === `${report}/Excel`) {
        excel = route.request().postDataJSON().excel;
        data = { jobId: '11111111-1111-1111-1111-111111111111', status: 'Queued' };
      }
      await route.fulfill({ json: data });
    });
    await page.goto(`/Report/${report}`);
    await page.getByRole('button', { name: /Filter$/ }).click();
    await expect(page.getByRole('cell', { name: 'ကုန်ပစ္စည်း & description', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: '12.3456', exact: true })).toBeVisible();
    const headers = await page.getByRole('columnheader').allTextContents();
    const address = headers.findIndex(title => title.trim() === 'Company Address');
    expect(headers.slice(address + 1, address + 5).map(title => title.trim())).toEqual(['HS Code', 'Description', 'QTY', 'Currency']);
    await page.getByRole('button', { name: /Excel$/ }).click();
    await expect.poll(() => excel).toBeDefined();
    const index = excel!.columns.findIndex(column => column.dataIndex === 'companyAddress');
    expect(excel!.columns.slice(index + 1, index + 4).map(column => column.dataIndex)).toEqual(['hsCode', 'description', 'quantity']);
  });
}
