/**
 * @fileoverview ThemeModuleOptions interface — forRoot configuration.
 * @module @stackra-inc/react-theming
 * @category Interfaces
 */

import type { ColorMode } from '@/types/theme.types';
import type { ThemeConfig } from './theme-config.interface';

/** ThemeModule forRoot options. */
export interface ThemeModuleOptions {
  /** Default color mode. @default "system" */
  defaultMode?: ColorMode;
  /** Default theme id. @default "default" */
  defaultTheme?: string;
  /** localStorage key for persisting the color palette. @default "theme-color" */
  storageKey?: string;
  /** Additional themes to register on init */
  themes?: ThemeConfig[];
}
