/**
 * Settings Configuration
 *
 * Default configuration for the settings package.
 *
 * @module @stackra-inc/ts-settings
 */

import type { SettingsModuleOptions } from '@stackra-inc/ts-settings';

export const defaultSettingsConfig: SettingsModuleOptions = {
  default: 'memory',
  stores: {
    memory: { driver: 'memory' },
  },
};
