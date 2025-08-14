// tests/numberFormatter.spec.ts
import { NumberFormatter } from '../NumberFormatter';

type Case<T extends number | bigint> = {
  test: string;
  input: T;
  options?: Parameters<typeof NumberFormatter.bigNumberData<T>>[1];
  expectedData: {
    input: T;
    value: string;
    decimals: string;
    suffix: string;
  };
  expectedString: string;
};

export const cases: Array<Case<number | bigint>> = [
  {
    test: 'Numbers < 1000 have no suffix',
    input: 999,
    expectedData: { input: 999, value: '999', decimals: '', suffix: '' },
    expectedString: '999',
  },
  {
    test: 'Exactly 1000 -> 1K',
    input: 1000,
    expectedData: { input: 1000, value: '1', decimals: '', suffix: 'K' },
    expectedString: '1K',
  },
  {
    test: 'Exactly 1,000,000 -> 1M',
    input: 1_000_000,
    expectedData: { input: 1_000_000, value: '1', decimals: '', suffix: 'M' },
    expectedString: '1M',
  },
  {
    test: 'Default maxDecimals=2 shows trimmed decimals',
    input: 1500,
    expectedData: { input: 1500, value: '1', decimals: '5', suffix: 'K' },
    expectedString: '1.5K',
  },
  {
    test: 'minDecimals pads with zeros',
    input: 1011,
    options: { minDecimals: 2 },
    expectedData: { input: 1011, value: '1', decimals: '01', suffix: 'K' },
    expectedString: '1.01K',
  },
  {
    test: 'minDecimals at a whole-thousand shows zeros',
    input: 1000,
    options: { minDecimals: 2 },
    expectedData: { input: 1000, value: '1', decimals: '00', suffix: 'K' },
    expectedString: '1.00K',
  },
  {
    test: 'maxDecimals=1 (no rounding applied)',
    input: 1999,
    options: { maxDecimals: 1 },
    expectedData: { input: 1999, value: '1', decimals: '9', suffix: 'K' },
    expectedString: '1.9K',
  },
  {
    test: 'forceDecimals enforces exact fractional length',
    input: 1500,
    options: { forceDecimals: 3, maxDecimals: 3 },
    expectedData: { input: 1500, value: '1', decimals: '500', suffix: 'K' },
    expectedString: '1.500K',
  },
  {
    test: 'removeZeros=false keeps trailing zeros',
    input: 1000,
    options: { maxDecimals: 3, removeZeros: false },
    expectedData: { input: 1000, value: '1', decimals: '000', suffix: 'K' },
    expectedString: '1.000K',
  },
  {
    test: 'Negative numbers carry sign in value',
    input: -12_345,
    expectedData: { input: -12_345, value: '-12', decimals: '34', suffix: 'K' },
    expectedString: '-12.34K',
  },
  {
    test: 'Rounding mode = floor',
    input: 1_201_500,
    options: { maxDecimals: 1, rounding: 'floor' },
    expectedData: { input: 1_201_500, value: '1', decimals: '2', suffix: 'M' },
    expectedString: '1.2M',
  },
  {
    test: 'Rounding mode = ceil',
    input: 1_201_500,
    options: { maxDecimals: 1, rounding: 'ceil' },
    expectedData: { input: 1_201_500, value: '1', decimals: '3', suffix: 'M' },
    expectedString: '1.3M',
  },
  {
    test: 'BigInt < 1000 has no suffix',
    input: 999n,
    expectedData: { input: 999n, value: '999', decimals: '', suffix: '' },
    expectedString: '999',
  },
  {
    test: 'BigInt 1000n -> 1K',
    input: 1000n,
    expectedData: { input: 1000n, value: '1', decimals: '', suffix: 'K' },
    expectedString: '1K',
  },
  {
    test: 'Large BigInt with custom maxDecimals',
    input: 12345678901234567890n,
    options: { maxDecimals: 6 },
    expectedData: { input: 12345678901234567890n, value: '12', decimals: '345678', suffix: 'a' },
    expectedString: '12.345678a',
  },
  {
    test: 'BigInt negative',
    input: -10000n,
    expectedData: { input: -10000n, value: '-10', decimals: '', suffix: 'K' },
    expectedString: '-10K',
  },
  {
    test: 'BigInt with minDecimals',
    input: 1001n,
    options: { minDecimals: 2 },
    expectedData: { input: 1001n, value: '1', decimals: '00', suffix: 'K' },
    expectedString: '1.00K',
  },
  {
    test: 'Zero respects minDecimals',
    input: 0,
    options: { minDecimals: 2 },
    expectedData: { input: 0, value: '0', decimals: '00', suffix: '' },
    expectedString: '0.00',
  },
  {
    test: 'Custom suffix array capped',
    input: 10n ** 60n,
    options: { suffixes: ['', 'K', 'M'] },
    expectedData: {
      input: 10n ** 60n,
      value: (10n ** 54n).toString(),
      decimals: '',
      suffix: 'M',
    },
    expectedString: `${(10n ** 54n).toString()}M`,
  },
  {
    test: 'Decimal number no suffix, respects maxDecimals',
    input: 1.2424234,
    expectedData: { input: 1.2424234, value: '1', decimals: '24', suffix: '' },
    expectedString: '1.24',
  },
  {
    test: 'Decimal number no suffix, respects minDecimals',
    input: 1.2,
    options: { minDecimals: 3 },
    expectedData: { input: 1.2, value: '1', decimals: '200', suffix: '' },
    expectedString: '1.200',
  },
  {
    test: 'Decimal number no suffix, trims trailing zeros by default',
    input: 1.2,
    expectedData: { input: 1.2, value: '1', decimals: '2', suffix: '' },
    expectedString: '1.2',
  },
  {
    test: 'Decimal number no suffix, removeZeros=false keeps trailing zeros',
    input: 1.2,
    options: { maxDecimals: 3, removeZeros: false },
    expectedData: { input: 1.2, value: '1', decimals: '200', suffix: '' },
    expectedString: '1.200',
  },
  {
    test: 'Decimal number with forceDecimals overrides trimming',
    input: 1.234,
    options: { forceDecimals: 5, maxDecimals: 5 },
    expectedData: { input: 1.234, value: '1', decimals: '23400', suffix: '' },
    expectedString: '1.23400',
  },
  {
    test: 'Decimal number with rounding=ceil',
    input: 1.234,
    options: { maxDecimals: 2, rounding: 'ceil' },
    expectedData: { input: 1.234, value: '1', decimals: '24', suffix: '' },
    expectedString: '1.24',
  },
];

describe('NumberFormatter.bigNumber', () => {
  for (const c of cases) {
    test(c.test, () => {
      const strResult = NumberFormatter.bigNumber<any>(c.input as any, c.options as any);
      const dataResult = NumberFormatter.bigNumberData<any>(c.input as any, c.options as any);
      expect(strResult).toBe(c.expectedString);
      expect(dataResult).toEqual(c.expectedData);
    });
  }
});
