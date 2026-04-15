/**
 * Dynamic Domain Resolver
 *
 * Resolves tenant ID by calling an API endpoint with the current domain.
 * Implements caching with TTL using @abdokouta/react-cache to reduce API calls.
 *
 * @example
 * ```tsx
 * import { CacheService } from '@abdokouta/react-cache';
 *
 * const resolver = new DynamicDomainResolver({
 *   apiUrl: "https://api.example.com/tenants/resolve",
 *   cacheTTL: 300000, // 5 minutes
 *   cacheService: cacheService, // Optional: use shared cache service
 * });
 * ```
 */

import type { TenantResolver } from '@/interfaces/tenant-resolver.interface';
import { ResolverPriority } from '@/enums/resolver-priority.enum';

/**
 * Configuration for DynamicDomainResolver
 */
export interface DynamicDomainResolverConfig {
  /**
   * API endpoint to call for tenant resolution
   * Should accept domain as query parameter
   *
   * @example "https://api.example.com/tenants/resolve"
   */
  apiUrl: string;

  /**
   * Cache TTL in seconds
   *
   * @default 300 (5 minutes)
   */
  cacheTTL?: number;

  /**
   * Query parameter name for domain
   *
   * @default "domain"
   */
  domainParam?: string;

  /**
   * Custom headers to include in API request
   */
  headers?: Record<string, string>;

  /**
   * Response path to tenant ID
   * Use dot notation for nested properties
   *
   * @default "tenantId"
   * @example "data.tenant.id"
   */
  responsePath?: string;

  /**
   * Optional cache service instance from @abdokouta/react-cache
   * If not provided, uses in-memory Map cache
   *
   * @example
   * ```typescript
   * import { CacheService } from '@abdokouta/react-cache';
   *
   * const resolver = new DynamicDomainResolver({
   *   apiUrl: '/api/tenants/resolve',
   *   cacheService: cacheService,
   * });
   * ```
   */
  cacheService?: any; // CacheService from @abdokouta/react-cache
}

/**
 * Dynamic Domain Resolver
 *
 * Calls an API endpoint to resolve tenant ID from domain.
 * Caches results using @abdokouta/react-cache to minimize API calls.
 * Falls back to in-memory cache if cache service is not provided.
 */
export class DynamicDomainResolver implements TenantResolver {
  readonly name = 'DynamicDomainResolver';
  readonly priority = ResolverPriority.HIGHEST;

  private cacheService?: any;
  private memoryCache: Map<string, { value: string; expiresAt: number }> = new Map();
  private config: Required<Omit<DynamicDomainResolverConfig, 'cacheService'>>;

  constructor(config: DynamicDomainResolverConfig) {
    this.config = {
      apiUrl: config.apiUrl,
      cacheTTL: config.cacheTTL ?? 300, // 5 minutes in seconds
      domainParam: config.domainParam ?? 'domain',
      headers: config.headers ?? {},
      responsePath: config.responsePath ?? 'tenantId',
    };

    this.cacheService = config.cacheService;
  }

  /**
   * Resolve tenant ID from current domain via API call
   */
  async resolve(): Promise<string | undefined> {
    // Check if running in browser
    if (typeof window === 'undefined') {
      return undefined;
    }

    try {
      const hostname = window.location.hostname;
      const cacheKey = `multitenancy:domain:${hostname}`;

      // Check cache first
      const cached = await this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      // Call API
      const tenantId = await this.fetchTenantId(hostname);

      // Cache result
      if (tenantId) {
        await this.setCached(cacheKey, tenantId);
      }

      return tenantId;
    } catch (error) {
      console.error('[DynamicDomainResolver] Error resolving tenant:', error);
      return undefined;
    }
  }

  /**
   * Get cached value if not expired
   */
  private async getCached(key: string): Promise<string | undefined> {
    // Use cache service if available
    if (this.cacheService) {
      try {
        return await this.cacheService.get(key);
      } catch (error) {
        console.warn('[DynamicDomainResolver] Cache service error:', error);
        // Fall through to memory cache
      }
    }

    // Fall back to memory cache
    const entry = this.memoryCache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Set cached value with expiration
   */
  private async setCached(key: string, value: string): Promise<void> {
    // Use cache service if available
    if (this.cacheService) {
      try {
        await this.cacheService.put(key, value, this.config.cacheTTL);
        return;
      } catch (error) {
        console.warn('[DynamicDomainResolver] Cache service error:', error);
        // Fall through to memory cache
      }
    }

    // Fall back to memory cache
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + this.config.cacheTTL * 1000, // Convert seconds to milliseconds
    });
  }

  /**
   * Fetch tenant ID from API
   */
  private async fetchTenantId(domain: string): Promise<string | undefined> {
    const url = new URL(this.config.apiUrl);
    url.searchParams.set(this.config.domainParam, domain);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract tenant ID using response path
    return this.extractValue(data, this.config.responsePath);
  }

  /**
   * Extract value from object using dot notation path
   */
  private extractValue(obj: any, path: string): string | undefined {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return typeof value === 'string' ? value : undefined;
  }

  /**
   * Clear all cached entries
   */
  async clearCache(): Promise<void> {
    if (this.cacheService) {
      try {
        // Clear all multitenancy domain cache entries
        // Note: This requires cache service to support pattern-based clearing
        // For now, we just clear the memory cache
        await this.cacheService.flush();
      } catch (error) {
        console.warn('[DynamicDomainResolver] Cache service error:', error);
      }
    }

    this.memoryCache.clear();
  }

  /**
   * Clear cache for specific domain
   */
  async clearCacheForDomain(domain: string): Promise<void> {
    const cacheKey = `multitenancy:domain:${domain}`;

    if (this.cacheService) {
      try {
        await this.cacheService.forget(cacheKey);
      } catch (error) {
        console.warn('[DynamicDomainResolver] Cache service error:', error);
      }
    }

    this.memoryCache.delete(cacheKey);
  }
}

export default DynamicDomainResolver;
