/**
 * Define Config Utility
 *
 * Helper function to define Eloquent ORM options with type safety.
 * Follows the `defineConfig()` pattern popularized by Vite, Vitest,
 * and similar tools.
 *
 * @module utils/define-config
 */

import type { ConnectionConfig } from '@/connection/connection.types';

/**
 * Helper function to define Eloquent connection options with type safety.
 *
 * Provides IDE autocomplete and type checking for configuration objects.
 *
 * @param config - The Eloquent connection configuration object
 * @returns The same configuration object with proper typing
 *
 * @example
 * ```typescript
 * // eloquent.config.ts
 * import { defineConfig } from '@stackra/ts-eloquent';
 *
 * export default defineConfig({
 *   default: env('VITE_DB_CONNECTION', 'supabase'),
 *   connections: {
 *     supabase: {
 *       driver: 'supabase',
 *       url: env('VITE_SUPABASE_URL', ''),
 *       anonKey: env('VITE_SUPABASE_ANON_KEY', ''),
 *     },
 *   },
 * });
 * ```
 */
export function defineConfig(config: ConnectionConfig): ConnectionConfig {
  return config;
}
