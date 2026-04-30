/**
 * Database Configuration
 *
 * Configuration for the @stackra/ts-eloquent package.
 * Defines database connections, storage drivers, and optional
 * Supabase replication for offline-first sync.
 *
 * ## Environment Variables
 *
 * | Variable                        | Description                              | Default        |
 * |---------------------------------|------------------------------------------|----------------|
 * | `VITE_DB_CONNECTION`            | Default connection name                  | `'local'`      |
 * | `VITE_DB_DRIVER`                | Local storage driver                     | `'indexeddb'`   |
 * | `VITE_DB_NAME`                  | Database name                            | `'app-db'`     |
 * | `VITE_DB_MULTI_INSTANCE`        | Support multiple browser tabs            | `true`         |
 * | `VITE_DB_EVENT_REDUCE`          | Enable RxDB EventReduce algorithm        | `true`         |
 * | `VITE_SUPABASE_URL`             | Supabase project URL                     | `''`           |
 * | `VITE_SUPABASE_ANON_KEY`        | Supabase anonymous API key               | `''`           |
 * | `VITE_DB_REPLICATION_LIVE`      | Enable live replication                  | `true`         |
 * | `VITE_DB_REPLICATION_PULL_SIZE` | Pull batch size                          | `50`           |
 * | `VITE_DB_REPLICATION_PUSH_SIZE` | Push batch size                          | `50`           |
 *
 * @example
 * ```typescript
 * // In app.module.ts
 * import databaseConfig from '@/config/database.config';
 *
 * @Module({
 *   imports: [EloquentModule.forRoot(databaseConfig)],
 * })
 * export class AppModule {}
 * ```
 *
 * @module config/database
 */

import { defineConfig } from '@stackra/ts-eloquent';

/**
 * Database configuration.
 *
 * @example
 * ```typescript
 * import { ConnectionManager } from '@stackra/ts-eloquent';
 *
 * const db = ConnectionManager.connection();       // default (local)
 * const synced = ConnectionManager.connection('synced'); // synced connection
 * ```
 */
const databaseConfig = defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Default Connection
  |--------------------------------------------------------------------------
  |
  | The connection used when no specific name is passed to
  | `ConnectionManager.connection()`. Must match a key in `connections`.
  |
  */
  default: env('VITE_DB_CONNECTION', 'local'),

  /*
  |--------------------------------------------------------------------------
  | Database Connections
  |--------------------------------------------------------------------------
  |
  | Each connection maps to one RxDB database instance. The `driver`
  | field determines which storage adapter is used.
  |
  | Drivers:
  |   - 'indexeddb'      — Dexie-backed IndexedDB (most common for browsers)
  |   - 'memory'         — In-memory, non-persistent (ideal for tests)
  |   - 'localstorage'   — Browser localStorage (~5 MB limit)
  |   - 'sessionstorage' — Browser sessionStorage (cleared on tab close)
  |
  */
  connections: {
    /**
     * Local-only connection.
     *
     * Pure client-side storage with no cloud sync.
     * Data persists in IndexedDB across page reloads.
     */
    local: {
      driver: env('VITE_DB_DRIVER', 'indexeddb') as any,
      name: env('VITE_DB_NAME', 'app-db'),
      multiInstance: env('VITE_DB_MULTI_INSTANCE', true),
      eventReduce: env('VITE_DB_EVENT_REDUCE', true),
    },

    /**
     * Synced connection — local + Supabase replication.
     *
     * Stores data locally in IndexedDB and syncs bidirectionally
     * with Supabase (PostgreSQL) in the background. The local
     * database is always the source of truth for reads/writes.
     */
    // synced: {
    //   driver: env('VITE_DB_DRIVER', 'indexeddb') as any,
    //   name: env('VITE_DB_NAME', 'app-db-synced'),
    //   multiInstance: env('VITE_DB_MULTI_INSTANCE', true),
    //   eventReduce: env('VITE_DB_EVENT_REDUCE', true),
    //   replication: {
    //     provider: 'supabase',
    //     url: env('VITE_SUPABASE_URL', ''),
    //     apiKey: env('VITE_SUPABASE_ANON_KEY', ''),
    //     live: env('VITE_DB_REPLICATION_LIVE', true),
    //     pull: { batchSize: env('VITE_DB_REPLICATION_PULL_SIZE', 50) },
    //     push: { batchSize: env('VITE_DB_REPLICATION_PUSH_SIZE', 50) },
    //   },
    // },

    /**
     * In-memory connection for testing.
     *
     * Non-persistent — data is lost on page refresh.
     * Fast and isolated, perfect for unit tests.
     */
    // testing: {
    //   driver: 'memory',
    //   name: 'test-db',
    //   multiInstance: false,
    //   eventReduce: false,
    // },
  },
});

export default databaseConfig;
