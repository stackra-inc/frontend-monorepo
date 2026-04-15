/**
 * prettier.config.js — frontend-monorepo
 *
 * Shared Prettier configuration for all workspaces.
 * Individual workspaces can override by adding their own prettier.config.js,
 * but should prefer extending this root config for consistency.
 *
 * Docs: https://prettier.io/docs/en/configuration.html
 */

/** @type {import("prettier").Config} */
const config = {
  // Use double quotes for consistency with JSX attribute strings.
  singleQuote: false,

  // Trailing commas in multi-line structures — helps with cleaner git diffs.
  trailingComma: 'all',

  // Semicolons at end of statements.
  semi: true,

  // Print width — soft limit, Prettier will break lines longer than this.
  printWidth: 100,

  // Tab width — 2 spaces (matches .editorconfig).
  tabWidth: 2,

  // Use spaces, not tabs.
  useTabs: false,

  // Always include parentheses around arrow function parameters.
  arrowParens: 'always',

  // Preserve existing line endings in files.
  endOfLine: 'lf',

  // Bracket spacing in object literals: { foo: bar }
  bracketSpacing: true,

  // Put the closing bracket of JSX elements on a new line.
  bracketSameLine: false,

  // Overrides per file type.
  overrides: [
    {
      // JSON files — no trailing commas (invalid JSON).
      files: ['*.json', '*.jsonc'],
      options: {
        trailingComma: 'none',
      },
    },
    {
      // Markdown — prose wrap to preserve intentional line breaks.
      files: ['*.md'],
      options: {
        proseWrap: 'always',
        printWidth: 80,
      },
    },
  ],
};

export default config;
