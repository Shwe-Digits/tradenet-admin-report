import { test, expect } from '@playwright/test';

const families = ['ImportPermit', 'ExportPermit', 'BorderImportPermit', 'BorderExportPermit'];

for (const family of families) {
  test(`${family} pending menu, filtering and Excel use the same report`, async ({ page }) => {
    const name = `${family}PendingReport`;
    const familyTitle = family.replace(/([a-z])([A-Z])/g, '$1 $2');
    const category = 'report-' + familyTitle.toLowerCase().replaceAll(' ', '-');
    let filtered: Record<string, unknown> | undefined;
    let exported: { columns: { dataIndex: string }[] } | undefined;
    await page.addInitScript(() => {
      localStorage.setItem('userid', 'permit-test');
      localStorage.setItem('permission', 'Report');
      localStorage.setItem('token', 'browser-test-token');
    });
    await page.route('**/api/**', async route => {
      const path = new URL(route.request().url()).pathname.split('/api/')[1];
      let data: unknown = [];
      if (path === 'Auth/permissions') data = { isAdmin: false, categories: [category] };
      if (path === name) {
        filtered = route.request().postDataJSON();
        data = { data: [{ applicationNo: `${family}-TEST`, status: 'Pending', applyType: 'New', sectionName: 'Section 1',
          applicationDate: '2026-11-17', companyName: 'Test Company', companyRegistrationNo: '100',
          hsCode: '1234567890', additionalDescription: 'Test goods', currency: 'USD', amount: 35 }],
          pageIndex: 0, pageSize: 10, totalCount: 1, totalPages: 1, hasNextPage: false, isTotalCountExact: false };
      }
      if (path === `${name}/Excel`) {
        exported = route.request().postDataJSON().excel;
        data = { jobId: '11111111-1111-1111-1111-111111111111', status: 'Queued' };
      }
      await route.fulfill({ json: data });
    });
    await page.goto(`/Report/${name}`);
    const menuLink = page.getByRole('link', { name: `${familyTitle} Pending Report`, exact: true });
    if (!await menuLink.isVisible()) await page.getByRole('menuitem', { name: familyTitle, exact: true }).click();
    await expect(menuLink).toBeVisible();
    await page.getByRole('button', { name: /Filter$/ }).click();
    await expect(page.getByRole('cell', { name: `${family}-TEST`, exact: true })).toBeVisible();
    expect(filtered).toMatchObject({ ExportImportSectionId: 0, includeTotalCount: false });
    await page.getByRole('button', { name: /Excel$/ }).click();
    await expect.poll(() => exported).toBeDefined();
    expect(exported!.columns.map(column => column.dataIndex)).toEqual(expect.arrayContaining([
      'status', 'applicationNo', 'applicationDate', 'hsCode', 'additionalDescription', 'currency', 'amount',
    ]));
  });
}
