/**
 * @fileoverview Prettier configuration for @stackra-inc/ts-cache package
 *
 * Extends the shared @nesvel/prettier-config for consistent code formatting
 * across all packages in the monorepo.
 *
 * Shared Config Provides:
 * - Single quotes for strings
 * - Trailing commas (ES5 style)
 * - 100 character print width
 * - 2 space indentation
 * - Semicolons enabled
 * - LF line endings
 *
 * @module @stackra-inc/ts-cache
 * @category Configuration
 * @see https://prettier.io/docs/en/configuration
 */

// Extend the shared Nesvel Prettier configuration.
// All formatting rules are defined in the shared config —
// no package-specific overrides needed.
/** @type {string} */
const config = '@nesvel/prettier-config';

export default config;
