/**
 * Services Barrel Export
 *
 * Re-exports the core service classes that power the cache system:
 *
 * - {@link CacheManager} — Orchestrates multiple named cache stores, handles
 *   driver creation, and provides the DI integration point.
 * - {@link CacheService} — The consumer-facing API wrapping a single store
 *   with convenience methods (remember, pull, tags, etc.).
 *
 * @module services
 */

export { CacheManager } from './cache-manager.service';
export { CacheService } from './cache.service';
