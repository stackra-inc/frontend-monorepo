/**
 * @fileoverview MetaPixelPlatform — Meta Pixel (`fbq`) implementation.
 *
 * Wraps the Meta Pixel SDK behind the {@link PixelPlatformInterface}.
 * Handles script injection, initialization with the configured pixel ID,
 * and event dispatch via `fbq('track', ...)` / `fbq('trackCustom', ...)`.
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
 * Standard Meta Pixel event names that use `fbq('track', ...)`.
 * All other events use `fbq('trackCustom', ...)`.
 */
const META_STANDARD_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "Search",
  "AddToCart",
  "AddToWishlist",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Purchase",
  "Lead",
  "CompleteRegistration",
  "Contact",
  "CustomizeProduct",
  "Donate",
  "FindLocation",
  "Schedule",
  "StartTrial",
  "SubmitApplication",
  "Subscribe",
]);

/**
 * MetaPixelPlatform — Meta Pixel (`fbq`) implementation of {@link PixelPlatformInterface}.
 *
 * Injects the Meta Pixel base code into the DOM, initializes with the
 * configured pixel ID, and dispatches events via `fbq('track', ...)`
 * for standard events and `fbq('trackCustom', ...)` for custom events.
 *
 * No-ops silently when Meta is not configured in {@link TrackingConfig}.
 *
 * @example
 * ```typescript
 * const meta = container.get(MetaPixelPlatform);
 * meta.load();
 * meta.fireEvent('PageView', { url: '/products' }, 'abc-123');
 * ```
 */
@TrackingPlatform({ name: "meta" })
export class MetaPixelPlatform implements PixelPlatformInterface {
  /**
   * Create a new MetaPixelPlatform instance.
   *
   * @param config - The tracking configuration injected via DI.
   */
  public constructor(@Inject(TRACKING_CONFIG) private readonly config: TrackingConfig) {}

  /**
   * Return the platform identifier.
   *
   * @returns `'meta'`
   */
  public platformName(): string {
    return "meta";
  }

  /**
   * Check whether the Meta Pixel script has been loaded.
   *
   * @returns `true` if `window.fbq` is a function.
   */
  public isLoaded(): boolean {
    return typeof (window as any).fbq === "function";
  }

  /**
   * Inject the Meta Pixel base code and initialize with the pixel ID.
   *
   * Guards against duplicate injection via `isLoaded()`. No-ops when
   * Meta is not configured in the tracking config.
   *
   * @returns void
   */
  public load(): void {
    if (!this.config.meta) return;
    if (typeof document === "undefined") return;
    if (this.isLoaded()) return;

    const w = window as any;

    /* Meta Pixel base code */
    const n: any = (w.fbq = function (...args: any[]) {
      n.callMethod ? n.callMethod(...args) : n.queue.push(args);
    });
    if (!w._fbq) w._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];

    this.injectScript("https://connect.facebook.net/en_US/fbevents.js");
    w.fbq("init", this.config.meta.pixelId);
  }

  /**
   * Dispatch an event via the Meta Pixel.
   *
   * Uses `fbq('track', ...)` for standard Meta events and
   * `fbq('trackCustom', ...)` for custom events. Passes `eventID`
   * option for deduplication with server-side events.
   *
   * No-ops silently when Meta is not configured or the script is not loaded.
   *
   * @param eventName - The canonical event name.
   * @param params - Event-specific parameters.
   * @param eventId - Optional event ID for deduplication.
   * @returns void
   */
  public fireEvent(eventName: string, params: Record<string, unknown>, eventId?: string): void {
    if (!this.config.meta) return;

    const fbq = (window as any).fbq;
    if (typeof fbq !== "function") return;

    const options = eventId ? { eventID: eventId } : undefined;

    if (META_STANDARD_EVENTS.has(eventName)) {
      fbq("track", eventName, params, options);
    } else {
      fbq("trackCustom", eventName, params, options);
    }
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
