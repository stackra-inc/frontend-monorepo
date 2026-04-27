/**
 * @TrackingPlatform Decorator
 *
 * Marks a class as a pixel platform implementation and stores its
 * platform name as metadata. Composes `@Injectable()` so consumers
 * don't need to apply both decorators.
 *
 * All metadata reads and writes go through `@vivtel/metadata` for a
 * consistent, typed API instead of raw `Reflect.*` calls.
 *
 * @module @stackra/react-tracking
 * @category Decorators
 *
 * @example
 * ```typescript
 * import { TrackingPlatform } from '@stackra/react-tracking';
 *
 * @TrackingPlatform({ name: 'meta' })
 * export class MetaPixelPlatform implements PixelPlatformInterface {
 *   // ...
 * }
 * ```
 */

import { Injectable } from "@stackra/ts-container";
import { defineMetadata, getMetadata } from "@vivtel/metadata";

import { TRACKING_PLATFORM_METADATA } from "@/constants/tokens.constant";

/**
 * Options for the `@TrackingPlatform` decorator.
 */
export interface TrackingPlatformOptions {
  /**
   * The platform's string identifier (e.g., `'meta'`, `'google'`, `'tiktok'`).
   *
   * Must be unique across all registered platforms. Used for logging,
   * debugging, and configuration lookups.
   */
  name: string;
}

/**
 * Class decorator that marks a class as a pixel platform implementation.
 *
 * Composes `@Injectable()` and stores the platform name as metadata
 * via `@vivtel/metadata`. The `PixelManager` and `TrackingModule.forFeature()`
 * read this metadata to identify registered platforms.
 *
 * @param options - Platform configuration with the platform name.
 * @returns A class decorator function.
 *
 * @example
 * ```typescript
 * @TrackingPlatform({ name: 'meta' })
 * export class MetaPixelPlatform implements PixelPlatformInterface {
 *   platformName(): string { return 'meta'; }
 *   // ...
 * }
 * ```
 */
export function TrackingPlatform(options: TrackingPlatformOptions): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function) => {
    // Apply @Injectable() so the class is DI-resolvable
    Injectable()(target);

    // Store the platform name as metadata
    defineMetadata(TRACKING_PLATFORM_METADATA, options.name, target as object);
  };
}

/**
 * Read `@TrackingPlatform` metadata from a decorated class.
 *
 * @param target - The class to read metadata from.
 * @returns The stored platform name, or `undefined` if not decorated.
 *
 * @example
 * ```typescript
 * const name = getTrackingPlatformMetadata(MetaPixelPlatform);
 * // 'meta'
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function getTrackingPlatformMetadata(target: Function): string | undefined {
  return getMetadata<string>(TRACKING_PLATFORM_METADATA, target as object);
}
