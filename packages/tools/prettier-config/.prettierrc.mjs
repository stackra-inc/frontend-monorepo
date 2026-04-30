/**
 * Prettier configuration for @stackra/prettier-config
 *
 * Inlined to avoid circular dependency (this package IS the prettier config).
 * Keep in sync with src/presets/base.ts.
 */

/** @type {import("prettier").Config} */
const config = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'lf',
  bracketSameLine: false,
};

export default config;
