/**
 * @fileoverview ModeSelector Component
 *
 * Explicit dropdown to select light / dark / system mode.
 *
 * @module @stackra-inc/react-theming
 * @category Components
 */

'use client';

import React, { createElement } from 'react';
import { Select, Label, ListBox } from '@heroui/react';
import { useColorMode } from '@/hooks/use-color-mode';
import type { ColorMode } from '@/types/theme.types';

export interface ModeSelectorProps {
  showLabel?: boolean;
  className?: string;
}

const MODES: { id: ColorMode; label: string; icon: string }[] = [
  { id: 'light', label: 'Light', icon: '☀️' },
  { id: 'dark', label: 'Dark', icon: '🌙' },
  { id: 'system', label: 'System', icon: '💻' },
];

/**
 * ModeSelector
 *
 * Dropdown select for choosing color mode explicitly.
 */
export const ModeSelector: React.FC<ModeSelectorProps> = ({ showLabel = true, className }) => {
  const { mode, setMode } = useColorMode();

  return createElement(
    Select,
    {
      value: mode,
      onChange: (v) => setMode(v as ColorMode),
      variant: 'secondary',
      className,
      'aria-label': 'Color mode',
    },
    showLabel ? createElement(Label, null, 'Color mode') : null,
    createElement(
      Select.Trigger,
      null,
      createElement(Select.Value, null),
      createElement(Select.Indicator, null)
    ),
    createElement(
      Select.Popover,
      null,
      createElement(
        ListBox,
        null,
        ...MODES.map((m) =>
          createElement(
            ListBox.Item,
            { key: m.id, id: m.id, textValue: m.label },
            `${m.icon} ${m.label}`,
            createElement(ListBox.ItemIndicator, null)
          )
        )
      )
    )
  );
};

ModeSelector.displayName = 'ModeSelector';
