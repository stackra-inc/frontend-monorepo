# Entry Providers Analysis

Services that implement `OnModuleInit` or `OnApplicationBootstrap` need to be
listed in `entryProviders` so they are instantiated eagerly on bootstrap — even
if nothing injects them directly.

Without `entryProviders`, these services are only instantiated when first
injected. Side effects (DB connections, event subscriptions, hardware init)
would never run.

---

## Packages Requiring `entryProviders`

### 1. `@stakra/ts-cache` — `cache.module.ts`

**Service:** `CacheManager` implements `OnModuleInit`

```typescript
// cache.module.ts — forRoot()
static forRoot(config: CacheModuleOptions): DynamicModule {
  return {
    module: CacheModule,
    global: true,
    providers: [
      { provide: CACHE_CONFIG, useValue: config },
      { provide: CacheManager, useClass: CacheManager },
      { provide: CACHE_MANAGER, useExisting: CacheManager },
    ],
    exports: [CacheManager, CACHE_MANAGER, CACHE_CONFIG],
    // ✅ ADD:
    entryProviders: [
      { provide: CacheManager, useClass: CacheManager },
    ],
  };
}
```

**Why:** `CacheManager.onModuleInit()` initializes store connections. Without
eager init, the first `manager.store()` call would hit an uninitialized manager.

---

### 2. `@stakra/ts-redis` — `redis.module.ts`

**Service:** `RedisManager` implements `OnModuleInit`

```typescript
// redis.module.ts — forRoot()
static forRoot(config: RedisConfig): DynamicModule {
  return {
    module: RedisModule,
    global: config.isGlobal ?? true,
    providers: [
      { provide: REDIS_CONFIG, useValue: config },
      { provide: RedisManager, useClass: RedisManager },
      { provide: REDIS_MANAGER, useExisting: RedisManager },
      { provide: REDIS_CONNECTOR, useClass: UpstashConnector },
    ],
    exports: [RedisManager, REDIS_MANAGER],
    // ✅ ADD:
    entryProviders: [
      { provide: RedisManager, useClass: RedisManager },
    ],
  };
}
```

**Why:** `RedisManager.onModuleInit()` establishes Redis connections.
Connections must be ready before any cache/event/session operations.

---

### 3. `@stakra/ts-events` — `events.module.ts`

**Service:** `EventManager` implements `OnModuleInit`

```typescript
// events.module.ts — forRoot()
static forRoot(config: EventModuleOptions): DynamicModule {
  return {
    module: EventsModule,
    global: true,
    providers: [
      { provide: EVENT_CONFIG, useValue: config },
      { provide: EventManager, useClass: EventManager },
      { provide: EVENT_MANAGER, useExisting: EventManager },
    ],
    exports: [EventManager, EVENT_MANAGER, EVENT_CONFIG],
    // ✅ ADD:
    entryProviders: [
      { provide: EventManager, useClass: EventManager },
    ],
  };
}
```

**Why:** `EventManager.onModuleInit()` connects to the event dispatcher (Redis
pub/sub, memory bus). Event subscribers registered via `@OnEvent()` won't
receive events until the manager is initialized.

---

### 4. `@stakra/ts-logger` — `logger.module.ts`

**Service:** `LoggerManager` implements `OnModuleInit`

```typescript
// logger.module.ts — forRoot()
static forRoot(config: LoggerModuleOptions): DynamicModule {
  return {
    module: LoggerModule,
    global: true,
    providers: [
      { provide: LOGGER_CONFIG, useValue: processedConfig },
      { provide: LoggerManager, useClass: LoggerManager },
      { provide: LOGGER_MANAGER, useExisting: LoggerManager },
      {
        provide: 'LOGGER_STATIC_REF',
        useFactory: (manager: LoggerManager) => {
          LoggerService.staticManagerRef = manager;
          return manager;
        },
        inject: [LoggerManager],
      },
    ],
    exports: [LoggerManager, LOGGER_MANAGER, LOGGER_CONFIG],
    // ✅ ADD:
    entryProviders: [
      { provide: LoggerManager, useClass: LoggerManager },
    ],
  };
}
```

**Why:** `LoggerManager.onModuleInit()` sets up log channels and transporters.
`LoggerService.staticManagerRef` must be set before any static `Logger.log()`
calls during bootstrap.

---

### 5. `@stakra/ts-desktop` — `desktop.module.ts`

**Services:** `DesktopManager`, `AutoUpdateService` implement `OnModuleInit`

```typescript
// desktop.module.ts — forRoot()
static forRoot(config: DesktopModuleOptions): DynamicModule {
  return {
    module: DesktopModule,
    global: true,
    providers: [ /* ...all 23 services... */ ],
    exports: [ /* ...all exports... */ ],
    // ✅ ADD:
    entryProviders: [
      { provide: DesktopManager, useClass: DesktopManager },
      { provide: AutoUpdateService, useClass: AutoUpdateService },
    ],
  };
}
```

**Why:**

- `DesktopManager.onModuleInit()` registers IPC handlers, sets up the menu bar,
  and initializes hardware bridges. Must run at startup.
- `AutoUpdateService.onModuleInit()` starts the update check interval. Must run
  eagerly to catch updates on launch.

---

### 6. `@stakra/ts-eloquent` — `eloquent.module.ts`

**Services:** `ModelRegistry`, `MigrationRegistry` implement `OnModuleInit`

```typescript
// eloquent.module.ts — forRoot()
static forRoot(config: EloquentRootOptions): DynamicModule {
  return {
    module: EloquentModule,
    global: true,
    providers: [ /* ...all registry providers... */ ],
    exports: [ /* ...all exports... */ ],
    // ✅ ADD:
    entryProviders: [
      { provide: ModelRegistry, useClass: ModelRegistry },
      { provide: MigrationRegistry, useFactory: (cm) => { ... }, inject: [ConnectionManager] },
    ],
  };
}
```

**Why:**

- `ModelRegistry.onModuleInit()` wires `ConnectionManager` into all `Model`
  classes and creates RxDB collections. Without this, no model queries work.
- `MigrationRegistry.onModuleInit()` runs pending migrations when `autoMigrate`
  is enabled. Must run before any data access.

---

## Packages That Do NOT Need `entryProviders`

| Package                      | Reason                                                     |
| ---------------------------- | ---------------------------------------------------------- |
| `@stakra/ts-config`          | Config is a value provider — no lifecycle hooks            |
| `@stakra/react-i18n`         | React-driven, no server-side init                          |
| `@stakra/kbd`                | Registry is a value provider (singleton instance)          |
| `@stakra/ts-settings`        | `SettingsStoreManager` is lazy — init on first use is fine |
| `@stakra/react-theming`      | Registry is a value provider (singleton instance)          |
| `@stakra/ts-pwa`             | Config-only module, no services with lifecycle hooks       |
| `@stakra/react-multitenancy` | React-driven, no DI lifecycle hooks                        |
| `@stakra/react-auth`         | React-driven, no DI lifecycle hooks                        |
| `@stakra/ts-http`            | Stateless middleware pipeline, no init needed              |
| `@stakra/react-router`       | Registry-based, no lifecycle hooks                         |
| `@stakra/react-sdui`         | Registry-based, no lifecycle hooks                         |
| `@stakra/react-refine`       | Service registry, lazy init is fine                        |
| `@stakra/ts-ui`              | Component registry, no lifecycle hooks                     |

---

## Summary

| Package               | Service             | Hook           | Add to entryProviders |
| --------------------- | ------------------- | -------------- | --------------------- |
| `@stakra/ts-cache`    | `CacheManager`      | `OnModuleInit` | ✅ Yes                |
| `@stakra/ts-redis`    | `RedisManager`      | `OnModuleInit` | ✅ Yes                |
| `@stakra/ts-events`   | `EventManager`      | `OnModuleInit` | ✅ Yes                |
| `@stakra/ts-logger`   | `LoggerManager`     | `OnModuleInit` | ✅ Yes                |
| `@stakra/ts-desktop`  | `DesktopManager`    | `OnModuleInit` | ✅ Yes                |
| `@stakra/ts-desktop`  | `AutoUpdateService` | `OnModuleInit` | ✅ Yes                |
| `@stakra/ts-eloquent` | `ModelRegistry`     | `OnModuleInit` | ✅ Yes                |
| `@stakra/ts-eloquent` | `MigrationRegistry` | `OnModuleInit` | ✅ Yes                |
