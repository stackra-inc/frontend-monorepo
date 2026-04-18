/**
 * Settings Configuration
 *
 * Default configuration for the settings package.
 *
 * @module @stackra/ts-settings
 */

import type { SettingsModuleOptions } from '@/src/interfaces';

export const defaultSettingsConfig: SettingsModuleOptions = {
  default: 'memory',
  stores: {
    memory: { driver: 'memory' },
  },
};
