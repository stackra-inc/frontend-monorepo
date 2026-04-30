/**
 * @fileoverview Realtime configuration interface for multi-connection setup.
 * @module @stackra/ts-realtime
 * @category Interfaces
 */

import type { RealtimeConnectionConfig } from './realtime-connection-config.interface';

/**
 * Top-level configuration for the realtime module.
 *
 * Follows the multi-connection pattern from `RedisConfig`: a `default`
 * connection name, a `connections` map of named configurations, and an
 * optional `isGlobal` flag controlling DI scope.
 *
 * @example
 * ```typescript
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
 *         admin: {
 *           driver: 'echo',
 *           key: 'admin-key',
 *           wsHost: 'ws-admin.example.com',
 *           wsPort: 6001,
 *         },
 *       },
 *       isGlobal: true,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
export interface RealtimeConfig {
  /** Default connection name. */
  default: string;

  /** Named connections map. */
  connections: Record<string, RealtimeConnectionConfig>;

  /** Register providers globally. Default: true. */
  isGlobal?: boolean;
}
