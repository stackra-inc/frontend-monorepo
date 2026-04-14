/**
 * Tests for key mapping utilities
 *
 * @category Tests
 */

import { describe, it, expect } from 'vitest';
import { isKeyValue, getKeyMapping, keyMappings } from '@/src';

describe('keyMappings', () => {
  it('should contain all modifier keys', () => {
    expect(keyMappings.command).toBeDefined();
    expect(keyMappings.shift).toBeDefined();
    expect(keyMappings.ctrl).toBeDefined();
    expect(keyMappings.option).toBeDefined();
    expect(keyMappings.alt).toBeDefined();
    expect(keyMappings.win).toBeDefined();
  });

  it('should contain all special keys', () => {
    expect(keyMappings.enter).toBeDefined();
    expect(keyMappings.delete).toBeDefined();
    expect(keyMappings.escape).toBeDefined();
    expect(keyMappings.tab).toBeDefined();
    expect(keyMappings.space).toBeDefined();
  });

  it('should contain all navigation keys', () => {
    expect(keyMappings.up).toBeDefined();
    expect(keyMappings.down).toBeDefined();
    expect(keyMappings.left).toBeDefined();
    expect(keyMappings.right).toBeDefined();
    expect(keyMappings.pageup).toBeDefined();
    expect(keyMappings.pagedown).toBeDefined();
    expect(keyMappings.home).toBeDefined();
    expect(keyMappings.end).toBeDefined();
  });
});

describe('isKeyValue', () => {
  it('should return true for valid key values', () => {
    expect(isKeyValue('command')).toBe(true);
    expect(isKeyValue('shift')).toBe(true);
    expect(isKeyValue('enter')).toBe(true);
    expect(isKeyValue('up')).toBe(true);
  });

  it('should return false for invalid key values', () => {
    expect(isKeyValue('invalid')).toBe(false);
    expect(isKeyValue('K')).toBe(false);
    expect(isKeyValue('')).toBe(false);
  });
});

describe('getKeyMapping', () => {
  it('should return correct mapping for valid keys', () => {
    const commandMapping = getKeyMapping('command');
    expect(commandMapping.symbol).toBe('⌘');
    expect(commandMapping.title).toBe('Command');

    const shiftMapping = getKeyMapping('shift');
    expect(shiftMapping.symbol).toBe('⇧');
    expect(shiftMapping.title).toBe('Shift');
  });

  it('should return uppercase key for regular keys', () => {
    const kMapping = getKeyMapping('k');
    expect(kMapping.symbol).toBe('K');
    expect(kMapping.title).toBe('K');

    const pMapping = getKeyMapping('p');
    expect(pMapping.symbol).toBe('P');
    expect(pMapping.title).toBe('P');
  });

  it('should handle mixed case input', () => {
    const mapping = getKeyMapping('CoMmAnD');
    expect(mapping.symbol).toBe('COMMAND');
    expect(mapping.title).toBe('COMMAND');
  });
});
