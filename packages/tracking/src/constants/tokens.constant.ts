/**
 * @fileoverview DI tokens for the tracking package.
 *
 * All Symbol-based injection tokens for `@stackra/react-tracking` are
 * centralized here. Never define `Symbol.for()` tokens elsewhere.
 *
 * @module @stackra/react-tracking
 * @category Constants
 */

/**
 * DI token for the {@link ITrackingService} implementation.
 *
 * Injected into components and hooks that need to dispatch
 * engagement events (page views, scroll depth, time on page, CTA clicks).
 *
 * @example
 * ```typescript
 * @Injectable()
 * class MyService {
 *   constructor(@Inject(TRACKING_SERVICE) private tracking: ITrackingService) {}
 * }
 * ```
 */
export const TRACKING_SERVICE = Symbol.for("TRACKING_SERVICE");

/**
 * DI token for the {@link TrackingConfig} configuration object.
 *
 * Provided by `TrackingModule.forRoot(config)` and consumed by
 * services that need pixel IDs, measurement IDs, or feature flags.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class PixelLoaderService {
 *   constructor(@Inject(TRACKING_CONFIG) private config: TrackingConfig) {}
 * }
 * ```
 */
export const TRACKING_CONFIG = Symbol.for("TRACKING_CONFIG");

/**
 * DI token for the {@link PixelManager} service.
 *
 * Injected into services that need to dispatch events across all
 * configured pixel platforms (Meta, Google, TikTok).
 *
 * @example
 * ```typescript
 * @Injectable()
 * class TrackingService {
 *   constructor(@Inject(PIXEL_MANAGER) private pixelManager: PixelManager) {}
 * }
 * ```
 */
export const PIXEL_MANAGER = Symbol.for("PIXEL_MANAGER");

/**
 * DI token for the array of {@link PixelPlatformInterface} implementations.
 *
 * Provided as a multi-value token containing all configured pixel platform
 * instances (MetaPixelPlatform, GtagPlatform, TikTokPixelPlatform).
 *
 * @example
 * ```typescript
 * @Injectable()
 * class PixelManager {
 *   constructor(@Inject(PIXEL_PLATFORMS) private platforms: PixelPlatformInterface[]) {}
 * }
 * ```
 */
export const PIXEL_PLATFORMS = Symbol.for("PIXEL_PLATFORMS");

/**
 * DI token for the {@link ConsentService}.
 *
 * Injected into services that need to check or update user consent
 * state before dispatching tracking events.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class PixelManager {
 *   constructor(@Inject(CONSENT_SERVICE) private consent: ConsentService) {}
 * }
 * ```
 */
export const CONSENT_SERVICE = Symbol.for("CONSENT_SERVICE");

/**
 * DI token for the {@link OfflineQueueService}.
 *
 * Injected into services that need to queue events when the device
 * is offline and flush them on reconnection.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class PixelManager {
 *   constructor(@Inject(OFFLINE_QUEUE) private offlineQueue: OfflineQueueService) {}
 * }
 * ```
 */
export const OFFLINE_QUEUE = Symbol.for("OFFLINE_QUEUE");

/**
 * Metadata key for the `@TrackingPlatform` decorator.
 *
 * Stores the platform name on the decorated class. Read by
 * `PixelManager` and `TrackingModule.forFeature()` to identify
 * registered pixel platform implementations.
 *
 * Written by: `@TrackingPlatform()`
 * Read by: `PixelManager`, `TrackingModule.forFeature()`
 *
 * @example
 * ```typescript
 * import { getMetadata } from '@vivtel/metadata';
 * const name = getMetadata<string>(TRACKING_PLATFORM_METADATA, MetaPixelPlatform);
 * ```
 */
export const TRACKING_PLATFORM_METADATA = Symbol.for("TRACKING_PLATFORM_METADATA");
