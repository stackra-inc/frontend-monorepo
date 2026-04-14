/**
 * @fileoverview useKbdVisibility hook
 *
 * Read and control whether shortcut hints are visible.
 *
 * @module hooks/use-kbd-visibility
 *
 * @example
 * ```tsx
 * function SettingsPanel() {
 *   const { visible, toggle } = useKbdVisibility();
 *   return (
 *     <Switch checked={visible} onChange={toggle} label="Show keyboard shortcuts" />
 *   );
 * }
 * ```
 */

import { useContext } from 'react';
import { KbdVisibilityContext } from '@/contexts/kbd-visibility.context';
import type { KbdVisibilityContextValue } from '@/contexts/kbd-visibility.context';

/**
 * Hook to read and control shortcut hint visibility.
 *
 * @returns { visible, toggle, setVisible }
 */
export function useKbdVisibility(): KbdVisibilityContextValue {
  return useContext(KbdVisibilityContext);
}
