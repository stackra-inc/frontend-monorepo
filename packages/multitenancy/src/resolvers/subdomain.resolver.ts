import type { BaseKey } from '@refinedev/core';
import { ResolverPriority } from '@/enums';
import type { TenantConfig, TenantResolver } from '@/interfaces';

/**
 * Resolver that extracts tenant ID from subdomain.
 *
 * @description
 * This resolver extracts the first segment of the hostname as the tenant identifier.
 * For example, `acme.example.com` → `acme`.
 *
 * Supports optional subdomain mapping via configuration, allowing you to map
 * subdomains to different tenant IDs. For example, `acme` → `tenant-123`.
 *
 * This resolver is SSR-safe and will return undefined when running on the server.
 *
 * @example
 * ```typescript
 * import { SubdomainResolver } from "@stackra/react-multitenancy";
 *
 * // Without mapping (subdomain is tenant ID)
 * const resolver = new SubdomainResolver({
 *   mode: TenantMode.FILTER,
 *   resolvers: ["subdomain"],
 * });
 *
 * // URL: acme.example.com
 * const tenantId = resolver.resolve(); // "acme"
 * ```
 *
 * @example
 * ```typescript
 * // With subdomain mapping
 * const resolver = new SubdomainResolver({
 *   mode: TenantMode.FILTER,
 *   resolvers: ["subdomain"],
 *   subdomainMap: {
 *     acme: "tenant-123",
 *     globex: "tenant-456",
 *   },
 * });
 *
 * // URL: acme.example.com
 * const tenantId = resolver.resolve(); // "tenant-123"
 * ```
 *
 * @remarks
 * - Priority: HIGH (2)
 * - Performance: ~0ms (string manipulation)
 * - SSR-safe: returns undefined when window is not available
 * - Handles www subdomain variants
 * - Returns undefined for single-segment hostnames (e.g., localhost)
 *
 * @public
 */
export class SubdomainResolver implements TenantResolver {
  /**
   * Unique identifier for this resolver.
   */
  public readonly name = 'subdomain';

  /**
   * Priority level (HIGH = 2).
   */
  public readonly priority = ResolverPriority.HIGH;

  /**
   * Creates a new SubdomainResolver instance.
   *
   * @param config - Tenant configuration containing optional subdomainMap
   */
  constructor(private readonly config: TenantConfig) {}

  /**
   * Resolves tenant ID from subdomain.
   *
   * @returns Tenant ID from subdomain, or undefined if not found or running on server
   */
  public resolve(): BaseKey | undefined {
    // Check if running in browser
    if (typeof window === 'undefined') {
      return undefined;
    }

    // Extract hostname
    const hostname = window.location.hostname;

    // Split hostname by dots
    const parts = hostname.split('.');

    // Need at least 2 segments (subdomain.domain)
    if (parts.length < 2) {
      return undefined;
    }

    // Extract first segment as subdomain
    const subdomain = parts[0];

    // Skip www subdomain
    if (subdomain === 'www') {
      return undefined;
    }

    // If subdomainMap exists, lookup subdomain
    if (this.config.subdomainMap && subdomain) {
      return this.config.subdomainMap[subdomain];
    }

    // Otherwise, return subdomain as-is
    return subdomain;
  }
}
