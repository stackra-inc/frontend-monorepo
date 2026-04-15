import { TenantMode } from '@/enums';
import type { TenantConfig } from '@/interfaces';

/**
 * Loads tenant configuration from JSON string or object.
 *
 * @description
 * Accepts either a TenantConfig object or a JSON string and returns
 * a TenantConfig object. This allows configuration to be loaded from
 * JSON files, environment variables, or API responses.
 *
 * @param config - Tenant configuration as object or JSON string
 * @returns Parsed TenantConfig object
 *
 * @example
 * ```typescript
 * import { loadTenantConfig } from "@abdokouta/react-multitenancy";
 *
 * // From object
 * const config = loadTenantConfig({
 *   mode: "filter",
 *   resolvers: ["router"],
 * });
 *
 * // From JSON string
 * const jsonConfig = '{"mode":"header","resolvers":["subdomain"]}';
 * const config = loadTenantConfig(jsonConfig);
 *
 * // From JSON file
 * import configJson from "./tenant.config.json";
 * const config = loadTenantConfig(configJson);
 * ```
 *
 * @public
 */
export function loadTenantConfig(config: TenantConfig | string): TenantConfig {
  if (typeof config === 'string') {
    return JSON.parse(config) as TenantConfig;
  }
  return config;
}

/**
 * Validates tenant configuration.
 *
 * @description
 * Checks that the configuration has all required properties and that
 * values are valid. Throws descriptive errors if validation fails.
 *
 * Validation rules:
 * - `mode` must be present and a valid TenantMode enum value
 * - `resolvers` must be a non-empty array
 *
 * @param config - Tenant configuration to validate
 * @throws {Error} If configuration is invalid
 *
 * @example
 * ```typescript
 * import { validateTenantConfig } from "@abdokouta/react-multitenancy";
 *
 * try {
 *   validateTenantConfig(config);
 *   console.log("Configuration is valid");
 * } catch (error) {
 *   console.error("Invalid configuration:", error.message);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // This will throw an error
 * validateTenantConfig({
 *   mode: "invalid" as any,
 *   resolvers: [],
 * });
 * // Error: Invalid tenant mode: "invalid". Valid modes are: filter, header, url, query
 * ```
 *
 * @public
 */
export function validateTenantConfig(config: TenantConfig): void {
  // Check mode exists
  if (!config.mode) {
    throw new Error(
      'Tenant config must have a mode. ' +
        `Valid modes are: ${Object.values(TenantMode).join(', ')}`
    );
  }

  // Check mode is valid
  if (!Object.values(TenantMode).includes(config.mode)) {
    throw new Error(
      `Invalid tenant mode: "${config.mode}". ` +
        `Valid modes are: ${Object.values(TenantMode).join(', ')}`
    );
  }

  // Check resolvers array exists and is not empty
  if (!config.resolvers || config.resolvers.length === 0) {
    throw new Error(
      'Tenant config must have at least one resolver. ' +
        'Available resolvers: server-domain, dynamic-domain, domain, subdomain, router, header, query'
    );
  }
}
