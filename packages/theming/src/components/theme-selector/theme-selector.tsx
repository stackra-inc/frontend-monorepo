/**
 * @fileoverview ThemeSelector Component
 *
 * Dropdown select for choosing a named theme.
 *
 * @module @stackra-inc/react-theming
 * @category Components
 */

'use client';

import React, { createElement } from 'react';
import { Select, Label, ListBox } from '@heroui/react';
import { useTheme } from '@/hooks/use-theme';

export interface ThemeSelectorProps {
  showLabel?: boolean;
  className?: string;
}

/**
 * ThemeSelector
 *
 * Dropdown select listing all registered themes.
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ showLabel = true, className }) => {
  const { theme, setTheme, themes } = useTheme();

  return createElement(
    Select,
    {
      value: theme,
      onChange: (v) => setTheme(v as string),
      variant: 'secondary',
      className,
      'aria-label': 'Theme',
    },
    showLabel ? createElement(Label, null, 'Theme') : null,
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
        ...themes.map((t) =>
          createElement(
            ListBox.Item,
            { key: t.id, id: t.id, textValue: t.label },
            createElement(
              'span',
              { className: 'flex items-center gap-2' },
              createElement('span', {
                className: 'size-3 rounded-full inline-block',
                style: { backgroundColor: t.color ?? '#6366f1' },
              }),
              t.label
            ),
            createElement(ListBox.ItemIndicator, null)
          )
        )
      )
    )
  );
};

ThemeSelector.displayName = 'ThemeSelector';
