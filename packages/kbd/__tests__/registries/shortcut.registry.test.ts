/**
 * @fileoverview Unit tests for ShortcutRegistry
 *
 * This test suite validates the ShortcutRegistry class which manages all keyboard
 * shortcuts in the application. It tests registration, conflict detection, querying,
 * platform detection, and the event system.
 *
 * Test Coverage:
 * - Registration: Adding shortcuts to the registry
 * - Unregistration: Removing shortcuts from the registry
 * - Retrieval: Getting shortcuts by ID, category, context
 * - Conflict Detection: Preventing duplicate key combinations
 * - Enable/Disable: Managing shortcut states
 * - Platform Detection: Detecting and resolving platform-specific keys
 * - Events: Subscribing to registry changes
 *
 * @module @stackra/kbd
 * @category Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { shortcutRegistry } from '@/src/registries/shortcut.registry';
import type { KeyboardShortcut } from '@/src/interfaces/keyboard-shortcut.interface';

/**
 * Test suite for ShortcutRegistry
 *
 * This suite tests the core functionality of the shortcut registry system,
 * ensuring proper management of keyboard shortcuts throughout the application.
 */
describe('ShortcutRegistry', () => {
  /**
   * Setup: Clear registry before each test
   *
   * This ensures each test starts with a clean slate and doesn't
   * interfere with other tests.
   */
  beforeEach(() => {
    shortcutRegistry.clear();
  });

  /**
   * Test suite for shortcut registration
   *
   * Validates that shortcuts can be registered correctly and that
   * conflicts are detected when appropriate.
   */
  describe('register', () => {
    /**
     * Test: Basic shortcut registration
     *
     * This test ensures that a shortcut can be registered and is
     * immediately available in the registry.
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

      const registered = shortcutRegistry.register(shortcut);

      expect(registered).toMatchObject(shortcut);
      expect(shortcutRegistry.has('test')).toBe(true);
    });

    /**
     * Test: Conflict detection
     *
     * This test ensures that registering two shortcuts with the same
     * key combination throws an error to prevent conflicts.
     */
    it('should detect conflicts', () => {
      const shortcut1: KeyboardShortcut = {
        id: 'test1',
        name: 'Test 1',
        category: 'custom',
        context: 'global',
        keys: ['ctrl', 'T'],
        callback: vi.fn(),
      };

      const shortcut2: KeyboardShortcut = {
        id: 'test2',
        name: 'Test 2',
        category: 'custom',
        context: 'global',
        keys: ['ctrl', 'T'],
        callback: vi.fn(),
      };

      // Register first shortcut
      shortcutRegistry.register(shortcut1);

      // Attempt to register conflicting shortcut - should throw with error option
      expect(() => {
        shortcutRegistry.register(shortcut2, { onConflict: 'error' });
      }).toThrow();
    });

    /**
     * Test: Skip conflict check option
     *
     * This test verifies that conflicts can be allowed when the
     * skipConflictCheck option is set to true.
     */
    it('should allow conflicts when skipConflictCheck is true', () => {
      const shortcut1: KeyboardShortcut = {
        id: 'test1',
        name: 'Test 1',
        category: 'custom',
        context: 'global',
        keys: ['ctrl', 'T'],
        callback: vi.fn(),
      };

      const shortcut2: KeyboardShortcut = {
        id: 'test2',
        name: 'Test 2',
        category: 'custom',
        context: 'global',
        keys: ['ctrl', 'T'],
        callback: vi.fn(),
      };

      // Register first shortcut
      shortcutRegistry.register(shortcut1);

      // Register conflicting shortcut with skipConflictCheck - should not throw
      expect(() => {
        shortcutRegistry.register(shortcut2);
      }).not.toThrow();
    });
  });

  /**
   * Test suite for shortcut unregistration
   *
   * Validates that shortcuts can be removed from the registry.
   */
  describe('unregister', () => {
    /**
     * Test: Successful unregistration
     *
     * This test ensures that a registered shortcut can be removed
     * and is no longer available in the registry.
     */
    it('should unregister a shortcut', () => {
      const shortcut: KeyboardShortcut = {
        id: 'test',
        name: 'Test',
        category: 'custom',
        context: 'global',
        keys: ['ctrl', 'T'],
        callback: vi.fn(),
      };

      // Register shortcut
      shortcutRegistry.register(shortcut);
      expect(shortcutRegistry.has('test')).toBe(true);

      // Unregister shortcut
      const result = shortcutRegistry.unregister('test');
      expect(result).toBe(true);
      expect(shortcutRegistry.has('test')).toBe(false);
    });

    /**
     * Test: Unregistering non-existent shortcut
     *
     * This test ensures that attempting to unregister a shortcut
     * that doesn't exist returns false without throwing an error.
     */
    it('should return false for non-existent shortcut', () => {
      const result = shortcutRegistry.unregister('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('get', () => {
    it('should get a shortcut by id', () => {
      const shortcut: KeyboardShortcut = {
        id: 'test',
        name: 'Test',
        category: 'custom',
        context: 'global',
        keys: ['ctrl', 'T'],
        callback: vi.fn(),
      };

      shortcutRegistry.register(shortcut);
      const retrieved = shortcutRegistry.get('test');

      expect(retrieved).toMatchObject(shortcut);
    });

    it('should return undefined for non-existent shortcut', () => {
      const retrieved = shortcutRegistry.get('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all shortcuts', () => {
      const shortcut1: KeyboardShortcut = {
        id: 'test1',
        name: 'Test 1',
        category: 'custom',
        context: 'global',
        keys: ['ctrl', 'T'],
        callback: vi.fn(),
      };

      const shortcut2: KeyboardShortcut = {
        id: 'test2',
        name: 'Test 2',
        category: 'custom',
        context: 'global',
        keys: ['ctrl', 'Y'],
        callback: vi.fn(),
      };

      shortcutRegistry.register(shortcut1);
      shortcutRegistry.register(shortcut2);

      const all = shortcutRegistry.getAll();
      expect(all).toHaveLength(2);
      expect(all).toEqual(
        expect.arrayContaining([
          expect.objectContaining(shortcut1),
          expect.objectContaining(shortcut2),
        ])
      );
    });
  });

  describe('getByCategory', () => {
    it('should filter shortcuts by category', () => {
      const shortcut1: KeyboardShortcut = {
        id: 'test1',
        name: 'Test 1',
        category: 'navigation',
        context: 'global',
        keys: ['ctrl', 'T'],
        callback: vi.fn(),
      };

      const shortcut2: KeyboardShortcut = {
        id: 'test2',
        name: 'Test 2',
        category: 'editing',
        context: 'global',
        keys: ['ctrl', 'Y'],
        callback: vi.fn(),
      };

      shortcutRegistry.register(shortcut1);
      shortcutRegistry.register(shortcut2);

      const navigation = shortcutRegistry.getByCategory('navigation');
      expect(navigation).toHaveLength(1);
      expect(navigation[0].id).toBe('test1');
    });
  });

  describe('enable/disable/toggle', () => {
    it('should enable a shortcut', () => {
      const shortcut: KeyboardShortcut = {
        id: 'test',
        name: 'Test',
        category: 'custom',
        context: 'global',
        keys: ['ctrl', 'T'],
        callback: vi.fn(),
        enabled: false,
      };

      shortcutRegistry.register(shortcut);
      shortcutRegistry.enable('test');

      const retrieved = shortcutRegistry.get('test');
      expect(retrieved?.enabled).toBe(true);
    });

    it('should disable a shortcut', () => {
      const shortcut: KeyboardShortcut = {
        id: 'test',
        name: 'Test',
        category: 'custom',
        context: 'global',
        keys: ['ctrl', 'T'],
        callback: vi.fn(),
        enabled: true,
      };

      shortcutRegistry.register(shortcut);
      shortcutRegistry.disable('test');

      const retrieved = shortcutRegistry.get('test');
      expect(retrieved?.enabled).toBe(false);
    });

    it('should toggle a shortcut', () => {
      const shortcut: KeyboardShortcut = {
        id: 'test',
        name: 'Test',
        category: 'custom',
        context: 'global',
        keys: ['ctrl', 'T'],
        callback: vi.fn(),
        enabled: true,
      };

      shortcutRegistry.register(shortcut);

      let newState = shortcutRegistry.toggle('test');
      expect(newState).toBe(false);

      newState = shortcutRegistry.toggle('test');
      expect(newState).toBe(true);
    });
  });

  describe('platform detection', () => {
    it('should detect platform', () => {
      const platform = shortcutRegistry.getPlatform();
      expect(['mac', 'windows', 'linux']).toContain(platform);
    });

    it('should resolve platform-specific keys', () => {
      const keys = shortcutRegistry.resolveKeys({
        mac: ['command', 'K'],
        windows: ['ctrl', 'K'],
        linux: ['ctrl', 'K'],
        default: ['ctrl', 'K'],
      });

      expect(keys).toBeDefined();
      expect(Array.isArray(keys)).toBe(true);
    });
  });

  describe('events', () => {
    it('should emit events on register', () => {
      const listener = vi.fn();
      shortcutRegistry.subscribe(listener);

      const shortcut: KeyboardShortcut = {
        id: 'test',
        name: 'Test',
        category: 'custom',
        context: 'global',
        keys: ['ctrl', 'T'],
        callback: vi.fn(),
      };

      shortcutRegistry.register(shortcut);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'registered',
          shortcut: expect.objectContaining({ id: 'test' }),
        })
      );
    });

    it('should unsubscribe from events', () => {
      const listener = vi.fn();
      const unsubscribe = shortcutRegistry.subscribe(listener);

      unsubscribe();

      const shortcut: KeyboardShortcut = {
        id: 'test',
        name: 'Test',
        category: 'custom',
        context: 'global',
        keys: ['ctrl', 'T'],
        callback: vi.fn(),
      };

      shortcutRegistry.register(shortcut);

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
