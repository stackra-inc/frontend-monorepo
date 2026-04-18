/**
 * Utilities Barrel Export
 *
 * Helper functions for working with the DI system.
 *
 * - {@link forwardRef} — Wraps a class reference in a lazy function to break circular dependencies
 * - {@link defineConfig} — Type-safe helper for `Application.create()` options
 *
 * @module utils
 */

export { forwardRef } from './forward-ref.util';
export { defineConfig } from './define-config.util';
