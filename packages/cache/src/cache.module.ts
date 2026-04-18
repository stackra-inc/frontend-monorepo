/**
 * Cache Module
 *
 * Registers:
 * - `CACHE_CONFIG` — raw config object
 * - `CacheManager` — created by DI so @Inject decorators fire
 * - `CACHE_MANAGER` — useExisting alias to CacheManager
 *
 * Users inject `CACHE_MANAGER` (or `CacheManager` directly) and call
 * `manager.store()` to get a `CacheService`, or use the `useCache()`
 * hook which does this automatically.
 *
 * @module cache.module
 */

import { Module, type DynamicModule } from '@stackra/ts-container';

import type { CacheModuleOptions } from '@/interfaces';
import { CacheManager } from '@/services/cache-manager.service';
import { CACHE_CONFIG, CACHE_MANAGER } from '@/constants/tokens.constant';

/**
 * CacheModule — provides multi-driver caching with DI integration.
 *
 * Follows the standard manager DI pattern:
 * - `CACHE_CONFIG` — raw config object
 * - `CacheManager` — class-based injection
 * - `CACHE_MANAGER` — useExisting alias
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     CacheModule.forRoot({
 *       default: 'memory',
 *       stores: {
 *         memory: { driver: 'memory', maxSize: 100 },
 *         redis: { driver: 'redis', connection: 'cache' },
 *       },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern requires static methods
export class CacheModule {
  /**
   * Configure the cache module with runtime configuration.
   *
   * Registers three providers as global singletons:
   *
   * 1. `CACHE_CONFIG` — the raw {@link CacheModuleOptions} object, available
   *    for injection by any service that needs to read cache configuration.
   * 2. `CacheManager` — the class-based provider, created by the DI container
   *    so that `@Inject` decorators on its constructor are resolved.
   * 3. `CACHE_MANAGER` — a token-based alias pointing to the same CacheManager
   *    instance, for consumers who prefer token injection.
   *
   * The returned module is marked `global: true`, so these providers are
   * available throughout the application without re-importing.
   *
   * @param config - Cache configuration defining the default store name,
   *   all available store configurations, and an optional global key prefix
   * @returns A DynamicModule with all cache providers registered and exported
   *
   * @example
   * ```typescript
   * @Module({
   *   imports: [
   *     CacheModule.forRoot({
   *       default: 'memory',
   *       stores: {
   *         memory: { driver: 'memory', maxSize: 100 },
   *         redis: { driver: 'redis', connection: 'cache' },
   *       },
   *       prefix: 'app_',
   *     }),
   *   ],
   * })
   * export class AppModule {}
   * ```
   */
  static forRoot(config: CacheModuleOptions): DynamicModule {
    return {
      module: CacheModule,
      global: true,
      providers: [
        { provide: CACHE_CONFIG, useValue: config },
        { provide: CacheManager, useClass: CacheManager },
        { provide: CACHE_MANAGER, useExisting: CacheManager },
      ],
      exports: [CacheManager, CACHE_MANAGER, CACHE_CONFIG],
    };
  }
}
