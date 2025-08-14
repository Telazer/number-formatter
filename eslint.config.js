const path = require('path');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  {
    files: ['src/**/*.{js,ts}'],
    ignores: [
      'node_modules/**', // Ignore node_modules
      'dist/**', // Ignore build output folder
      'coverage/**', // Ignore test coverage
      '*.config.js', // Ignore config files
      '*.config.ts', // Ignore config files
      'package-lock.json', // Ignore package lock
      'yarn.lock', // Ignore yarn lock
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: path.resolve(__dirname, './tsconfig.json'), // Ensure ESLint uses the correct TypeScript config
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierPlugin.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      // Relax strict rules for JSON handling library
      '@typescript-eslint/no-explicit-any': 'warn', // Allow any types but warn
      '@typescript-eslint/no-unsafe-function-type': 'warn', // Allow Function type but warn
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true, // Explicitly define the option
          allowTernary: true, // Allow ternary expressions too, if needed
        },
      ],
      'prettier/prettier': 'error', // Show Prettier errors as ESLint errors
    },
  },
];
