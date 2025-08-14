import { Rounding } from './types';

export const splitNumberString = (s: string): [string, string] => {
  const i = s.indexOf('.');
  return i === -1 ? [s, ''] : [s.slice(0, i), s.slice(i + 1)];
};

export const digitsForOutput = (
  frac: string,
  minD: number,
  maxD: number,
  forceD: number | undefined,
  removeZeros: boolean,
): string => {
  // If forceDecimals is set, pad/truncate to exactly forceD
  if (forceD !== undefined) {
    return frac.padEnd(forceD, '0').slice(0, forceD);
  }

  // If removeZeros is false, we should pad up to maxDecimals (not just min),
  // so cases like 1.2 with max=3 become "1.200"
  if (!removeZeros) {
    return frac.padEnd(maxD, '0').slice(0, maxD);
  }

  // Default: ensure at least minDecimals, allow up to maxDecimals, then trim trailing zeros beyond min
  let out = frac.padEnd(minD, '0').slice(0, maxD);
  if (out.length > minD) out = rtrimZeros(out, minD);
  return out;
};

export const rtrimZeros = (f: string, minKeep: number): string => {
  let i = f.length - 1;
  while (i >= minKeep && f[i] === '0') i--;
  return f.slice(0, i + 1);
};

export const roundDecimalString = (
  intPart: string,
  fracRaw: string,
  maxD: number,
  mode: Rounding,
): { int: string; frac: string } => {
  if (maxD <= 0) {
    const anyFrac = /[1-9]/.test(fracRaw);
    const first = fracRaw[0] ?? '0';
    const carry = mode === 'ceil' ? anyFrac : mode === 'floor' ? false : first >= '5';
    return { int: carry ? addOne(intPart) : intPart, frac: '' };
  }

  const pad = '0'.repeat(maxD + 1);
  const fracPad = (fracRaw + pad).slice(0, maxD + 1);
  let keep = fracPad.slice(0, maxD);
  const next = fracPad[maxD] ?? '0';

  let carry = false;
  if (mode === 'ceil') carry = /[1-9]/.test(fracRaw.slice(maxD));
  else if (mode === 'round') carry = next >= '5';

  if (carry) {
    const { frac, carryToInt } = addOneDecimal(keep);
    keep = frac;
    if (carryToInt) intPart = addOne(intPart);
  }
  return { int: stripLeadingZeros(intPart) || '0', frac: keep };
};

export const addOne = (s: string): string => {
  let carry = 1;
  let out = '';
  for (let i = s.length - 1; i >= 0; i--) {
    const d = s.charCodeAt(i) - 48 + carry;
    carry = d >= 10 ? 1 : 0;
    out = String.fromCharCode(48 + (d % 10)) + out;
  }
  if (carry) out = '1' + out;
  return out;
};

export const addOneDecimal = (frac: string): { frac: string; carryToInt: boolean } => {
  let carry = 1;
  let out = '';
  for (let i = frac.length - 1; i >= 0; i--) {
    const d = frac.charCodeAt(i) - 48 + carry;
    carry = d >= 10 ? 1 : 0;
    out = String.fromCharCode(48 + (d % 10)) + out;
  }
  return { frac: out, carryToInt: !!carry };
};

export const stripLeadingZeros = (s: string): string => {
  const t = s.replace(/^0+/, '');
  return t.length ? t : '0';
};
