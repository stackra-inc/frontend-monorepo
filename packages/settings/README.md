# @stackra/ts-settings

Registry-based settings management with decorator-driven DTOs, multi-driver
persistence, and DI integration.

## Installation

```bash
pnpm add @stackra/ts-settings
```

## Features

- 🏗️ `SettingsModule.forRoot()` / `forFeature()` with DI integration
- 📦 `SettingsStoreManager` extending `MultipleInstanceManager` for named stores
- 🗂️ `SettingsRegistry` for group/field registration via `@Setting()` DTOs
- 🎯 `SettingsService` high-level API for get/set operations
- 💾 Stores: `MemoryStore`, `LocalStorageStore`, `ApiStore`
- 🎭 Decorators: `@Setting()`, `@Field()`, `@Group()`, `@Section()`
- ⚛️ React hooks: `useSettings()`, `useSettingsService()`,
  `useSettingsManager()`
- 🏷️ DI tokens: `SETTINGS_CONFIG`, `SETTINGS_REGISTRY`, `SETTINGS_SERVICE`,
  `SETTINGS_MANAGER`
- 🔧 Per-group store overrides
- 📐 Field validation rules and control types

## Usage

### Module Registration

```typescript
/**
 * |-------------------------------------------------------------------
 * | Register SettingsModule in your root AppModule.
 * |-------------------------------------------------------------------
 */
import { Module } from '@stackra/ts-container';
import { SettingsModule } from '@stackra/ts-settings';

@Module({
  imports: [
    SettingsModule.forRoot({
      default: 'local',
      prefix: 'app:settings',
      stores: {
        memory: { driver: 'memory' },
        local: { driver: 'localStorage', prefix: 'app:' },
        api: {
          driver: 'api',
          baseUrl: '/api/settings',
          fallbackStore: 'local',
        },
      },
      groups: {
        terminal: { store: 'api' },
      },
    }),
  ],
})
export class AppModule {}
```

### Defining Settings DTOs

```typescript
/**
 * |-------------------------------------------------------------------
 * | Use @Setting, @Group, @Section, and @Field decorators.
 * |-------------------------------------------------------------------
 */
import { Setting, Group, Section, Field } from '@stackra/ts-settings';

@Setting({ key: 'display', label: 'Display Settings' })
export class DisplaySettings {
  @Group({ label: 'Appearance' })
  @Section({ label: 'Theme' })
  @Field({
    type: 'select',
    default: 'dark',
    options: ['light', 'dark', 'system'],
  })
  theme!: string;

  @Field({ type: 'number', default: 14, min: 10, max: 24 })
  fontSize!: number;
}
```

### Feature Module Registration

```typescript
/**
 * |-------------------------------------------------------------------
 * | Register @Setting() classes via forFeature().
 * |-------------------------------------------------------------------
 */
@Module({
  imports: [SettingsModule.forFeature([DisplaySettings, TerminalSettings])],
})
export class SettingsFeatureModule {}
```

### React Hook

```tsx
/**
 * |-------------------------------------------------------------------
 * | useSettings() provides get/set with reactive updates.
 * |-------------------------------------------------------------------
 */
import { useSettings } from '@stackra/ts-settings';

function SettingsPanel() {
  const { groups, getValue, setValue, loading } = useSettings();

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {groups.map((group) => (
        <div key={group.key}>{group.label}</div>
      ))}
    </div>
  );
}
```

## API Reference

| Export                 | Type      | Description                                           |
| ---------------------- | --------- | ----------------------------------------------------- |
| `SettingsModule`       | Module    | DI module with `forRoot()` and `forFeature()`         |
| `SettingsService`      | Service   | High-level get/set API                                |
| `SettingsStoreManager` | Service   | Multi-store manager (extends MultipleInstanceManager) |
| `SettingsRegistry`     | Service   | Group/field registry for @Setting DTOs                |
| `MemoryStore`          | Store     | In-memory settings store                              |
| `LocalStorageStore`    | Store     | localStorage-backed store                             |
| `ApiStore`             | Store     | API-backed store with fallback support                |
| `@Setting(opts)`       | Decorator | Mark a class as a settings DTO                        |
| `@Field(opts)`         | Decorator | Define a settings field with type and defaults        |
| `@Group(opts)`         | Decorator | Group fields under a label                            |
| `@Section(opts)`       | Decorator | Section within a group                                |
| `useSettings()`        | Hook      | Reactive settings access                              |
| `useSettingsService()` | Hook      | Access SettingsService from DI                        |
| `useSettingsManager()` | Hook      | Access SettingsStoreManager from DI                   |
| `SETTINGS_CONFIG`      | Token     | DI token for module configuration                     |
| `SETTINGS_REGISTRY`    | Token     | DI token for SettingsRegistry                         |
| `SETTINGS_SERVICE`     | Token     | DI token for SettingsService                          |
| `SETTINGS_MANAGER`     | Token     | DI token for SettingsStoreManager                     |

## License

MIT
