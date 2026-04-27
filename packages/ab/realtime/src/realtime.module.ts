/**
 * @fileoverview RealtimeModule — DI module for real-time WebSocket services.
 * @module @stackra/ts-realtime
 * @category Module
 */

import { Module, type DynamicModule } from '@stackra/ts-container';

import { REALTIME_CONFIG, REALTIME_MANAGER } from './constants/tokens.constant';
import { defaultRealtimeConfig } from './config/realtime.config';
import { RealtimeManager } from './services/realtime-manager.service';
import type { RealtimeConfig } from './interfaces/realtime-config.interface';

/**
 * DI module for the `@stackra/ts-realtime` package.
 *
 * Provides the `RealtimeManager` singleton, configuration token, and Symbol
 * alias following the standard `@stackra` module pattern. Call `forRoot()`
 * once in your root application module to configure the WebSocket connection.
 *
 * @description
 * The module merges the consumer-provided config with `defaultRealtimeConfig`
 * so that only required fields and explicit overrides need to be specified.
 * The module is registered as `global: true`, making the `RealtimeManager`
 * available to all modules without explicit imports.
 *
 * @example
 * ```typescript
 * import { Module } from '@stackra/ts-container';
 * import { RealtimeModule } from '@stackra/ts-realtime';
 *
 * @Module({
 *   imports: [
 *     RealtimeModule.forRoot({
 *       driver: 'pusher',
 *       key: 'my-app-key',
 *       wsHost: 'ws.example.com',
 *       wsPort: 6001,
 *       authEndpoint: '/broadcasting/auth',
 *       forceTLS: true,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern
export class RealtimeModule {
  /**
   * Configure the realtime WebSocket connection.
   *
   * Merges the provided config with `defaultRealtimeConfig` and registers:
   * - `REALTIME_CONFIG` — the merged configuration object
   * - `RealtimeManager` — the core service (class provider)
   * - `REALTIME_MANAGER` — Symbol alias (useExisting)
   *
   * @param config - The realtime configuration with required connection fields
   * @returns A global `DynamicModule` with all providers and exports
   *
   * @example
   * ```typescript
   * RealtimeModule.forRoot({
   *   driver: 'pusher',
   *   key: 'app-key',
   *   wsHost: 'ws.example.com',
   *   wsPort: 6001,
   *   authEndpoint: '/broadcasting/auth',
   * });
   * ```
   */
  static forRoot(config: RealtimeConfig): DynamicModule {
    const mergedConfig = { ...defaultRealtimeConfig, ...config };

    return {
      module: RealtimeModule,
      global: true,
      providers: [
        { provide: REALTIME_CONFIG, useValue: mergedConfig },
        { provide: RealtimeManager, useClass: RealtimeManager },
        { provide: REALTIME_MANAGER, useExisting: RealtimeManager },
      ],
      exports: [RealtimeManager, REALTIME_MANAGER, REALTIME_CONFIG],
    };
  }
}
