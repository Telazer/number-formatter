import { BIG_NUMBER_SUFFIX, DEFAULT_OPTIONS } from './consts';
import { NumberFormatData, NumberFormatOptions, Numeric, Rounding } from './types';
import { digitsForOutput, roundDecimalString, splitNumberString, stripLeadingZeros } from './utils';

export class NumberFormatter {
  static suffixes = BIG_NUMBER_SUFFIX;

  static setSuffixes(suffixes: string[]) {
    this.suffixes = suffixes;
  }

  static bigNumber<T extends Numeric>(input: T, options?: NumberFormatOptions<T>): string {
    const data = this.bigNumberData(input, options);
    return `${data.value}${data.decimals ? '.' + data.decimals : ''}${data.suffix}`;
  }

  static bigNumberData<T extends Numeric>(input: T, options?: NumberFormatOptions<T>): NumberFormatData<T> {
    const o = { ...DEFAULT_OPTIONS, suffixes: this.suffixes, ...options } as NumberFormatOptions<T>;
    const minD = Math.max(0, o.minDecimals ?? 0);
    const maxD = Math.max(minD, o.maxDecimals ?? 2);
    const forceD = o.forceDecimals === undefined ? undefined : Math.max(0, o.forceDecimals);
    const sliceD = Math.max(maxD, forceD ?? 0); // ensure enough digits for forceDecimals

    if (input === 0 || input === 0n) {
      const decimals = digitsForOutput('', minD, maxD, forceD, o.removeZeros ?? true);
      return { input, value: '0', decimals, suffix: '' };
    }

    const isBig = typeof input === 'bigint';
    const neg = isBig ? (input as bigint) < 0n : (input as number) < 0;
    const absStr = isBig
      ? (neg ? (-input as bigint) : (input as bigint)).toString()
      : Math.abs(input as number).toString();

    const [intDigitsStr, fracDigitsStr] = splitNumberString(absStr);
    let digits = intDigitsStr.replace(/^0+/, '') || '0';
    let group = Math.floor((digits.length - 1) / 3);
    if (group < 0) group = 0;

    const suffixes = o.suffixes as string[];
    if (group >= suffixes.length) group = suffixes.length - 1;

    const intLenAfterScale = Math.max(1, digits.length - group * 3);
    const scaledInt = digits.slice(0, intLenAfterScale);
    const scaledFracFromInt = digits.slice(intLenAfterScale);
    const baseFrac = scaledFracFromInt + (group === 0 ? fracDigitsStr : '');

    let outInt: string;
    let outFrac: string;

    // Default: NO rounding - truncate to sliceD
    if (!o.rounding) {
      outInt = stripLeadingZeros(scaledInt) || '0';
      outFrac = baseFrac.slice(0, sliceD);
    } else {
      const { int, frac } = roundDecimalString(scaledInt, baseFrac, sliceD, o.rounding as Rounding);
      outInt = int;
      outFrac = frac;
    }

    let decimals = digitsForOutput(outFrac, minD, maxD, forceD, o.removeZeros ?? true);

    let value = outInt;
    if (neg && value !== '0') value = '-' + value;

    return { input, value, decimals, suffix: suffixes[group] };
  }
}
