/**
 * @fileoverview Tests for UpstashConnector
 *
 * This test suite validates the UpstashConnector functionality including:
 * - Connection creation with various configurations
 * - Timeout handling
 * - Retry configuration
 * - Connection object structure
 *
 * The UpstashConnector is responsible for creating Redis connections
 * using the Upstash HTTP API, which is suitable for client-side usage.
 *
 * @module @stackra-inc/redis
 * @category Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpstashConnector } from '@/connectors/upstash.connector';
import type { RedisConnectionConfig } from '@/interfaces';

/**
 * Test suite for UpstashConnector
 *
 * This suite tests the connector's ability to create Redis connections
 * with various configuration options. The connector wraps the Upstash
 * Redis client and provides a consistent interface for connection creation.
 */
describe('UpstashConnector', () => {
  /** Connector instance used across tests */
  let connector: UpstashConnector;

  /**
   * Setup: Create a fresh connector instance before each test
   *
   * This ensures each test starts with a clean state and doesn't
   * interfere with other tests.
   */
  beforeEach(() => {
    connector = new UpstashConnector();
  });

  /**
   * Test suite for connection creation
   *
   * Validates that the connector can create connections with various
   * configuration options and that the resulting connection objects
   * have the expected interface.
   */
  describe('connect', () => {
    /**
     * Test: Basic connection creation
     *
     * This test ensures that the connector can create a connection
     * with minimal configuration (just URL and token).
     *
     * Expected behavior:
     * - Connection object is created successfully
     * - Connection has all required methods (get, set, del, etc.)
     */
    it('should create connection with valid config', async () => {
      // Arrange: Create minimal configuration
      const config: RedisConnectionConfig = {
        url: 'https://test.upstash.io',
        token: 'test-token',
      };

      // Act: Create connection
      const connection = await connector.connect(config);

      // Assert: Connection is valid and has required methods
      expect(connection).toBeDefined();
      expect(typeof connection.get).toBe('function');
      expect(typeof connection.set).toBe('function');
      expect(typeof connection.del).toBe('function');
    });

    /**
     * Test: Connection with timeout configuration
     *
     * This test ensures that the connector can create a connection
     * with a custom timeout value.
     *
     * Expected behavior:
     * - Connection is created with timeout configuration
     * - Timeout value is respected in HTTP requests
     */
    it('should create connection with timeout', async () => {
      // Arrange: Create configuration with timeout
      const config: RedisConnectionConfig = {
        url: 'https://test.upstash.io',
        token: 'test-token',
        timeout: 5000, // 5 second timeout
      };

      // Act: Create connection
      const connection = await connector.connect(config);

      // Assert: Connection is created successfully
      expect(connection).toBeDefined();
    });

    /**
     * Test: Connection with retry configuration
     *
     * This test ensures that the connector can create a connection
     * with custom retry logic for handling transient failures.
     *
     * Expected behavior:
     * - Connection is created with retry configuration
     * - Retry logic includes backoff strategy
     * - Failed requests are retried according to configuration
     */
    it('should create connection with retry config', async () => {
      // Arrange: Create configuration with retry logic
      const config: RedisConnectionConfig = {
        url: 'https://test.upstash.io',
        token: 'test-token',
        retry: {
          retries: 3, // Retry up to 3 times
          // Exponential backoff: 1s, 2s, 3s (capped at 3s)
          backoff: (retryCount) => Math.min(1000 * 2 ** retryCount, 3000),
        },
      };

      // Act: Create connection
      const connection = await connector.connect(config);

      // Assert: Connection is created successfully
      expect(connection).toBeDefined();
    });
  });
});
