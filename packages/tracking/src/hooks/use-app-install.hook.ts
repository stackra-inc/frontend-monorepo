/**
 * @fileoverview useAppInstall hook — fires AppInstall tracking event on PWA install acceptance.
 *
 * Bridges the PWA package's install prompt flow with the tracking system.
 * Listens for install acceptance via the provided `promptInstall` callback
 * and fires an `AppInstall` event via {@link PixelManager}.
 *
 * This hook does NOT manage the `beforeinstallprompt` event — that is
 * handled by the PWA package's `useInstallPrompt` / `PwaProvider`.
 * This hook only fires the tracking event when the install is accepted.
 *
 * @module @stackra/react-tracking
 * @category Hooks
 */

import { useCallback } from "react";

import type { PixelManager } from "@/services/pixel-manager.service";

/**
 * Return type for the `useAppInstall` hook.
 */
export interface UseAppInstallReturn {
  /**
   * Wraps the PWA install prompt and fires an `AppInstall` tracking event
   * when the user accepts. Returns the prompt outcome.
   *
   * @returns The prompt outcome: `'accepted'`, `'dismissed'`, or `'unavailable'`.
   */
  promptAndTrack: () => Promise<"accepted" | "dismissed" | "unavailable">;
}

/**
 * Bridge between the PWA install prompt and the tracking system.
 *
 * Wraps the PWA package's `promptInstall()` callback and fires an
 * `AppInstall` event via the PixelManager when the user accepts.
 *
 * Does NOT duplicate `beforeinstallprompt` handling — that belongs
 * in the PWA package's `PwaProvider` / `useInstallPrompt`.
 *
 * @param pixelManager - The pixel manager instance for dispatching events.
 * @param promptInstall - The install prompt function from the PWA package
 *   (e.g., from `usePwa().install.prompt` or `useInstallPrompt().prompt`).
 * @returns An object with `promptAndTrack` that triggers the prompt and
 *   fires the tracking event on acceptance.
 *
 * @example
 * ```tsx
 * function InstallBanner() {
 *   const { install } = usePwa();
 *   const pixelManager = useResolve<PixelManager>(PIXEL_MANAGER);
 *   const { promptAndTrack } = useAppInstall(pixelManager, install.prompt);
 *
 *   return (
 *     <button onClick={promptAndTrack}>Install App</button>
 *   );
 * }
 * ```
 */
export function useAppInstall(
  pixelManager: PixelManager,
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">,
): UseAppInstallReturn {
  const promptAndTrack = useCallback(async (): Promise<
    "accepted" | "dismissed" | "unavailable"
  > => {
    const outcome = await promptInstall();

    if (outcome === "accepted") {
      pixelManager.fireEvent("AppInstall", {
        timestamp: Date.now(),
      });
    }

    return outcome;
  }, [pixelManager, promptInstall]);

  return { promptAndTrack };
}
