/**
 * @fileoverview RealtimeModule — DI module for real-time WebSocket services.
 * @module @stackra/ts-realtime
 * @category Module
 */

import { Module, type DynamicModule } from '@stackra/ts-container';

import { REALTIME_CONFIG, REALTIME_MANAGER, REALTIME_CONNECTOR } from './constants/tokens.constant';
import { RealtimeManager } from './services/realtime-manager.service';
import { LaravelEchoConnector } from './connectors/laravel-echo.connector';
import type { RealtimeConfig } from './interfaces/realtime-config.interface';

/**
 * DI module for the `@stackra/ts-realtime` package.
 *
 * Provides the `RealtimeManager` singleton, configuration token, connector,
 * and Symbol alias following the standard `@stackra` module pattern. Call
 * `forRoot()` once in your root application module to configure realtime
 * connections.
 *
 * @description
 * The module registers the provided config directly (no merging with defaults)
 * and sets `global` based on `config.isGlobal` (defaults to `true`), making
 * the `RealtimeManager` available to all modules without explicit imports.
 *
 * @example
 * ```typescript
 * import { Module } from '@stackra/ts-container';
 * import { RealtimeModule } from '@stackra/ts-realtime';
 *
 * @Module({
 *   imports: [
 *     RealtimeModule.forRoot({
 *       default: 'main',
 *       connections: {
 *         main: {
 *           driver: 'echo',
 *           key: 'my-app-key',
 *           wsHost: 'ws.example.com',
 *           wsPort: 6001,
 *           authEndpoint: '/broadcasting/auth',
 *           forceTLS: true,
 *         },
 *       },
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
   * Configure the realtime WebSocket connections.
   *
   * Registers:
   * - `REALTIME_CONFIG` — the configuration object
   * - `RealtimeManager` — the core service (class provider)
   * - `REALTIME_MANAGER` — Symbol alias (useExisting)
   * - `REALTIME_CONNECTOR` — the connector factory (useClass: LaravelEchoConnector)
   *
   * @param config - The realtime configuration with named connections
   * @returns A global `DynamicModule` with all providers and exports
   */
  static forRoot(config: RealtimeConfig): DynamicModule {
    return {
      module: RealtimeModule,
      global: config.isGlobal ?? true,
      providers: [
        { provide: REALTIME_CONFIG, useValue: config },
        { provide: RealtimeManager, useClass: RealtimeManager },
        { provide: REALTIME_MANAGER, useExisting: RealtimeManager },
        { provide: REALTIME_CONNECTOR, useClass: LaravelEchoConnector },
      ],
      exports: [RealtimeManager, REALTIME_MANAGER],
    };
  }
}
