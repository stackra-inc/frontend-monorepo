/**
 * Cache Facade
 *
 * Typed proxy for {@link CacheManager} from `@stackra/ts-cache`.
 *
 * Multi-driver cache orchestrator. Manages named stores (memory, redis, null).
 *
 * The facade is a module-level constant typed as `CacheManager`.
 * It lazily resolves the service from the DI container on first property
 * access — safe to use at module scope before bootstrap completes.
 *
 * ## Setup (once, in main.tsx)
 *
 * ```typescript
 * import { Application } from '@stackra/ts-container';
 * import { Facade } from '@stackra/ts-support';
 *
 * const app = await Application.create(AppModule);
 * Facade.setApplication(app); // wires all facades
 * ```
 *
 * ## Usage
 *
 * ```typescript
 * import { CacheFacade } from '@stackra/ts-cache';
 *
 * // Full autocomplete — no .proxy() call needed
 * CacheFacade.store();
 * ```
 *
 * ## Available methods (from {@link CacheManager})
 *
 * - `store(name?: string): CacheService`
 * - `extend(driver: string, creator: DriverCreator<Store>): this`
 * - `getDefaultInstance(): string`
 *
 * ## Testing — swap in a mock
 *
 * ```typescript
 * import { Facade } from '@stackra/ts-support';
 * import { CACHE_MANAGER } from '@/constants/tokens.constant';
 *
 * // Before test — replace the resolved instance
 * Facade.swap(CACHE_MANAGER, mockInstance);
 *
 * // After test — restore
 * Facade.clearResolvedInstances();
 * ```
 *
 * @module facades/cache
 * @see {@link CacheManager} — the underlying service
 * @see {@link Facade} — the base class providing `make()`
 */

import { Facade } from '@stackra/ts-support';
import { CacheManager } from '@/services/cache-manager.service';
import { CACHE_MANAGER } from '@/constants/tokens.constant';

/**
 * CacheFacade — typed proxy for {@link CacheManager}.
 *
 * Resolves `CacheManager` from the DI container via the `CACHE_MANAGER` token.
 * All property and method access is forwarded to the resolved instance
 * with correct `this` binding.
 *
 * Call `Facade.setApplication(app)` once during bootstrap before using this.
 *
 * @example
 * ```typescript
 * CacheFacade.store();
 * ```
 */
export const CacheFacade: CacheManager = Facade.make<CacheManager>(CACHE_MANAGER);
