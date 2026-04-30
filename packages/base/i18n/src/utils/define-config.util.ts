/**
 * Define Config Utility
 *
 * Helper function to define i18n module options with type safety.
 * Follows the `defineConfig()` pattern popularized by Vite, Vitest,
 * and similar tools.
 *
 * @module utils/define-config
 */

import type { I18nModuleOptions } from '@/interfaces/i18n-module-options.interface';

/**
 * Helper function to define i18n module options with type safety.
 *
 * Provides IDE autocomplete and type checking for configuration objects.
 *
 * @param config - The i18n module configuration object
 * @returns The same configuration object with proper typing
 *
 * @example
 * ```typescript
 * // i18n.config.ts
 * import { defineConfig } from '@stackra/react-i18n';
 *
 * export default defineConfig({
 *   defaultLanguage: env('VITE_DEFAULT_LOCALE', 'en'),
 *   languages: ['en', 'ar', 'es'],
 *   resolvers: ['storage', 'navigator'],
 *   debug: env('VITE_I18N_DEBUG', false),
 * });
 * ```
 */
export function defineConfig(config: Partial<I18nModuleOptions>): Partial<I18nModuleOptions> {
  return config;
}
