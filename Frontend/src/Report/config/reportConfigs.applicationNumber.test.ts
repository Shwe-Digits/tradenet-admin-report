import { expect, it } from 'vitest';
import { reportConfigs } from './reportConfigs';
import { getReportCategoryKey } from '../reportNavItems';

it('places Application Number Report in Payment with precise dates and two application families', () => {
  const config = reportConfigs.ApplicationNumberReport;
  expect(config).toBeDefined();
  expect(config.title).toBe('Application Number Report');
  expect(getReportCategoryKey(config.controllerName)).toBe('report-payment');
  expect(config.filters.find(filter => filter.type === 'dateRange')).toMatchObject({ showTime: true });
  expect(config.filters.find(filter => filter.name === 'FormType')?.options?.map(option => option.value))
    .toEqual(['', 'Import Licence', 'Border Import Licence']);
  expect(config.columns.find(column => column.dataIndex === 'applicationNo')?.title).toBe('Application No');
  expect(config.columns.find(column => column.dataIndex === 'mpuApplicationNo')?.title).toBe('MPU Application No');
});
