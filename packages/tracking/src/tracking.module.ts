/**
 * @fileoverview TrackingModule — DI module for browser engagement tracking.
 *
 * `forRoot()` registers TrackingService, PixelManager, pixel platform
 * implementations, ConsentService, OfflineQueueService, IdentitySyncService,
 * and the TrackingConfig in the DI container.
 *
 * @module @stackra/react-tracking
 * @category Module
 */

import { TrackingService } from "@/services/tracking.service";
import { PixelManager } from "@/services/pixel-manager.service";
import { MetaPixelPlatform } from "@/platforms/meta-pixel-platform.service";
import { GtagPlatform } from "@/platforms/gtag-platform.service";
import { TikTokPixelPlatform } from "@/platforms/tiktok-pixel-platform.service";
import { ConsentService } from "@/services/consent.service";
import { OfflineQueueService } from "@/services/offline-queue.service";
import { PixelLoaderService } from "@/services/pixel-loader.service";
import { IdentitySyncService } from "@/services/identity-sync.service";
import {
  TRACKING_SERVICE,
  TRACKING_CONFIG,
  PIXEL_MANAGER,
  PIXEL_PLATFORMS,
  CONSENT_SERVICE,
  OFFLINE_QUEUE,
} from "@/constants";
import type { TrackingConfig } from "@/interfaces/tracking-config.interface";
import type { PixelPlatformInterface } from "@/interfaces/pixel-platform.interface";

/**
 * DI module for browser engagement tracking, pixel management, and identity sync.
 *
 * Usage:
 * ```typescript
 * @Module({
 *   imports: [
 *     TrackingModule.forRoot({
 *       meta: { pixelId: '123456789' },
 *       google: { measurementId: 'G-XXXXXXXXXX' },
 *       apiBaseUrl: '/api',
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
export class TrackingModule {
  /**
   * Configure the tracking module with platform credentials and feature flags.
   *
   * Registers all tracking services in the DI container and makes them
   * available globally. The config is provided via the `TRACKING_CONFIG`
   * token and consumed by all tracking services.
   *
   * @param config - The tracking configuration with pixel IDs, API base URL,
   *   and engagement feature flags.
   * @returns A dynamic module definition with providers and exports.
   *
   * @example
   * ```typescript
   * TrackingModule.forRoot({
   *   meta: { pixelId: '123456789' },
   *   google: { measurementId: 'G-XXXXXXXXXX' },
   *   tiktok: { pixelCode: 'CXXXXXXXXX' },
   *   apiBaseUrl: '/api',
   *   scrollDepthThresholds: [25, 50, 75, 100],
   *   enableTimeOnPage: true,
   *   enableCtaTracking: true,
   * });
   * ```
   */
  public static forRoot(config: TrackingConfig) {
    const providers: any[] = [
      { provide: TRACKING_CONFIG, useValue: config },
      { provide: TRACKING_SERVICE, useClass: TrackingService },
      { provide: PIXEL_MANAGER, useClass: PixelManager },
      { provide: MetaPixelPlatform, useClass: MetaPixelPlatform },
      { provide: GtagPlatform, useClass: GtagPlatform },
      { provide: TikTokPixelPlatform, useClass: TikTokPixelPlatform },
      {
        provide: PIXEL_PLATFORMS,
        useFactory: (
          meta: MetaPixelPlatform,
          google: GtagPlatform,
          tiktok: TikTokPixelPlatform,
        ) => [meta, google, tiktok],
        inject: [MetaPixelPlatform, GtagPlatform, TikTokPixelPlatform],
      },
      { provide: CONSENT_SERVICE, useClass: ConsentService },
      { provide: OFFLINE_QUEUE, useClass: OfflineQueueService },
      { provide: IdentitySyncService, useClass: IdentitySyncService },
      /** @deprecated Use PixelManager instead. Kept for backward compatibility. */
      { provide: PixelLoaderService, useClass: PixelLoaderService },
    ];

    return {
      module: TrackingModule,
      global: true,
      providers,
      exports: [
        TRACKING_SERVICE,
        TRACKING_CONFIG,
        PIXEL_MANAGER,
        CONSENT_SERVICE,
        OFFLINE_QUEUE,
        IdentitySyncService,
        PixelLoaderService,
      ],
    };
  }

  /**
   * Register additional pixel platform implementations.
   *
   * Each platform class must be decorated with `@TrackingPlatform({ name: '...' })`
   * which composes `@Injectable()` and stores the platform name as metadata.
   * The factory provider injects the PixelManager and appends the new platforms
   * to its internal platform array.
   *
   * @param platforms - Array of `@TrackingPlatform`-decorated classes implementing
   *   {@link PixelPlatformInterface}.
   * @returns A dynamic module definition with providers.
   *
   * @example
   * ```typescript
   * @TrackingPlatform({ name: 'snapchat' })
   * class SnapchatPixelPlatform implements PixelPlatformInterface { ... }
   *
   * @Module({
   *   imports: [
   *     TrackingModule.forFeature([SnapchatPixelPlatform]),
   *   ],
   * })
   * export class MarketingModule {}
   * ```
   */
  public static forFeature(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    platforms: (Function & { new (...args: any[]): PixelPlatformInterface })[],
  ) {
    const FEATURE_PLATFORMS = Symbol.for(`TRACKING_FEATURE_PLATFORMS_${Date.now()}`);

    const providers: any[] = [
      // Register each platform class as a provider
      ...platforms.map((platform) => ({
        provide: platform,
        useClass: platform,
      })),
      // Collect all feature platforms into an array
      {
        provide: FEATURE_PLATFORMS,
        useFactory: (...instances: PixelPlatformInterface[]) => instances,
        inject: platforms,
      },
      // Register the feature platforms on the PixelManager's platform array
      {
        provide: `TRACKING_FEATURE_INIT_${Date.now()}`,
        useFactory: (
          existingPlatforms: PixelPlatformInterface[],
          newPlatforms: PixelPlatformInterface[],
        ) => {
          for (const platform of newPlatforms) {
            existingPlatforms.push(platform);
          }
          return true;
        },
        inject: [PIXEL_PLATFORMS, FEATURE_PLATFORMS],
      },
    ];

    return {
      module: TrackingModule,
      providers,
      exports: [],
    };
  }
}
