import type { BaseKey } from '@refinedev/core';
import type { TenantResolver } from '@/interfaces/tenant-resolver.interface';
import type { TenantConfig } from '@/interfaces/tenant-config.interface';
import { ResolverPriority } from '@/enums/resolver-priority.enum';

/**
 * Domain resolver
 * Handles multiple domain patterns:
 * 1. Custom domain per tenant: acme.com → tenant-123
 * 2. Subdomain: acme.example.com → tenant-123
 * 3. Path-based: example.com/acme → tenant-123
 *
 * @example
 * ```json
 * {
 *   "domainMap": {
 *     "acme.com": "tenant-123",
 *     "acme.example.com": "tenant-123",
 *     "globex.io": "tenant-456"
 *   }
 * }
 * ```
 */
export class DomainResolver implements TenantResolver {
  name = 'domain';
  priority = ResolverPriority.HIGHEST; // Check custom domains first

  constructor(private config: TenantConfig) {}

  resolve(): BaseKey | undefined {
    if (typeof window === 'undefined') return undefined;

    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // 1. Try exact domain match (custom domain)
    // Example: acme.com → tenant-123
    if (this.config.domainMap && this.config.domainMap[hostname]) {
      return this.config.domainMap[hostname];
    }

    // 2. Try subdomain match
    // Example: acme.example.com → tenant-123
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const subdomain = parts[0];
      if (!subdomain) return undefined;

      const subdomainKey = `${subdomain}.${this.config.baseDomain || parts.slice(1).join('.')}`;

      if (this.config.domainMap && this.config.domainMap[subdomainKey]) {
        return this.config.domainMap[subdomainKey];
      }

      // Also check if subdomain itself is mapped
      if (this.config.subdomainMap && this.config.subdomainMap[subdomain]) {
        return this.config.subdomainMap[subdomain];
      }
    }

    // 3. Try path-based match
    // Example: example.com/acme → tenant-123
    if (this.config.pathBasedTenants) {
      const pathParts = pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        const firstPath = pathParts[0];

        if (firstPath && this.config.domainMap && this.config.domainMap[firstPath]) {
          return this.config.domainMap[firstPath];
        }

        // Return first path segment as tenant ID if no mapping
        return firstPath || undefined;
      }
    }

    return undefined;
  }
}
