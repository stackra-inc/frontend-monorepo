/**
 * @fileoverview useSettingsManager React hook.
 *
 * Provides direct access to the SettingsStoreManager instance
 * for custom driver registration and store-level operations.
 *
 * @module hooks/use-settings-manager
 */

import { useInject } from '@stackra-inc/ts-container';
import { SettingsStoreManager } from '@/services/settings-manager.service';

/**
 * Hook to get the SettingsStoreManager (for custom drivers, store access).
 */
export function useSettingsManager(): SettingsStoreManager {
  const manager = useInject<SettingsStoreManager>(SettingsStoreManager);
  if (!manager) {
    throw new Error('[useSettingsManager] SettingsStoreManager not found.');
  }
  return manager;
}
