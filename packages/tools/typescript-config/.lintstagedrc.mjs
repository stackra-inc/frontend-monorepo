/**
 * @fileoverview lint-staged — runs prettier on staged files only
 * @see https://github.com/lint-staged/lint-staged
 */

export default {
  '*.{json,md,mdx,css,html,yml,yaml,ts}': ['prettier --write'],
};
