/**
 * @fileoverview useDesktopAppOpen hook — fires AppOpen when desktop window gains focus from tray.
 *
 * Detects when the desktop window gains focus from the system tray or
 * after being minimized, and fires an `AppOpen` event via {@link PixelManager}.
 * No-ops silently when not running in a desktop environment (Electron/Tauri).
 *
 * @module @stackra/react-tracking
 * @category Hooks
 */

import { useEffect, useRef } from "react";

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
 * Fire an `AppOpen` event when the desktop window gains focus from the system tray.
 *
 * Listens for the `focus` window event in desktop environments (Electron/Tauri).
 * No-ops silently when not running in a desktop environment.
 *
 * @param pixelManager - The pixel manager instance for dispatching events.
 * @returns void
 *
 * @example
 * ```tsx
 * function App() {
 *   const pixelManager = useResolve<PixelManager>(PIXEL_MANAGER);
 *   useDesktopAppOpen(pixelManager);
 *   return <div>My Desktop App</div>;
 * }
 * ```
 */
export function useDesktopAppOpen(pixelManager: PixelManager): void {
  const wasHiddenRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isDesktopEnvironment()) return;

    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        wasHiddenRef.current = true;
      } else if (wasHiddenRef.current) {
        wasHiddenRef.current = false;
        pixelManager.fireEvent("AppOpen", {
          source: "desktop",
          timestamp: Date.now(),
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pixelManager]);
}
