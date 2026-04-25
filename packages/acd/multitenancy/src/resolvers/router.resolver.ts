/**
 * Router Resolver
 *
 * Resolves tenant ID from URL path segments.
 * Parses window.location.pathname directly — no React hooks required,
 * so it's safe to call from useEffect, async callbacks, or class methods.
 *
 * @example
 * ```ts
 * const resolver = new RouterResolver({
 *   tenantField: "tenantId",   // path segment name (default)
 *   pathBasedTenants: true,    // e.g. /acme/dashboard → "acme"
 * });
 * ```
 */

import type { BaseKey } from '@refinedev/core';
import type { TenantResolver } from '@/interfaces/tenant-resolver.interface';
import type { TenantConfig } from '@/interfaces/tenant-config.interface';
import { ResolverPriority } from '@/enums/resolver-priority.enum';

/**
 * Router Resolver
 *
 * Extracts tenant ID from URL path segments.
 * Works outside React context (no hooks).
 */
export class RouterResolver implements TenantResolver {
  readonly name = 'RouterResolver';
  readonly priority = ResolverPriority.NORMAL;

  private config: TenantConfig;

  constructor(config: TenantConfig) {
    this.config = config;
  }

  /**
   * Resolve tenant ID from URL path.
   *
   * Strategy:
   * 1. If `pathBasedTenants` is enabled, treats the first path segment as the tenant ID.
   * 2. Otherwise, looks for a `:tenantField` style segment by checking the domainMap
   *    or simply returns the first non-empty path segment.
   *
   * @returns Tenant ID string or undefined
   */
  resolve(): BaseKey | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }

    try {
      const pathname = window.location.pathname;
      const segments = pathname.split('/').filter(Boolean);

      if (segments.length === 0) {
        return undefined;
      }

      // If pathBasedTenants is enabled, the first segment is the tenant
      if (this.config.pathBasedTenants) {
        return segments[0];
      }

      // If a domainMap is configured with path keys, try to match
      if (this.config.domainMap) {
        for (const segment of segments) {
          const tenantId = this.config.domainMap[segment];
          if (tenantId !== undefined) {
            return tenantId;
          }
        }
      }

      // Fallback: return undefined — other resolvers in the chain will handle it
      return undefined;
    } catch (error) {
      console.warn('[RouterResolver] Error parsing URL path:', error);
      return undefined;
    }
  }
}

export default RouterResolver;
