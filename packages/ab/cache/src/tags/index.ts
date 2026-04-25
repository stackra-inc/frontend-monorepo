/**
 * Tags Barrel Export
 *
 * Re-exports all tag-related classes for cache tagging support.
 *
 * - {@link RedisTagSet} — Redis-backed tag namespace management with TTL tracking
 * - {@link TagSet} — In-memory tag namespace management (base implementation)
 * - {@link TaggedCache} — Cache operations scoped to specific tags
 *
 * ## How Tagging Works
 *
 * 1. Each tag has a unique namespace ID (random string)
 * 2. Cache keys are prefixed with combined namespace IDs (e.g., "abc|def:user:1")
 * 3. When a tag is flushed, its namespace ID is regenerated
 * 4. Old cache keys become inaccessible because the namespace prefix changed
 * 5. The orphaned keys eventually expire via their TTL
 *
 * @module tags
 */

export { RedisTagSet } from './redis-tag-set';
export { TagSet } from './tag-set';
export { TaggedCache } from './tagged-cache';
