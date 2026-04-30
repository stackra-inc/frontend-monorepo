/**
 * React Hooks Barrel Export
 *
 * Re-exports all React hooks provided by the cache package.
 * These hooks integrate the cache system with React components
 * via the DI container's React bindings.
 *
 * Available hooks:
 * - {@link useCache} — Access a CacheService instance for manual cache operations
 * - {@link useCachedQuery} — Cache async query results with loading/error state management
 *
 * @module hooks
 *
 * @example
 * ```typescript
 * import { useCache, useCachedQuery } from '@stackra/ts-cache';
 * ```
 */

export * from './use-cache';
export * from './use-cached-query';
