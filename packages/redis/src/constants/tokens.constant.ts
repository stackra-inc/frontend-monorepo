/**
 * Dependency injection tokens for Redis module
 *
 * @packageDocumentation
 */

/**
 * Injection token for Redis configuration.
 */
export const REDIS_CONFIG = Symbol.for('REDIS_CONFIG');

/**
 * Injection token for Redis connector.
 */
export const REDIS_CONNECTOR = Symbol.for('REDIS_CONNECTOR');

/**
 * Injection token for RedisManager (alternative to class-based injection).
 */
export const REDIS_MANAGER = Symbol.for('REDIS_MANAGER');

/**
 * @deprecated Use REDIS_MANAGER instead.
 */
export const REDIS_SERVICE = REDIS_MANAGER;
