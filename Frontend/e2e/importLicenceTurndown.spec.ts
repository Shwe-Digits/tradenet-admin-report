import { test, expect } from '@playwright/test';

test.use({ channel: process.env.E2E_BROWSER_CHANNEL });

// Exercise the actual report UI with deterministic API responses. SQL behaviour
// is covered separately by ImportLicenceTurndownReportTests against SQL Server.
for (const border of [false, true]) {
  const report = `${border ? 'Border' : ''}ImportLicenceTurndownReport`;
  test(`${report}: database types, history retry, full history, and Excel`, async ({
    page,
  }) => {
    const id = 'b574a666-5c6e-4dd2-bd47-d51b28c8419e';
    const longRemark =
      'Please provide the corrected application documents.\n'.repeat(12) +
      'Final remark line.';
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      localStorage.setItem('userid', 'test-admin');
      localStorage.setItem('permission', 'Super Administrator');
      localStorage.setItem('token', 'browser-test-token');
    });
    let historyCalls = 0;
    let excelBody: Record<string, unknown> | undefined;
    let gridBody: Record<string, unknown> | undefined;
    await page.route('**/api/**', async (route) => {
      const path = new URL(route.request().url()).pathname.split('/api/')[1];
      let data: unknown = [];
      if (path === 'Auth/permissions') data = { isAdmin: true, categories: [] };
      else if (path?.startsWith('ReportLookups/')) {
        data = path.toLowerCase().endsWith('turndownapplytypes')
          ? [{ id: 1, code: '', label: 'Reissue', value: 'Reissue' }]
          : [{ id: 1, code: '2', label: 'Section Two' }];
      } else if (path === report) {
        gridBody = route.request().postDataJSON();
        data = {
          data: [
            {
              id,
              sectionCode: '2',
              status: 'Turndown',
              applyType: 'Reissue',
              applicationNo: 'APP-001',
              applicationDate: '2026-10-01',
              licenceNo: '',
              licenceDate: null,
              companyRegistrationNo: '12345',
              companyName: 'Example Company',
              commodityType: 'Electronics',
              hsCode: '8507109900',
              additionalDescription: 'Battery',
              currency: 'USD',
              amount: 20,
              turndownCount: 2,
              turndownDate: '2026-10-29T14:38:05',
              turndownRemark: longRemark,
            },
          ],
          pageIndex: 0,
          pageSize: 10,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          isTotalCountExact: true,
        };
      } else if (path === `${report}/History/${id}`) {
        historyCalls++;
        if (historyCalls === 1) {
          await route.fulfill({
            status: 500,
            json: { message: 'Temporary failure' },
          });
          return;
        }
        data = [
          {
            id: 'latest',
            createdDate: '2026-10-29T14:38:05',
            remark: longRemark,
          },
          {
            id: 'earlier',
            createdDate: '2026-09-01T09:00:00',
            remark: 'Earlier valid remark.',
          },
        ];
      } else if (path === `${report}/Excel`) {
        excelBody = route.request().postDataJSON();
        data = { status: 'Queued' };
      }
      await route.fulfill({ json: data });
    });
    await page.goto(`/Report/${report}`);
    const applyType = page.getByLabel('Apply Type', { exact: true });
    await applyType.focus();
    await applyType.press('ArrowDown');
    await expect(
      page
        .locator('.ant-select-item-option-content')
        .filter({ hasText: /^Reissue$/ })
    ).toBeVisible();
    await applyType.press('ArrowDown');
    await applyType.press('Enter');
    await page
      .getByLabel('Company Registration No', { exact: true })
      .fill('12345');
    await page.getByLabel('Company Name', { exact: true }).fill('Example');
    await page.getByRole('button', { name: /Filter$/ }).click();
    const count = page.getByRole('button', {
      name: 'View 2 turndowns for APP-001',
    });
    await expect(count).toBeVisible();
    expect(gridBody).toMatchObject({
      ApplyType: 'Reissue',
      CompanyRegistrationNo: '12345',
      CompanyName: 'Example',
    });
    const mainRemark = page.locator('.turndown-remark').first();
    const mainShowMore = mainRemark
      .locator('button')
      .filter({ hasText: 'Show more' });
    await expect(mainShowMore).toBeVisible();
    const mainHeight = await mainRemark.evaluate(
      (element) => element.getBoundingClientRect().height
    );
    const mainLineHeight = await mainRemark.evaluate((element) =>
      parseFloat(getComputedStyle(element).lineHeight)
    );
    expect(mainHeight).toBeLessThanOrEqual(mainLineHeight * 3 + 2);
    await mainShowMore.click();
    await expect(mainRemark).toContainText('Final remark line.');
    expect(
      await mainRemark.evaluate(
        (element) => element.getBoundingClientRect().height
      )
    ).toBeGreaterThan(mainHeight);
    await mainRemark.locator('button').filter({ hasText: 'Show less' }).click();
    await expect(mainShowMore).toBeVisible();
    await count.click();
    const details = page.getByRole('region', {
      name: 'Turndown history for APP-001',
    });
    await expect(count).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(
      details.locator('xpath=ancestor::tr[1]/preceding-sibling::tr[1]')
    ).toContainText('APP-001');
    await expect(
      details.getByText('Could not load turndown history.')
    ).toBeVisible();
    await details.getByRole('button', { name: 'Retry' }).click();
    await expect(details.getByText('29/10/2026 14:38:05')).toBeVisible();
    await expect(details.getByText('01/09/2026 09:00:00')).toBeVisible();
    await expect(
      details.getByText('Earlier valid remark.', { exact: true })
    ).toBeVisible();
    await expect(
      details.getByText('Remark unavailable', { exact: true })
    ).toHaveCount(0);
    await expect(details.locator('tbody tr.ant-table-row')).toHaveCount(2);
    const remark = details.locator('.turndown-remark').first();
    const showMore = remark.locator('button').filter({ hasText: 'Show more' });
    await expect(showMore).toBeVisible();
    const collapsedHeight = await remark.evaluate(
      (element) => element.getBoundingClientRect().height
    );
    const lineHeight = await remark.evaluate((element) =>
      parseFloat(getComputedStyle(element).lineHeight)
    );
    expect(collapsedHeight).toBeLessThanOrEqual(lineHeight * 3 + 2);
    await showMore.click();
    await expect(remark).toContainText('Final remark line.');
    expect(
      await remark.evaluate((element) => element.getBoundingClientRect().height)
    ).toBeGreaterThan(collapsedHeight);
    await remark.locator('button').filter({ hasText: 'Show less' }).click();
    await expect(showMore).toBeVisible();
    await expect(
      details.locator('button').filter({ hasText: 'Show more' })
    ).toHaveCount(1);
    await count.click();
    await expect(details).toHaveCount(0);
    await expect(count).toHaveAttribute('aria-expanded', 'false');
    await page.getByRole('button', { name: /Excel$/ }).click();
    await expect.poll(() => excelBody).toBeDefined();
    expect(excelBody).toMatchObject({
      ApplyType: 'Reissue',
      CompanyRegistrationNo: '12345',
      CompanyName: 'Example',
      excel: { controllerName: report, showRowNumber: true },
    });
    expect(errors).toEqual([]);
  });
}
