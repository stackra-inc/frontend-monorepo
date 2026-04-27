/**
 * Platforms Barrel Export
 *
 * Pixel platform implementations for advertising SDKs.
 * Each class implements {@link PixelPlatformInterface} and is decorated
 * with `@TrackingPlatform` for metadata-driven registration.
 *
 * - {@link MetaPixelPlatform} — Meta Pixel (`fbq`)
 * - {@link GtagPlatform} — Google Analytics (`gtag.js`)
 * - {@link TikTokPixelPlatform} — TikTok Pixel (`ttq`)
 *
 * @module platforms
 */

export { MetaPixelPlatform } from "./meta-pixel-platform.service";
export { GtagPlatform } from "./gtag-platform.service";
export { TikTokPixelPlatform } from "./tiktok-pixel-platform.service";
