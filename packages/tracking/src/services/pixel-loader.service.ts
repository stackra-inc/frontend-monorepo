/**
 * @fileoverview PixelLoaderService — loads advertising pixel scripts into the DOM.
 *
 * Responsible for injecting Meta Pixel (`fbq`), Google Analytics (`gtag.js`),
 * and TikTok Pixel (`ttq`) script tags based on the provided
 * {@link TrackingConfig}. Each pixel is loaded at most once per page lifecycle.
 *
 * @module @stackra/react-tracking
 * @category Services
 */

import { Injectable, Inject } from "@stackra/ts-container";

import { TRACKING_CONFIG } from "@/constants/tokens.constant";
import type { TrackingConfig } from "@/interfaces/tracking-config.interface";

/**
 * PixelLoaderService — injects advertising pixel scripts into the DOM.
 *
 * Loads Meta Pixel, gtag.js, and TikTok Pixel scripts based on the
 * tracking configuration. Each script is loaded at most once — subsequent
 * calls to `loadAll()` are no-ops for already-loaded pixels.
 *
 * @example
 * ```typescript
 * const loader = container.get(PixelLoaderService);
 * loader.loadAll(); // injects configured pixel scripts
 * ```
 */
@Injectable()
export class PixelLoaderService {
  /** Tracks which pixels have already been loaded to prevent duplicates. */
  private readonly loaded: Set<string> = new Set();

  /**
   * Create a new PixelLoaderService instance.
   *
   * @param config - The tracking configuration injected via DI.
   */
  public constructor(@Inject(TRACKING_CONFIG) private readonly config: TrackingConfig) {}

  /**
   * Load all configured pixel scripts into the DOM.
   *
   * Checks the configuration for each platform and injects the
   * corresponding script tag if the platform is configured and
   * has not already been loaded.
   *
   * @returns void
   */
  public loadAll(): void {
    if (typeof document === "undefined") return;

    if (this.config.meta) {
      this.loadMetaPixel(this.config.meta.pixelId);
    }

    if (this.config.google) {
      this.loadGtag(this.config.google.measurementId);
    }

    if (this.config.tiktok) {
      this.loadTikTokPixel(this.config.tiktok.pixelCode);
    }
  }

  // ── Private Loaders ───────────────────────────────────────────────

  /**
   * Load the Meta Pixel (`fbq`) script.
   *
   * Injects the Meta Pixel base code and initializes it with the
   * provided pixel ID. Skips if already loaded.
   *
   * @param pixelId - The Meta Pixel ID.
   */
  private loadMetaPixel(pixelId: string): void {
    if (this.loaded.has("meta")) return;
    this.loaded.add("meta");

    const w = window as any;
    if (typeof w.fbq === "function") return;

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
    w.fbq("init", pixelId);
  }

  /**
   * Load the Google Analytics gtag.js script.
   *
   * Injects the gtag.js loader and initializes the data layer
   * with the provided measurement ID. Skips if already loaded.
   *
   * @param measurementId - The GA4 Measurement ID.
   */
  private loadGtag(measurementId: string): void {
    if (this.loaded.has("google")) return;
    this.loaded.add("google");

    const w = window as any;
    if (typeof w.gtag === "function") return;

    w.dataLayer = w.dataLayer ?? [];
    w.gtag = function (...args: any[]) {
      w.dataLayer.push(args);
    };
    w.gtag("js", new Date());
    w.gtag("config", measurementId);

    this.injectScript(`https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
  }

  /**
   * Load the TikTok Pixel (`ttq`) script.
   *
   * Injects the TikTok pixel base code and initializes it with the
   * provided pixel code. Skips if already loaded.
   *
   * @param pixelCode - The TikTok Pixel Code.
   */
  private loadTikTokPixel(pixelCode: string): void {
    if (this.loaded.has("tiktok")) return;
    this.loaded.add("tiktok");

    const w = window as any;
    if (typeof w.ttq?.track === "function") return;

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
    ttq.load(pixelCode);
    ttq.page();
  }

  /**
   * Inject a script tag into the document head.
   *
   * Creates an async script element and appends it before the first
   * existing script tag in the document.
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
