/**
 * Driver Creator
 *
 * Factory function signature for creating settings store instances from config.
 * Used by SettingsStoreManager for custom driver registration via `extend()`.
 *
 * @typeParam T - The type of instance the creator produces
 *
 * @module types/driver-creator
 */
export type DriverCreator<T = any> = (config: Record<string, any>, prefix?: string) => T;
