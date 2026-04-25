/**
 * @fileoverview ShortcutHint — visibility-aware keyboard shortcut display
 *
 * Wraps HeroUI's `<Kbd>` component and reads from `KbdVisibilityContext`
 * to conditionally render. When visibility is off, renders nothing.
 *
 * Use this instead of raw `<Kbd>` whenever you want the hint to
 * respect the global show/hide toggle.
 *
 * @module components/shortcut-hint
 *
 * @example
 * ```tsx
 * // Next to a button — only shows when hints are visible
 * <Button>Save</Button>
 * <ShortcutHint keys={["command", "S"]} />
 *
 * // Inline with text
 * <span>Press <ShortcutHint keys={["command", "K"]} /> to search</span>
 *
 * // With custom className
 * <ShortcutHint keys={["command", "N"]} className="ml-2 opacity-60" />
 * ```
 */

import { useContext } from 'react';
import { Kbd } from '@heroui/react';
import { KbdVisibilityContext } from '@/contexts/kbd-visibility.context';
import type { KeyValue } from '@/types/key-value.type';

/** Platform-aware key symbol mapping */
const KEY_SYMBOLS: Record<string, string> = {
  command: '⌘',
  shift: '⇧',
  ctrl: '⌃',
  option: '⌥',
  alt: '⌥',
  enter: '↵',
  delete: '⌫',
  escape: 'esc',
  tab: '⇥',
  space: '␣',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};

export interface ShortcutHintProps {
  /** Key combination to display */
  keys: (KeyValue | string)[];
  /** Additional CSS classes */
  className?: string;
  /** Override visibility (ignore context) */
  forceVisible?: boolean;
}

/**
 * Visibility-aware shortcut hint.
 *
 * Renders the key combination using HeroUI's Kbd component,
 * but only when the global visibility context says hints are on.
 * Use `forceVisible` to override the context (e.g. in settings panels).
 */
export function ShortcutHint({ keys, className, forceVisible }: ShortcutHintProps) {
  const { visible } = useContext(KbdVisibilityContext);

  if (!forceVisible && !visible) return null;

  return (
    <span className={`inline-flex items-center gap-0.5 ${className ?? ''}`}>
      {keys.map((key, i) => {
        const symbol = KEY_SYMBOLS[key.toLowerCase()] ?? key.toUpperCase();
        return (
          <Kbd key={i} className="px-1.5 py-0.5 text-[10px]">
            {symbol}
          </Kbd>
        );
      })}
    </span>
  );
}
