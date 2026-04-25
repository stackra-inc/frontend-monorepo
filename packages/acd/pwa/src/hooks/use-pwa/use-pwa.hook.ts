/**
 * @fileoverview usePwa — unified consumer hook for all PWA features.
 *
 * Provides access to install prompt, update prompt, network status,
 * and standalone detection through a single hook.
 *
 * @module pwa/hooks/use-pwa
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { install, update, network, isStandalone } = usePwa();
 *
 *   if (!network.isOnline) return <OfflineBanner />;
 *   if (install.isVisible) return <InstallBanner />;
 *   if (update.isAvailable) return <UpdateBanner />;
 * }
 * ```
 */

import { useContext } from 'react';
import { PwaContext } from '@/contexts';
import type { PwaContextValue } from '@/interfaces';

/**
 * Access the unified PWA context.
 *
 * @throws {Error} If called outside of a `PwaProvider`.
 * @returns The unified PWA context value.
 */
export function usePwa(): PwaContextValue {
  const ctx = useContext(PwaContext);
  if (!ctx) {
    throw new Error('[PWA] usePwa must be used within a <PwaProvider>.');
  }
  return ctx;
}
