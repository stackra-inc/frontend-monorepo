/**
 * Settings Module
 *
 * Registers:
 * - `SETTINGS_CONFIG`   — raw config object
 * - `SettingsStoreManager` — created by DI (extends MultipleInstanceManager)
 * - `SETTINGS_MANAGER`  — useExisting alias to SettingsStoreManager
 * - `SettingsRegistry`  — group/field registry
 * - `SettingsService`   — high-level API
 *
 * Follows the exact same DI pattern as CacheModule:
 * - `forRoot(config)` — configures stores and registers providers
 * - `forFeature(classes)` — registers @Setting() decorated classes
 *
 * @module settings.module
 *
 * @example
 * ```ts
 * @Module({
 *   imports: [
 *     SettingsModule.forRoot({
 *       default: 'local',
 *       prefix: 'mngo:settings',
 *       stores: {
 *         local: { driver: 'localStorage' },
 *         api: { driver: 'api', baseUrl: '/api/settings', fallbackStore: 'local' },
 *       },
 *       groups: {
 *         terminal: { store: 'api' },
 *       },
 *     }),
 *     SettingsModule.forFeature([DisplaySettings, TerminalSettings]),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */

import { Module, type DynamicModule } from '@abdokouta/ts-container';
import {
  SETTINGS_CONFIG,
  SETTINGS_REGISTRY,
  SETTINGS_SERVICE,
  SETTINGS_MANAGER,
} from '@/constants/tokens.constant';
import { SettingsRegistry } from '@/registries/settings-registry.service';
import { SettingsStoreManager } from '@/services/settings-manager.service';
import { SettingsService } from '@/services/settings.service';
import type { SettingsModuleOptions } from '@/interfaces/settings-module-options.interface';

import type { SettingDtoConstructor } from '@/interfaces/setting-group.interface';

/** Singleton registry shared across forRoot and forFeature calls */
const globalRegistry = new SettingsRegistry();

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern
export class SettingsModule {
  /**
   * Configure the settings system. Call once in root app module.
   *
   * Follows the same pattern as CacheModule.forRoot():
   * - SETTINGS_CONFIG — raw config
   * - SettingsStoreManager — class-based injection (extends MultipleInstanceManager)
   * - SETTINGS_MANAGER — useExisting alias
   * - SettingsRegistry — group/field registry
   * - SettingsService — high-level API
   */
  static forRoot(config: SettingsModuleOptions = {}): DynamicModule {
    return {
      module: SettingsModule,
      global: true,
      providers: [
        // Config
        { provide: SETTINGS_CONFIG, useValue: config },
        // Registry
        { provide: SETTINGS_REGISTRY, useValue: globalRegistry },
        { provide: SettingsRegistry, useValue: globalRegistry },
        // Manager (created by DI so @Inject decorators fire)
        { provide: SettingsStoreManager, useClass: SettingsStoreManager },
        { provide: SETTINGS_MANAGER, useExisting: SettingsStoreManager },
        // Service
        { provide: SettingsService, useClass: SettingsService },
        { provide: SETTINGS_SERVICE, useExisting: SettingsService },
      ],
      exports: [
        SETTINGS_CONFIG,
        SETTINGS_REGISTRY,
        SETTINGS_MANAGER,
        SETTINGS_SERVICE,
        SettingsRegistry,
        SettingsStoreManager,
        SettingsService,
      ],
    };
  }

  /**
   * Register `@Setting()` decorated classes.
   *
   * @param classes - A single class or array of classes
   */
  static forFeature(classes: SettingDtoConstructor | SettingDtoConstructor[]): DynamicModule {
    const list = Array.isArray(classes) ? classes : [classes];
    for (const dto of list) {
      globalRegistry.registerClass(dto);
    }
    return { module: SettingsModule, providers: [], exports: [] };
  }
}
