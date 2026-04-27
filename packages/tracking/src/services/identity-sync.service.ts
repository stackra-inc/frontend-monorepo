/**
 * @fileoverview IdentitySyncService — synchronizes browser identity cookies with the backend.
 *
 * Reads `_fbp`, `_fbc`, and `_ga` cookies from the browser and POSTs them
 * to the `/api/tracking/context` endpoint. Re-syncs when cookie values change.
 *
 * @module @stackra/react-tracking
 * @category Services
 */

import { Injectable, Inject } from "@stackra/ts-container";
import { Str } from "@stackra/ts-support";
import { HTTP_CLIENT } from "@stackra/ts-http";
import type { HttpClient } from "@stackra/ts-http";

import { TRACKING_CONFIG, CONSENT_SERVICE } from "@/constants/tokens.constant";
import {
  COOKIE_FBP,
  COOKIE_FBC,
  COOKIE_GA,
  ENDPOINT_TRACKING_CONTEXT,
} from "@/constants/tracking.constant";
import { ConsentCategory } from "@/enums/consent-category.enum";
import type { TrackingConfig } from "@/interfaces/tracking-config.interface";
import type { ConsentService } from "@/services/consent.service";

/**
 * IdentitySyncService — reads browser cookies and syncs identity tokens.
 *
 * On initialization, reads the `_fbp`, `_fbc`, and `_ga` cookies from
 * `document.cookie` and POSTs them to the backend tracking context endpoint.
 * Periodically checks for cookie changes and re-syncs when values differ.
 *
 * @example
 * ```typescript
 * const sync = container.get(IdentitySyncService);
 * sync.start();  // begins identity sync
 * sync.stop();   // stops periodic re-sync
 * ```
 */
@Injectable()
export class IdentitySyncService {
  /** Interval ID for periodic cookie change detection. */
  private intervalId: ReturnType<typeof setInterval> | null = null;

  /** Last known cookie values to detect changes. */
  private lastSyncedValues: string = "";

  /**
   * Create a new IdentitySyncService instance.
   *
   * @param config - The tracking configuration injected via DI.
   * @param http - The HTTP client for API requests.
   * @param consent - The consent service for checking analytics consent.
   */
  public constructor(
    @Inject(TRACKING_CONFIG) private readonly config: TrackingConfig,
    @Inject(HTTP_CLIENT) private readonly http: HttpClient,
    @Inject(CONSENT_SERVICE) private readonly consent: ConsentService,
  ) {}

  /**
   * Start the identity sync process.
   *
   * Performs an initial sync immediately, then sets up a periodic
   * check (every 30 seconds) to detect cookie changes and re-sync.
   *
   * @returns void
   */
  public start(): void {
    if (typeof document === "undefined") return;
    if (!this.consent.hasConsent(ConsentCategory.ANALYTICS)) return;

    this.sync();

    // Re-check cookies every 30 seconds for changes
    this.intervalId = setInterval(() => {
      this.sync();
    }, 30_000);
  }

  /**
   * Stop the periodic identity sync.
   *
   * Clears the interval timer. Does not clear the last synced values,
   * so calling `start()` again will only re-sync if cookies have changed.
   *
   * @returns void
   */
  public stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Perform a single identity sync.
   *
   * Reads current cookie values, compares against the last synced values,
   * and POSTs to the backend if any values have changed. Skips the POST
   * if no identity cookies are present.
   *
   * @returns void
   */
  public sync(): void {
    if (!this.consent.hasConsent(ConsentCategory.ANALYTICS)) return;

    const tokens = this.readCookies();

    // Skip if no identity tokens are available
    if (!tokens.fbp && !tokens.fbc && !tokens.ga_client_id) return;

    // Skip if values haven't changed since last sync
    const currentValues = JSON.stringify(tokens);
    if (currentValues === this.lastSyncedValues) return;

    this.lastSyncedValues = currentValues;

    const endpoint = `${this.config.apiBaseUrl}${ENDPOINT_TRACKING_CONTEXT}`;
    this.http.post(endpoint, tokens).catch(() => {
      // Reset last synced values so we retry on next interval
      this.lastSyncedValues = "";
    });
  }

  // ── Private Helpers ───────────────────────────────────────────────

  /**
   * Read identity cookies from the browser.
   *
   * Extracts `_fbp`, `_fbc`, and `_ga` cookie values from
   * `document.cookie`. Extracts the GA client ID from the `_ga`
   * cookie format (`GA1.1.{client_id}`).
   *
   * @returns An object containing the extracted identity tokens.
   */
  private readCookies(): { fbp?: string; fbc?: string; ga_client_id?: string } {
    if (typeof document === "undefined") return {};

    const cookies = document.cookie;
    const result: { fbp?: string; fbc?: string; ga_client_id?: string } = {};

    const fbp = this.getCookieValue(cookies, COOKIE_FBP);
    if (fbp) result.fbp = fbp;

    const fbc = this.getCookieValue(cookies, COOKIE_FBC);
    if (fbc) result.fbc = fbc;

    const ga = this.getCookieValue(cookies, COOKIE_GA);
    if (ga) {
      result.ga_client_id = this.extractGaClientId(ga);
    }

    return result;
  }

  /**
   * Extract a single cookie value by name from a cookie string.
   *
   * @param cookies - The full `document.cookie` string.
   * @param name - The cookie name to find.
   * @returns The cookie value, or `undefined` if not found.
   */
  private getCookieValue(cookies: string, name: string): string | undefined {
    const pairs = cookies.split(";");

    for (const pair of pairs) {
      const trimmed = Str.trim(pair);
      const prefix = `${name}=`;

      if (Str.startsWith(trimmed, prefix)) {
        return trimmed.substring(prefix.length);
      }
    }

    return undefined;
  }

  /**
   * Extract the GA client ID from a `_ga` cookie value.
   *
   * The `_ga` cookie format is `GA1.{container}.{timestamp}.{random}`.
   * The client ID is the last two segments: `{timestamp}.{random}`.
   *
   * @param gaCookie - The raw `_ga` cookie value.
   * @returns The extracted client ID, or `undefined` if the format is invalid.
   */
  private extractGaClientId(gaCookie: string): string | undefined {
    const parts = gaCookie.split(".");

    if (parts.length < 4) return undefined;

    // Client ID is the last two dot-separated segments
    return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  }
}
