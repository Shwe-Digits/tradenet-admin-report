import { test, expect } from '@playwright/test';

test.use({ channel: process.env.E2E_BROWSER_CHANNEL });

// Authorization is tested against the backend policy/filter separately. This
// verifies that the browser consumes ICT's non-admin category grants correctly.
test('ICT sees Oversea, Border and other reports while admin tools stay blocked', async ({ page }) => {
  const categories = [
    'report-import-licence', 'report-import-permit',
    'report-export-licence', 'report-export-permit',
    'report-border-import-licence', 'report-border-import-permit',
    'report-border-export-licence', 'report-border-export-permit',
    'report-wholesale-retail', 'report-wholesale', 'report-retail',
    'report-alcoholic-beverages', 'report-duty-free-shop', 'report-re-export',
    'report-business-service-agency', 'report-sale-center', 'report-show-room',
    'report-ev-show-room', 'report-evcycle-show-room', 'report-pathaka',
    'report-payment', 'report-member', 'report-oga-recommendation', 'report-eicc',
  ];
  await page.addInitScript(() => {
    localStorage.setItem('userid', 'ict-test');
    localStorage.setItem('permission', 'User');
    localStorage.setItem('token', 'browser-test-token');
  });
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname.split('/api/')[1];
    await route.fulfill({
      json: path === 'Auth/permissions' ? { isAdmin: false, categories } : [],
    });
  });

  await page.goto('/dashboards/default');
  for (const title of ['Import Licence', 'Border Import Licence', 'Member', 'Payment', 'OGA Recommendation']) {
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole('menuitem', { name: 'Data Import', exact: true })).toHaveCount(0);
  for (const report of ['ImportLicenceTurndownReport', 'BorderImportLicenceTurndownReport']) {
    await page.goto(`/Report/${report}`);
    await expect(page.getByLabel('Apply Type', { exact: true })).toBeVisible();
    await expect(page).not.toHaveURL(/errors\/403/);
  }
  await page.goto('/Report/DataImport');
  await expect(page).toHaveURL(/errors\/403/);
  await expect(page.getByText('Sorry, you are not authorized to access this page.')).toBeVisible();
});
