// tests/numberFormatter.suffix.spec.ts
import { NumberFormatter } from '../NumberFormatter';

describe('NumberFormatter.setSuffixes', () => {
  beforeEach(() => {
    // reset back to defaults after each test
    NumberFormatter.setSuffixes(['', 'foo', 'bar', 'baz']);
  });

  it('uses default suffixes initially', () => {
    const str = NumberFormatter.bigNumber(1000);
    expect(str).toBe('1foo');
  });

  it('applies custom suffix array when overridden', () => {
    NumberFormatter.setSuffixes(['', ' Thousand', ' Million', ' Billion']);
    const str = NumberFormatter.bigNumber(1000);
    expect(str).toBe('1 Thousand');
  });

  it('caps at last custom suffix', () => {
    NumberFormatter.setSuffixes(['', 'X']);
    const str = NumberFormatter.bigNumber(10 ** 9); // 1,000,000,000
    expect(str.endsWith('X')).toBe(true);
  });
});
