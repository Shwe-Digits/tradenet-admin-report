/**
 * Parity test for the Excel presentation spec: for EVERY report config (and
 * every ApplyType header variant) the spec must describe exactly the grid
 * `BasicTable` renders, and must satisfy the backend validator's limits
 * (docs/ExcelParity/Contract.md §3, §4).
 *
 * Pure: builds specs from the configs, touches no network and no filesystem.
 */
import { describe, expect, it } from 'vitest';

import { reportConfigs } from '../config/reportConfigs';
import { ReportPageConfig } from '../config/reportTypes';
import {
  buildReportHeaderLines,
  getReportConfigKey,
  isLegacyReportViewer,
  resolveReportColumns,
} from '../reportPresentation';
import { buildExcelPresentation } from './buildExcelPresentation';
import {
  applyTypeVariants,
  buildSampleAppliedFilters,
  EXCEL_SPEC_EXCLUDED_CONFIG_KEYS,
} from './excelSpecSamples';
import { EXCEL_PRESENTATION_FORMAT_VERSION } from './excelTypes';

/** The 6 alias configs that share a controller with a different column set. */
const ALIAS_CONFIG_KEYS = [
  'BorderExportLicenceHSCodeDetailReport',
  'BorderExportPermitHSCodeDetailReport',
  'BorderImportLicenceHSCodeDetailReport',
  'BorderImportPermitHSCodeDetailReport',
  'ExportLicenceHSCodeDetailReport',
  'ExportPermitHSCodeDetailReport',
];

/** Voucher configs whose column header texts depend on the ApplyType filter. */
const VOUCHER_CONFIG_KEYS = [
  'BorderExportLicenceVoucherDetailReport',
  'BorderExportLicenceVoucherReport',
  'BorderExportPermitVoucherDetailReport',
  'BorderExportPermitVoucherReport',
  'BorderImportLicenceVoucherDetailReport',
  'BorderImportLicenceVoucherReport',
  'ExportLicenceVoucherDetailReport',
  'ExportLicenceVoucherReport',
  'ExportPermitVoucherDetailReport',
  'ExportPermitVoucherReport',
  'ImportLicenceVoucherDetailReport',
  'ImportLicenceVoucherReport',
  'ImportPermitVoucherDetailReport',
  'ImportPermitVoucherReport',
];

/**
 * Configs whose `currencyTotalsColumns` points at a column key the config does
 * not have — the currency footer's value cell is therefore dropped by BOTH the
 * grid (BasicTable places by key) and the sheet. A config bug, not an export
 * bug; listed here so the parity suite stays green while it is fixed in
 * `reportConfigs.ts`. Empty today: the last gap
 * (`BorderImportPermitVoucherReport` valueColumnKey "Amount", a key that config
 * never had) was closed in `reportConfigs.ts` — its money column is
 * `TotalAmount`. Keep the list so a NEW gap fails the test below instead of
 * silently dropping a footer cell.
 */
const KNOWN_CURRENCY_TOTALS_KEY_GAPS: string[] = [];

const IDENTIFIER = /^[A-Za-z0-9_.]+$/;

interface Case {
  configKey: string;
  config: ReportPageConfig;
  applyType: string | null;
  label: string;
}

const exportableKeys = Object.keys(reportConfigs)
  .filter((key) => !EXCEL_SPEC_EXCLUDED_CONFIG_KEYS.includes(key))
  .sort();

const cases: Case[] = exportableKeys.flatMap((configKey) => {
  const config = reportConfigs[configKey];
  return [
    { configKey, config, applyType: null, label: configKey },
    ...applyTypeVariants(config).map((applyType) => ({
      configKey,
      config,
      applyType,
      label: `${configKey} [ApplyType=${applyType}]`,
    })),
  ];
});

const specFor = (testCase: Case) => {
  const applied = buildSampleAppliedFilters(
    testCase.config,
    testCase.applyType ? { ApplyType: testCase.applyType } : {}
  );

  return {
    applied,
    spec: buildExcelPresentation(testCase.config, applied, testCase.configKey),
  };
};

describe('buildExcelPresentation', () => {
  it('covers every exportable report config', () => {
    // 167 configs minus the 3 with no Excel export at all.
    expect(exportableKeys.length).toBeGreaterThanOrEqual(164);
    for (const key of EXCEL_SPEC_EXCLUDED_CONFIG_KEYS) {
      expect(Object.keys(reportConfigs)).toContain(key);
      expect(exportableKeys).not.toContain(key);
    }
  });

  it('varies the header texts by ApplyType only for the voucher reports', () => {
    const variantConfigs = exportableKeys.filter(
      (key) => applyTypeVariants(reportConfigs[key]).length > 0
    );

    expect(variantConfigs.sort()).toEqual(VOUCHER_CONFIG_KEYS);

    for (const key of VOUCHER_CONFIG_KEYS) {
      // New, Amend, Extension, Cancel, Actual Amend (+ De-Cancel on two).
      expect(applyTypeVariants(reportConfigs[key]).length).toBeGreaterThanOrEqual(5);
      expect(applyTypeVariants(reportConfigs[key])).toContain('New');
    }
  });

  it('places every currency footer on a column key that exists', () => {
    const gaps: string[] = [];

    for (const key of exportableKeys) {
      const config = reportConfigs[key];
      const placement = config.currencyTotalsColumns;
      if (!placement) {
        continue;
      }

      const columnKeys = resolveReportColumns(
        config,
        buildSampleAppliedFilters(config)
      ).map((column) => column.key);

      if (!columnKeys.includes(placement.labelColumnKey)) {
        gaps.push(`${key}: labelColumnKey "${placement.labelColumnKey}"`);
      }
      if (!columnKeys.includes(placement.valueColumnKey)) {
        gaps.push(`${key}: valueColumnKey "${placement.valueColumnKey}"`);
      }
    }

    expect(gaps.sort()).toEqual(KNOWN_CURRENCY_TOTALS_KEY_GAPS);
  });

  it('uses the configKey, not the controller name, only for the 6 aliases', () => {
    const mismatched = exportableKeys.filter(
      (key) => reportConfigs[key].controllerName !== key
    );

    expect(mismatched.sort()).toEqual(ALIAS_CONFIG_KEYS);

    for (const key of ALIAS_CONFIG_KEYS) {
      const { spec } = specFor({
        configKey: key,
        config: reportConfigs[key],
        applyType: null,
        label: key,
      });
      expect(spec.configKey).toBe(key);
      expect(spec.controllerName).toBe(reportConfigs[key].controllerName);
      expect(spec.controllerName).not.toBe(spec.configKey);
    }
  });

  it('resolves each config key by object identity', () => {
    for (const key of exportableKeys) {
      expect(getReportConfigKey(reportConfigs[key])).toBe(key);
    }
  });

  describe.each(cases.map((testCase) => [testCase.label, testCase] as const))(
    '%s',
    (_label, testCase) => {
      it('describes the grid the UI renders', () => {
        const { applied, spec } = specFor(testCase);
        const gridColumns = resolveReportColumns(testCase.config, applied);

        expect(spec.formatVersion).toBe(EXCEL_PRESENTATION_FORMAT_VERSION);
        expect(spec.configKey).toBe(testCase.configKey);
        expect(spec.controllerName).toBe(testCase.config.controllerName);
        expect(spec.title).toBe(testCase.config.title);
        expect(spec.fileName).toBe(testCase.config.excelFileName);
        expect(spec.headerLines).toEqual(
          buildReportHeaderLines(testCase.config, applied)
        );

        // M2/M3/M4: same columns, same order, same header text as the grid.
        expect(spec.columns.map((column) => column.title)).toEqual(
          gridColumns.map((column) => column.title)
        );
        expect(spec.columns.map((column) => column.dataIndex)).toEqual(
          gridColumns.map((column) => column.dataIndex)
        );
        expect(spec.columns.map((column) => column.key)).toEqual(
          gridColumns.map((column) => column.key)
        );
        expect(spec.columns.length).toBe(gridColumns.length);
      });

      it('carries no UI-only column metadata', () => {
        const { spec } = specFor(testCase);
        const serialized = JSON.stringify(spec);

        expect(serialized).not.toContain('"drilldown"');
        expect(serialized).not.toContain('"hidden"');
        expect(serialized).not.toContain('"render"');

        for (const column of spec.columns) {
          expect(Object.keys(column).sort()).toEqual(
            Object.keys(column)
              .filter((key) =>
                [
                  'key',
                  'dataIndex',
                  'title',
                  'dataType',
                  'fallbackDataIndexes',
                  'numberFormat',
                  'dateFormat',
                ].includes(key)
              )
              .sort()
          );
        }
      });

      it('has resolved, printable header texts', () => {
        const { spec } = specFor(testCase);

        for (const column of spec.columns) {
          // '=Parameters!header2.Value' is a raw RDLC placeholder that
          // resolveColumns must have replaced before export.
          expect(column.title.startsWith('=')).toBe(false);
          expect(column.title.trim()).not.toBe('');
        }

        expect(spec.headerLines.length).toBeGreaterThan(0);
        for (const line of spec.headerLines) {
          expect(line.trim()).not.toBe('');
        }
      });

      it('labels the row-number column the way the grid does', () => {
        const { spec } = specFor(testCase);

        expect(spec.showRowNumber).toBe(testCase.config.showRowNumber ?? true);
        // An explicit rowNumberTitle wins (the "By X" rdlcs head this column 'Sr.No.');
        // otherwise the legacy-viewer default applies.
        expect(spec.rowNumberTitle).toBe(
          testCase.config.rowNumberTitle ??
            (isLegacyReportViewer(testCase.config) ? 'No.' : 'No')
        );
      });

      it('places the currency footer on real column keys', () => {
        const { spec } = specFor(testCase);

        expect(spec.currencyTotalsColumns).toEqual(
          testCase.config.currencyTotalsColumns
        );

        if (!spec.currencyTotalsColumns) {
          return;
        }

        // Placement is by column KEY (BasicTable's rule). Config-level gaps are
        // asserted once, above, against KNOWN_CURRENCY_TOTALS_KEY_GAPS.
        const keys = spec.columns.map((column) => column.key);
        const placed = [
          spec.currencyTotalsColumns.labelColumnKey,
          spec.currencyTotalsColumns.valueColumnKey,
        ].filter((key) => keys.includes(key));

        expect(placed.length).toBeGreaterThan(0);
      });

      it('satisfies the backend validator limits', () => {
        const { spec } = specFor(testCase);

        expect(spec.title.length).toBeGreaterThan(0);
        expect(spec.title.length).toBeLessThanOrEqual(200);
        expect(spec.fileName.replace(/\.xlsx$/i, '').length).toBeGreaterThan(0);
        expect(spec.fileName.replace(/\.xlsx$/i, '').length).toBeLessThanOrEqual(120);
        expect(spec.fileName).toMatch(/^[A-Za-z0-9 _.-]+$/);
        expect(spec.headerLines.length).toBeLessThanOrEqual(12);
        expect(spec.columns.length).toBeGreaterThan(0);
        expect(spec.columns.length).toBeLessThanOrEqual(100);

        for (const line of spec.headerLines) {
          expect(line.length).toBeLessThanOrEqual(300);
        }

        for (const column of spec.columns) {
          expect(column.key).toMatch(IDENTIFIER);
          expect(column.dataIndex).toMatch(IDENTIFIER);
          expect(column.key.length).toBeLessThanOrEqual(100);
          expect(column.dataIndex.length).toBeLessThanOrEqual(100);
          expect(column.title.length).toBeLessThanOrEqual(200);
          expect(column.fallbackDataIndexes?.length ?? 0).toBeLessThanOrEqual(10);

          for (const fallback of column.fallbackDataIndexes ?? []) {
            expect(fallback).toMatch(IDENTIFIER);
            expect(fallback.length).toBeLessThanOrEqual(100);
          }
        }
      });

      it('serializes byte-identically on every build', () => {
        const first = JSON.stringify(specFor(testCase).spec);
        const second = JSON.stringify(specFor(testCase).spec);

        expect(second).toBe(first);
      });
    }
  );
});
