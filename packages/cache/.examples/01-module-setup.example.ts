/**
 * @fileoverview Cache Module Setup & Basic Operations
 *
 * Demonstrates how to configure the CacheModule with different stores
 * and perform basic cache operations (get, put, remember, forget, etc.).
 *
 * @module examples/module-setup
 *
 * Prerequisites:
 * - @stackra-inc/ts-cache installed
 * - @stackra-inc/ts-container installed
 * - @stackra-inc/ts-redis installed (optional, for Redis driver)
 */

// ============================================================================
// 1. Basic Module Setup — Memory Store Only
// ============================================================================

import { Module } from '@stackra-inc/ts-container';
import { CacheModule, defineConfig } from '@/index';

/**
 * Minimal setup with a single memory store.
 *
 * The memory store uses JavaScript Map internally — fast with zero
 * dependencies, but data is lost on page refresh or process restart.
 */
@Module({
  imports: [
    CacheModule.forRoot({
      default: 'memory',
      stores: {
        memory: {
          driver: 'memory',
          maxSize: 500,
          ttl: 300, // 5 minutes default TTL
          prefix: 'mem_',
        },
      },
      prefix: 'app_', // Global prefix for all stores
    }),
  ],
})
export class BasicAppModule {}

// ============================================================================
// 2. Multi-Store Setup — Memory + Redis + Null
// ============================================================================

/**
 * Full configuration with multiple stores.
 *
 * - `memory` — fast in-memory cache for client-side data
 * - `redis` — persistent cache via Upstash Redis
 * - `session` — separate Redis connection for session data (longer TTL)
 * - `null` — no-op store for testing or disabling cache
 */
@Module({
  imports: [
    CacheModule.forRoot({
      default: 'memory',
      stores: {
        memory: {
          driver: 'memory',
          maxSize: 1000,
          ttl: 300,
          prefix: 'mem_',
        },
        redis: {
          driver: 'redis',
          connection: 'cache', // Resolved by RedisModule at runtime
          prefix: 'cache_',
          ttl: 3600, // 1 hour
        },
        session: {
          driver: 'redis',
          connection: 'session',
          prefix: 'sess_',
          ttl: 86400, // 24 hours
        },
        null: {
          driver: 'null',
        },
      },
      prefix: 'myapp_',
    }),
  ],
})
export class MultiStoreAppModule {}

// ============================================================================
// 3. Using defineConfig for Type-Safe Configuration
// ============================================================================

/**
 * The `defineConfig` helper provides IDE autocomplete and type checking.
 * Follows the same pattern as Vite, Vitest, etc.
 *
 * Typically placed in `config/cache.config.ts`.
 */
const cacheConfig = defineConfig({
  default: process.env.VITE_CACHE_DRIVER || 'memory',
  stores: {
    memory: {
      driver: 'memory',
      maxSize: Number(process.env.VITE_CACHE_MEMORY_MAX_SIZE) || 100,
      ttl: Number(process.env.VITE_CACHE_MEMORY_TTL) || 300,
      prefix: 'mem_',
    },
    redis: {
      driver: 'redis',
      connection: process.env.VITE_REDIS_CACHE_CONNECTION || 'cache',
      prefix: process.env.VITE_CACHE_REDIS_PREFIX || 'cache_',
      ttl: Number(process.env.VITE_CACHE_REDIS_TTL) || 3600,
    },
    null: {
      driver: 'null',
    },
  },
  prefix: process.env.VITE_CACHE_PREFIX || 'app_',
});

@Module({
  imports: [CacheModule.forRoot(cacheConfig)],
})
export class ConfigDrivenAppModule {}

// ============================================================================
// 4. Basic Cache Operations via useCache Hook
// ============================================================================

import { useCache } from '@/index';

/**
 * Demonstrates all basic cache operations using the `useCache` hook.
 */
async function basicCacheOperations() {
  const cache = useCache(); // Uses default store

  // ── Put & Get ─────────────────────────────────────────────────────────
  await cache.put('user:123', { name: 'John', email: 'john@example.com' }, 3600);
  const user = await cache.get<{ name: string; email: string }>('user:123');
  console.log(user); // { name: 'John', email: 'john@example.com' }

  // Get with a default value
  const theme = await cache.get('settings:theme', 'light');
  console.log(theme); // 'light' (if not cached)

  // ── Has ───────────────────────────────────────────────────────────────
  const exists = await cache.has('user:123');
  console.log(exists); // true

  // ── Put Many & Many ───────────────────────────────────────────────────
  await cache.putMany(
    {
      'user:1': { name: 'Alice' },
      'user:2': { name: 'Bob' },
      'user:3': { name: 'Charlie' },
    },
    3600
  );

  const users = await cache.many<{ name: string }>(['user:1', 'user:2', 'user:3']);
  console.log(users);
  // { 'user:1': { name: 'Alice' }, 'user:2': { name: 'Bob' }, 'user:3': { name: 'Charlie' } }

  // ── Add (set-if-not-exists) ───────────────────────────────────────────
  const added = await cache.add('lock:resource', true, 30);
  if (!added) {
    console.log('Resource is already locked');
  }

  // ── Forever (no expiration) ───────────────────────────────────────────
  await cache.forever('config:app', { debug: false, version: '1.0.0' });

  // ── Remember (cache-aside pattern) ────────────────────────────────────
  const profile = await cache.remember('profile:123', 3600, async () => {
    // This callback only runs on cache miss
    const response = await fetch('/api/users/123');
    return response.json();
  });

  // Remember forever
  const countries = await cache.rememberForever('countries:all', async () => {
    const response = await fetch('/api/countries');
    return response.json();
  });

  // ── Pull (get and remove) ─────────────────────────────────────────────
  const token = await cache.pull<string>('auth:verification:abc123');
  // Token is now removed from cache — can't be used again

  // ── Forget & Flush ────────────────────────────────────────────────────
  await cache.forget('user:123'); // Remove single key
  await cache.flush(); // Clear entire store (use with caution!)

  // ── Increment & Decrement ─────────────────────────────────────────────
  await cache.increment('page:views'); // 1
  await cache.increment('page:views', 10); // 11
  await cache.decrement('stock:item:42'); // -1
  await cache.decrement('stock:item:42', 5); // -6
}

// ============================================================================
// 5. Switching Stores at Runtime
// ============================================================================

/**
 * Access different stores by name using the `useCache` hook.
 */
async function multipleStoreUsage() {
  // Default store (memory)
  const defaultCache = useCache();
  await defaultCache.put('temp', 'data', 60);

  // Explicit memory store
  const memoryCache = useCache('memory');
  await memoryCache.put('client:state', { page: 1 }, 300);

  // Redis store (persistent)
  const redisCache = useCache('redis');
  await redisCache.put('user:session', { token: 'abc' }, 86400);

  // Null store (no-op, useful for testing)
  const nullCache = useCache('null');
  await nullCache.put('anything', 'nothing', 3600); // Does nothing
  const value = await nullCache.get('anything'); // Always undefined
}
