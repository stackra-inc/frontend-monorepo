/**
 * @fileoverview TikTokPixelPlatform — TikTok Pixel (`ttq`) implementation.
 *
 * Wraps the TikTok Pixel SDK behind the {@link PixelPlatformInterface}.
 * Handles script injection, initialization with the configured pixel code,
 * and event dispatch via `ttq.track(...)`.
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
 * TikTokPixelPlatform — TikTok Pixel (`ttq`) implementation of {@link PixelPlatformInterface}.
 *
 * Injects the TikTok Pixel base code into the DOM, initializes with the
 * configured pixel code, and dispatches events via `ttq.track(...)`.
 *
 * No-ops silently when TikTok is not configured in {@link TrackingConfig}.
 *
 * @example
 * ```typescript
 * const tiktok = container.get(TikTokPixelPlatform);
 * tiktok.load();
 * tiktok.fireEvent('ViewContent', { url: '/products' }, 'abc-123');
 * ```
 */
@TrackingPlatform({ name: "tiktok" })
export class TikTokPixelPlatform implements PixelPlatformInterface {
  /**
   * Create a new TikTokPixelPlatform instance.
   *
   * @param config - The tracking configuration injected via DI.
   */
  public constructor(@Inject(TRACKING_CONFIG) private readonly config: TrackingConfig) {}

  /**
   * Return the platform identifier.
   *
   * @returns `'tiktok'`
   */
  public platformName(): string {
    return "tiktok";
  }

  /**
   * Check whether the TikTok Pixel script has been loaded.
   *
   * @returns `true` if `window.ttq` is an object with a `track` function.
   */
  public isLoaded(): boolean {
    const ttq = (window as any).ttq;
    return typeof ttq === "object" && typeof ttq?.track === "function";
  }

  /**
   * Inject the TikTok Pixel base code and initialize with the pixel code.
   *
   * Guards against duplicate injection via `isLoaded()`. No-ops when
   * TikTok is not configured in the tracking config.
   *
   * @returns void
   */
  public load(): void {
    if (!this.config.tiktok) return;
    if (typeof document === "undefined") return;
    if (this.isLoaded()) return;

    const w = window as any;

    /* TikTok Pixel base code */
    const ttq: any = (w.ttq = w.ttq ?? []);
    ttq.methods = [
      "page",
      "track",
      "identify",
      "instances",
      "debug",
      "on",
      "off",
      "once",
      "ready",
      "alias",
      "group",
      "enableCookie",
      "disableCookie",
    ];
    ttq.setAndDefer = function (t: any, e: string) {
      t[e] = function (...args: any[]) {
        t.push([e, ...args]);
      };
    };
    for (const method of ttq.methods) {
      ttq.setAndDefer(ttq, method);
    }

    this.injectScript("https://analytics.tiktok.com/i18n/pixel/events.js");
    ttq.load(this.config.tiktok.pixelCode);
    ttq.page();
  }

  /**
   * Dispatch an event via the TikTok Pixel.
   *
   * Calls `ttq.track(eventName, params)` with an optional `event_id`
   * parameter for deduplication with server-side events.
   *
   * No-ops silently when TikTok is not configured or the script is not loaded.
   *
   * @param eventName - The canonical event name.
   * @param params - Event-specific parameters.
   * @param eventId - Optional event ID for deduplication.
   * @returns void
   */
  public fireEvent(eventName: string, params: Record<string, unknown>, eventId?: string): void {
    if (!this.config.tiktok) return;

    const ttq = (window as any).ttq;
    if (typeof ttq !== "object" || typeof ttq?.track !== "function") return;

    const eventParams = eventId ? { ...params, event_id: eventId } : params;
    ttq.track(eventName, eventParams);
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
