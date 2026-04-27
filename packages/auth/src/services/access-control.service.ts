/**
 * @fileoverview Default AccessControlService implementation.
 *
 * Provides a fully functional access control service that checks
 * permissions against a backend API via the injected {@link HttpClient}
 * from `@stackra/ts-http`. Uses the {@link CacheService} from
 * `@stackra/ts-cache` to avoid redundant network requests for the
 * same resource/action pair.
 *
 * Users can override this by passing a custom `accessControlService`
 * to `AuthModule.forRoot()`. The custom service must implement
 * {@link IAccessControlService}.
 *
 * @module @stackra/react-auth
 * @category Services
 *
 * @example
 * ```typescript
 * // Uses the built-in AccessControlService automatically:
 * AuthModule.forRoot();
 *
 * // Or supply your own:
 * AuthModule.forRoot({ accessControlService: new MyCustomACL() });
 * ```
 */

import { Injectable, Inject } from "@stackra/ts-container";
import { HTTP_CLIENT } from "@stackra/ts-http";
import { CACHE_SERVICE } from "@stackra/ts-cache";
import type { HttpClient, HttpResponse } from "@stackra/ts-http";
import type { CacheService } from "@stackra/ts-cache";
import type { IAccessControlService } from "@/interfaces/access-control-service.interface";
import type { CanResponse } from "@/interfaces/can-response.interface";

/**
 * Cache TTL for permission check results (in seconds).
 * Cached results are considered stale after this duration.
 * @internal
 */
const ACL_CACHE_TTL = 30;

/**
 * Default access control service.
 *
 * Sends authorization checks to `POST /api/acl/can` and caches
 * results via the injected {@link CacheService} to reduce network
 * overhead. Cache entries are keyed by `acl:{resource}:{action}:{params}`
 * and expire after {@link ACL_CACHE_TTL} seconds.
 *
 * ### API Contract
 *
 * | Operation | Method | Endpoint       | Body                            | Response                           |
 * |-----------|--------|----------------|---------------------------------|------------------------------------|
 * | Can       | POST   | `/api/acl/can` | `{ resource, action, params? }` | `{ can: boolean, reason?: string }` |
 */
@Injectable()
export class AccessControlService implements IAccessControlService {
  /**
   * Create a new AccessControlService instance.
   *
   * @param http - The {@link HttpClient} instance injected via DI.
   *   Provided by `@stackra/ts-http` through `HttpModule.forRoot()`.
   * @param cache - The {@link CacheService} instance injected via DI.
   *   Provided by `@stackra/ts-cache` through `CacheModule.forRoot()`.
   *   When the cache module is not configured, this will be `undefined`
   *   and the service falls back to uncached requests.
   */
  constructor(
    @Inject(HTTP_CLIENT) private readonly http: HttpClient,
    @Inject(CACHE_SERVICE) private readonly cache?: CacheService,
  ) {}

  // ─── Private Helpers ─────────────────────────────────────────────

  /**
   * Build a deterministic cache key from the check parameters.
   *
   * @param resource - The resource name.
   * @param action - The action being checked.
   * @param params - Optional additional parameters.
   * @returns A namespaced string key for the cache.
   */
  private buildCacheKey(resource: string, action: string, params?: any): string {
    const paramStr = params ? JSON.stringify(params) : "";
    return `acl:${resource}:${action}:${paramStr}`;
  }

  // ─── IAccessControlService Implementation ────────────────────────

  /**
   * Check whether the current user can perform a given action on a resource.
   *
   * Sends a `POST /api/acl/can` request with `{ resource, action, params }`.
   * Results are cached via the injected {@link CacheService} for
   * {@link ACL_CACHE_TTL} seconds to avoid redundant network calls for
   * repeated checks (e.g. rendering a list of items with per-row action
   * buttons).
   *
   * On network failure, returns a **permissive** default (`{ can: true }`)
   * to avoid blocking the UI. Override this service if you need a
   * restrictive default.
   *
   * @param checkParams - The resource, action, and optional extra params.
   * @returns A {@link CanResponse} indicating whether the action is allowed.
   */
  async can(checkParams: { resource: string; action: string; params?: any }): Promise<CanResponse> {
    const { resource, action, params } = checkParams;
    const cacheKey = this.buildCacheKey(resource, action, params);

    /* Return cached result if available and the cache service is present */
    if (this.cache) {
      const cached = await this.cache.get<CanResponse>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response: HttpResponse<{ can: boolean; reason?: string }> = await this.http.post(
        "/api/acl/can",
        { resource, action, params },
      );

      const result: CanResponse = {
        can: response.data.can ?? true,
        reason: response.data.reason,
      };

      /* Store in cache if the cache service is present */
      if (this.cache) {
        await this.cache.put(cacheKey, result, ACL_CACHE_TTL);
      }

      return result;
    } catch (error: any) {
      /* If the server explicitly denied access (4xx), treat as forbidden */
      const status = error?.response?.status ?? error?.statusCode ?? 0;
      if (status >= 400 && status < 500) {
        const reason =
          error?.response?.data?.reason ??
          error?.response?.data?.message ??
          `Access denied (HTTP ${status})`;

        const result: CanResponse = { can: false, reason };

        if (this.cache) {
          await this.cache.put(cacheKey, result, ACL_CACHE_TTL);
        }

        return result;
      }

      /* Network error — permissive default to avoid blocking UI */
      return { can: true };
    }
  }
}
