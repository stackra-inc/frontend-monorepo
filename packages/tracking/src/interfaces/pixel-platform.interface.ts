/**
 * @fileoverview PixelPlatformInterface — contract for client-side pixel platforms.
 *
 * Each advertising pixel (Meta, Google, TikTok) implements this interface,
 * providing a uniform API for script loading and event dispatch. The
 * {@link PixelManager} iterates over configured implementations, so adding
 * a new pixel requires only a new class — zero changes to TrackingService.
 *
 * @module @stackra/react-tracking
 * @category Interfaces
 */

/**
 * Contract for a client-side advertising pixel platform.
 *
 * Implementations wrap a specific pixel SDK (fbq, gtag, ttq) behind
 * a common interface. The {@link PixelManager} resolves all configured
 * implementations and iterates over them for loading and event dispatch.
 *
 * @example
 * ```typescript
 * class MetaPixelPlatform implements PixelPlatformInterface {
 *   platformName(): string { return 'meta'; }
 *   isLoaded(): boolean { return typeof window.fbq === 'function'; }
 *   load(): void { // inject fbq script }
 *   fireEvent(name, params, eventId): void { fbq('track', name, params); }
 * }
 * ```
 */
export interface PixelPlatformInterface {
  /**
   * Return the platform's string identifier.
   *
   * Used for logging, debugging, and configuration lookups.
   * Must be unique across all registered platforms.
   *
   * @returns The platform name (e.g., `'meta'`, `'google'`, `'tiktok'`).
   */
  platformName(): string;

  /**
   * Check whether the platform's script has been loaded into the DOM.
   *
   * Used by {@link PixelManager} to determine if `load()` needs to be
   * called, and by `fireEvent()` to guard against dispatching before
   * the script is ready.
   *
   * @returns `true` if the platform script is loaded and ready.
   */
  isLoaded(): boolean;

  /**
   * Inject the platform's script tag into the DOM and initialize it.
   *
   * Must be idempotent — calling `load()` when the script is already
   * loaded should be a no-op. Implementations should guard against
   * duplicate injection via `isLoaded()`.
   *
   * @returns void
   */
  load(): void;

  /**
   * Dispatch an event to the platform's pixel.
   *
   * Maps the canonical event name and parameters to the platform-specific
   * API call (e.g., `fbq('track', ...)`, `gtag('event', ...)`,
   * `ttq.track(...)`).
   *
   * @param eventName - The canonical event name.
   * @param params - Event-specific parameters as key-value pairs.
   * @param eventId - Optional event ID for deduplication with server-side events.
   * @returns void
   */
  fireEvent(eventName: string, params: Record<string, unknown>, eventId?: string): void;
}
