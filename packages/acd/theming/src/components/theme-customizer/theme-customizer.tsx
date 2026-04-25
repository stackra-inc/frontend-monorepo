/**
 * Theme Customizer
 *
 * |--------------------------------------------------------------------------
 * | Floating button that opens a right-side drawer with theme controls.
 * |--------------------------------------------------------------------------
 * |
 * | Built-in sections:
 * |   - Color mode selector (light/dark/system)
 * |   - Theme palette switcher (color swatches)
 * |   - Registered customizer panels (via ThemeModule.registerCustomizer)
 * |
 * | Slot positions (via @stackra/ts-ui slotRegistry):
 * |   - theme.customizer.before
 * |   - theme.customizer.before-mode
 * |   - theme.customizer.after-mode
 * |   - theme.customizer.before-palette
 * |   - theme.customizer.after-palette
 * |   - theme.customizer.after-panels
 * |   - theme.customizer.after
 * |
 * @module components/theme-customizer
 */

'use client';

import React, { useState, createElement } from 'react';
import { Button, Drawer } from '@heroui/react';
import { customizerRegistry } from '@/registries/customizer.registry';
import { ThemeSwitcher } from '@/components/theme-switcher/theme-switcher';
import { ModeSelector } from '@/components/mode-selector/mode-selector';
import { THEME_SLOTS } from '@/constants';
import { renderSlot } from '@/utils';

export interface ThemeCustomizerProps {
  /** Position of the float trigger button. @default "bottom-right" */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Custom trigger button content */
  triggerLabel?: React.ReactNode;
}

const POSITION_CLASSES: Record<NonNullable<ThemeCustomizerProps['position']>, string> = {
  'bottom-right': 'fixed bottom-6 right-6 z-50',
  'bottom-left': 'fixed bottom-6 left-6 z-50',
  'top-right': 'fixed top-6 right-6 z-50',
  'top-left': 'fixed top-6 left-6 z-50',
};

/**
 * ThemeCustomizer — floating button + drawer with theme controls and slot positions.
 */
export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  position = 'bottom-right',
  triggerLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const panels = customizerRegistry.getPanels();
  const trigger = triggerLabel ?? createElement('span', { 'aria-hidden': true }, '🎨');

  return createElement(
    React.Fragment,
    null,

    /* Float button */
    createElement(
      'div',
      { className: POSITION_CLASSES[position] },
      createElement(
        Button,
        {
          'aria-label': 'Open theme customizer',
          onPress: () => setIsOpen(true),
          size: 'lg',
          variant: 'primary',
          className: 'rounded-full size-12 p-0',
        },
        trigger
      )
    ),

    /* Drawer */
    createElement(
      Drawer.Backdrop,
      { isOpen, onOpenChange: setIsOpen, variant: 'blur' },
      createElement(
        Drawer.Content,
        { placement: 'right' },
        createElement(
          Drawer.Dialog,
          { 'aria-label': 'Theme customizer' },
          createElement(Drawer.CloseTrigger, null),
          createElement(
            Drawer.Header,
            null,
            createElement(Drawer.Heading, null, 'Theme Customizer')
          ),
          createElement(
            Drawer.Body,
            { className: 'flex flex-col gap-8 py-6' },

            /* ── Slot: before all sections ── */
            renderSlot(THEME_SLOTS.CUSTOMIZER.BEFORE),

            /* ── Slot: before color mode ── */
            renderSlot(THEME_SLOTS.CUSTOMIZER.BEFORE_MODE),

            /* ── Built-in: Color mode ── */
            createElement(
              'section',
              null,
              createElement(
                'h3',
                {
                  className: 'text-sm font-semibold text-muted uppercase tracking-wider mb-4',
                },
                'Color Mode'
              ),
              createElement(ModeSelector, { showLabel: false })
            ),

            /* ── Slot: after color mode ── */
            renderSlot(THEME_SLOTS.CUSTOMIZER.AFTER_MODE),

            /* ── Slot: before palette ── */
            renderSlot(THEME_SLOTS.CUSTOMIZER.BEFORE_PALETTE),

            /* ── Built-in: Theme palette ── */
            createElement(
              'section',
              null,
              createElement(
                'h3',
                {
                  className: 'text-sm font-semibold text-muted uppercase tracking-wider mb-4',
                },
                'Color Palette'
              ),
              createElement(ThemeSwitcher, null)
            ),

            /* ── Slot: after palette ── */
            renderSlot(THEME_SLOTS.CUSTOMIZER.AFTER_PALETTE),

            /* ── Registered panels ── */
            ...panels.map((panel) =>
              createElement(
                'section',
                { key: panel.id },
                createElement(
                  'h3',
                  {
                    className: 'text-sm font-semibold text-muted uppercase tracking-wider mb-4',
                  },
                  panel.title
                ),
                createElement(panel.component, null)
              )
            ),

            /* ── Slot: after all panels ── */
            renderSlot(THEME_SLOTS.CUSTOMIZER.AFTER_PANELS),

            /* ── Slot: after everything ── */
            renderSlot(THEME_SLOTS.CUSTOMIZER.AFTER)
          )
        )
      )
    )
  );
};

ThemeCustomizer.displayName = 'ThemeCustomizer';
