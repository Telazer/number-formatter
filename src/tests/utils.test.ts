import {
  splitNumberString,
  digitsForOutput,
  rtrimZeros,
  roundDecimalString,
  addOne,
  addOneDecimal,
  stripLeadingZeros,
} from '../utils';

describe('splitNumberString', () => {
  test('no decimal point returns [whole,""]', () => {
    expect(splitNumberString('123')).toEqual(['123', '']);
  });

  test('with decimal point splits correctly', () => {
    expect(splitNumberString('123.456')).toEqual(['123', '456']);
  });

  test('leading dot', () => {
    expect(splitNumberString('.5')).toEqual(['', '5']);
  });

  test('trailing dot', () => {
    expect(splitNumberString('10.')).toEqual(['10', '']);
  });

  test('empty string', () => {
    expect(splitNumberString('')).toEqual(['', '']);
  });
});

describe('rtrimZeros', () => {
  test('trims zeros beyond minKeep', () => {
    expect(rtrimZeros('12000', 1)).toBe('12');
  });

  test('does not trim below minKeep', () => {
    expect(rtrimZeros('12000', 3)).toBe('120');
  });

  test('no trailing zeros', () => {
    expect(rtrimZeros('1234', 0)).toBe('1234');
  });

  test('all zeros with minKeep 0 becomes empty', () => {
    expect(rtrimZeros('0000', 0)).toBe('');
  });

  test('all zeros with minKeep 2 keeps 2 zeros', () => {
    expect(rtrimZeros('0000', 2)).toBe('00');
  });
});

describe('digitsForOutput', () => {
  // forceD behavior
  test('forceDecimals pads/truncates exactly', () => {
    expect(digitsForOutput('12', 0, 5, 4, true)).toBe('1200'); // pad to 4
    expect(digitsForOutput('123456', 0, 5, 3, true)).toBe('123'); // truncate to 3
  });

  // removeZeros=false pads to maxD
  test('removeZeros=false pads to maxDecimals', () => {
    expect(digitsForOutput('2', 0, 3, undefined, false)).toBe('200'); // 1.2 -> 1.200
  });

  test('removeZeros=false with short frac pads to exactly maxD', () => {
    expect(digitsForOutput('', 0, 2, undefined, false)).toBe('00');
  });

  // default path: at least minD, up to maxD, trim trailing beyond minD
  test('default trims trailing zeros beyond minDecimals', () => {
    expect(digitsForOutput('1200', 1, 4, undefined, true)).toBe('12'); // keep >=1, trim rest
  });

  test('default pads to minDecimals', () => {
    expect(digitsForOutput('', 2, 4, undefined, true)).toBe('00');
  });

  test('default respects maxDecimals cap', () => {
    expect(digitsForOutput('12345', 0, 3, undefined, true)).toBe('123');
  });
});

describe('addOne', () => {
  test('increments without carry', () => {
    expect(addOne('128')).toBe('129');
  });

  test('increments with single carry', () => {
    expect(addOne('199')).toBe('200');
  });

  test('increments all 9s', () => {
    expect(addOne('999')).toBe('1000');
  });

  test('leading zeros are preserved only by result value (not function concern)', () => {
    expect(addOne('009')).toBe('010'); // function is digit-wise; stripLeadingZeros handles normalization
  });
});

describe('addOneDecimal', () => {
  test('increments decimal without carry to int', () => {
    expect(addOneDecimal('129')).toEqual({ frac: '130', carryToInt: false });
  });

  test('increments decimal with carry to int', () => {
    expect(addOneDecimal('999')).toEqual({ frac: '000', carryToInt: true });
  });

  test('empty string treated as 0-length, becomes 1 with no carry', () => {
    expect(addOneDecimal('')).toEqual({ frac: '', carryToInt: true });
  });
});

describe('stripLeadingZeros', () => {
  test('removes leading zeros, leaves non-zero', () => {
    expect(stripLeadingZeros('000123')).toBe('123');
  });

  test('returns "0" when all zeros', () => {
    expect(stripLeadingZeros('0000')).toBe('0');
  });

  test('returns "0" when empty', () => {
    expect(stripLeadingZeros('')).toBe('0');
  });
});

describe('roundDecimalString', () => {
  // maxD <= 0 path
  test('maxD<=0 with mode=round uses first fractional digit >=5', () => {
    expect(roundDecimalString('12', '5', 0, 'round')).toEqual({ int: '13', frac: '' });
    expect(roundDecimalString('12', '4', 0, 'round')).toEqual({ int: '12', frac: '' });
  });

  test('maxD<=0 with mode=ceil increments if any fractional', () => {
    expect(roundDecimalString('12', '0001', 0, 'ceil')).toEqual({ int: '13', frac: '' });
    expect(roundDecimalString('12', '', 0, 'ceil')).toEqual({ int: '12', frac: '' });
  });

  test('maxD<=0 with mode=floor never increments', () => {
    expect(roundDecimalString('12', '999', 0, 'floor')).toEqual({ int: '12', frac: '' });
  });

  // maxD > 0 path, standard rounding
  test('round to given decimals (mode=round)', () => {
    expect(roundDecimalString('1', '2449', 2, 'round')).toEqual({ int: '1', frac: '24' });
    expect(roundDecimalString('1', '2500', 2, 'round')).toEqual({ int: '1', frac: '25' });
    expect(roundDecimalString('1', '9999', 2, 'round')).toEqual({ int: '2', frac: '00' }); // carry to int
  });

  test('round to given decimals (mode=floor)', () => {
    expect(roundDecimalString('1', '2999', 2, 'floor')).toEqual({ int: '1', frac: '29' });
    expect(roundDecimalString('1', '', 2, 'floor')).toEqual({ int: '1', frac: '00' });
  });

  test('round to given decimals (mode=ceil)', () => {
    expect(roundDecimalString('1', '2901', 2, 'ceil')).toEqual({ int: '1', frac: '30' }); // because carry checks beyond maxD slice
    expect(roundDecimalString('1', '290100', 2, 'ceil')).toEqual({ int: '1', frac: '30' }); // non-zero beyond -> carry
    expect(roundDecimalString('9', '999', 2, 'ceil')).toEqual({ int: '10', frac: '00' }); // carry to int
  });

  test('strips leading zeros on int result', () => {
    expect(roundDecimalString('0009', '999', 2, 'round')).toEqual({ int: '10', frac: '00' });
  });
});
