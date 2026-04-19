/**
 * Settings Configuration
 *
 * Default configuration for the settings package.
 *
 * @module @stackra/ts-settings
 */

import type { SettingsModuleOptions } from '@stackra/ts-settings';

export const defaultSettingsConfig: SettingsModuleOptions = {
  default: 'memory',
  stores: {
    memory: { driver: 'memory' },
  },
};
