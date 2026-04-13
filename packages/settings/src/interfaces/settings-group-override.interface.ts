/**
 * @fileoverview Per-group store override interface.
 *
 * Allows overriding which named store a specific settings group uses.
 *
 * @module interfaces/settings-group-override
 */

/**
 * Override which store a specific group uses
 */
export interface SettingsGroupOverride {
  /**
   * Name of the store (must match a key in `stores`)
   */
  store: string;
}
