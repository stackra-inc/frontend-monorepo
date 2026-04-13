/**
 * Redis Manager Interface
 *
 * Contract for the Redis manager. Implement this interface to provide
 * a custom Redis manager or to mock it in tests.
 *
 * @module interfaces/redis-service
 */

import type { RedisConnection } from './redis-connection.interface';

/**
 * IRedisService
 *
 * Defines the public API for managing Redis connections.
 * The concrete implementation is `RedisManager`.
 */
export interface IRedisService {
  /**
   * Get a Redis connection by name.
   */
  connection(name?: string): Promise<RedisConnection>;

  /**
   * Disconnect a specific connection.
   */
  disconnect(name?: string): Promise<void>;

  /**
   * Disconnect all active connections.
   */
  disconnectAll(): Promise<void>;

  /**
   * Get all configured connection names.
   */
  getConnectionNames(): string[];

  /**
   * Get the default connection name.
   */
  getDefaultConnectionName(): string;

  /**
   * Check if a connection is currently active (cached).
   */
  isConnectionActive(name?: string): boolean;
}
