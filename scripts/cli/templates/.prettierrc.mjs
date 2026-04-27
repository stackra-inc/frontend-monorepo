/**
 * @fileoverview Prettier configuration for {{PACKAGE_NAME}} package
 *
 * Extends the shared @stackra/prettier-config for consistent code formatting
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
 * @module {{PACKAGE_NAME}}
 * @category Configuration
 * @see https://prettier.io/docs/en/configuration
 */

// Extend the shared Stackra Prettier configuration.
// All formatting rules are defined in the shared config —
// no package-specific overrides needed.
/** @type {string} */
const config = '@stackra/prettier-config';

export default config;
