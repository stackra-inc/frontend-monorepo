/**
 * @fileoverview Settings driver name types.
 *
 * Defines the built-in driver names and the extensible
 * SettingsDriverName union that also accepts custom strings.
 *
 * @module interfaces/settings-driver
 */

/** Built-in driver names */
export type BuiltInSettingsDriver = 'localStorage' | 'api' | 'memory';

/** Driver name — built-in or custom string */
export type SettingsDriverName = BuiltInSettingsDriver | (string & {});
