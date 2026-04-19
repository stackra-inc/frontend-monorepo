/**
 * @fileoverview Advanced Cache Patterns
 *
 * Demonstrates advanced usage including cache tagging, custom stores,
 * service injection, counter operations, and the CacheManager API.
 *
 * @module examples/advanced-patterns
 *
 * Prerequisites:
 * - @stackra/ts-cache installed and CacheModule.forRoot() configured
 * - @stackra/ts-container installed
 * - @stackra/ts-redis installed (for tagging examples)
 */

// ============================================================================
// 1. Cache Tagging (Redis Only)
// ============================================================================

import { useCache } from '@/index';

/**
 * Cache tagging allows grouping related cache entries and flushing
 * them together. Only available with the Redis store.
 *
 * How it works:
 * 1. Each tag gets a unique namespace ID stored in Redis
 * 2. Cache keys are prefixed with the combined namespace
 * 3. Flushing a tag regenerates its namespace, making old keys inaccessible
 */
async function cacheTaggingExample() {
  const cache = useCache('redis');

  // ── Store items with tags ─────────────────────────────────────────────

  // Tag user data with 'users' and role-specific tags
  const userTags = await cache.tags(['users', 'premium']);
  await userTags.put('user:1', { name: 'Alice', plan: 'premium' }, 3600);
  await userTags.put('user:2', { name: 'Bob', plan: 'premium' }, 3600);

  const freeTags = await cache.tags(['users', 'free']);
  await freeTags.put('user:3', { name: 'Charlie', plan: 'free' }, 3600);

  // Tag post data separately
  const postTags = await cache.tags(['posts']);
  await postTags.put('post:1', { title: 'Hello World' }, 3600);
  await postTags.put('post:2', { title: 'Cache Guide' }, 3600);

  // ── Retrieve tagged items ─────────────────────────────────────────────

  const user1 = await (await cache.tags(['users', 'premium'])).get('user:1');
  console.log(user1); // { name: 'Alice', plan: 'premium' }

  // Retrieve multiple tagged items
  const premiumUsers = await (await cache.tags(['users', 'premium'])).many(['user:1', 'user:2']);
  console.log(premiumUsers);
  // { 'user:1': { name: 'Alice', ... }, 'user:2': { name: 'Bob', ... } }

  // ── Flush by tag ──────────────────────────────────────────────────────

  // Flush all premium users (user:1 and user:2 become inaccessible)
  await (await cache.tags(['users', 'premium'])).flush();

  // user:3 (free) and posts are still accessible
  const user3 = await (await cache.tags(['users', 'free'])).get('user:3');
  console.log(user3); // { name: 'Charlie', plan: 'free' }

  const post1 = await (await cache.tags(['posts'])).get('post:1');
  console.log(post1); // { title: 'Hello World' }

  // Flush ALL users (both premium and free)
  await (await cache.tags(['users'])).flush();
  // Now user:3 is also gone, but posts remain
}

// ============================================================================
// 2. Service Injection — Using Cache in Injectable Services
// ============================================================================

import { Injectable, Inject } from '@stackra/ts-container';
import { CACHE_MANAGER, CacheManager, type CacheService } from '@/index';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

/**
 * Service that uses cache via dependency injection.
 *
 * Inject `CACHE_MANAGER` (or `CacheManager` directly) and call
 * `manager.store()` to get a CacheService instance.
 */
@Injectable()
class ProductService {
  private cache: CacheService;

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: CacheManager) {
    this.cache = cacheManager.store(); // Default store
  }

  /**
   * Get a product with caching (remember pattern).
   */
  async getProduct(id: string): Promise<Product> {
    return this.cache.remember<Product>(`product:${id}`, 1800, async () => {
      const response = await fetch(`/api/products/${id}`);
      return response.json();
    });
  }

  /**
   * Get all products with caching.
   */
  async getAllProducts(): Promise<Product[]> {
    return this.cache.remember<Product[]>('products:all', 600, async () => {
      const response = await fetch('/api/products');
      return response.json();
    });
  }

  /**
   * Update a product and invalidate related caches.
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    // Invalidate both the specific product and the list
    await this.cache.forget(`product:${id}`);
    await this.cache.forget('products:all');
  }

  /**
   * Track product views using atomic increment.
   */
  async trackView(productId: string): Promise<number> {
    return this.cache.increment(`product:${productId}:views`);
  }

  /**
   * Decrement stock using atomic decrement.
   */
  async decrementStock(productId: string, quantity: number = 1): Promise<number> {
    return this.cache.decrement(`product:${productId}:stock`, quantity);
  }
}

// ============================================================================
// 3. Service with Multiple Stores
// ============================================================================

/**
 * Service that uses different stores for different data types.
 *
 * - Memory store for frequently accessed, ephemeral data
 * - Redis store for persistent data that survives restarts
 */
@Injectable()
class SessionService {
  private memoryCache: CacheService;
  private redisCache: CacheService;

  constructor(@Inject(CACHE_MANAGER) manager: CacheManager) {
    this.memoryCache = manager.store('memory');
    this.redisCache = manager.store('redis');
  }

  /**
   * Store session token in Redis (persistent).
   */
  async createSession(userId: string, token: string): Promise<void> {
    await this.redisCache.put(`session:${token}`, { userId, createdAt: Date.now() }, 86400);
  }

  /**
   * Validate session — check memory first, then Redis.
   * This implements a two-tier cache strategy.
   */
  async validateSession(token: string): Promise<{ userId: string } | null> {
    // Check fast memory cache first
    const memCached = await this.memoryCache.get<{ userId: string }>(`session:${token}`);
    if (memCached) return memCached;

    // Fall back to Redis
    const redisCached = await this.redisCache.get<{ userId: string }>(`session:${token}`);
    if (redisCached) {
      // Promote to memory cache for faster subsequent lookups
      await this.memoryCache.put(`session:${token}`, redisCached, 300);
      return redisCached;
    }

    return null;
  }

  /**
   * Destroy session from both stores.
   */
  async destroySession(token: string): Promise<void> {
    await this.memoryCache.forget(`session:${token}`);
    await this.redisCache.forget(`session:${token}`);
  }
}

// ============================================================================
// 4. Custom Store Implementation
// ============================================================================

import type { Store, DriverCreator } from '@/index';

/**
 * Custom cache store backed by localStorage.
 *
 * Implements the `Store` interface so it can be registered
 * as a custom driver with the CacheManager.
 */
class LocalStorageStore implements Store {
  private readonly prefix: string;

  constructor(config: { prefix?: string } = {}) {
    this.prefix = config.prefix ?? '';
  }

  async get(key: string): Promise<any> {
    const raw = localStorage.getItem(this.prefix + key);
    if (!raw) return undefined;

    try {
      const entry = JSON.parse(raw);
      // Check TTL
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        localStorage.removeItem(this.prefix + key);
        return undefined;
      }
      return entry.value;
    } catch {
      return undefined;
    }
  }

  async many(keys: string[]): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    for (const key of keys) {
      results[key] = await this.get(key);
    }
    return results;
  }

  async put(key: string, value: any, seconds: number): Promise<boolean> {
    const entry = {
      value,
      expiresAt: Date.now() + seconds * 1000,
    };
    localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    return true;
  }

  async putMany(values: Record<string, any>, seconds: number): Promise<boolean> {
    for (const [key, value] of Object.entries(values)) {
      await this.put(key, value, seconds);
    }
    return true;
  }

  async increment(key: string, value: number = 1): Promise<number | boolean> {
    const current = (await this.get(key)) ?? 0;
    const newValue = Number(current) + value;
    await this.forever(key, newValue);
    return newValue;
  }

  async decrement(key: string, value: number = 1): Promise<number | boolean> {
    return this.increment(key, -value);
  }

  async forever(key: string, value: any): Promise<boolean> {
    const entry = { value, expiresAt: null };
    localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    return true;
  }

  async forget(key: string): Promise<boolean> {
    localStorage.removeItem(this.prefix + key);
    return true;
  }

  async flush(): Promise<boolean> {
    // Only remove keys with our prefix
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    return true;
  }

  getPrefix(): string {
    return this.prefix;
  }
}

/**
 * Register the custom store with the CacheManager using `extend()`.
 *
 * The `DriverCreator` factory function receives the store config
 * and computed prefix, and returns a new Store instance.
 */
async function registerCustomStore() {
  const cache = useCache();
  const manager = cache.getStore(); // Access underlying manager

  // Alternative: inject CacheManager directly
  // const manager = useInject<CacheManager>(CACHE_MANAGER);

  // The DriverCreator factory
  const createLocalStorage: DriverCreator<Store> = (config, prefix) => {
    return new LocalStorageStore({ prefix: prefix ?? '' });
  };

  // Register the custom driver
  // manager.extend('localStorage', createLocalStorage);

  // Now use it like any other store
  // const localCache = manager.store('localStorage');
  // await localCache.put('key', 'value', 3600);
}

// ============================================================================
// 5. CacheManager Introspection API
// ============================================================================

/**
 * The CacheManager provides introspection methods for
 * inspecting and managing the cache system at runtime.
 */
async function cacheManagerIntrospection() {
  // Inject the CacheManager
  // const manager = useInject<CacheManager>(CACHE_MANAGER);

  // For demonstration, access via useCache
  const cache = useCache();

  // ── Introspection ─────────────────────────────────────────────────────

  // Get the default store name
  const defaultStore = cache.getDefaultTtl();
  console.log('Default TTL:', defaultStore); // 300

  // Get the key prefix
  const prefix = cache.getPrefix();
  console.log('Prefix:', prefix); // 'app_mem_'

  // ── TTL Management ────────────────────────────────────────────────────

  // Change default TTL (method chaining)
  cache.setTtl(7200); // 2 hours
  await cache.put('key', 'value'); // Uses 2-hour TTL

  // Reset back
  cache.setTtl(300);

  // ── Store Access ──────────────────────────────────────────────────────

  // Access the underlying low-level store
  const store = cache.getStore();
  console.log('Store type:', store.constructor.name); // 'MemoryStore'
}

// ============================================================================
// 6. Rate Limiting with Cache Counters
// ============================================================================

/**
 * Simple rate limiter using cache increment operations.
 *
 * Tracks request counts per IP/user with a sliding window.
 */
async function rateLimitExample() {
  const cache = useCache();

  const clientId = 'user:123';
  const maxRequests = 100;
  const windowSeconds = 60; // 1 minute window

  const key = `ratelimit:${clientId}`;

  // Check current count
  const exists = await cache.has(key);

  if (!exists) {
    // First request in this window — initialize counter
    await cache.put(key, 1, windowSeconds);
    console.log('Request allowed (1/100)');
  } else {
    const count = await cache.increment(key);

    if (count > maxRequests) {
      console.log('Rate limit exceeded! Try again later.');
    } else {
      console.log(`Request allowed (${count}/${maxRequests})`);
    }
  }
}

// ============================================================================
// 7. One-Time Tokens with Pull
// ============================================================================

/**
 * One-time verification tokens using the `pull` method.
 *
 * `pull` retrieves the value and immediately removes it from cache,
 * ensuring the token can only be used once.
 */
async function oneTimeTokenExample() {
  const cache = useCache();

  // Generate and store a verification token (expires in 15 minutes)
  const token = crypto.randomUUID();
  await cache.put(`verify:${token}`, { userId: '123', action: 'email-verify' }, 900);

  // Later, when the user clicks the verification link...
  const tokenData = await cache.pull<{ userId: string; action: string }>(`verify:${token}`);

  if (tokenData) {
    console.log(`Verified user ${tokenData.userId} for ${tokenData.action}`);
    // Token is now removed — can't be reused
  } else {
    console.log('Invalid or expired token');
  }

  // Attempting to use the same token again returns undefined
  const reuse = await cache.pull(`verify:${token}`);
  console.log(reuse); // undefined
}

// ============================================================================
// 8. Distributed Locking with Add
// ============================================================================

/**
 * Simple distributed lock using the `add` method.
 *
 * `add` only stores the value if the key doesn't already exist,
 * making it suitable for lock acquisition.
 */
async function distributedLockExample() {
  const cache = useCache('redis');

  const lockKey = 'lock:process-payments';
  const lockTtl = 30; // Lock expires after 30 seconds (safety net)

  // Try to acquire the lock
  const acquired = await cache.add(lockKey, { owner: 'worker-1', acquiredAt: Date.now() }, lockTtl);

  if (!acquired) {
    console.log('Another process holds the lock. Skipping.');
    return;
  }

  try {
    console.log('Lock acquired! Processing payments...');
    // ... do critical work ...
  } finally {
    // Release the lock
    await cache.forget(lockKey);
    console.log('Lock released.');
  }
}

// ============================================================================
// Exports (for reference)
// ============================================================================

export {
  cacheTaggingExample,
  ProductService,
  SessionService,
  LocalStorageStore,
  registerCustomStore,
  cacheManagerIntrospection,
  rateLimitExample,
  oneTimeTokenExample,
  distributedLockExample,
};
