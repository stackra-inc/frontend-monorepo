/**
 * @fileoverview useSettingsService React hook.
 *
 * Provides direct access to the raw SettingsService instance
 * for key-based settings access.
 *
 * @module hooks/use-settings-service
 */

import { useInject } from '@stackra-inc/ts-container';
import { SettingsService } from '@/services/settings.service';

/**
 * Hook to get the raw SettingsService (for key-based access).
 */
export function useSettingsService(): SettingsService {
  const service = useInject<SettingsService>(SettingsService);
  if (!service) {
    throw new Error('[useSettingsService] SettingsService not found.');
  }
  return service;
}
