/**
 * @fileoverview ThemeSwitcher Component
 *
 * Color swatch row for picking a named theme.
 *
 * @module @stackra-inc/react-theming
 * @category Components
 */

'use client';

import React, { createElement } from 'react';
import { useTheme } from '@/hooks/use-theme';

export interface ThemeSwitcherProps {
  className?: string;
}

/**
 * ThemeSwitcher
 *
 * Renders a row of color swatches — one per registered theme.
 * Clicking a swatch activates that theme.
 */
export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className }) => {
  const { theme, setTheme, themes } = useTheme();

  return createElement(
    'div',
    {
      className: `flex flex-wrap gap-2 ${className ?? ''}`,
      role: 'radiogroup',
      'aria-label': 'Theme',
    },
    themes.map((t) =>
      createElement('button', {
        key: t.id,
        type: 'button',
        role: 'radio',
        'aria-checked': theme === t.id,
        'aria-label': t.label,
        title: t.label,
        onClick: () => setTheme(t.id),
        className: [
          'size-7 rounded-full border-2 transition-all',
          theme === t.id ? 'border-foreground scale-110 ' : 'border-transparent hover:scale-105',
        ].join(' '),
        style: { backgroundColor: t.color ?? '#6366f1' },
      })
    )
  );
};

ThemeSwitcher.displayName = 'ThemeSwitcher';
