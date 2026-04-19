# @stackra-inc/redis - Quick Reference

## Installation

```bash
npm install @stackra-inc/redis @upstash/redis
```

## Setup

```typescript
import { RedisModule } from '@stackra-inc/redis';

RedisModule.forRoot({
  default: 'cache',
  connections: {
    cache: {
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    },
  },
});
```

## Service Usage

```typescript
import { RedisService } from '@stackra-inc/redis';

@Injectable()
export class MyService {
  constructor(private readonly redis: RedisService) {}

  async example() {
    const conn = await this.redis.connection();

    // Set with expiration
    await conn.set('key', 'value', { ex: 3600 });

    // Get
    const value = await conn.get('key');

    // Delete
    await conn.del('key');
  }
}
```

## React Hooks

```typescript
import { useRedis } from '@stackra-inc/redis';

function MyComponent() {
  const redis = useRedis();

  useEffect(() => {
    async function load() {
      const conn = await redis.connection();
      const data = await conn.get('key');
    }
    load();
  }, [redis]);
}
```

## Common Operations

### Basic Operations

```typescript
// Get/Set
await conn.get('key');
await conn.set('key', 'value', { ex: 3600 });

// Delete
await conn.del('key1', 'key2');

// Exists
const exists = await conn.exists('key');

// Expiration
await conn.expire('key', 300);
const ttl = await conn.ttl('key');
```

### Multi-Key Operations

```typescript
// Get multiple
const [v1, v2] = await conn.mget('key1', 'key2');

// Set multiple
await conn.mset({ key1: 'val1', key2: 'val2' });
```

### Counters

```typescript
// Increment
await conn.incr('counter');
await conn.incrby('counter', 5);

// Decrement
await conn.decr('counter');
await conn.decrby('counter', 3);
```

### Pipeline (Batching)

```typescript
const results = await conn
  .pipeline()
  .set('key1', 'value1')
  .set('key2', 'value2')
  .get('key1')
  .exec();
```

## Common Patterns

### Cache-Aside

```typescript
const cached = await conn.get(key);
if (cached) return JSON.parse(cached);

const data = await fetchFromDB();
await conn.set(key, JSON.stringify(data), { ex: 3600 });
return data;
```

### Distributed Lock

```typescript
const acquired = await conn.set('lock:resource', 'locked', {
  nx: true,
  ex: 10,
});
if (acquired === 'OK') {
  // Do work
  await conn.del('lock:resource');
}
```

### Rate Limiting

```typescript
const count = await conn.incr(`ratelimit:${userId}`);
if (count === 1) {
  await conn.expire(`ratelimit:${userId}`, 60);
}
return count <= 100;
```

## Configuration Options

```typescript
interface RedisConnectionConfig {
  url: string; // Required
  token: string; // Required
  timeout?: number; // Default: 5000ms
  retry?: {
    retries?: number;
    backoff?: (retryCount: number) => number;
  };
  enableAutoPipelining?: boolean; // Default: false
}
```

## Multiple Connections

```typescript
// Configure
RedisModule.forRoot({
  default: 'cache',
  connections: {
    cache: { url: '...', token: '...' },
    session: { url: '...', token: '...' },
  },
});

// Use
const cache = await redis.connection('cache');
const session = await redis.connection('session');
```

## Error Handling

```typescript
try {
  const conn = await redis.connection();
  await conn.set('key', 'value');
} catch (error) {
  console.error('Redis error:', error);
  // Fallback logic
}
```

## Best Practices

1. ✅ Always set TTL: `{ ex: 3600 }`
2. ✅ Use pipelines for multiple operations
3. ✅ Handle errors gracefully
4. ✅ Use namespaced keys: `user:${id}`
5. ✅ Clean up on shutdown: `redis.disconnectAll()`

## API Reference

### RedisService

- `connection(name?: string): Promise<RedisConnection>`
- `disconnect(name?: string): Promise<void>`
- `disconnectAll(): Promise<void>`
- `getConnectionNames(): string[]`
- `getDefaultConnectionName(): string`
- `isConnectionActive(name?: string): boolean`

### RedisConnection

- `get(key: string): Promise<string | null>`
- `set(key: string, value: string, options?: SetOptions): Promise<'OK' | null>`
- `del(...keys: string[]): Promise<number>`
- `exists(...keys: string[]): Promise<number>`
- `expire(key: string, seconds: number): Promise<number>`
- `ttl(key: string): Promise<number>`
- `mget(...keys: string[]): Promise<(string | null)[]>`
- `mset(data: Record<string, string>): Promise<'OK'>`
- `incr(key: string): Promise<number>`
- `incrby(key: string, increment: number): Promise<number>`
- `decr(key: string): Promise<number>`
- `decrby(key: string, decrement: number): Promise<number>`
- `zadd(key: string, score: number, member: string): Promise<number>`
- `zrange(key: string, start: number, stop: number): Promise<string[]>`
- `zrem(key: string, ...members: string[]): Promise<number>`
- `zremrangebyscore(key: string, min: number, max: number): Promise<number>`
- `eval(script: string, keys: string[], args: (string | number)[]): Promise<unknown>`
- `pipeline(): RedisPipeline`
- `flushdb(): Promise<'OK'>`
- `disconnect(): Promise<void>`

### React Hooks

- `useRedis(): RedisService`
- `useRedisConnection(name?: string): Promise<RedisConnection>`

## Links

- [Full Documentation](./README.md)
- [Examples](./EXAMPLES.md)
- [Changelog](./CHANGELOG.md)
- [Upstash Console](https://console.upstash.com)
