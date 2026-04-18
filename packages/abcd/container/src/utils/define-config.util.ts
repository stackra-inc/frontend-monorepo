/**
 * defineConfig Utility
 *
 * Type-safe configuration helper for `Application.create()` options.
 * Follows the same `defineConfig` pattern used by Vite, Vitest, and other
 * modern tooling — the function is an identity function that exists purely
 * to provide IDE autocomplete and TypeScript inference on the config object.
 *
 * @module utils/define-config
 */

import type { ApplicationOptions } from '@/interfaces/application-options.interface';

/**
 * Define a type-safe application configuration object.
 *
 * This is a pure identity function — it returns the config as-is.
 * Its only purpose is to give TypeScript full type inference and IDE
 * autocomplete when writing the configuration outside of the
 * `Application.create()` call.
 *
 * @param config - The application options to validate and return
 * @returns The same config object, fully typed as `ApplicationOptions`
 *
 * @example
 * ```typescript
 * // container.config.ts
 * import { defineConfig } from '@stakra/ts-container';
 *
 * export default defineConfig({
 *   debug: import.meta.env.DEV,
 *   globalName: '__APP__',
 *   config: {
 *     apiUrl: import.meta.env.VITE_API_URL,
 *     featureFlags: {
 *       newCheckout: import.meta.env.VITE_FF_NEW_CHECKOUT === 'true',
 *     },
 *   },
 *   onReady: async (app) => {
 *     console.log('Application bootstrapped');
 *   },
 * });
 *
 * // main.ts
 * import { Application } from '@stakra/ts-container';
 * import containerConfig from './container.config';
 *
 * const app = await Application.create(AppModule, containerConfig);
 * ```
 */
export function defineConfig(config: ApplicationOptions): ApplicationOptions {
  return config;
}
