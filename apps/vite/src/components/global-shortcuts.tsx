/**
 * Global Shortcuts
 *
 * |--------------------------------------------------------------------------
 * | Activates all registered keyboard shortcuts from the ShortcutRegistry.
 * |--------------------------------------------------------------------------
 * |
 * | Renders nothing — just attaches a global keydown listener that
 * | checks every keystroke against the registered shortcuts.
 * |
 * | In Electron mode, menu shortcuts (id starting with "menu:") are
 * | handled by the native menu — we skip them here to prevent
 * | double execution.
 * |
 * | Place this once in the app shell (Provider) to enable all shortcuts.
 * |
 * @module @stackra/vite
 */

import { useEffect, useCallback } from 'react';
import { shortcutRegistry } from '@stackra/kbd';

/** Whether we're running inside Electron. */
const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

/**
 * Normalizes a key string to match event.key values.
 */
const MODIFIER_MAP: Record<
  string,
  keyof Pick<KeyboardEvent, 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'>
> = {
  command: 'metaKey',
  cmd: 'metaKey',
  meta: 'metaKey',
  ctrl: 'ctrlKey',
  control: 'ctrlKey',
  shift: 'shiftKey',
  alt: 'altKey',
  option: 'altKey',
};

export function GlobalShortcuts() {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    /*
    |--------------------------------------------------------------------------
    | Skip if the user is typing in an input/textarea.
    |--------------------------------------------------------------------------
    */
    const target = event.target as HTMLElement;
    const isInput =
      target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    const shortcuts = shortcutRegistry.getAll();

    for (const shortcut of shortcuts) {
      if (!shortcut.enabled) continue;
      if (isInput && !shortcut.allowInInput) continue;
      if (shortcut.condition && !shortcut.condition()) continue;

      /*
      |--------------------------------------------------------------------------
      | In Electron, skip menu shortcuts — the native menu handles them.
      | Menu shortcuts have IDs like "menu:file:newOrder".
      |--------------------------------------------------------------------------
      */
      if (isElectron && shortcut.id.startsWith('menu:')) continue;

      const keys = shortcutRegistry.resolveKeys(shortcut.keys);
      if (!keys || keys.length === 0) continue;

      /*
      |--------------------------------------------------------------------------
      | Check if all required keys are pressed.
      |--------------------------------------------------------------------------
      */
      let allPressed = true;
      let hasNonModifier = false;

      for (const key of keys) {
        const lower = key.toLowerCase();
        const modProp = MODIFIER_MAP[lower];

        if (modProp) {
          if (!event[modProp]) {
            allPressed = false;
            break;
          }
        } else {
          hasNonModifier = true;
          if (event.key.toLowerCase() !== lower && event.code.toLowerCase() !== `key${lower}`) {
            allPressed = false;
            break;
          }
        }
      }

      if (!allPressed || !hasNonModifier) continue;

      /*
      |--------------------------------------------------------------------------
      | Match found — execute the callback.
      |--------------------------------------------------------------------------
      */
      if (shortcut.preventDefault !== false) {
        event.preventDefault();
      }
      if (shortcut.stopPropagation) {
        event.stopPropagation();
      }

      if (shortcut.callback) {
        shortcut.callback();
      }

      /* Only fire the first matching shortcut. */
      return;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null;
}
