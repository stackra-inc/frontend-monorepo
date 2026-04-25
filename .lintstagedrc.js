/**
 * lint-staged Configuration
 *
 * Runs linters on staged files before each commit via husky pre-commit hook.
 * ESLint handles JS/TS files, Prettier handles everything else.
 *
 * @see https://github.com/lint-staged/lint-staged
 * @module .lintstagedrc
 */

export default {
  "*.{js,jsx,ts,tsx}": ["eslint --fix --no-error-on-unmatched-pattern", "prettier --write"],
  "*.{json,md,mdx,css,html,yml,yaml,scss}": ["prettier --write"],
};
