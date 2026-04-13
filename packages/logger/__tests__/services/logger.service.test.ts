/**
 * @fileoverview Tests for LoggerService
 *
 * This test suite validates the LoggerService functionality including:
 * - Channel management and caching
 * - Multiple named channels
 * - Logging at different levels (debug, info, warn, error, fatal)
 * - Context management (withContext, withoutContext)
 * - Channel lifecycle and configuration
 *
 * The LoggerService is the main entry point for logging operations in the
 * application. It manages multiple named channels internally and provides
 * a unified API for logging throughout the application.
 *
 * @module @abdokouta/react-logger
 * @category Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoggerService } from '@/services/logger.service';
import type { LoggerModuleOptions } from '@/interfaces/logger-module-options.interface';
import type { LoggerInterface } from '@/interfaces/logger.interface';

/**
 * Test suite for LoggerService
 *
 * This suite tests the service's ability to manage logging channels,
 * handle multiple named channels, and provide a consistent API for
 * logging operations throughout the application.
 */
describe('LoggerService', () => {
  /** Service instance used across tests */
  let loggerService: LoggerService;

  /** Mock logger instance returned by channels */
  let mockLogger: LoggerInterface;

  /** Configuration object for the service */
  let config: LoggerModuleOptions;

  /**
   * Setup: Create fresh instances before each test
   *
   * This ensures each test starts with a clean state:
   * - Fresh mock logger with spy functions
   * - Fresh configuration with multiple channels
   * - Fresh service instance
   */
  beforeEach(() => {
    // Create mock logger with all logging methods
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn(),
      withContext: vi.fn().mockReturnThis(),
      withoutContext: vi.fn().mockReturnThis(),
      getTransporters: vi.fn().mockReturnValue([]),
    } as any;

    // Create configuration with multiple channels
    config = {
      default: 'app', // Default channel name
      channels: {
        app: {
          level: 'info',
          transporters: [],
        },
        audit: {
          level: 'info',
          transporters: [],
        },
        error: {
          level: 'error',
          transporters: [],
        },
      },
    };

    // Create service instance with config
    loggerService = new LoggerService(config);
  });

  /**
   * Test suite for channel retrieval
   *
   * Validates that the service can retrieve channels by name,
   * use the default channel when no name is provided, and
   * properly cache channels for reuse.
   */
  describe('channel', () => {
    /**
     * Test: Default channel retrieval
     *
     * This test ensures that when no channel name is provided,
     * the service returns the default channel as specified in
     * the configuration.
     *
     * Expected behavior:
     * - Returns a logger instance
     * - Uses the default channel from config
     */
    it('should return default channel when no name provided', () => {
      // Act: Get channel without specifying name
      const channel = loggerService.channel();

      // Assert: Channel is defined
      expect(channel).toBeDefined();
      // Assert: Channel has logging methods
      expect(typeof channel.info).toBe('function');
    });

    /**
     * Test: Named channel retrieval
     *
     * This test ensures that the service can retrieve a specific
     * named channel when requested.
     *
     * Expected behavior:
     * - Returns a logger instance for the named channel
     * - Channel is configured according to its settings
     */
    it('should return named channel', () => {
      // Act: Get specific named channel
      const channel = loggerService.channel('audit');

      // Assert: Channel is defined
      expect(channel).toBeDefined();
      // Assert: Channel has logging methods
      expect(typeof channel.info).toBe('function');
    });

    /**
     * Test: Channel caching
     *
     * This test ensures that channels are cached and reused
     * instead of creating new channels for each request.
     *
     * Expected behavior:
     * - First call creates a new channel
     * - Second call returns the cached channel
     * - Both calls return the same channel instance
     */
    it('should cache channels', () => {
      // Act: Get the same channel twice
      const channel1 = loggerService.channel('app');
      const channel2 = loggerService.channel('app');

      // Assert: Both calls returned the same instance
      expect(channel1).toBe(channel2);
    });

    /**
     * Test: Error handling for unconfigured channels
     *
     * This test ensures that the service throws a helpful error
     * when attempting to access a channel that hasn't been
     * configured.
     *
     * Expected behavior:
     * - Error is thrown with descriptive message
     * - Error message includes the invalid channel name
     * - Error message lists available channels
     */
    it('should throw error for unconfigured channel', () => {
      // Act & Assert: Attempting to get invalid channel should throw
      expect(() => loggerService.channel('invalid')).toThrow(
        'Logger channel [invalid] is not configured'
      );
    });
  });

  /**
   * Test suite for logging methods
   *
   * Validates that the service provides convenient methods for
   * logging at different levels using the default channel.
   */
  describe('logging methods', () => {
    it('should log debug messages', () => {
      // Spy on the underlying channel's debug method
      const channelInstance = loggerService.channel();
      const debugSpy = vi.spyOn(channelInstance, 'debug');

      loggerService.debug('Debug message', { key: 'value' });

      expect(debugSpy).toHaveBeenCalledWith('Debug message', { key: 'value' });
    });

    it('should log info messages', () => {
      const channelInstance = loggerService.channel();
      const infoSpy = vi.spyOn(channelInstance, 'info');

      loggerService.info('Info message', { userId: 123 });

      expect(infoSpy).toHaveBeenCalledWith('Info message', { userId: 123 });
    });

    it('should log warn messages', () => {
      const channelInstance = loggerService.channel();
      const warnSpy = vi.spyOn(channelInstance, 'warn');

      loggerService.warn('Warning message', { remaining: 10 });

      expect(warnSpy).toHaveBeenCalledWith('Warning message', { remaining: 10 });
    });

    it('should log error messages', () => {
      const channelInstance = loggerService.channel();
      const errorSpy = vi.spyOn(channelInstance, 'error');

      loggerService.error('Error message', { error: 'details' });

      expect(errorSpy).toHaveBeenCalledWith('Error message', { error: 'details' });
    });

    it('should log fatal messages', () => {
      const channelInstance = loggerService.channel();
      const fatalSpy = vi.spyOn(channelInstance, 'fatal');

      loggerService.fatal('Fatal error', { stack: 'trace' });

      expect(fatalSpy).toHaveBeenCalledWith('Fatal error', { stack: 'trace' });
    });
  });

  /**
   * Test suite for context management
   *
   * Validates that the service can manage persistent context
   * that is included with all log entries.
   */
  describe('context management', () => {
    /**
     * Test: Adding context
     *
     * This test ensures that context can be added to the
     * default channel and is included with subsequent logs.
     *
     * Expected behavior:
     * - Context is added to default channel
     * - Method returns service instance for chaining
     */
    it('should add context to default channel', () => {
      // Act: Add context
      const result = loggerService.withContext({ requestId: 'abc-123' });

      // Assert: Returns service instance for chaining
      expect(result).toBe(loggerService);
    });

    /**
     * Test: Removing context
     *
     * This test ensures that context can be removed from the
     * default channel.
     *
     * Expected behavior:
     * - Specified context keys are removed
     * - Method returns service instance for chaining
     */
    it('should remove context from default channel', () => {
      // Act: Remove context
      const result = loggerService.withoutContext(['requestId']);

      // Assert: Returns service instance for chaining
      expect(result).toBe(loggerService);
    });

    /**
     * Test: Context chaining
     *
     * This test ensures that context methods can be chained
     * for fluent API usage.
     *
     * Expected behavior:
     * - Multiple context operations can be chained
     * - Final result is the service instance
     */
    it('should support method chaining', () => {
      // Act: Chain context operations
      const result = loggerService.withContext({ requestId: 'abc' }).withContext({ userId: 123 });

      // Assert: Returns service instance
      expect(result).toBe(loggerService);
    });
  });

  /**
   * Test suite for channel information methods
   *
   * Validates that the service can provide information about
   * configured channels.
   */
  describe('channel information', () => {
    /**
     * Test: Get default channel name
     *
     * This test ensures that the service returns the correct
     * default channel name as specified in configuration.
     *
     * Expected behavior:
     * - Returns the default channel name from config
     */
    it('should return default channel name', () => {
      // Act: Get default channel name
      const defaultName = loggerService.getDefaultChannelName();

      // Assert: Returns the configured default name
      expect(defaultName).toBe('app');
    });

    /**
     * Test: Get all channel names
     *
     * This test ensures that the service can return a list of
     * all configured channel names.
     *
     * Expected behavior:
     * - Returns array of channel names
     * - Array includes all configured channels
     */
    it('should return all configured channel names', () => {
      // Act: Get channel names
      const names = loggerService.getChannelNames();

      // Assert: Returns array with all configured channels
      expect(names).toEqual(['app', 'audit', 'error']);
    });

    /**
     * Test: Check if channel exists
     *
     * This test ensures that the service can check whether
     * a channel is configured.
     *
     * Expected behavior:
     * - Returns true for configured channels
     * - Returns false for unconfigured channels
     */
    it('should check if channel is configured', () => {
      // Act & Assert: Configured channel exists
      expect(loggerService.hasChannel('app')).toBe(true);
      // Act & Assert: Unconfigured channel doesn't exist
      expect(loggerService.hasChannel('invalid')).toBe(false);
    });

    /**
     * Test: Check if channel is active
     *
     * This test ensures that the service can report whether
     * a channel is currently active (cached and ready to use).
     *
     * Expected behavior:
     * - Returns false for channels that haven't been created
     * - Returns true for channels that have been created
     */
    it('should check if channel is active', () => {
      // Act & Assert: Channel that hasn't been created is not active
      expect(loggerService.isChannelActive('audit')).toBe(false);

      // Arrange: Create a channel
      loggerService.channel('audit');

      // Act & Assert: Channel that has been created is active
      expect(loggerService.isChannelActive('audit')).toBe(true);
    });
  });
});
