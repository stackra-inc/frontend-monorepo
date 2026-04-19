/**
 * defineConfig Helper
 *
 * |--------------------------------------------------------------------------
 * | Type-safe config factory for @stackra-inc/ts-pwa.
 * |--------------------------------------------------------------------------
 * |
 * | Provides IntelliSense and type checking for the PWA config file.
 * | Returns the config object unchanged — it's purely a type helper.
 * |
 * | Usage:
 * |   import { defineConfig } from "@stackra-inc/ts-pwa";
 * |
 * |   export default defineConfig({
 * |     vite: { manifest: { name: "My App" } },
 * |     install: { delay: 30000 },
 * |   });
 * |
 * @module pwa/utils/define-config
 */

import type { PwaModuleOptions } from '@/interfaces/pwa-module-options.interface';

/**
 * Type-safe config factory for PWA configuration.
 *
 * @param config — the PWA module options
 * @returns the same config object (identity function for type inference)
 */
export function defineConfig(config: PwaModuleOptions): PwaModuleOptions {
  return config;
}
