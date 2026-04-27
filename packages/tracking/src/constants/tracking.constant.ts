/**
 * @fileoverview Tracking constants — centralized string literals.
 *
 * Cookie names, header names, endpoint paths, and data attributes used
 * across the tracking package. All services reference these constants
 * instead of inline string literals.
 *
 * @module @stackra/react-tracking
 * @category Constants
 */

/**
 * Meta Pixel browser cookie name (`_fbp`).
 *
 * Set by the Meta Pixel script. Contains the browser identifier
 * used for cross-domain tracking and server-side event matching.
 *
 * @example
 * ```typescript
 * const fbp = getCookieValue(document.cookie, COOKIE_FBP);
 * ```
 */
export const COOKIE_FBP = "_fbp";

/**
 * Meta click ID browser cookie name (`_fbc`).
 *
 * Set when a user arrives via a Facebook ad click. Contains the
 * click identifier used for conversion attribution.
 *
 * @example
 * ```typescript
 * const fbc = getCookieValue(document.cookie, COOKIE_FBC);
 * ```
 */
export const COOKIE_FBC = "_fbc";

/**
 * Google Analytics browser cookie name (`_ga`).
 *
 * Set by the gtag.js script. Contains the GA client ID in the
 * format `GA1.{container}.{timestamp}.{random}`.
 *
 * @example
 * ```typescript
 * const ga = getCookieValue(document.cookie, COOKIE_GA);
 * ```
 */
export const COOKIE_GA = "_ga";

/**
 * HTTP header name for the tracking context response.
 *
 * The backend attaches this header to responses containing
 * an `event_id` for client-server event deduplication.
 *
 * @example
 * ```typescript
 * const eventId = response.headers.get(HEADER_TRACKING_CONTEXT);
 * ```
 */
export const HEADER_TRACKING_CONTEXT = "X-Tracking-Context";

/**
 * Relative endpoint path for the tracking context API.
 *
 * Used by {@link IdentitySyncService} and {@link ConsentService} to
 * POST identity tokens and consent state to the backend. Appended
 * to `config.apiBaseUrl`.
 *
 * @example
 * ```typescript
 * const url = `${config.apiBaseUrl}${ENDPOINT_TRACKING_CONTEXT}`;
 * ```
 */
export const ENDPOINT_TRACKING_CONTEXT = "/tracking/context";

/**
 * HTML data attribute for CTA click tracking.
 *
 * Elements with this attribute are automatically tracked when
 * CTA tracking is enabled in the config.
 *
 * @example
 * ```html
 * <button data-track-cta="signup-hero">Sign Up</button>
 * ```
 */
export const DATA_ATTR_CTA = "data-track-cta";
