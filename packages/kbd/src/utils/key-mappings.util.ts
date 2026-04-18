import { Str } from '@stackra/ts-support';
import type { KeyValue } from '@/types';

/**
 * Mapping of key values to their visual symbols and accessibility titles.
 * This provides a consistent way to display keyboard shortcuts across the application.
 *
 * @category Utils
 * @internal
 */
export const keyMappings: Record<KeyValue, { symbol: string; title: string }> = {
  // Modifier keys
  command: { symbol: '⌘', title: 'Command' },
  shift: { symbol: '⇧', title: 'Shift' },
  ctrl: { symbol: '⌃', title: 'Control' },
  option: { symbol: '⌥', title: 'Option' },
  alt: { symbol: '⌥', title: 'Alt' },
  win: { symbol: '⊞', title: 'Windows' },

  // Special keys
  enter: { symbol: '↵', title: 'Enter' },
  delete: { symbol: '⌫', title: 'Delete' },
  escape: { symbol: '⎋', title: 'Escape' },
  tab: { symbol: '⇥', title: 'Tab' },
  space: { symbol: '␣', title: 'Space' },
  capslock: { symbol: '⇪', title: 'Caps Lock' },
  help: { symbol: '?', title: 'Help' },
  fn: { symbol: 'fn', title: 'Function' },

  // Navigation keys
  up: { symbol: '↑', title: 'Up Arrow' },
  down: { symbol: '↓', title: 'Down Arrow' },
  left: { symbol: '←', title: 'Left Arrow' },
  right: { symbol: '→', title: 'Right Arrow' },
  pageup: { symbol: '⇞', title: 'Page Up' },
  pagedown: { symbol: '⇟', title: 'Page Down' },
  home: { symbol: '↖', title: 'Home' },
  end: { symbol: '↘', title: 'End' },
};

/**
 * Checks if a given string is a valid KeyValue.
 *
 * @param key - The key string to check
 * @returns True if the key is a valid KeyValue, false otherwise
 *
 * @category Utils
 * @public
 */
export const isKeyValue = (key: string): key is KeyValue => {
  return key in keyMappings;
};

/**
 * Gets the symbol and title for a given key value.
 * If the key is not a recognized KeyValue, returns the key itself as both symbol and title.
 *
 * @param key - The key value to look up
 * @returns An object containing the symbol and title for the key
 *
 * @category Utils
 * @public
 */
export const getKeyMapping = (key: string): { symbol: string; title: string } => {
  const lowerKey = Str.lower(key);
  if (isKeyValue(lowerKey)) {
    return keyMappings[lowerKey];
  }
  // For regular keys (like letters), return the key itself
  return { symbol: Str.upper(key), title: Str.upper(key) };
};
