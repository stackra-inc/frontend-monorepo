/**
 * Cache Types Barrel Export
 *
 * Type aliases and union types for the cache package.
 * Interface definitions are in the `interfaces/` folder.
 *
 * - {@link CacheDriver} — Union of built-in driver identifiers
 * - {@link StoreConfig} — Discriminated union of store configurations
 * - {@link DriverCreator} — Factory function type for custom drivers
 *
 * @module types
 */

export type { CacheDriver } from './cache-driver.type';
export type { StoreConfig } from './store-config.type';
export type { DriverCreator } from './driver-creator.type';
