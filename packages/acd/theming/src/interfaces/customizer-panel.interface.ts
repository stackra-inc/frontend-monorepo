/**
 * @fileoverview CustomizerPanel interface — a customizer panel registered with the ThemeModule.
 * @module @stackra/react-theming
 * @category Interfaces
 */

import type React from 'react';

/** A customizer panel registered with the ThemeModule. */
export interface CustomizerPanel {
  /** Unique ID for this panel (e.g. "auth", "multitenancy"). */
  id: string;
  /** Section heading shown in the drawer. */
  title: string;
  /** The React component that renders the customizer controls. */
  component: React.ComponentType;
  /** Display order — lower = shown first. @default 99 */
  order?: number;
}
