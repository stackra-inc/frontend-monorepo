/**
 * @fileoverview Unit tests for KbdModule
 *
 * This test suite validates the KbdModule class which provides a static API
 * for managing keyboard shortcuts. It tests configuration, registration,
 * querying, groups, and platform management.
 *
 * Test Coverage:
 * - Configuration: Module setup and built-in shortcuts
 * - Registration: Adding single and multiple shortcuts
 * - Querying: Filtering shortcuts by various criteria
 * - Groups: Managing shortcut groups
 * - Platform: Platform detection and key resolution
 *
 * @module @stackra/kbd
 * @category Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KbdModule } from '@/src/kbd.module';
import type { KeyboardShortcut } from '@/src/interfaces/keyboard-shortcut.interface';

/**
 * Test suite for KbdModule
 *
 * This suite tests the static API provided by KbdModule for managing
 * keyboard shortcuts throughout the application.
 */
describe('KbdModule', () => {
  /**
   * Setup: Clear module before each test
   *
   * This ensures each test starts with a clean state and doesn't
   * interfere with other tests.
   */
  beforeEach(() => {
    KbdModule.clear();
  });

  /**
   * Test suite for module configuration
   *
   * Validates that the module can be configured with various options
   * including built-in shortcuts registration.
   */
  describe('configure', () => {
    /**
     * Test: Basic configuration
     *
     * This test ensures that the module can be configured without
     * registering built-in shortcuts.
     */
    it('should configure the module', () => {
      // Configure without built-in shortcuts
      KbdModule.configure({
        registerBuiltIn: false,
        debug: false,
      });

      // Should have no shortcuts
      expect(KbdModule.getAll()).toHaveLength(0);
    });

    /**
     * Test: Built-in shortcuts registration
     *
     * This test verifies that built-in shortcuts are automatically
     * registered when the registerBuiltIn option is enabled.
     */
    it('should register built-in shortcuts when enabled', () => {
      // Configure with built-in shortcuts
      KbdModule.configure({
        registerBuiltIn: true,
        debug: false,
      });

      // Should have built-in shortcuts
      const shortcuts = KbdModule.getAll();
      expect(shortcuts.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test suite for shortcut registration
   *
   * Validates that shortcuts can be registered individually or in bulk.
   */
  describe('register', () => {
    /**
     * Test: Single shortcut registration
     *
     * This test ensures that a single shortcut can be registered
     * and is immediately available in the module.
     */
    it('should register a shortcut', () => {
      const shortcut: KeyboardShortcut = {
        id: 'test',
        name: 'Test',
        category: 'custom',
        context: 'global',
        keys: ['ctrl', 'T'],
        callback: vi.fn(),
      };

      // Register shortcut
      const registered = KbdModule.register(shortcut);

      // Verify registration
      expect(registered).toMatchObject(shortcut);
      expect(KbdModule.has('test')).toBe(true);
    });

    /**
     * Test: Multiple shortcuts registration
     *
     * This test verifies that multiple shortcuts can be registered
     * at once using the registerMany method.
     */
    it('should register multiple shortcuts', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          id: 'test1',
          name: 'Test 1',
          category: 'custom',
          context: 'global',
          keys: ['ctrl', 'T'],
          callback: vi.fn(),
        },
        {
          id: 'test2',
          name: 'Test 2',
          category: 'custom',
          context: 'global',
          keys: ['ctrl', 'Y'],
          callback: vi.fn(),
        },
      ];

      // Register multiple shortcuts
      const registered = KbdModule.registerMany(shortcuts);

      // Verify all registered
      expect(registered).toHaveLength(2);
      expect(KbdModule.has('test1')).toBe(true);
      expect(KbdModule.has('test2')).toBe(true);
    });
  });

  /**
   * Test suite for shortcut querying
   *
   * Validates that shortcuts can be filtered by category, context,
   * and other criteria.
   */
  describe('query', () => {
    /**
     * Setup: Register test shortcuts
     *
     * This creates a set of shortcuts with different categories
     * and contexts for testing query functionality.
     */
    beforeEach(() => {
      // Register test shortcuts with different categories and contexts
      KbdModule.register({
        id: 'nav1',
        name: 'Nav 1',
        category: 'navigation',
        context: 'global',
        keys: ['ctrl', 'N'],
        callback: vi.fn(),
      });

      KbdModule.register({
        id: 'edit1',
        name: 'Edit 1',
        category: 'editing',
        context: 'editor',
        keys: ['ctrl', 'E'],
        callback: vi.fn(),
      });
    });

    /**
     * Test: Query by category
     *
     * This test ensures that shortcuts can be filtered by their category.
     */
    it('should query by category', () => {
      // Query navigation shortcuts
      const results = KbdModule.query({ category: 'navigation' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('nav1');
    });

    /**
     * Test: Query by context
     *
     * This test ensures that shortcuts can be filtered by their context.
     */
    it('should query by context', () => {
      // Query editor shortcuts
      const results = KbdModule.query({ context: 'editor' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('edit1');
    });

    /**
     * Test: Query with multiple filters
     *
     * This test verifies that multiple query filters can be combined
     * to narrow down results.
     */
    it('should query by multiple filters', () => {
      // Query with multiple filters
      const results = KbdModule.query({
        category: 'navigation',
        context: 'global',
      });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('nav1');
    });
  });

  /**
   * Test suite for shortcut groups
   *
   * Validates that shortcuts can be organized into groups.
   */
  describe('groups', () => {
    /**
     * Test: Register a group
     *
     * This test ensures that a group of shortcuts can be registered
     * and retrieved.
     */
    it('should register a group', () => {
      const shortcut: KeyboardShortcut = {
        id: 'test',
        name: 'Test',
        category: 'custom',
        context: 'global',
        keys: ['ctrl', 'T'],
        callback: vi.fn(),
      };

      // Register a group
      KbdModule.registerGroup({
        id: 'test-group',
        name: 'Test Group',
        shortcuts: [shortcut],
      });

      // Retrieve the group
      const group = KbdModule.getGroup('test-group');
      expect(group).toBeDefined();
      expect(group?.name).toBe('Test Group');
    });

    /**
     * Test: Get all groups
     *
     * This test verifies that all registered groups can be retrieved,
     * including built-in groups.
     */
    it('should get all groups', () => {
      // Configure with built-in shortcuts
      KbdModule.configure({ registerBuiltIn: true });

      // Get all groups
      const groups = KbdModule.getAllGroups();
      expect(groups.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test suite for platform management
   *
   * Validates platform detection and key resolution functionality.
   */
  describe('platform', () => {
    /**
     * Test: Get current platform
     *
     * This test ensures that the platform can be detected automatically.
     */
    it('should get platform', () => {
      // Get detected platform
      const platform = KbdModule.getPlatform();
      expect(['mac', 'windows', 'linux']).toContain(platform);
    });

    /**
     * Test: Set platform manually
     *
     * This test verifies that the platform can be set manually,
     * overriding automatic detection.
     */
    it('should set platform', () => {
      // Set platform manually
      KbdModule.setPlatform('mac');
      expect(KbdModule.getPlatform()).toBe('mac');
    });

    /**
     * Test: Resolve platform-specific keys
     *
     * This test ensures that platform-specific key configurations
     * are resolved correctly based on the current platform.
     */
    it('should resolve keys', () => {
      const keys = KbdModule.resolveKeys({
        mac: ['command', 'K'],
        windows: ['ctrl', 'K'],
        linux: ['ctrl', 'K'],
        default: ['ctrl', 'K'],
      });

      expect(keys).toBeDefined();
      expect(Array.isArray(keys)).toBe(true);
    });
  });
});
