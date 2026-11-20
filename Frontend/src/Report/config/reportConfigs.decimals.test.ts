import { describe, expect, it } from 'vitest';
import { reportConfigs } from './reportConfigs';

/**
 * 2026-09-14, customer: every column that carries a decimal point shows FOUR places,
 * in every report, whether or not the value has anything after the point — 2000 reads
 * "2,000.0000" and 2000.1 reads "2,000.1000".
 *
 * 2026-09-17, ငွေစာရင်း department: "ဒသမနောက် လေးလုံး မထည့်ပေးပါနှင့်" — NOT in their
 * reports. So the rule now has one exception, and it is the whole Payment group: those
 * six print the value AS STORED with '0.####' (3000 reads "3000", 3000.5 reads
 * "3000.5"), which is what the old Tradenet 2.0 screens did — their RDLCs carry no
 * Format at all and the amounts are SQL float. Everything else keeps '#,##0.0000'.
 *
 * The Payment formats are also comma-less (see reportConfigs.payment.test.ts).
 *
 * 2026-09-25, BSA: "ဒသမနောက်က သုညလေးလုံး ဖြုတ်ပေးပါရန်" — the Business Service Agency
 * Registration By Voucher's Total Amount went '0.####' too (its old RDLC has no Format).
 * That one report only; its ten Registration-By-Voucher siblings keep four places.
 */
const PAYMENT = new Set([
  'AccountSummaryReport',
  'ChequeNoDetailReport',
  'ChequeNoReport',
  'MPUReport',
  'MPUReportV3',
  'MPUReportV4',
  'OnlineFeesReport',
]);

const AS_STORED_REGISTRATION = new Set(['BusinessServiceAgencyRegistrationByVoucher']);

/** Amount-bearing columns. */
const MONEY_DATA_INDEXES = new Set([
  'amount', 'amountDiff', 'capital', 'exchangeRate', 'imAmount', 'mocAmount',
  'mpuAmount', 'price', 'quantity', 'totalAmount', 'totalCIF', 'totalUSDValue',
  'totalValue', 'transactionAmount',
]);

/**
 * Counts and identifiers. These carry no decimal point in the old reports either,
 * so "5 licences" must never become "5.0000".
 */
const COUNTS = new Set([
  'chequeId', 'companyCount', 'extensionCount', 'noOfLicences', 'terms',
]);

/**
 * The MMK voucher fee. `amount` on a Voucher report is the fee the office collected
 * — whole kyat, pinned to the old RDLC's FORMAT(...,"N0") by earlier complaint fixes
 * — NOT the goods value, which is the sibling `LicValue` (totalAmount) and does get
 * four places. It has no decimal point to widen.
 */
const isVoucherFee = (reportKey: string, dataIndex?: string) =>
  reportKey.includes('Voucher') && dataIndex === 'amount';

describe('decimal columns show four places, except ငွေစာရင်း and BSA voucher', () => {
  it('every amount column asks for 4 decimals, or for as-stored in Payment and BSA voucher', () => {
    const wrong: string[] = [];

    for (const [key, config] of Object.entries(reportConfigs)) {
      for (const column of config.columns) {
        if (
          !MONEY_DATA_INDEXES.has(column.dataIndex ?? '') ||
          isVoucherFee(key, column.dataIndex)
        ) {
          continue;
        }

        const expected =
          PAYMENT.has(key) || AS_STORED_REGISTRATION.has(key) ? '0.####' : '#,##0.0000';
        if (column.numberFormat !== expected) {
          wrong.push(
            `${key}.${column.key}: ${String(column.numberFormat)} (want ${expected})`
          );
        }
      }
    }

    expect(wrong).toEqual([]);
  });

  it('counts and identifiers keep no decimals at all', () => {
    const wrong: string[] = [];

    for (const [key, config] of Object.entries(reportConfigs)) {
      for (const column of config.columns) {
        if (COUNTS.has(column.dataIndex ?? '') && column.numberFormat) {
          wrong.push(`${key}.${column.key}: ${column.numberFormat}`);
        }
      }
    }

    expect(wrong).toEqual([]);
  });

  it('no format pads to fewer than four places', () => {
    const formats = new Set<string>();

    for (const config of Object.values(reportConfigs)) {
      for (const column of config.columns) {
        if (column.numberFormat) {
          formats.add(column.numberFormat);
        }
      }
    }

    // '#,##0' is the voucher fee's N0 and '0.####' the ငွေစာရင်း as-stored format;
    // everything else pads to four places. A '0.00' or '#,##0.00' reappearing here
    // is the 2026-09-14 complaint coming back.
    expect([...formats].sort()).toEqual(['#,##0', '#,##0.0000', '0.####']);
  });
});
