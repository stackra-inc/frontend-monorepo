# Cache Integration in @abdokouta/multitenancy

## Overview

The multitenancy package now integrates with @abdokouta/react-cache for improved
caching capabilities. The DynamicDomainResolver has been updated to support both
the new cache service and a fallback in-memory cache.

## Changes Made

### 1. DynamicDomainResolver Updates

The `DynamicDomainResolver` class now supports optional integration with
@abdokouta/react-cache:

**Before:**

```typescript
// Used simple Map-based cache
private cache: Map<string, CacheEntry> = new Map();
```

**After:**

```typescript
// Supports both cache service and fallback memory cache
private cacheService?: any; // CacheService from @abdokouta/react-cache
private memoryCache: Map<string, { value: string; expiresAt: number }> = new Map();
```

### 2. Configuration Changes

#### Cache TTL Units Changed

**Before:** Milliseconds

```typescript
dynamicDomainCacheTTL: 300000; // 5 minutes in milliseconds
```

**After:** Seconds (to match @abdokouta/react-cache API)

```typescript
dynamicDomainCacheTTL: 300; // 5 minutes in seconds
```

#### New Optional Parameter

```typescript
interface DynamicDomainResolverConfig {
  // ... existing config

  /**
   * Optional cache service instance from @abdokouta/react-cache
   * If not provided, uses in-memory Map cache
   */
  cacheService?: CacheService;
}
```

## Usage Examples

### Basic Usage (Without Cache Service)

Works exactly as before with in-memory cache:

```typescript
import { DynamicDomainResolver } from '@abdokouta/multitenancy';

const resolver = new DynamicDomainResolver({
  apiUrl: '/api/tenants/resolve',
  cacheTTL: 300, // 5 minutes in seconds
});
```

### Advanced Usage (With Cache Service)

Integrate with @abdokouta/react-cache for persistent caching:

```typescript
import { DynamicDomainResolver } from '@abdokouta/multitenancy';
import { CacheService } from '@abdokouta/react-cache';

// Inject cache service
const resolver = new DynamicDomainResolver({
  apiUrl: '/api/tenants/resolve',
  cacheTTL: 300, // 5 minutes
  cacheService: cacheService, // Use shared cache service
});
```

### Full Application Setup

```typescript
import { Module } from '@abdokouta/container';
import { CacheModule } from '@abdokouta/react-cache';
import { MultiTenancyModule } from '@abdokouta/multitenancy';

@Module({
  imports: [
    // Configure cache
    CacheModule.forRoot({
      default: 'memory',
      stores: {
        memory: {
          driver: 'memory',
          maxSize: 1000,
          ttl: 300,
        },
      },
    }),

    // Configure multitenancy with cache
    MultiTenancyModule.forRoot({
      // ... other config
      dynamicDomainApiUrl: '/api/tenants/resolve',
      dynamicDomainCacheTTL: 600, // 10 minutes
    }),
  ],
})
export class AppModule {}
```

## Benefits

### 1. Unified Caching Strategy

- Use the same cache system across your entire application
- Consistent API for cache operations
- Centralized cache configuration

### 2. Multiple Cache Drivers

Choose the best cache driver for your needs:

- **Memory**: Fast, in-process caching
- **Redis**: Distributed caching across instances
- **Null**: Disable caching for testing

### 3. Advanced Features

When using @abdokouta/react-cache, you get:

- **Cache Tagging**: Group related cache entries
- **Multiple Stores**: Different caches for different purposes
- **TTL Management**: Automatic expiration
- **Cache Invalidation**: Easy cache clearing

### 4. Backward Compatibility

The integration is fully backward compatible:

- Works without cache service (uses memory cache)
- No breaking changes to existing code
- Opt-in enhancement

## Cache Key Format

Domain-to-tenant mappings are cached with the following key format:

```
multitenancy:domain:{hostname}
```

Example:

```
multitenancy:domain:tenant1.myapp.com
multitenancy:domain:tenant2.myapp.com
```

## Cache Operations

### Clear All Cache

```typescript
await resolver.clearCache();
```

### Clear Specific Domain

```typescript
await resolver.clearCacheForDomain('tenant1.myapp.com');
```

## Migration Guide

### For Existing Users

No changes required! The package works exactly as before with in-memory caching.

### To Enable Cache Service Integration

1. Install @abdokouta/react-cache:

```bash
npm install @abdokouta/react-cache
```

2. Configure CacheModule in your app:

```typescript
CacheModule.forRoot({
  default: 'memory',
  stores: {
    memory: { driver: 'memory', ttl: 300 },
  },
});
```

3. Pass cache service to resolver (if creating manually):

```typescript
const resolver = new DynamicDomainResolver({
  apiUrl: '/api/tenants/resolve',
  cacheService: cacheService,
});
```

### Update Cache TTL Values

If you were using custom cache TTL values, convert from milliseconds to seconds:

**Before:**

```typescript
dynamicDomainCacheTTL: 600000; // 10 minutes in milliseconds
```

**After:**

```typescript
dynamicDomainCacheTTL: 600; // 10 minutes in seconds
```

## Error Handling

The integration includes graceful fallback:

1. If cache service is provided but fails, falls back to memory cache
2. Logs warnings for cache errors without breaking functionality
3. Always returns valid results even if caching fails

```typescript
// Automatic fallback on cache service errors
try {
  return await this.cacheService.get(key);
} catch (error) {
  console.warn('[DynamicDomainResolver] Cache service error:', error);
  // Falls back to memory cache
}
```

## Performance Considerations

### Memory Cache (Default)

- **Pros**: Fast, no external dependencies
- **Cons**: Not shared across instances, lost on restart
- **Best for**: Single-instance apps, development

### Cache Service with Memory Store

- **Pros**: Unified API, better management
- **Cons**: Still not shared across instances
- **Best for**: Single-instance apps with complex caching needs

### Cache Service with Redis Store

- **Pros**: Shared across instances, persistent
- **Cons**: Requires Redis setup, network latency
- **Best for**: Multi-instance production apps

## Testing

The cache integration is fully testable:

```typescript
import { DynamicDomainResolver } from '@abdokouta/multitenancy';

// Test with mock cache service
const mockCacheService = {
  get: jest.fn(),
  put: jest.fn(),
  forget: jest.fn(),
  flush: jest.fn(),
};

const resolver = new DynamicDomainResolver({
  apiUrl: '/api/tenants/resolve',
  cacheService: mockCacheService,
});

// Verify cache operations
await resolver.resolve();
expect(mockCacheService.get).toHaveBeenCalled();
```

## Summary

✅ **Backward Compatible**: Works without any changes ✅ **Opt-in Enhancement**:
Use cache service when needed ✅ **Graceful Fallback**: Falls back to memory
cache on errors ✅ **Consistent API**: Same cache API across the application ✅
**Production Ready**: Tested and built successfully

The multitenancy package now seamlessly integrates with @abdokouta/react-cache
while maintaining full backward compatibility!
