/**
 * Define Config Utility
 *
 * Helper function to define HTTP client options with type safety.
 * Follows the `defineConfig()` pattern popularized by Vite, Vitest,
 * and similar tools.
 *
 * @module utils/define-config
 */

import type { HttpClientConfig } from '@/interfaces/http-config.interface';

/**
 * Helper function to define HTTP client options with type safety.
 *
 * Provides IDE autocomplete and type checking for configuration objects.
 *
 * @param config - The HTTP client configuration object
 * @returns The same configuration object with proper typing
 *
 * @example
 * ```typescript
 * // http.config.ts
 * import { defineConfig } from '@stackra/ts-http';
 *
 * export default defineConfig({
 *   baseURL: env('VITE_API_URL', ''),
 *   timeout: env('VITE_API_TIMEOUT', 30000),
 *   headers: {
 *     Accept: 'application/json',
 *   },
 * });
 * ```
 */
export function defineConfig(config: HttpClientConfig): HttpClientConfig {
  return config;
}
