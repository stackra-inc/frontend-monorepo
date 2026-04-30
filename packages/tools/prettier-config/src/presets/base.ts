import type { Config } from 'prettier';

/**
 * Prettier Configuration
 *
 * Shared Prettier configuration for Stackra packages.
 * Ensures consistent code formatting across all packages.
 *
 * @module @stackra/prettier-config
 * @since 1.0.0
 *
 * @description
 * This configuration provides:
 * - **Consistent formatting**: Same style across all packages
 * - **ES5 trailing commas**: Maximum compatibility
 * - **Single quotes**: JavaScript/TypeScript standard
 * - **100 char width**: Readable code (80 for JSON/MD)
 * - **LF line endings**: Unix-style for cross-platform consistency
 *
 * @example
 * ```typescript
 * // prettier.config.ts
 * import config from '@stackra/prettier-config';
 * export default config;
 * ```
 *
 * @note
 * TypeScript config requires Node.js >= 22.6.0 with --experimental-strip-types flag:
 * ```bash
 * NODE_OPTIONS="--experimental-strip-types" prettier . --write
 * ```
 */

const config: Config = {
  // Use semicolons at the end of statements
  semi: true,

  // ES5-compatible trailing commas (objects, arrays, parameters)
  // Avoids issues with older browsers and tools
  trailingComma: 'es5',

  // Use single quotes instead of double quotes
  singleQuote: true,

  // Maximum line length before wrapping
  printWidth: 100,

  // Number of spaces per indentation level
  tabWidth: 2,

  // Use spaces instead of tabs
  useTabs: false,

  // Always include parentheses around arrow function parameters
  arrowParens: 'always',

  // Add spaces inside object literals
  bracketSpacing: true,

  // Line endings: LF (Unix-style)
  endOfLine: 'lf',

  // How to wrap prose in markdown
  proseWrap: 'preserve',

  // Quote object properties as needed
  quoteProps: 'as-needed',

  // Use double quotes in JSX
  jsxSingleQuote: false,

  // Put closing bracket on new line
  bracketSameLine: false,

  // HTML whitespace sensitivity
  htmlWhitespaceSensitivity: 'css',

  // Format embedded code (in template literals, markdown, etc)
  embeddedLanguageFormatting: 'auto',

  // Don't insert @format pragma
  insertPragma: false,

  // Don't require @format pragma
  requirePragma: false,

  // File-specific overrides
  overrides: [
    {
      // JSON files: narrower width, no trailing commas
      files: '*.json',
      options: {
        printWidth: 80,
        trailingComma: 'none',
      },
    },
    {
      // Markdown files: narrower width, always wrap
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      // YAML files: use double quotes, 2 space indent
      files: '*.yml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
  ],
};

export default config;
