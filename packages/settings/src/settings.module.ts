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
 *       sync: {
 *         groups: ['theme', 'notifications'],
 *         storageAdapter: 'localStorage',
 *       },
 *     }),
 *     SettingsModule.forFeature([DisplaySettings, TerminalSettings]),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */

import { Module, type DynamicModule } from '@stackra/ts-container';
import {
  SETTINGS_CONFIG,
  SETTINGS_REGISTRY,
  SETTINGS_SERVICE,
  SETTINGS_MANAGER,
  SETTINGS_SYNC_CONFIG,
  SETTINGS_SYNC_SERVICE,
  SETTINGS_FEATURE_CLASSES,
} from '@/constants/tokens.constant';
import { SettingsRegistry } from '@/registries/settings-registry.service';
import { SettingsStoreManager } from '@/services/settings-manager.service';
import { SettingsService } from '@/services/settings.service';
import { SettingsSyncService } from '@/services/settings-sync.service';
import type { SettingsModuleOptions } from '@/interfaces/settings-module-options.interface';

import type { SettingDtoConstructor } from '@/interfaces/setting-group.interface';

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
   *
   * When `config.sync` is provided, additionally registers:
   * - SETTINGS_SYNC_CONFIG — sync configuration
   * - SettingsSyncService — real-time sync service
   * - SETTINGS_SYNC_SERVICE — useExisting alias
   */
  static forRoot(config: SettingsModuleOptions = {}): DynamicModule {
    const providers: any[] = [
      // Config
      { provide: SETTINGS_CONFIG, useValue: config },
      // Registry (DI-managed singleton — no module-level global)
      { provide: SettingsRegistry, useClass: SettingsRegistry },
      { provide: SETTINGS_REGISTRY, useExisting: SettingsRegistry },
      // Manager (created by DI so @Inject decorators fire)
      { provide: SettingsStoreManager, useClass: SettingsStoreManager },
      { provide: SETTINGS_MANAGER, useExisting: SettingsStoreManager },
      // Service
      { provide: SettingsService, useClass: SettingsService },
      { provide: SETTINGS_SERVICE, useExisting: SettingsService },
    ];

    const exports: any[] = [
      SETTINGS_CONFIG,
      SETTINGS_REGISTRY,
      SETTINGS_MANAGER,
      SETTINGS_SERVICE,
      SettingsRegistry,
      SettingsStoreManager,
      SettingsService,
    ];

    // Register sync providers when sync config is provided
    if (config.sync) {
      providers.push(
        { provide: SETTINGS_SYNC_CONFIG, useValue: config.sync },
        { provide: SettingsSyncService, useClass: SettingsSyncService },
        { provide: SETTINGS_SYNC_SERVICE, useExisting: SettingsSyncService }
      );

      exports.push(SETTINGS_SYNC_CONFIG, SETTINGS_SYNC_SERVICE, SettingsSyncService);
    }

    return {
      module: SettingsModule,
      global: true,
      providers,
      exports,
    };
  }

  /**
   * Register `@Setting()` decorated classes.
   *
   * Returns a dynamic module with a factory provider that injects the
   * DI-managed `SettingsRegistry` and registers the classes on it.
   * This avoids a module-level global singleton.
   *
   * @param classes - A single class or array of classes
   */
  static forFeature(classes: SettingDtoConstructor | SettingDtoConstructor[]): DynamicModule {
    const list = Array.isArray(classes) ? classes : [classes];

    return {
      module: SettingsModule,
      providers: [
        { provide: SETTINGS_FEATURE_CLASSES, useValue: list },
        {
          provide: `SETTINGS_FEATURE_INIT_${Date.now()}`,
          useFactory: (registry: SettingsRegistry, dtos: SettingDtoConstructor[]) => {
            for (const dto of dtos) {
              registry.registerClass(dto);
            }
            return true;
          },
          inject: [SettingsRegistry, SETTINGS_FEATURE_CLASSES],
        },
      ],
      exports: [],
    };
  }
}
