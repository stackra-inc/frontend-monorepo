/**
 * @fileoverview PixelManager — orchestrates event dispatch across pixel platforms.
 *
 * Resolves configured {@link PixelPlatformInterface} implementations from DI
 * and iterates over them for loading and event dispatch. Integrates with
 * {@link ConsentService} for consent-gated dispatch and
 * {@link OfflineQueueService} for offline event queuing.
 *
 * Replaces the per-platform dispatch methods previously in TrackingService.
 *
 * @module @stackra/react-tracking
 * @category Services
 */

import { Injectable, Inject } from "@stackra/ts-container";

import {
  TRACKING_CONFIG,
  PIXEL_PLATFORMS,
  CONSENT_SERVICE,
  OFFLINE_QUEUE,
} from "@/constants/tokens.constant";
import { ConsentCategory } from "@/enums/consent-category.enum";
import type { PixelPlatformInterface } from "@/interfaces/pixel-platform.interface";
import type { TrackingConfig } from "@/interfaces/tracking-config.interface";
import type { ConsentService } from "@/services/consent.service";
import type { OfflineQueueService } from "@/services/offline-queue.service";

/**
 * PixelManager — iterates over configured pixel platforms for loading and dispatch.
 *
 * Replaces the hardcoded per-platform methods in TrackingService. Adding a
 * new pixel platform requires only a new {@link PixelPlatformInterface}
 * implementation and a config entry — zero changes to this class.
 *
 * Consent-gated: `loadAll()` and `fireEvent()` check marketing consent
 * before proceeding. Offline-aware: events are queued via
 * {@link OfflineQueueService} when the device is offline.
 *
 * @example
 * ```typescript
 * const manager = container.get<PixelManager>(PIXEL_MANAGER);
 * manager.loadAll();
 * manager.fireEvent('PageView', { url: '/products' }, 'abc-123');
 * ```
 */
@Injectable()
export class PixelManager {
  /**
   * Create a new PixelManager instance.
   *
   * @param platforms - Array of configured pixel platform implementations.
   * @param consent - The consent service for checking marketing consent.
   * @param offlineQueue - The offline queue service for queuing events when offline.
   * @param config - The tracking configuration.
   */
  public constructor(
    @Inject(PIXEL_PLATFORMS) private readonly platforms: PixelPlatformInterface[],
    @Inject(CONSENT_SERVICE) private readonly consent: ConsentService,
    @Inject(OFFLINE_QUEUE) private readonly offlineQueue: OfflineQueueService,
    @Inject(TRACKING_CONFIG) private readonly config: TrackingConfig,
  ) {}

  /**
   * Load all configured pixel platform scripts into the DOM.
   *
   * Checks marketing consent before calling `load()` on each platform.
   * No-ops when marketing consent has not been granted.
   *
   * @returns void
   */
  public loadAll(): void {
    if (!this.consent.hasConsent(ConsentCategory.MARKETING)) return;

    for (const platform of this.platforms) {
      platform.load();
    }
  }

  /**
   * Dispatch an event to all configured pixel platforms.
   *
   * Checks marketing consent before dispatching. When offline, delegates
   * to the {@link OfflineQueueService} for later flush. When online,
   * iterates over all platforms and calls `fireEvent()` on each.
   *
   * Appends experiment-variant mapping from config to params when present.
   *
   * @param eventName - The canonical event name.
   * @param params - Event-specific parameters.
   * @param eventId - Optional event ID for deduplication.
   * @returns void
   */
  public fireEvent(eventName: string, params: Record<string, unknown>, eventId?: string): void {
    if (!this.consent.hasConsent(ConsentCategory.MARKETING)) return;

    // Append experiment-variant mapping when configured
    const enrichedParams = this.config.experiments
      ? { ...params, experiments: this.config.experiments }
      : params;

    // Queue for later if offline
    if (!this.offlineQueue.isOnline()) {
      this.offlineQueue.enqueue({
        eventName,
        params: enrichedParams,
        eventId,
        timestamp: Date.now(),
        type: "pixel",
      });
      return;
    }

    for (const platform of this.platforms) {
      platform.fireEvent(eventName, enrichedParams, eventId);
    }
  }
}
