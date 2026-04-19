/**
 * @fileoverview Unit tests for key mappings utilities
 *
 * This test suite validates the key mapping utilities that convert keyboard key names
 * to their visual symbols and handle key value validation.
 *
 * Test Coverage:
 * - isKeyValue: Validates whether a string is a valid KeyValue type
 * - getKeyMapping: Retrieves the symbol and title for a given key
 * - keyMappings: Ensures all expected key mappings are defined
 *
 * @module @stackra/kbd
 * @category Tests
 */

import { describe, it, expect } from 'vitest';
import { isKeyValue, getKeyMapping, keyMappings } from '@/src/utils/key-mappings.util';

/**
 * Test suite for key-mappings utilities
 *
 * These tests ensure that keyboard key mappings work correctly across
 * different platforms and key types (modifiers, navigation, special keys).
 */
describe('key-mappings utilities', () => {
  /**
   * Test suite for isKeyValue function
   *
   * Validates that the function correctly identifies valid KeyValue types
   * and rejects invalid strings.
   */
  describe('isKeyValue', () => {
    /**
     * Test: Valid key values should return true
     *
     * This test ensures that all standard modifier keys (command, ctrl, shift, alt)
     * are correctly identified as valid KeyValue types.
     */
    it('should return true for valid key values', () => {
      expect(isKeyValue('command')).toBe(true);
      expect(isKeyValue('ctrl')).toBe(true);
      expect(isKeyValue('shift')).toBe(true);
      expect(isKeyValue('alt')).toBe(true);
    });

    /**
     * Test: Invalid key values should return false
     *
     * This test ensures that non-KeyValue strings (regular letters, empty strings)
     * are correctly identified as invalid.
     */
    it('should return false for invalid key values', () => {
      expect(isKeyValue('invalid')).toBe(false);
      expect(isKeyValue('K')).toBe(false);
      expect(isKeyValue('')).toBe(false);
    });
  });

  /**
   * Test suite for getKeyMapping function
   *
   * Validates that the function returns correct symbol and title mappings
   * for both valid keys and unknown keys.
   */
  describe('getKeyMapping', () => {
    /**
     * Test: Valid keys should return correct mappings
     *
     * This test verifies that known keys (command, ctrl) return their
     * expected symbols (⌘, ⌃) and titles.
     */
    it('should return mapping for valid keys', () => {
      const commandMapping = getKeyMapping('command');
      expect(commandMapping.symbol).toBe('⌘');
      expect(commandMapping.title).toBe('Command');

      const ctrlMapping = getKeyMapping('ctrl');
      expect(ctrlMapping.symbol).toBe('⌃');
      expect(ctrlMapping.title).toBe('Control');
    });

    /**
     * Test: Unknown keys should return themselves as symbols
     *
     * This test ensures that regular keys (like "K") that don't have
     * special symbols are returned as-is.
     */
    it('should return key as symbol for unknown keys', () => {
      const mapping = getKeyMapping('K');
      expect(mapping.symbol).toBe('K');
      expect(mapping.title).toBe('K');
    });

    /**
     * Test: Uppercase keys should be handled correctly
     *
     * This test verifies that the function is case-insensitive and
     * correctly maps uppercase key names to their symbols.
     */
    it('should handle uppercase keys', () => {
      const mapping = getKeyMapping('COMMAND');
      expect(mapping.symbol).toBe('⌘');
    });
  });

  /**
   * Test suite for keyMappings object
   *
   * Validates that the keyMappings object contains all expected key definitions
   * for modifiers, navigation, and special keys.
   */
  describe('keyMappings', () => {
    /**
     * Test: All modifier keys should be defined
     *
     * This test ensures that all standard modifier keys (command, ctrl, shift,
     * alt, option) are present in the keyMappings object.
     */
    it('should contain all modifier keys', () => {
      expect(keyMappings.command).toBeDefined();
      expect(keyMappings.ctrl).toBeDefined();
      expect(keyMappings.shift).toBeDefined();
      expect(keyMappings.alt).toBeDefined();
      expect(keyMappings.option).toBeDefined();
    });

    /**
     * Test: All navigation keys should be defined
     *
     * This test verifies that arrow keys (up, down, left, right) are
     * present in the keyMappings object.
     */
    it('should contain navigation keys', () => {
      expect(keyMappings.up).toBeDefined();
      expect(keyMappings.down).toBeDefined();
      expect(keyMappings.left).toBeDefined();
      expect(keyMappings.right).toBeDefined();
    });

    /**
     * Test: All special keys should be defined
     *
     * This test ensures that special keys (enter, escape, tab, space)
     * are present in the keyMappings object.
     */
    it('should contain special keys', () => {
      expect(keyMappings.enter).toBeDefined();
      expect(keyMappings.escape).toBeDefined();
      expect(keyMappings.tab).toBeDefined();
      expect(keyMappings.space).toBeDefined();
    });
  });
});
