# @stackra/redis - Usage Examples

Comprehensive examples for using the Redis package in various scenarios.

## Table of Contents

- [Basic Setup](#basic-setup)
- [Service Usage](#service-usage)
- [React Hooks](#react-hooks)
- [Common Patterns](#common-patterns)
- [Advanced Usage](#advanced-usage)

## Basic Setup

### 1. Module Configuration

```typescript
// app.module.ts
import { Module } from '@stackra/ts-container';
import { RedisModule } from '@stackra/redis';

@Module({
  imports: [
    RedisModule.forRoot({
      default: 'cache',
      connections: {
        cache: {
          url: process.env.UPSTASH_REDIS_REST_URL!,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
          timeout: 5000,
          retry: {
            retries: 3,
            backoff: (retryCount) => Math.min(1000 * 2 ** retryCount, 3000),
          },
        },
      },
    }),
  ],
})
export class AppModule {}
```

### 2. Environment Variables

```env
# .env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

## Service Usage

### Basic Cache Operations

```typescript
import { Injectable } from '@stackra/ts-container';
import { RedisService } from '@stackra/redis';

@Injectable()
export class CacheService {
  constructor(private readonly redis: RedisService) {}

  async set(key: string, value: unknown, ttl: number = 3600): Promise<void> {
    const connection = await this.redis.connection();
    await connection.set(key, JSON.stringify(value), { ex: ttl });
  }

  async get<T>(key: string): Promise<T | null> {
    const connection = await this.redis.connection();
    const data = await connection.get(key);
    return data ? JSON.parse(data) : null;
  }

  async delete(key: string): Promise<void> {
    const connection = await this.redis.connection();
    await connection.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const connection = await this.redis.connection();
    const count = await connection.exists(key);
    return count > 0;
  }
}
```

### User Service with Caching

```typescript
import { Injectable } from '@stackra/ts-container';
import { RedisService } from '@stackra/redis';

interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable()
export class UserService {
  constructor(
    private readonly redis: RedisService,
    private readonly database: DatabaseService
  ) {}

  async getUser(id: string): Promise<User | null> {
    const connection = await this.redis.connection();
    const cacheKey = `user:${id}`;

    // Try cache first
    const cached = await connection.get(cacheKey);
    if (cached) {
      console.log('Cache hit');
      return JSON.parse(cached);
    }

    // Fetch from database
    console.log('Cache miss - fetching from database');
    const user = await this.database.users.findById(id);

    if (user) {
      // Cache for 1 hour
      await connection.set(cacheKey, JSON.stringify(user), { ex: 3600 });
    }

    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const connection = await this.redis.connection();

    // Update in database
    const user = await this.database.users.update(id, data);

    // Invalidate cache
    await connection.del(`user:${id}`);

    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const connection = await this.redis.connection();

    // Delete from database
    await this.database.users.delete(id);

    // Invalidate cache
    await connection.del(`user:${id}`);
  }
}
```

## React Hooks

### Basic Hook Usage

```typescript
import { useRedis } from '@stackra/redis';
import { useEffect, useState } from 'react';

function UserProfile({ userId }: { userId: string }) {
  const redis = useRedis();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const connection = await redis.connection();
        const cached = await connection.get(`user:${userId}`);

        if (cached) {
          setUser(JSON.parse(cached));
        } else {
          const user = await fetchUser(userId);
          await connection.set(
            `user:${userId}`,
            JSON.stringify(user),
            { ex: 3600 }
          );
          setUser(user);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [userId, redis]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Custom Cache Hook

```typescript
import { useRedis } from '@stackra/redis';
import { useEffect, useState } from 'react';

function useCache<T>(key: string, fetcher: () => Promise<T>, ttl: number = 3600) {
  const redis = useRedis();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const connection = await redis.connection();

        // Try cache
        const cached = await connection.get(key);
        if (cached) {
          setData(JSON.parse(cached));
          setLoading(false);
          return;
        }

        // Fetch and cache
        const result = await fetcher();
        await connection.set(key, JSON.stringify(result), { ex: ttl });
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [key, redis, ttl]);

  return { data, loading, error };
}

// Usage
function UserList() {
  const { data: users, loading, error } = useCache(
    'users:all',
    () => fetch('/api/users').then(r => r.json()),
    300 // 5 minutes
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## Common Patterns

### 1. Cache-Aside Pattern

```typescript
@Injectable()
export class ProductService {
  constructor(private readonly redis: RedisService) {}

  async getProduct(id: string): Promise<Product> {
    const connection = await this.redis.connection();
    const cacheKey = `product:${id}`;

    // Try cache
    const cached = await connection.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const product = await this.database.products.findById(id);

    // Cache for 1 hour
    await connection.set(cacheKey, JSON.stringify(product), { ex: 3600 });

    return product;
  }
}
```

### 2. Write-Through Cache

```typescript
@Injectable()
export class ProductService {
  constructor(private readonly redis: RedisService) {}

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const connection = await this.redis.connection();

    // Update database
    const product = await this.database.products.update(id, data);

    // Update cache immediately
    await connection.set(`product:${id}`, JSON.stringify(product), {
      ex: 3600,
    });

    return product;
  }
}
```

### 3. Distributed Locking

```typescript
@Injectable()
export class LockService {
  constructor(private readonly redis: RedisService) {}

  async acquireLock(resource: string, ttl: number = 10): Promise<boolean> {
    const connection = await this.redis.connection();
    const lockKey = `lock:${resource}`;

    // Try to acquire lock (set if not exists)
    const acquired = await connection.set(lockKey, 'locked', {
      nx: true,
      ex: ttl,
    });

    return acquired === 'OK';
  }

  async releaseLock(resource: string): Promise<void> {
    const connection = await this.redis.connection();
    await connection.del(`lock:${resource}`);
  }

  async withLock<T>(
    resource: string,
    callback: () => Promise<T>,
    ttl: number = 10
  ): Promise<T> {
    const acquired = await this.acquireLock(resource, ttl);

    if (!acquired) {
      throw new Error(`Failed to acquire lock for ${resource}`);
    }

    try {
      return await callback();
    } finally {
      await this.releaseLock(resource);
    }
  }
}

// Usage
const result = await lockService.withLock('user:123:update', async () => {
  // Critical section - only one process can execute this at a time
  const user = await userService.getUser('123');
  user.balance += 100;
  return await userService.updateUser('123', user);
});
```

### 4. Rate Limiting

```typescript
@Injectable()
export class RateLimitService {
  constructor(private readonly redis: RedisService) {}

  async checkRateLimit(
    userId: string,
    limit: number = 100,
    window: number = 60
  ): Promise<{ allowed: boolean; remaining: number }> {
    const connection = await this.redis.connection();
    const key = `ratelimit:${userId}`;

    const current = await connection.incr(key);

    if (current === 1) {
      // First request, set expiration
      await connection.expire(key, window);
    }

    const allowed = current <= limit;
    const remaining = Math.max(0, limit - current);

    return { allowed, remaining };
  }
}

// Usage in middleware
async function rateLimitMiddleware(req, res, next) {
  const { allowed, remaining } = await rateLimitService.checkRateLimit(
    req.user.id,
    100, // 100 requests
    60 // per minute
  );

  res.setHeader('X-RateLimit-Remaining', remaining.toString());

  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  next();
}
```

### 5. Session Storage

```typescript
@Injectable()
export class SessionService {
  constructor(private readonly redis: RedisService) {}

  async createSession(userId: string, data: SessionData): Promise<string> {
    const connection = await this.redis.connection('session');
    const sessionId = generateSessionId();

    await connection.set(
      `session:${sessionId}`,
      JSON.stringify({ userId, ...data }),
      { ex: 86400 } // 24 hours
    );

    return sessionId;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const connection = await this.redis.connection('session');
    const data = await connection.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async refreshSession(sessionId: string): Promise<void> {
    const connection = await this.redis.connection('session');
    await connection.expire(`session:${sessionId}`, 86400);
  }

  async destroySession(sessionId: string): Promise<void> {
    const connection = await this.redis.connection('session');
    await connection.del(`session:${sessionId}`);
  }
}
```

### 6. Leaderboard

```typescript
@Injectable()
export class LeaderboardService {
  constructor(private readonly redis: RedisService) {}

  async addScore(userId: string, score: number): Promise<void> {
    const connection = await this.redis.connection();
    await connection.zadd('leaderboard', score, userId);
  }

  async getTopPlayers(count: number = 10): Promise<string[]> {
    const connection = await this.redis.connection();
    // Get top N players (highest scores)
    return connection.zrange('leaderboard', -count, -1);
  }

  async getUserRank(userId: string): Promise<number | null> {
    const connection = await this.redis.connection();
    const members = await connection.zrange('leaderboard', 0, -1);
    const index = members.indexOf(userId);
    return index >= 0 ? members.length - index : null;
  }
}
```

## Advanced Usage

### Pipeline for Batch Operations

```typescript
@Injectable()
export class BatchService {
  constructor(private readonly redis: RedisService) {}

  async cacheMultipleUsers(users: User[]): Promise<void> {
    const connection = await this.redis.connection();

    // Use pipeline for better performance
    const pipeline = connection.pipeline();

    for (const user of users) {
      pipeline.set(`user:${user.id}`, JSON.stringify(user), { ex: 3600 });
    }

    await pipeline.exec();
  }

  async getMultipleUsers(ids: string[]): Promise<(User | null)[]> {
    const connection = await this.redis.connection();

    // Use mget for efficient multi-key retrieval
    const keys = ids.map((id) => `user:${id}`);
    const values = await connection.mget(...keys);

    return values.map((v) => (v ? JSON.parse(v) : null));
  }
}
```

### Multiple Connections

```typescript
// Configure multiple connections
RedisModule.forRoot({
  default: 'cache',
  connections: {
    cache: {
      url: process.env.UPSTASH_CACHE_URL!,
      token: process.env.UPSTASH_CACHE_TOKEN!,
    },
    session: {
      url: process.env.UPSTASH_SESSION_URL!,
      token: process.env.UPSTASH_SESSION_TOKEN!,
    },
    ratelimit: {
      url: process.env.UPSTASH_RATELIMIT_URL!,
      token: process.env.UPSTASH_RATELIMIT_TOKEN!,
    },
  },
});

// Use different connections
@Injectable()
export class MultiConnectionService {
  constructor(private readonly redis: RedisService) {}

  async cacheData(key: string, value: unknown): Promise<void> {
    const cache = await this.redis.connection('cache');
    await cache.set(key, JSON.stringify(value), { ex: 3600 });
  }

  async saveSession(sessionId: string, data: SessionData): Promise<void> {
    const session = await this.redis.connection('session');
    await session.set(`session:${sessionId}`, JSON.stringify(data), {
      ex: 86400,
    });
  }

  async checkRateLimit(userId: string): Promise<boolean> {
    const ratelimit = await this.redis.connection('ratelimit');
    const count = await ratelimit.incr(`ratelimit:${userId}`);
    return count <= 100;
  }
}
```

### Error Handling

```typescript
@Injectable()
export class ResilientCacheService {
  constructor(private readonly redis: RedisService) {}

  async get<T>(key: string, fallback: () => Promise<T>): Promise<T> {
    try {
      const connection = await this.redis.connection();
      const cached = await connection.get(key);

      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Redis error:', error);
      // Fall through to fallback
    }

    // Fetch from fallback (e.g., database)
    return fallback();
  }

  async set(key: string, value: unknown, ttl: number = 3600): Promise<void> {
    try {
      const connection = await this.redis.connection();
      await connection.set(key, JSON.stringify(value), { ex: ttl });
    } catch (error) {
      console.error('Failed to cache data:', error);
      // Don't throw - caching is optional
    }
  }
}
```

### Testing

```typescript
import { Test } from '@stackra/testing';
import { RedisModule, RedisService } from '@stackra/redis';

describe('UserService', () => {
  let userService: UserService;
  let redis: RedisService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        RedisModule.forRoot({
          default: 'test',
          connections: {
            test: {
              url: process.env.TEST_REDIS_URL!,
              token: process.env.TEST_REDIS_TOKEN!,
            },
          },
        }),
      ],
      providers: [UserService],
    }).compile();

    userService = module.get(UserService);
    redis = module.get(RedisService);
  });

  afterEach(async () => {
    // Clean up test data
    const connection = await redis.connection();
    await connection.flushdb();
  });

  it('should cache user data', async () => {
    const user = { id: '1', name: 'John' };
    await userService.cacheUser(user);

    const cached = await userService.getUser('1');
    expect(cached).toEqual(user);
  });
});
```

## Best Practices

1. **Always set TTL**: Prevent memory leaks by setting expiration times
2. **Use pipelines**: Batch operations for better performance
3. **Handle errors gracefully**: Cache failures shouldn't break your app
4. **Use namespaced keys**: Organize keys with prefixes
5. **Monitor cache hit rates**: Track performance metrics
6. **Clean up on shutdown**: Call `disconnectAll()` during shutdown
7. **Use appropriate connections**: Separate cache, session, and rate limiting
   data
