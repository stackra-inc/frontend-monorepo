/**
 * @fileoverview useDesktopAppClose hook — fires AppClose when desktop window is closed to tray.
 *
 * Detects when the desktop window is closed to the system tray (not terminated)
 * and fires an `AppClose` event via {@link PixelManager}. No-ops silently
 * when not running in a desktop environment (Electron/Tauri).
 *
 * @module @stackra/react-tracking
 * @category Hooks
 */

import { useEffect } from "react";

import type { PixelManager } from "@/services/pixel-manager.service";

/**
 * Check whether the app is running in a desktop environment.
 *
 * @returns `true` if running in Electron or Tauri.
 */
function isDesktopEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as any;
  return !!(w.__TAURI__ || w.electron || w.process?.versions?.electron);
}

/**
 * Fire an `AppClose` event when the desktop window is closed to the system tray.
 *
 * Listens for the `beforeunload` window event in desktop environments.
 * The event fires when the window is minimized to tray, not when the
 * app is fully terminated. No-ops silently when not running in a
 * desktop environment.
 *
 * @param pixelManager - The pixel manager instance for dispatching events.
 * @returns void
 *
 * @example
 * ```tsx
 * function App() {
 *   const pixelManager = useResolve<PixelManager>(PIXEL_MANAGER);
 *   useDesktopAppClose(pixelManager);
 *   return <div>My Desktop App</div>;
 * }
 * ```
 */
export function useDesktopAppClose(pixelManager: PixelManager): void {
  useEffect(() => {
    if (!isDesktopEnvironment()) return;

    const handleBeforeUnload = (): void => {
      pixelManager.fireEvent("AppClose", {
        source: "desktop",
        timestamp: Date.now(),
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pixelManager]);
}
