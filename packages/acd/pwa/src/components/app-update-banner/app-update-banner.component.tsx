/**
 * @fileoverview AppUpdateBanner — handles both service-worker-based updates
 * (via `useUpdatePrompt`) and server-driven update notifications
 * (via `SettingsSyncService`).
 *
 * Uses plain HTML/CSS (inline styles) instead of HeroUI to keep the PWA
 * package framework-agnostic. For non-mandatory updates a dismissible
 * bottom banner is rendered; for mandatory updates a blocking modal
 * overlay prevents interaction until the user reloads.
 *
 * Dismissed versions are tracked in `sessionStorage` so the same
 * non-mandatory notification is suppressed for the remainder of the
 * browser session but reappears in a new session.
 *
 * @module pwa/components/app-update-banner
 */

'use client';

import { useState, useCallback, useEffect, type ReactNode, type CSSProperties } from 'react';

// ─── Constants ─────────────────────────────────────────────────────

/** sessionStorage key used to track the last dismissed update version. */
const DISMISSED_KEY = 'stackra:dismissed-update-version';

// ─── Props ─────────────────────────────────────────────────────────

/** Props accepted by {@link AppUpdateBanner}. */
export interface AppUpdateBannerProps {
  /**
   * The new application version number to display (e.g. `"2.4.0"`).
   * Used both in the UI copy and as the key for dismiss tracking.
   */
  version: string;

  /**
   * Whether the update is mandatory.
   *
   * - `true`  — renders a blocking modal overlay that prevents all
   *   interaction until the user clicks **Update Now**.
   * - `false` — renders a dismissible bottom banner with a reload
   *   button and a close (×) button.
   */
  mandatory: boolean;

  /**
   * Callback invoked when the user clicks the reload / update button.
   * Typically triggers `window.location.reload()` or a service-worker
   * `skipWaiting` + `clients.claim` flow.
   */
  onReload: () => void;

  /**
   * Callback invoked when the user dismisses a **non-mandatory** banner.
   * Not called for mandatory updates (the dismiss button is hidden).
   */
  onDismiss?: () => void;

  /**
   * Source of the update notification.
   *
   * - `'sw'`     — triggered by a waiting service worker detected via
   *   `useUpdatePrompt`.
   * - `'server'` — triggered by a server-driven notification received
   *   via `SettingsSyncService` on the `app.updates` channel.
   */
  source: 'sw' | 'server';

  /** Optional custom content rendered inside the banner / modal body. */
  children?: ReactNode;
}

// ─── Inline Styles ─────────────────────────────────────────────────

/** Full-viewport overlay that blocks interaction for mandatory updates. */
const overlayStyles: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 99999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(4px)',
};

/** Centered modal card for mandatory updates. */
const modalStyles: CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '32px',
  maxWidth: '420px',
  width: '90%',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  textAlign: 'center',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

/** Heading inside the mandatory modal. */
const modalHeadingStyles: CSSProperties = {
  margin: '0 0 12px 0',
  fontSize: '20px',
  fontWeight: 600,
  color: '#111827',
};

/** Body text inside the mandatory modal. */
const modalTextStyles: CSSProperties = {
  margin: '0 0 8px 0',
  fontSize: '14px',
  lineHeight: 1.5,
  color: '#4b5563',
};

/** Source label inside the mandatory modal. */
const modalSourceStyles: CSSProperties = {
  margin: '0 0 24px 0',
  fontSize: '12px',
  color: '#9ca3af',
};

/** Primary action button (used in both banner and modal). */
const primaryButtonStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 24px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#ffffff',
  backgroundColor: '#2563eb',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'background-color 150ms ease',
};

/** Fixed-bottom dismissible banner for non-mandatory updates. */
const bannerStyles: CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  backgroundColor: '#1e293b',
  color: '#f1f5f9',
  fontSize: '14px',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.15)',
};

/** Banner text span. */
const bannerTextStyles: CSSProperties = {
  flex: 1,
};

/** Reload button inside the non-mandatory banner. */
const reloadButtonStyles: CSSProperties = {
  padding: '6px 16px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#ffffff',
  backgroundColor: '#2563eb',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'background-color 150ms ease',
};

/** Dismiss (×) button inside the non-mandatory banner. */
const dismissButtonStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  padding: 0,
  fontSize: '18px',
  fontWeight: 400,
  lineHeight: 1,
  color: '#94a3b8',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'color 150ms ease',
  flexShrink: 0,
};

// ─── Component ─────────────────────────────────────────────────────

/**
 * Displays an update notification banner or blocking modal depending
 * on whether the update is mandatory.
 *
 * **Non-mandatory** — a fixed-bottom banner with the version number,
 * a "Reload" button, and a dismiss (×) button. Once dismissed the
 * version is written to `sessionStorage` so the banner is suppressed
 * for the rest of the session. A *different* version will still
 * trigger the banner.
 *
 * **Mandatory** — a full-viewport overlay with a centered modal that
 * blocks all interaction. The only action available is "Update Now"
 * which invokes `onReload`.
 *
 * @example
 * ```tsx
 * // Service-worker update (non-mandatory)
 * <AppUpdateBanner
 *   version="2.4.0"
 *   mandatory={false}
 *   source="sw"
 *   onReload={() => window.location.reload()}
 *   onDismiss={() => console.log('dismissed')}
 * />
 *
 * // Server-driven mandatory update
 * <AppUpdateBanner
 *   version="3.0.0"
 *   mandatory={true}
 *   source="server"
 *   onReload={() => window.location.reload()}
 * />
 * ```
 */
export function AppUpdateBanner({
  version,
  mandatory,
  onReload,
  onDismiss,
  source,
  children,
}: AppUpdateBannerProps): React.JSX.Element | null {
  const [dismissed, setDismissed] = useState(false);

  // On mount (and when version/mandatory change), check whether this
  // version was already dismissed during the current session.
  useEffect(() => {
    if (!mandatory) {
      try {
        const dismissedVersion = sessionStorage.getItem(DISMISSED_KEY);
        if (dismissedVersion === version) {
          setDismissed(true);
        }
      } catch {
        // sessionStorage may be unavailable (e.g. in some sandboxed iframes).
        // Silently ignore — the banner will simply re-appear.
      }
    }
  }, [version, mandatory]);

  /**
   * Persist the dismissed version to sessionStorage and notify the
   * parent via `onDismiss`.
   */
  const handleDismiss = useCallback(() => {
    try {
      sessionStorage.setItem(DISMISSED_KEY, version);
    } catch {
      // Best-effort — see note above.
    }
    setDismissed(true);
    onDismiss?.();
  }, [version, onDismiss]);

  // ── Early returns ──────────────────────────────────────────────

  // Non-mandatory + already dismissed → render nothing.
  if (dismissed && !mandatory) return null;

  // ── Mandatory: blocking overlay ────────────────────────────────

  if (mandatory) {
    return (
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label="Mandatory update required"
        style={overlayStyles}
      >
        <div style={modalStyles}>
          <h2 style={modalHeadingStyles}>Update Required</h2>
          <p style={modalTextStyles}>
            Version {version} is available and required to continue using the application.
          </p>
          <p style={modalSourceStyles}>Source: {source === 'sw' ? 'Service Worker' : 'Server'}</p>
          {children}
          <button type="button" onClick={onReload} style={primaryButtonStyles}>
            Update Now
          </button>
        </div>
      </div>
    );
  }

  // ── Non-mandatory: dismissible bottom banner ───────────────────

  return (
    <div role="alert" aria-live="polite" style={bannerStyles}>
      <span style={bannerTextStyles}>Version {version} is available.</span>
      {children}
      <button type="button" onClick={onReload} style={reloadButtonStyles}>
        Reload
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss update notification"
        style={dismissButtonStyles}
      >
        ×
      </button>
    </div>
  );
}
