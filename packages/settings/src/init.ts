/**
 * initSettings — standalone initialization (no DI container needed)
 *
 * Call once at app startup before React renders.
 *
 * @module init
 *
 * @example
 * ```ts
 * import { initSettings } from '@abdokouta/react-settings';
 * import { DisplaySettings, TerminalSettings } from './settings';
 *
 * initSettings({
 *   persistence: 'localStorage',
 *   storagePrefix: 'mngo:settings',
 *   groups: [DisplaySettings, TerminalSettings],
 * });
 * ```
 */

import { SettingsRegistry } from '@/registries/settings-registry.service';
import { SettingsService } from '@/services/settings.service';
import { _setServiceRef, _getServiceRef } from '@/hooks/use-settings.hook';
import type { SettingsModuleOptions } from '@/interfaces/settings-module-options.interface';
import type { SettingDtoConstructor } from '@/interfaces/setting-group.interface';

/** Module-level singletons */
let _registry: SettingsRegistry | null = null;
let _initialized = false;

export interface InitSettingsOptions extends SettingsModuleOptions {
  /** Settings classes decorated with @Setting() to register */
  groups?: SettingDtoConstructor[];
}

/**
 * Initialize the settings system without DI.
 *
 * Creates the registry and service, registers settings classes,
 * and wires up the useSettings() hook.
 *
 * Safe to call multiple times — subsequent calls register new groups only.
 *
 * @param options - Persistence config + settings classes
 * @returns The SettingsService instance
 */
export function initSettings(options: InitSettingsOptions = {}): SettingsService {
  if (_initialized && _registry) {
    const existing = _getServiceRef();
    if (options.groups) {
      for (const dto of options.groups) {
        try {
          _registry.registerClass(dto);
        } catch {
          /* already registered */
        }
      }
    }
    return existing!;
  }

  _registry = new SettingsRegistry();

  if (options.groups) {
    for (const dto of options.groups) {
      _registry.registerClass(dto);
    }
  }

  const service = new SettingsService(options, _registry);
  _setServiceRef(service);
  _initialized = true;

  return service;
}

/**
 * Get the registry singleton (after initSettings).
 */
export function getSettingsRegistry(): SettingsRegistry | null {
  return _registry;
}
