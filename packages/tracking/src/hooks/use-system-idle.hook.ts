/**
 * @fileoverview useSystemIdle hook — fires SystemIdle when user is inactive for a configurable duration.
 *
 * Detects user inactivity in desktop environments (Electron/Tauri) and
 * fires a `SystemIdle` event via {@link PixelManager} after the configured
 * idle duration. No-ops silently when not running in a desktop environment.
 *
 * @module @stackra/react-tracking
 * @category Hooks
 */

import { useEffect, useRef } from "react";

import type { PixelManager } from "@/services/pixel-manager.service";

/** Default idle duration in milliseconds (5 minutes). */
const DEFAULT_IDLE_DURATION_MS = 5 * 60 * 1000;

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
 * Fire a `SystemIdle` event when the user has been inactive for a configurable duration.
 *
 * Resets the idle timer on mouse movement, keyboard input, and touch events.
 * When the timer expires, fires a `SystemIdle` event. No-ops silently when
 * not running in a desktop environment.
 *
 * @param pixelManager - The pixel manager instance for dispatching events.
 * @param idleDurationMs - Idle duration in milliseconds before firing the event.
 *   Defaults to 5 minutes (300,000ms).
 * @returns void
 *
 * @example
 * ```tsx
 * function App() {
 *   const pixelManager = useResolve<PixelManager>(PIXEL_MANAGER);
 *   useSystemIdle(pixelManager, 10 * 60 * 1000); // 10 minutes
 *   return <div>My Desktop App</div>;
 * }
 * ```
 */
export function useSystemIdle(
  pixelManager: PixelManager,
  idleDurationMs: number = DEFAULT_IDLE_DURATION_MS,
): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isDesktopEnvironment()) return;

    const resetTimer = (): void => {
      firedRef.current = false;

      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        if (!firedRef.current) {
          firedRef.current = true;
          pixelManager.fireEvent("SystemIdle", {
            idle_duration_ms: idleDurationMs,
            source: "desktop",
            timestamp: Date.now(),
          });
        }
      }, idleDurationMs);
    };

    // Activity events that reset the idle timer
    const events = ["mousemove", "keydown", "touchstart", "scroll"];

    for (const event of events) {
      window.addEventListener(event, resetTimer, { passive: true });
    }

    // Start the initial timer
    resetTimer();

    return () => {
      for (const event of events) {
        window.removeEventListener(event, resetTimer);
      }

      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [pixelManager, idleDurationMs]);
}
