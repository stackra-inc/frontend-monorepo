/**
 * @fileoverview PwaProvider — unified context provider for all PWA features.
 *
 * Combines install prompt, update prompt, network status, and standalone
 * detection into a single provider. All PWA components consume this context
 * via the `usePwa()` hook.
 *
 * ## Early event capture:
 * The browser fires `beforeinstallprompt` once during page load — often
 * before React mounts. The app entry point (main.tsx) must capture it
 * early and stash it on `window.__PWA_DEFERRED_PROMPT__`. This provider
 * picks it up on mount.
 *
 * @module pwa/providers/pwa
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { PwaContext } from '@/contexts';
import { INSTALL_PROMPT_DEFAULTS, UPDATE_PROMPT_DEFAULTS } from '@/constants';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useStandaloneMode } from '@/hooks/use-standalone-mode';
import { usePwaConfig } from '@/hooks/use-pwa-config';
import type { PwaConfig, PwaContextValue } from '@/interfaces';

/** Props for the PwaProvider component. */
export interface PwaProviderProps {
  /** Optional config override — if not provided, reads from DI (PWA_CONFIG). */
  config?: PwaConfig;
  children: ReactNode;
}

export function PwaProvider({ config: propConfig, children }: PwaProviderProps): React.JSX.Element {
  /*
  |--------------------------------------------------------------------------
  | Resolve config: props override > DI container > empty defaults
  |--------------------------------------------------------------------------
  */
  const diConfig = usePwaConfig();
  const config: PwaConfig = propConfig ?? {
    install: diConfig?.install,
    update: diConfig?.update,
  };
  /* ── Install prompt state ── */
  const deferredPrompt = useRef<any>(null);
  const [installSupported, setInstallSupported] = useState(false);
  const [installVisible, setInstallVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installDismissCount, setInstallDismissCount] = useState(() => {
    const key = config?.install?.dismissKey ?? INSTALL_PROMPT_DEFAULTS.DISMISS_KEY;
    if (key === false) return 0;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) || 0 : 0;
  });

  const installDismissKey = config?.install?.dismissKey ?? INSTALL_PROMPT_DEFAULTS.DISMISS_KEY;
  const installMaxDismissals =
    config?.install?.maxDismissals ?? INSTALL_PROMPT_DEFAULTS.MAX_DISMISSALS;
  const installDelay = config?.install?.delay ?? INSTALL_PROMPT_DEFAULTS.DELAY;

  /* ── Update prompt state ── */
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const updateIntervalRef = useRef<number>(0);
  const updatePolling = config?.update?.pollingInterval ?? UPDATE_PROMPT_DEFAULTS.POLLING_INTERVAL;

  /* ── Shared hooks ── */
  const network = useNetworkStatus();
  const isStandalone = useStandaloneMode();

  // ════════════════════════════════════════════════════════════════
  // Install prompt — event capture (runs ONCE on mount)
  // ════════════════════════════════════════════════════════════════

  useEffect(() => {
    const captureEvent = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setInstallSupported(true);
    };

    const earlyEvent = (window as any).__PWA_DEFERRED_PROMPT__;
    if (earlyEvent) {
      captureEvent(earlyEvent);
    }

    window.addEventListener('beforeinstallprompt', captureEvent);
    return () => window.removeEventListener('beforeinstallprompt', captureEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ════════════════════════════════════════════════════════════════
  // Install prompt — auto-show banner (reactive to dismiss count)
  // ════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!installSupported) return undefined;
    if (installDismissCount >= installMaxDismissals) return undefined;

    if (installDelay > 0) {
      const timer = setTimeout(() => setInstallVisible(true), installDelay);
      return () => clearTimeout(timer);
    } else {
      setInstallVisible(true);
      return undefined;
    }
  }, [installSupported, installDismissCount, installMaxDismissals, installDelay]);

  useEffect(() => {
    const handler = () => {
      setIsInstalled(true);
      setInstallVisible(false);
      deferredPrompt.current = null;
    };
    window.addEventListener('appinstalled', handler);
    return () => window.removeEventListener('appinstalled', handler);
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const prompt = deferredPrompt.current ?? (window as any).__PWA_DEFERRED_PROMPT__;

    if (!prompt) return 'unavailable';

    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;

      deferredPrompt.current = null;
      delete (window as any).__PWA_DEFERRED_PROMPT__;
      setInstallVisible(false);

      if (outcome === 'accepted') setIsInstalled(true);
      return outcome === 'accepted' ? 'accepted' : 'dismissed';
    } catch {
      return 'unavailable';
    }
  }, []);

  const dismissInstall = useCallback(() => {
    const next = installDismissCount + 1;
    setInstallDismissCount(next);
    setInstallVisible(false);
    if (installDismissKey !== false) {
      localStorage.setItem(installDismissKey, String(next));
    }
  }, [installDismissCount, installDismissKey]);

  // ════════════════════════════════════════════════════════════════
  // Update prompt lifecycle
  // ════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      setSwRegistration(reg);

      if (reg.waiting) {
        setUpdateAvailable(true);
        setUpdateVisible(true);
      }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
            setUpdateVisible(true);
          }
        });
      });

      if (updatePolling > 0) {
        updateIntervalRef.current = window.setInterval(() => reg.update(), updatePolling);
      }
    });

    return () => {
      if (updateIntervalRef.current) window.clearInterval(updateIntervalRef.current);
    };
  }, [updatePolling]);

  const applyUpdate = useCallback(() => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [swRegistration]);

  const dismissUpdate = useCallback(() => setUpdateVisible(false), []);

  // ════════════════════════════════════════════════════════════════
  // Context value
  // ════════════════════════════════════════════════════════════════

  const value = useMemo<PwaContextValue>(
    () => ({
      install: {
        isSupported: installSupported,
        isVisible: installVisible,
        isInstalled: isInstalled || isStandalone,
        dismissCount: installDismissCount,
        prompt: promptInstall,
        dismiss: dismissInstall,
      },
      update: {
        isAvailable: updateAvailable,
        isVisible: updateVisible,
        apply: applyUpdate,
        dismiss: dismissUpdate,
      },
      network,
      isStandalone,
    }),
    [
      installSupported,
      installVisible,
      isInstalled,
      isStandalone,
      installDismissCount,
      promptInstall,
      dismissInstall,
      updateAvailable,
      updateVisible,
      applyUpdate,
      dismissUpdate,
      network,
    ]
  );

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}
