import type { BaseKey } from '@refinedev/core';
import { ResolverPriority } from '@/enums';
import type { TenantConfig, TenantResolver } from '@/interfaces';

/**
 * Resolver that reads tenant ID from localStorage (for header-based APIs).
 *
 * @description
 * This resolver reads the tenant ID from localStorage, where it was previously
 * stored by the setTenant operation. This is used for header-based multi-tenancy
 * where the tenant ID is sent as an HTTP header.
 *
 * The storage key is derived from the configured header name:
 * `refine-tenant-{headerName}`
 *
 * This resolver is SSR-safe and will return undefined when localStorage is not available.
 *
 * @example
 * ```typescript
 * import { HeaderResolver } from "@stackra-inc/react-multitenancy";
 *
 * // With default header name (X-Tenant-ID)
 * const resolver = new HeaderResolver({
 *   mode: TenantMode.HEADER,
 *   resolvers: ["header"],
 * });
 *
 * // Reads from localStorage key: "refine-tenant-X-Tenant-ID"
 * const tenantId = resolver.resolve();
 * ```
 *
 * @example
 * ```typescript
 * // With custom header name
 * const resolver = new HeaderResolver({
 *   mode: TenantMode.HEADER,
 *   resolvers: ["header"],
 *   headerName: "X-Organization-ID",
 * });
 *
 * // Reads from localStorage key: "refine-tenant-X-Organization-ID"
 * const tenantId = resolver.resolve();
 * ```
 *
 * @example
 * ```typescript
 * // With custom storage implementation
 * class CustomStorage implements Storage {
 *   private data = new Map<string, string>();
 *
 *   get length() { return this.data.size; }
 *   clear() { this.data.clear(); }
 *   getItem(key: string) { return this.data.get(key) ?? null; }
 *   setItem(key: string, value: string) { this.data.set(key, value); }
 *   removeItem(key: string) { this.data.delete(key); }
 *   key(index: number) { return Array.from(this.data.keys())[index] ?? null; }
 * }
 *
 * const resolver = new HeaderResolver(config, new CustomStorage());
 * ```
 *
 * @remarks
 * - Priority: LOW (4)
 * - Performance: ~0ms (localStorage read)
 * - SSR-safe: returns undefined when localStorage is not available
 * - Default header name: "X-Tenant-ID"
 * - Storage key format: `refine-tenant-{headerName}`
 * - Supports custom Storage implementation
 *
 * @public
 */
export class HeaderResolver implements TenantResolver {
  /**
   * Unique identifier for this resolver.
   */
  public readonly name = 'header';

  /**
   * Priority level (LOW = 4).
   */
  public readonly priority = ResolverPriority.LOW;

  /**
   * Storage key for tenant ID.
   */
  private readonly storageKey: string;

  /**
   * Storage implementation (defaults to localStorage).
   */
  private readonly storage: Storage | undefined;

  /**
   * Creates a new HeaderResolver instance.
   *
   * @param config - Tenant configuration containing optional headerName
   * @param storage - Optional custom Storage implementation (defaults to localStorage)
   */
  constructor(config: TenantConfig, storage?: Storage) {
    const headerName = config.headerName || 'X-Tenant-ID';
    this.storageKey = `refine-tenant-${headerName}`;
    this.storage = storage || (typeof window !== 'undefined' ? window.localStorage : undefined);
  }

  /**
   * Resolves tenant ID from localStorage.
   *
   * @returns Tenant ID from localStorage, or undefined if not found or storage not available
   */
  public resolve(): BaseKey | undefined {
    // Check if storage is available
    if (!this.storage) {
      return undefined;
    }

    try {
      // Read value from storage
      const value = this.storage.getItem(this.storageKey);

      // Return value or undefined
      return value || undefined;
    } catch (error) {
      // Storage access might fail (e.g., in private browsing mode)
      console.warn(`[MultiTenancy] Failed to read from storage:`, error);
      return undefined;
    }
  }
}
