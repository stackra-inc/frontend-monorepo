# @stackra-inc/ts-events

## 1.0.0

### Major Features

- 🎉 Initial release of @stackra-inc/ts-events
- 🚀 `EventsModule.forRoot()` with DynamicModule DI pattern
- 📦 `EventManager` extending MultipleInstanceManager for named dispatchers
- 🎯 `EventService` high-level API wrapping individual dispatchers
- 💾 `MemoryDispatcher` with wildcard matching, priority, and RxJS streaming
- 📡 `RedisDispatcher` for cross-process event dispatching
- 🔇 `NullDispatcher` for testing
- 🎭 `@OnEvent` decorator for declarative listener registration
- 🏷️ `@Subscriber` decorator for event subscriber classes
- 📺 `@Channel` decorator for binding subscribers to specific dispatchers
- ⚡ Priority-based listener execution via `EventPriority` enum
- 🔁 One-time listeners via `once()`
- 🛑 Halt-on-first-response via `until()`
- 📡 RxJS `asObservable()` for async event streaming
- ⚛️ React hooks: `useEvents()`, `useEvent()`
- 🏗️ DI tokens: `EVENT_CONFIG`, `EVENT_MANAGER`, `ON_EVENT_METADATA`,
  `EVENT_SUBSCRIBER_METADATA`
- 🛠️ Wildcard utilities: `isWildcard`, `matchesWildcard`, `clearWildcardCache`
- 📐 `defineConfig()` type-safe config helper
