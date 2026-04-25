/**
 * @fileoverview AppShellConfig — configuration for the PWA app shell.
 * @module pwa/app-shell/interfaces/app-shell-config
 */

import type { ReactNode } from 'react';

/**
 * Configuration for the PWA app shell layout.
 */
export interface AppShellConfig {
  /** Status bar color for mobile browsers. @default "default" */
  statusBarStyle?: 'default' | 'black' | 'black-translucent';

  /** Theme color for the browser chrome. */
  themeColor?: string;

  /** Whether to apply safe-area padding. @default true */
  safeAreaPadding?: boolean;

  /** Whether to prevent overscroll/bounce on iOS. @default true */
  preventOverscroll?: boolean;

  /** Custom header element (e.g. status bar spacer). */
  header?: ReactNode;

  /** Custom footer element (e.g. bottom nav). */
  footer?: ReactNode;
}
