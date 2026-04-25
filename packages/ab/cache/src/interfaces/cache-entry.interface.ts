/**
 * Cache entry structure
 *
 * Stores the cached value along with metadata for TTL tracking
 */
export interface CacheEntry<T = any> {
  /**
   * The cached value
   */
  value: T;
  /**
   * Timestamp when the entry was created (milliseconds)
   */
  timestamp: number;
  /**
   * Time-to-live in milliseconds (undefined = no expiration)
   */
  ttl?: number;
}
