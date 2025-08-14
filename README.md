# Telazer - NumberFormatter

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/Telazer/number-formatter)

For more helpers and utilities, check out the [Telazer NPM Page](https://www.npmjs.com/org/telazer)

A TypeScript utility for compact, suffix-based number formatting with first-class **BigInt** support.

---

## Installation

```bash
npm install @telazer/number-formatter
```

---

## Key Features

- Works with both **number** and **bigint**
- String-slicing core – no floating-point drift, safe for very large values
- Flexible decimals: `minDecimals`, `maxDecimals`, `forceDecimals`, `removeZeros`
- Optional rounding modes (`round`, `floor`, `ceil`) – default is **no rounding**
- Custom suffix list (default: `["", "K", "M", "B", "T", "Q", "a"..."ah"]`)
- Convenient dual API:
  - `bigNumberData()` → structured parts
  - `bigNumber()` → final compact string

---

## Quick Start

```ts
import { NumberFormatter } from '@telazer/number-formatter';

// String output
NumberFormatter.bigNumber(1500); // "1.5K"
NumberFormatter.bigNumber(1000, { minDecimals: 2 }); // "1.00K"
NumberFormatter.bigNumber(1999, { maxDecimals: 1 }); // "1.9K" (no rounding by default)
NumberFormatter.bigNumber(1500n, { forceDecimals: 3, maxDecimals: 3 }); // "1.500K"

// Structured output
const data = NumberFormatter.bigNumberData(1234567);
/// { input: 1234567, value: "1", decimals: "23", suffix: "M" }
```

---

## API

### `bigNumberData(input, options?)`

Returns structured parts for custom rendering.

```ts
type Numeric = number | bigint;

type NumberFormatData<T extends Numeric> = {
  input: T; // original input
  value: string; // "0".."999" (may include "-" for negatives)
  decimals: string; // fractional digits only ("" if none)
  suffix: string; // "", "K", "M", ...
};
```

### `bigNumber(input, options?)`

Returns a single compact string assembled from the same parts:
`"${value}${decimals ? '.' + decimals : ''}${suffix}"`

---

## Options

```ts
type Rounding = 'round' | 'floor' | 'ceil';

type NumberFormatOptions<T extends number | bigint> = {
  minDecimals?: number; // default 0
  maxDecimals?: number; // default 2
  forceDecimals?: number; // exact decimals; pads/truncates to this length
  removeZeros?: boolean; // default true; trims trailing zeros beyond minDecimals
  rounding?: Rounding; // default undefined => NO rounding (truncate)
  suffixes?: readonly string[]; // custom suffix list
};
```

### Defaults

```ts
{
  minDecimals: 0,
  maxDecimals: 2,
  forceDecimals: undefined,
  removeZeros: true,
  rounding: undefined,        // no rounding by default
  suffixes: ["", "K", "M", "B", "T", "Q", "a", "b", ..., "ah"]
}
```

---

## Behavior Details

- **No rounding by default**
  Fractional digits are taken by slicing up to `maxDecimals`. Set `rounding` to enable rounding.

- **minDecimals**
  Ensures at least this many fractional digits by padding with zeros.

- **maxDecimals**
  Caps how many fractional digits are considered from the source.

- **forceDecimals**
  Overrides the above; pads or truncates to _exactly_ this many digits.

- **removeZeros**
  When `true` (default), trailing zeros beyond `minDecimals` are trimmed.
  When `false`, the fractional part is padded to `maxDecimals`.

- **Suffix selection**
  Based on the **integer digit length** of the absolute input. Every group of 3 digits increases the suffix index.
  If a **custom suffix list is short**, scaling stops at its last entry and the integer part may exceed three digits. This is intentional.

- **Numbers < 1000**
  No suffix. Decimal handling still applies.

- **Decimal inputs (number)**
  Normal values like `1.2424234` are supported. Extremely small/large JS numbers that stringify to exponential notation may need pre-normalization if you rely on precise fractional digits.

- **Zero**
  Respects `minDecimals` (e.g., `0` with `{ minDecimals: 2 }` → `"0.00"`).

- **Negatives**
  The sign is placed on the integer part only (e.g., `-12_345` → `"-12.34K"`).

---

## Examples

```ts
// No rounding, just slicing
NumberFormatter.bigNumber(1999, { maxDecimals: 1 }); // "1.9K"

// Enable rounding
NumberFormatter.bigNumber(1201500, { maxDecimals: 1, rounding: 'round' }); // "1.2M"
NumberFormatter.bigNumber(1201500, { maxDecimals: 1, rounding: 'ceil' }); // "1.3M"
NumberFormatter.bigNumber(1201500, { maxDecimals: 1, rounding: 'floor' }); // "1.2M"

// Keep trailing zeros
NumberFormatter.bigNumber(1.2, { maxDecimals: 3, removeZeros: false }); // "1.200"

// Force exact decimals
NumberFormatter.bigNumber(1500, { forceDecimals: 3, maxDecimals: 3 }); // "1.500K"

// BigInt
NumberFormatter.bigNumber(12345678901234567890n, { maxDecimals: 6 }); // "12.345678a"
```

---

## Custom Suffixes

```ts
const custom = ['', 'K', 'M']; // stop at 'M'
NumberFormatter.bigNumber(10n ** 60n, { suffixes: custom });
// Scales only to 'M'; leftover magnitude stays in the integer part.
```

---

## Development

```bash
# Clone the repo
git clone https://github.com/Telazer/number-formatter

# Install dependencies
npm install

# Start the watcher for development
npm run watch

# Run tests
npm test

# Build the library
npm run build
```

---

## License

MIT License

Copyright (c) 2025 Telazer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
