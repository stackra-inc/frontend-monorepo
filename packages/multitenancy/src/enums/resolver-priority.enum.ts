/**
 * Resolver priority enum for determining the order of tenant resolution.
 *
 * @description
 * When multiple resolvers are configured, they are tried in priority order
 * (lower number = higher priority). The first resolver that returns a value wins.
 *
 * @example
 * ```typescript
 * import { ResolverPriority } from "@stackra/react-multitenancy";
 *
 * class CustomResolver implements TenantResolver {
 *   name = "custom";
 *   priority = ResolverPriority.HIGHEST; // Try this first
 *
 *   resolve() {
 *     // Custom logic
 *   }
 * }
 * ```
 *
 * @public
 */
export enum ResolverPriority {
  /**
   * Highest priority - tried first.
   *
   * @description
   * Use for resolvers that should always take precedence.
   *
   * @example
   * - Custom domain resolver (acme.com → tenant-123)
   * - Server-injected tenant (from meta tag)
   * - JWT token claims
   *
   * @remarks
   * Priority value: 1
   */
  HIGHEST = 1,

  /**
   * High priority - tried second.
   *
   * @description
   * Use for important resolvers that should be checked early.
   *
   * @example
   * - Subdomain resolver (acme.example.com → tenant-123)
   * - API-based domain lookup
   *
   * @remarks
   * Priority value: 2
   */
  HIGH = 2,

  /**
   * Normal priority - tried third (default).
   *
   * @description
   * Use for standard resolvers.
   *
   * @example
   * - Router parameter resolver (/:tenantId/products)
   * - Query parameter resolver (?tenant_id=tenant-123)
   *
   * @remarks
   * Priority value: 3
   */
  NORMAL = 3,

  /**
   * Low priority - tried fourth.
   *
   * @description
   * Use for fallback resolvers.
   *
   * @example
   * - LocalStorage resolver
   * - Cookie resolver
   * - Header resolver (from localStorage)
   *
   * @remarks
   * Priority value: 4
   */
  LOW = 4,

  /**
   * Lowest priority - tried last.
   *
   * @description
   * Use for last-resort resolvers.
   *
   * @example
   * - Default tenant resolver
   * - Fallback to config value
   *
   * @remarks
   * Priority value: 5
   */
  LOWEST = 5,
}
