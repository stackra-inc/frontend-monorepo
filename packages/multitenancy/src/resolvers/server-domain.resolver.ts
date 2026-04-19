import type { BaseKey } from '@refinedev/core';

import { ResolverPriority } from '@/enums';
import type { TenantResolver } from '@/interfaces';

/**
 * Resolver that reads tenant ID from server-injected HTML meta tag.
 *
 * @description
 * This resolver provides zero-latency tenant resolution by reading the tenant ID
 * from a meta tag that was injected by the server during HTML generation.
 * This is the fastest resolution method (~0ms) as it requires no API calls or
 * complex logic.
 *
 * The server middleware should inject a meta tag like:
 * `<meta name="tenant-id" content="tenant-123" />`
 *
 * This resolver is SSR-safe and will return undefined when running on the server.
 *
 * @example
 * ```typescript
 * import { ServerDomainResolver } from "@stackra-inc/react-multitenancy";
 *
 * const resolver = new ServerDomainResolver();
 * const tenantId = resolver.resolve();
 * console.log("Tenant ID:", tenantId);
 * ```
 *
 * @example
 * ```typescript
 * // Server-side implementation (Express.js)
 * app.use(async (req, res, next) => {
 *   const hostname = req.hostname;
 *   const tenantId = await resolveTenantFromDomain(hostname);
 *
 *   if (tenantId) {
 *     const originalSend = res.send;
 *     res.send = function(data) {
 *       if (typeof data === "string" && data.includes("</head>")) {
 *         data = data.replace(
 *           "</head>",
 *           `<meta name="tenant-id" content="${tenantId}" />\n</head>`
 *         );
 *       }
 *       return originalSend.call(this, data);
 *     };
 *   }
 *   next();
 * });
 * ```
 *
 * @remarks
 * - Priority: HIGHEST (1) - tried first in resolver chain
 * - Performance: ~0ms (DOM query)
 * - SSR-safe: returns undefined when window is not available
 * - No caching needed: value is already in DOM
 * - Requires server-side implementation to inject meta tag
 *
 * @public
 */
export class ServerDomainResolver implements TenantResolver {
  /**
   * Unique identifier for this resolver.
   */
  public readonly name = 'server-domain';

  /**
   * Priority level (HIGHEST = 1).
   */
  public readonly priority = ResolverPriority.HIGHEST;

  /**
   * Resolves tenant ID from server-injected meta tag.
   *
   * @returns Tenant ID from meta tag, or undefined if not found or running on server
   */
  public resolve(): BaseKey | undefined {
    // Check if running in browser
    if (typeof window === 'undefined') {
      return undefined;
    }

    // Query for meta tag with name="tenant-id"
    const metaTag = document.querySelector<HTMLMetaElement>('meta[name="tenant-id"]');

    // Return content attribute value if found
    return metaTag?.content || undefined;
  }
}
