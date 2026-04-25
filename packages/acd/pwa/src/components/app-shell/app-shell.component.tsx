/**
 * @fileoverview AppShell — PWA app shell layout wrapper.
 *
 * Provides safe-area padding, overscroll prevention, status bar spacing,
 * and standalone mode detection. Wraps the entire app content.
 * Uses the unified `usePwa()` hook for standalone detection.
 *
 * @module pwa/components/app-shell
 */

import React, { useEffect } from 'react';
import { usePwa } from '@/hooks/use-pwa';
import { APP_SHELL_DEFAULTS } from '@/constants';
import type { AppShellConfig } from '@/interfaces';

/** Props for the AppShell component. */
export interface AppShellProps extends AppShellConfig {
  /** App content. */
  children: React.ReactNode;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * PWA app shell layout wrapper.
 *
 * Applies safe-area insets, prevents overscroll bounce on iOS,
 * and sets `data-standalone` attribute for standalone-specific styling.
 *
 * @example
 * ```tsx
 * <PwaProvider>
 *   <AppShell
 *     themeColor="#f97316"
 *     header={<TopNav />}
 *     footer={<BottomNav />}
 *   >
 *     <Routes />
 *   </AppShell>
 * </PwaProvider>
 * ```
 */
export function AppShell({
  children,
  className,
  statusBarStyle = APP_SHELL_DEFAULTS.STATUS_BAR_STYLE,
  themeColor,
  safeAreaPadding = APP_SHELL_DEFAULTS.SAFE_AREA_PADDING,
  preventOverscroll = APP_SHELL_DEFAULTS.PREVENT_OVERSCROLL,
  header,
  footer,
}: AppShellProps): React.JSX.Element {
  const { isStandalone } = usePwa();

  useEffect(() => {
    if (!themeColor) return;
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', themeColor);
  }, [themeColor]);

  useEffect(() => {
    if (!preventOverscroll) return;
    const html = document.documentElement;
    const body = document.body;
    html.style.overscrollBehavior = 'none';
    body.style.overscrollBehavior = 'none';
    return () => {
      html.style.overscrollBehavior = '';
      body.style.overscrollBehavior = '';
    };
  }, [preventOverscroll]);

  return (
    <div
      className={[
        'flex flex-col min-h-screen min-h-dvh',
        safeAreaPadding &&
          'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-standalone={isStandalone ? 'true' : undefined}
      data-status-bar={statusBarStyle}
    >
      {header}
      <main className="flex-1 min-h-0">{children}</main>
      {footer}
    </div>
  );
}
