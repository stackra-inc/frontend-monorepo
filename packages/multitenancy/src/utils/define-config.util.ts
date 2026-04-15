import type { MultiTenancyOptions } from '@/interfaces/multitenancy-options.interface';
import { defaultPreset } from '@/presets';

/**
 * Define configuration factory
 *
 * @description
 * Helper function to create a multi-tenancy configuration with defaults.
 * Merges the default preset with your custom options.
 *
 * @param options - Partial configuration options
 * @returns Complete configuration with defaults
 *
 * @example
 * ```typescript
 * import { defineConfig, subdomainPreset } from "@abdokouta/react-multitenancy";
 *
 * const config = defineConfig({
 *   ...subdomainPreset,
 *   baseDomain: "myapp.com",
 *   fetchTenants: async () => {
 *     const response = await fetch("/api/tenants");
 *     return await response.json();
 *   }
 * });
 * ```
 */
export function defineConfig(options: Partial<MultiTenancyOptions>): Partial<MultiTenancyOptions> {
  return {
    ...defaultPreset,
    ...options,
  };
}
