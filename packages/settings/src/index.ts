/**
 * @stackra-inc/ts-settings
 *
 * Registry-based settings system with decorator-driven DTOs,
 * multi-driver persistence (localStorage, API, memory), and
 * the MultipleInstanceManager pattern from ts-support.
 *
 * @module @stackra-inc/ts-settings
 */

// Module
export { SettingsModule } from './settings.module';

// Services
export { SettingsService } from './services/settings.service';
export { SettingsStoreManager } from './services/settings-manager.service';

// Registry
export { SettingsRegistry } from './registries/settings-registry.service';

// Stores (driver implementations)
export { LocalStorageStore } from './stores/local-storage.store';
export { MemoryStore } from './stores/memory.store';
export { ApiStore } from './stores/api.store';

// Decorators
export {
  Setting,
  getSettingMeta,
  SETTING_META_KEY,
  FIELD_META_KEY,
  GROUP_META_KEY,
  SECTION_META_KEY,
} from './decorators/setting.decorator';
export type { SettingOptions } from './decorators/setting.decorator';

export { Field, getFieldDescriptors } from './decorators/field.decorator';
export type {
  FieldOptions,
  FieldDescriptor,
  FieldOption,
  OptionsProvider,
} from './decorators/field.decorator';

export { Group, getGroupDescriptors } from './decorators/group.decorator';
export type { GroupOptions, GroupDescriptor } from './decorators/group.decorator';

export { Section, getSectionForField } from './decorators/section.decorator';
export type { SectionOptions } from './decorators/section.decorator';

// React Hooks
export { useSettings } from './hooks/use-settings.hook';
export type { UseSettingsReturn } from './hooks/use-settings.hook';
export { useSettingsService } from './hooks/use-settings-service.hook';
export { useSettingsManager } from './hooks/use-settings-manager.hook';

// Constants (DI Tokens)
export {
  SETTINGS_CONFIG,
  SETTINGS_REGISTRY,
  SETTINGS_SERVICE,
  SETTINGS_MANAGER,
} from './constants/tokens.constant';

// Interfaces
export type {
  BuiltInControlType,
  SettingControlType,
} from './interfaces/built-in-control-type.type';
export type { SettingValidationRule } from './interfaces/setting-validation-rule.interface';
export type { AttachmentConfig } from './interfaces/attachment-config.interface';
export type { MapConfig } from './interfaces/map-config.interface';

export type {
  SettingDtoConstructor,
  ResolvedSettingGroup,
} from './interfaces/setting-group.interface';

export type { BuiltInSettingsDriver, SettingsDriverName } from './interfaces/settings-driver.type';
export type { BaseStoreConfig } from './interfaces/base-store-config.interface';
export type { LocalStorageStoreConfig } from './interfaces/local-storage-store-config.interface';
export type { ApiStoreConfig } from './interfaces/api-store-config.interface';
export type { MemoryStoreConfig } from './interfaces/memory-store-config.interface';
export type { SettingsStoreConfig } from './interfaces/settings-store-config.type';
export type { SettingsGroupOverride } from './interfaces/settings-group-override.interface';
export type { SettingsModuleOptions } from './interfaces/settings-module-options.interface';

export type { SettingsStore } from './interfaces/settings-store.interface';

export type { SettingFieldSchema } from './interfaces/setting-field-schema.interface';
export type { SettingSubGroupSchema } from './interfaces/setting-sub-group-schema.interface';
export type { SettingGroupSchema } from './interfaces/setting-group-schema.interface';
export type { SettingsApiResponse } from './interfaces/settings-api-response.interface';

// Types
export type { DriverCreator } from './types/driver-creator.type';

// ============================================================================
// Facades
// ============================================================================
export { SettingsFacade } from './facades';
