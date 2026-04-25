/**
 * @fileoverview Tests for RedisService
 *
 * This test suite validates the RedisService functionality including:
 * - Connection management and caching
 * - Multiple named connections
 * - Connection lifecycle (connect/disconnect)
 * - Configuration validation
 * - Default connection handling
 *
 * The RedisService is the main entry point for Redis operations in the
 * application. It manages multiple named connections internally and provides
 * a simple API for accessing Redis functionality.
 *
 * @module @stackra/redis
 * @category Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RedisService } from '@/services/redis.service';
import type { RedisConfig, RedisConnector, RedisConnection } from '@/interfaces';

/**
 * Test suite for RedisService
 *
 * This suite tests the service's ability to manage Redis connections,
 * handle multiple named connections, and provide a consistent API for
 * Redis operations throughout the application.
 */
describe('RedisService', () => {
  /** Service instance used across tests */
  let redisService: RedisService;

  /** Mock connector for creating connections */
  let mockConnector: RedisConnector;

  /** Mock connection object returned by connector */
  let mockConnection: RedisConnection;

  /** Configuration object for the service */
  let config: RedisConfig;

  /**
   * Setup: Create fresh instances before each test
   *
   * This ensures each test starts with a clean state:
   * - Fresh mock connection with spy functions
   * - Fresh mock connector
   * - Fresh configuration
   * - Fresh service instance
   */
  beforeEach(() => {
    // Create mock connection with common Redis methods
    mockConnection = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      disconnect: vi.fn(),
    } as any;

    // Create mock connector that returns the mock connection
    mockConnector = {
      connect: vi.fn().mockResolvedValue(mockConnection),
    };

    // Create configuration with two named connections
    config = {
      default: 'cache', // Default connection name
      connections: {
        cache: {
          url: 'https://test.upstash.io',
          token: 'test-token',
        },
        session: {
          url: 'https://session.upstash.io',
          token: 'session-token',
        },
      },
    };

    // Create service instance with mocks
    redisService = new RedisService(config, mockConnector);
  });

  /**
   * Test suite for connection retrieval
   *
   * Validates that the service can retrieve connections by name,
   * use the default connection when no name is provided, and
   * properly cache connections for reuse.
   */
  describe('connection', () => {
    /**
     * Test: Default connection retrieval
     *
     * This test ensures that when no connection name is provided,
     * the service returns the default connection as specified in
     * the configuration.
     *
     * Expected behavior:
     * - Connector is called with default connection config
     * - Returned connection matches the mock connection
     */
    it('should return default connection when no name provided', async () => {
      // Act: Get connection without specifying name
      const connection = await redisService.connection();

      // Assert: Connector was called with default config
      expect(mockConnector.connect).toHaveBeenCalledWith(config.connections.cache);
      // Assert: Returned connection is the mock connection
      expect(connection).toBe(mockConnection);
    });

    /**
     * Test: Named connection retrieval
     *
     * This test ensures that the service can retrieve a specific
     * named connection when requested.
     *
     * Expected behavior:
     * - Connector is called with the specified connection config
     * - Returned connection matches the mock connection
     */
    it('should return named connection', async () => {
      // Act: Get specific named connection
      const connection = await redisService.connection('session');

      // Assert: Connector was called with session config
      expect(mockConnector.connect).toHaveBeenCalledWith(config.connections.session);
      // Assert: Returned connection is the mock connection
      expect(connection).toBe(mockConnection);
    });

    /**
     * Test: Connection caching
     *
     * This test ensures that connections are cached and reused
     * instead of creating new connections for each request.
     *
     * Expected behavior:
     * - First call creates a new connection
     * - Second call returns the cached connection
     * - Connector is only called once
     * - Both calls return the same connection instance
     */
    it('should cache connections', async () => {
      // Act: Get the same connection twice
      const conn1 = await redisService.connection('cache');
      const conn2 = await redisService.connection('cache');

      // Assert: Connector was only called once (connection was cached)
      expect(mockConnector.connect).toHaveBeenCalledTimes(1);
      // Assert: Both calls returned the same instance
      expect(conn1).toBe(conn2);
    });

    /**
     * Test: Error handling for unconfigured connections
     *
     * This test ensures that the service throws a helpful error
     * when attempting to access a connection that hasn't been
     * configured.
     *
     * Expected behavior:
     * - Error is thrown with descriptive message
     * - Error message includes the invalid connection name
     * - Error message lists available connections
     */
    it('should throw error for unconfigured connection', async () => {
      // Act & Assert: Attempting to get invalid connection should throw
      await expect(redisService.connection('invalid')).rejects.toThrow(
        'Redis connection [invalid] not configured'
      );
    });
  });

  /**
   * Test suite for connection disconnection
   *
   * Validates that the service can properly disconnect connections
   * and remove them from the cache.
   */
  describe('disconnect', () => {
    /**
     * Test: Disconnect default connection
     *
     * This test ensures that the default connection can be
     * disconnected and removed from the cache.
     *
     * Expected behavior:
     * - Connection's disconnect method is called
     * - Connection is removed from cache
     * - isConnectionActive returns false after disconnect
     */
    it('should disconnect default connection', async () => {
      // Arrange: Create a connection first
      await redisService.connection();

      // Act: Disconnect the default connection
      await redisService.disconnect();

      // Assert: Connection's disconnect method was called
      expect(mockConnection.disconnect).toHaveBeenCalled();
      // Assert: Connection is no longer active
      expect(redisService.isConnectionActive()).toBe(false);
    });

    /**
     * Test: Disconnect named connection
     *
     * This test ensures that a specific named connection can be
     * disconnected without affecting other connections.
     *
     * Expected behavior:
     * - Specified connection's disconnect method is called
     * - Specified connection is removed from cache
     * - Other connections remain active
     */
    it('should disconnect named connection', async () => {
      // Arrange: Create a connection first
      await redisService.connection('session');

      // Act: Disconnect the session connection
      await redisService.disconnect('session');

      // Assert: Connection's disconnect method was called
      expect(mockConnection.disconnect).toHaveBeenCalled();
      // Assert: Session connection is no longer active
      expect(redisService.isConnectionActive('session')).toBe(false);
    });

    /**
     * Test: Graceful handling of non-existent connection disconnect
     *
     * This test ensures that attempting to disconnect a connection
     * that doesn't exist or was never created doesn't throw an error.
     *
     * Expected behavior:
     * - No error is thrown
     * - Operation completes successfully
     */
    it('should handle disconnect of non-existent connection', async () => {
      // Act & Assert: Disconnecting non-existent connection should not throw
      await expect(redisService.disconnect('nonexistent')).resolves.not.toThrow();
    });
  });

  /**
   * Test suite for disconnecting all connections
   *
   * Validates that the service can disconnect all active connections
   * at once, useful for cleanup during application shutdown.
   */
  describe('disconnectAll', () => {
    /**
     * Test: Disconnect all active connections
     *
     * This test ensures that all active connections are properly
     * disconnected and removed from the cache.
     *
     * Expected behavior:
     * - All connections' disconnect methods are called
     * - All connections are removed from cache
     * - isConnectionActive returns false for all connections
     */
    it('should disconnect all connections', async () => {
      // Arrange: Create multiple connections
      await redisService.connection('cache');
      await redisService.connection('session');

      // Act: Disconnect all connections
      await redisService.disconnectAll();

      // Assert: Disconnect was called for each connection
      expect(mockConnection.disconnect).toHaveBeenCalledTimes(2);
      // Assert: Cache connection is no longer active
      expect(redisService.isConnectionActive('cache')).toBe(false);
      // Assert: Session connection is no longer active
      expect(redisService.isConnectionActive('session')).toBe(false);
    });
  });

  /**
   * Test suite for retrieving connection names
   *
   * Validates that the service can provide information about
   * configured connections.
   */
  describe('getConnectionNames', () => {
    /**
     * Test: Get all configured connection names
     *
     * This test ensures that the service can return a list of
     * all configured connection names.
     *
     * Expected behavior:
     * - Returns array of connection names
     * - Array includes all configured connections
     */
    it('should return all configured connection names', () => {
      // Act: Get connection names
      const names = redisService.getConnectionNames();

      // Assert: Returns array with both configured connections
      expect(names).toEqual(['cache', 'session']);
    });
  });

  /**
   * Test suite for retrieving default connection name
   *
   * Validates that the service can provide the name of the
   * default connection.
   */
  describe('getDefaultConnectionName', () => {
    /**
     * Test: Get default connection name
     *
     * This test ensures that the service returns the correct
     * default connection name as specified in configuration.
     *
     * Expected behavior:
     * - Returns the default connection name from config
     */
    it('should return default connection name', () => {
      // Act: Get default connection name
      const defaultName = redisService.getDefaultConnectionName();

      // Assert: Returns the configured default name
      expect(defaultName).toBe('cache');
    });
  });

  /**
   * Test suite for checking connection active status
   *
   * Validates that the service can report whether a connection
   * is currently active (cached and ready to use).
   */
  describe('isConnectionActive', () => {
    /**
     * Test: Check inactive connection
     *
     * This test ensures that the service correctly reports when
     * a connection has not been created yet.
     *
     * Expected behavior:
     * - Returns false for connections that haven't been created
     */
    it('should return false for inactive connection', () => {
      // Act & Assert: Connection that hasn't been created is not active
      expect(redisService.isConnectionActive('cache')).toBe(false);
    });

    /**
     * Test: Check active connection
     *
     * This test ensures that the service correctly reports when
     * a connection has been created and is cached.
     *
     * Expected behavior:
     * - Returns true for connections that have been created
     * - Status is accurate after connection creation
     */
    it('should return true for active connection', async () => {
      // Arrange: Create a connection
      await redisService.connection('cache');

      // Act & Assert: Connection that has been created is active
      expect(redisService.isConnectionActive('cache')).toBe(true);
    });
  });
});
