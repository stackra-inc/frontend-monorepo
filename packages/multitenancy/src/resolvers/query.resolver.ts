import type { BaseKey } from '@refinedev/core';
import { ResolverPriority } from '@/enums';
import type { TenantConfig, TenantResolver } from '@/interfaces';

/**
 * Resolver that extracts tenant ID from URL query parameters.
 *
 * @description
 * This resolver parses the URL query string and extracts the tenant ID from
 * a configured parameter. Default parameter name is "tenant_id".
 *
 * Example: `https://example.com/products?tenant_id=tenant-123` → `tenant-123`
 *
 * This resolver is SSR-safe and will return undefined when running on the server.
 *
 * @example
 * ```typescript
 * import { QueryResolver } from "@stackra-inc/react-multitenancy";
 *
 * // With default parameter name (tenant_id)
 * const resolver = new QueryResolver({
 *   mode: TenantMode.FILTER,
 *   resolvers: ["query"],
 * });
 *
 * // URL: https://example.com/products?tenant_id=tenant-123
 * const tenantId = resolver.resolve(); // "tenant-123"
 * ```
 *
 * @example
 * ```typescript
 * // With custom parameter name
 * const resolver = new QueryResolver({
 *   mode: TenantMode.FILTER,
 *   resolvers: ["query"],
 *   queryParam: "org_id",
 * });
 *
 * // URL: https://example.com/products?org_id=org-456
 * const tenantId = resolver.resolve(); // "org-456"
 * ```
 *
 * @remarks
 * - Priority: NORMAL (3)
 * - Performance: ~0ms (URLSearchParams parsing)
 * - SSR-safe: returns undefined when window is not available
 * - Default parameter name: "tenant_id"
 * - Configurable via `queryParam` in TenantConfig
 *
 * @public
 */
export class QueryResolver implements TenantResolver {
  /**
   * Unique identifier for this resolver.
   */
  public readonly name = 'query';

  /**
   * Priority level (NORMAL = 3).
   */
  public readonly priority = ResolverPriority.NORMAL;

  /**
   * Query parameter name to extract tenant ID from.
   */
  private readonly paramName: string;

  /**
   * Creates a new QueryResolver instance.
   *
   * @param config - Tenant configuration containing optional queryParam
   */
  constructor(config: TenantConfig) {
    this.paramName = config.queryParam || 'tenant_id';
  }

  /**
   * Resolves tenant ID from URL query parameter.
   *
   * @returns Tenant ID from query parameter, or undefined if not found or running on server
   */
  public resolve(): BaseKey | undefined {
    // Check if running in browser
    if (typeof window === 'undefined') {
      return undefined;
    }

    // Parse query string
    const params = new URLSearchParams(window.location.search);

    // Extract configured parameter
    const value = params.get(this.paramName);

    // Return value or undefined
    return value || undefined;
  }
}
