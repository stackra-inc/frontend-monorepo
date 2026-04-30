/**
 * @fileoverview Dependency injection tokens for the realtime module.
 * @module @stackra/ts-realtime
 * @category Constants
 */

/**
 * DI token for the realtime configuration object.
 *
 * Registered as a value provider by `RealtimeModule.forRoot()` and injected
 * into `RealtimeManager` via `@Inject(REALTIME_CONFIG)`.
 *
 * @description
 * Uses `Symbol.for()` to ensure a globally unique, cross-module token that
 * remains stable across different bundle chunks.
 *
 * @example
 * ```typescript
 * import { Inject } from '@stackra/ts-container';
 * import { REALTIME_CONFIG } from '@stackra/ts-realtime';
 *
 * constructor(@Inject(REALTIME_CONFIG) private readonly config: RealtimeConfig) {}
 * ```
 */
export const REALTIME_CONFIG = Symbol.for('REALTIME_CONFIG');

/**
 * DI token for the `RealtimeManager` service.
 *
 * Registered as a `useExisting` alias by `RealtimeModule.forRoot()` and used
 * by `RealtimeFacade`, `useChannel`, `usePresence`, and `useRealtime` to
 * resolve the manager from the container.
 *
 * @description
 * Uses `Symbol.for()` to ensure a globally unique, cross-module token that
 * remains stable across different bundle chunks.
 *
 * @example
 * ```typescript
 * import { Facade } from '@stackra/ts-support';
 * import { REALTIME_MANAGER } from '@stackra/ts-realtime';
 *
 * const facade = Facade.make<RealtimeManager>(REALTIME_MANAGER);
 * ```
 */
export const REALTIME_MANAGER = Symbol.for('REALTIME_MANAGER');

/**
 * DI token for the `RealtimeConnector` service.
 *
 * Registered as a class provider by `RealtimeModule.forRoot()` and injected
 * into `RealtimeManager` via `@Inject(REALTIME_CONNECTOR)`.
 *
 * @description
 * Uses `Symbol.for()` to ensure a globally unique, cross-module token that
 * remains stable across different bundle chunks.
 *
 * @example
 * ```typescript
 * import { Inject } from '@stackra/ts-container';
 * import { REALTIME_CONNECTOR } from '@stackra/ts-realtime';
 *
 * constructor(@Inject(REALTIME_CONNECTOR) private readonly connector: RealtimeConnector) {}
 * ```
 */
export const REALTIME_CONNECTOR = Symbol.for('REALTIME_CONNECTOR');
