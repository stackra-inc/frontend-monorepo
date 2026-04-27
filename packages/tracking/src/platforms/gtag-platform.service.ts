/**
 * @fileoverview GtagPlatform — Google Analytics (`gtag.js`) implementation.
 *
 * Wraps the Google Analytics gtag.js SDK behind the {@link PixelPlatformInterface}.
 * Handles script injection, data layer initialization, and event dispatch
 * via `gtag('event', ...)`.
 *
 * @module @stackra/react-tracking
 * @category Services
 */

import { Inject } from "@stackra/ts-container";

import { TRACKING_CONFIG } from "@/constants/tokens.constant";
import { TrackingPlatform } from "@/decorators/tracking-platform.decorator";
import type { PixelPlatformInterface } from "@/interfaces/pixel-platform.interface";
import type { TrackingConfig } from "@/interfaces/tracking-config.interface";

/**
 * GtagPlatform — Google Analytics (`gtag.js`) implementation of {@link PixelPlatformInterface}.
 *
 * Injects the gtag.js loader script, initializes the data layer with the
 * configured measurement ID, and dispatches events via `gtag('event', ...)`.
 *
 * No-ops silently when Google is not configured in {@link TrackingConfig}.
 *
 * @example
 * ```typescript
 * const google = container.get(GtagPlatform);
 * google.load();
 * google.fireEvent('page_view', { page_location: '/products' }, 'abc-123');
 * ```
 */
@TrackingPlatform({ name: "google" })
export class GtagPlatform implements PixelPlatformInterface {
  /**
   * Create a new GtagPlatform instance.
   *
   * @param config - The tracking configuration injected via DI.
   */
  public constructor(@Inject(TRACKING_CONFIG) private readonly config: TrackingConfig) {}

  /**
   * Return the platform identifier.
   *
   * @returns `'google'`
   */
  public platformName(): string {
    return "google";
  }

  /**
   * Check whether the gtag.js script has been loaded.
   *
   * @returns `true` if `window.gtag` is a function.
   */
  public isLoaded(): boolean {
    return typeof (window as any).gtag === "function";
  }

  /**
   * Inject the gtag.js script and initialize the data layer.
   *
   * Guards against duplicate injection via `isLoaded()`. No-ops when
   * Google is not configured in the tracking config.
   *
   * @returns void
   */
  public load(): void {
    if (!this.config.google) return;
    if (typeof document === "undefined") return;
    if (this.isLoaded()) return;

    const w = window as any;

    w.dataLayer = w.dataLayer ?? [];
    w.gtag = function (...args: any[]) {
      w.dataLayer.push(args);
    };
    w.gtag("js", new Date());
    w.gtag("config", this.config.google.measurementId);

    this.injectScript(
      `https://www.googletagmanager.com/gtag/js?id=${this.config.google.measurementId}`,
    );
  }

  /**
   * Dispatch an event via Google Analytics.
   *
   * Calls `gtag('event', eventName, params)` with an optional `event_id`
   * parameter for deduplication with server-side events.
   *
   * No-ops silently when Google is not configured or the script is not loaded.
   *
   * @param eventName - The canonical event name.
   * @param params - Event-specific parameters.
   * @param eventId - Optional event ID for deduplication.
   * @returns void
   */
  public fireEvent(eventName: string, params: Record<string, unknown>, eventId?: string): void {
    if (!this.config.google) return;

    const gtag = (window as any).gtag;
    if (typeof gtag !== "function") return;

    const eventParams = eventId ? { ...params, event_id: eventId } : params;
    gtag("event", eventName, eventParams);
  }

  // ── Private Helpers ───────────────────────────────────────────────

  /**
   * Inject a script tag into the document head.
   *
   * @param src - The script source URL.
   */
  private injectScript(src: string): void {
    const script = document.createElement("script");
    script.async = true;
    script.src = src;

    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }
}
