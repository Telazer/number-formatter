export type Numeric = number | bigint;

export type Rounding = 'round' | 'floor' | 'ceil';

export type NumberFormatOptions<T extends Numeric> = {
  minDecimals?: number;
  maxDecimals?: number;
  forceDecimals?: number;
  removeZeros?: boolean;
  rounding?: Rounding;
  suffixes?: readonly string[];
};

export type NumberFormatData<T extends Numeric> = {
  input: T;
  value: string; // "0".."999" (may include "-" for negatives)
  decimals: string; // fractional digits only
  suffix: string; // "", "K", "M", ...
};
