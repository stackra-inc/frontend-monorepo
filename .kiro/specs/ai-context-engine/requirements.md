# Requirements Document

## Introduction

The AI Context Engine is a DI-native service package
(`@stackra/react-ai-context`) that enables an AI chatbot to be context-aware of
every component on the current page. Instead of introducing a separate state
management library, the package leverages the existing `@stackra/ts-container`
DI container, `@stackra/ts-support` facade system and `BaseRegistry`, and
`@stackra/ts-events` event dispatcher already present in the monorepo.

The package provides a central registry (`AIContextRegistry`) that extends
`BaseRegistry<ComponentContextEntry>` from `@stackra/ts-support`, consistent
with other registries in the monorepo (ShortcutRegistry, ThemeRegistry,
RouteRegistry). On top of the inherited Map-based component storage, the
registry adds a separate global context map, a debounced subscription system, a
snapshot builder with optional payload-size truncation, middleware/interceptor
support for transforming context before storage, and context selectors for
cross-component reads.

React hooks (`useAIComponent`, `useAIGlobal`, `useAIEvent`,
`useAIComponentSnapshot`) handle lifecycle-aware registration and
cross-component reads. An `AIContextFacade` provides static access from the
chatbot API layer. Components can also emit semantic AI events via the existing
`EventFacade` for temporal context.

The `AIContextModule` supports both `forRoot()` for global configuration and
`forFeature()` for declarative pre-registration of component contexts and
default globals from feature modules.

The package lives at `packages/ai-context/` and follows all monorepo
conventions: DI module pattern with `forRoot()` / `forFeature()`, facade
constant, `BaseRegistry` extension, lower-kebab-case file naming, full JSDoc
docblocks per `docblocks-and-comments.md`, tsup builds, and vitest tests.

## Glossary

- **AIContextRegistry**: An injectable singleton service extending
  `BaseRegistry<ComponentContextEntry>` from `@stackra/ts-support`. Acts as the
  central registry where components and global context register themselves.
  Inherits Map-based component storage from BaseRegistry and adds a separate
  global context map, snapshot builder, subscription system with debounced
  notifications, middleware/interceptor pipeline, context selectors, and payload
  size truncation.
- **BaseRegistry**: An abstract generic class from `@stackra/ts-support` that
  provides standard Map-based registry operations: `register(key, entry)`,
  `get(key)`, `has(key)`, `remove(key)`, `all()`, `count()`, `clear()`. Used as
  the base class for all registries in the monorepo.
- **ComponentContext**: A registered entry in the AIContextRegistry representing
  a single component's semantic data, keyed by a unique component ID. Contains
  an id, a semantic label, a data payload, and an optional insight classifier.
- **ComponentContextEntry**: Internal entry extending ComponentContext with an
  `updatedAt` timestamp for LRU truncation. This is the type parameter for
  `BaseRegistry<ComponentContextEntry>`.
- **GlobalContext**: A registered entry in the AIContextRegistry representing a
  global context value (user, theme, route, etc.), keyed by a string key.
- **AISnapshot**: The normalized JSON payload produced by the AIContextRegistry
  snapshot method, containing all global context entries and all component
  contexts, ready for transmission to an AI API.
- **Insight**: A short string classifier attached to a ComponentContext that
  pre-categorizes the data for the AI (e.g., "active_cart", "high_value",
  "empty_state").
- **AIContextInterceptor**: An interface for middleware that transforms or
  enriches context data before it enters the registry. Interceptors can
  auto-attach timestamps, route info, user IDs, or transform data.
- **useAIComponent**: A React hook that registers a component's semantic context
  with the AIContextRegistry on mount, updates on data change, and unregisters
  on unmount.
- **useAIGlobal**: A React hook that pushes a global context entry (user, theme,
  route) into the AIContextRegistry and updates whenever the value changes.
- **useAIComponentSnapshot**: A React hook that reads a specific component's
  context from the registry, enabling cross-component AI features.
- **AIContextFacade**: A typed facade constant providing static-style access to
  the AIContextRegistry from the chatbot API layer, following the monorepo
  facade pattern.
- **AIContextModule**: The DI module that registers the AIContextRegistry and
  related providers via the standard `forRoot()` / `forFeature()` pattern.
- **SnapshotSubscriber**: A callback function registered with the
  AIContextRegistry that is invoked whenever the snapshot changes due to context
  registration, update, or removal.
- **DebounceWindow**: A configurable time interval (in milliseconds) during
  which rapid context updates are batched before notifying subscribers.
- **SemanticEvent**: An event emitted through the existing EventFacade (e.g.,
  `ai:customer_selected`, `ai:checkout_started`) that provides temporal context
  about user actions for the AI.
- **SnapshotDiff**: The result of comparing two AISnapshot objects, containing
  added, removed, and modified components and globals. Used for sending
  incremental updates to the AI API.
- **AIContextFeatureConfig**: Configuration object passed to
  `AIContextModule.forFeature()` for declarative pre-registration of component
  contexts and default globals from feature modules.

## Requirements

### Requirement 1: AIContextRegistry Service

**User Story:** As a developer, I want a central injectable registry for AI
context that extends BaseRegistry from @stackra/ts-support, so that any
component or service can contribute semantic data that the AI chatbot can
consume, and the registry follows the same pattern as other registries in the
monorepo.

#### Acceptance Criteria

1. THE AIContextRegistry SHALL be an injectable singleton service decorated with
   `@Injectable()` and registered in the DI container via the AIContextModule.
2. THE AIContextRegistry SHALL extend `BaseRegistry<ComponentContextEntry>` from
   `@stackra/ts-support`, inheriting the standard registry API:
   `register(key, entry)`, `get(key)`, `has(key)`, `remove(key)`, `all()`,
   `count()`, `clear()`.
3. THE AIContextRegistry SHALL use the inherited BaseRegistry storage for
   ComponentContextEntry entries keyed by a unique string component ID.
4. THE AIContextRegistry SHALL maintain a separate Map of GlobalContext entries
   keyed by a string key (not stored in the BaseRegistry storage).
5. WHEN `registerComponent` is called with a component ID, label, data payload,
   and optional insight, THE AIContextRegistry SHALL run all registered
   interceptors, then call the inherited `register(id, entry)` method to add a
   new ComponentContextEntry to the BaseRegistry storage.
6. WHEN `registerComponent` is called with a component ID that already exists in
   the registry, THE AIContextRegistry SHALL run all registered interceptors,
   then call the inherited `register(id, entry)` method to update the existing
   ComponentContextEntry with the new data and insight.
7. WHEN `unregisterComponent` is called with a component ID, THE
   AIContextRegistry SHALL call the inherited `remove(id)` method to remove the
   matching ComponentContextEntry from the BaseRegistry storage.
8. IF `unregisterComponent` is called with a component ID that does not exist in
   the registry, THEN THE AIContextRegistry SHALL return without error.
9. WHEN `setGlobal` is called with a key and value, THE AIContextRegistry SHALL
   add or update the matching GlobalContext entry in the global map.
10. WHEN `removeGlobal` is called with a key, THE AIContextRegistry SHALL remove
    the matching GlobalContext entry from the global map.
11. THE AIContextRegistry SHALL expose a `componentCount` accessor that returns
    the inherited `count()` value (number of registered ComponentContextEntry
    entries).
12. THE AIContextRegistry SHALL expose a `globalKeys` accessor that returns an
    array of all registered GlobalContext keys.

### Requirement 2: Snapshot Builder

**User Story:** As a chatbot API developer, I want to retrieve a normalized JSON
snapshot of all registered context, so that I can send it to the AI API as part
of the conversation payload.

#### Acceptance Criteria

1. WHEN `snapshot` is called, THE AIContextRegistry SHALL return an AISnapshot
   object containing all GlobalContext entries as top-level keys and all
   ComponentContext entries nested under a `components` key.
2. THE AISnapshot `components` object SHALL use the component ID as the key and
   the ComponentContext data payload (with insight field included when present)
   as the value.
3. WHEN `snapshot` is called and no components or global context are registered,
   THE AIContextRegistry SHALL return an AISnapshot with an empty `components`
   object and no global keys.
4. FOR ALL valid registry states, calling `snapshot` SHALL produce a
   JSON-serializable object (THE AISnapshot SHALL contain no circular
   references, functions, or undefined values).
5. WHEN `snapshot` is called, THE AIContextRegistry SHALL produce a new object
   reference each time (THE AISnapshot SHALL be an immutable copy, not a
   reference to internal state).
6. FOR ALL valid registry states, `JSON.parse(JSON.stringify(snapshot()))` SHALL
   produce an object deeply equal to the original snapshot (round-trip
   serialization property).

### Requirement 3: Subscription System

**User Story:** As a chatbot developer, I want to subscribe to context changes,
so that the AI can receive updated context when the page state changes.

#### Acceptance Criteria

1. WHEN `subscribe` is called with a SnapshotSubscriber callback, THE
   AIContextRegistry SHALL register the callback and return an unsubscribe
   function.
2. WHEN a ComponentContext is registered, updated, or removed, THE
   AIContextRegistry SHALL notify all registered SnapshotSubscriber callbacks
   with the latest AISnapshot.
3. WHEN a GlobalContext entry is set or removed, THE AIContextRegistry SHALL
   notify all registered SnapshotSubscriber callbacks with the latest
   AISnapshot.
4. WHEN the returned unsubscribe function is called, THE AIContextRegistry SHALL
   remove the corresponding SnapshotSubscriber so that the callback is no longer
   invoked on changes.
5. IF the unsubscribe function is called more than once, THEN THE
   AIContextRegistry SHALL handle the duplicate call without error.

### Requirement 4: Debounced Notifications

**User Story:** As a performance-conscious developer, I want rapid context
updates to be debounced, so that the subscription system does not fire
excessively during bulk component mounts or frequent data changes.

#### Acceptance Criteria

1. THE AIContextRegistry SHALL accept a configurable DebounceWindow (in
   milliseconds) via the AIContextModule configuration.
2. WHEN multiple context changes occur within a single DebounceWindow, THE
   AIContextRegistry SHALL batch the changes and notify subscribers only once
   after the window elapses.
3. WHEN a single context change occurs and no further changes happen within the
   DebounceWindow, THE AIContextRegistry SHALL notify subscribers once after the
   window elapses.
4. WHILE the DebounceWindow is set to 0, THE AIContextRegistry SHALL notify
   subscribers synchronously on every change without debouncing.
5. THE AIContextRegistry SHALL use the latest snapshot at the time of
   notification, not the snapshot from when the first change in the batch
   occurred.

### Requirement 5: useAIComponent Hook

**User Story:** As a React developer, I want a hook that automatically registers
my component's semantic context with the AI registry, so that I do not need to
manage registration lifecycle manually.

#### Acceptance Criteria

1. WHEN a component using `useAIComponent` mounts, THE Hook SHALL call
   `registerComponent` on the AIContextRegistry with the provided component ID,
   label, data payload, and optional insight.
2. WHEN the data payload or insight passed to `useAIComponent` changes, THE Hook
   SHALL call `registerComponent` again with the updated values.
3. WHEN a component using `useAIComponent` unmounts, THE Hook SHALL call
   `unregisterComponent` on the AIContextRegistry with the component ID.
4. THE `useAIComponent` Hook SHALL resolve the AIContextRegistry instance using
   `useInject` from `@stackra/ts-container-react`.
5. IF `useAIComponent` is called with a data payload containing functions or
   non-serializable values, THEN THE Hook SHALL exclude those values from the
   registered data (THE Hook SHALL only register JSON-serializable data).
6. THE `useAIComponent` Hook SHALL accept a `disabled` option that, WHEN set to
   true, prevents registration and unregisters any existing entry for that
   component ID.

### Requirement 6: useAIGlobal Hook

**User Story:** As a React developer, I want a hook that pushes global context
(user, theme, route) into the AI registry, so that the AI always has access to
the current application-wide state.

#### Acceptance Criteria

1. WHEN a component using `useAIGlobal` mounts, THE Hook SHALL call `setGlobal`
   on the AIContextRegistry with the provided key and value.
2. WHEN the value passed to `useAIGlobal` changes, THE Hook SHALL call
   `setGlobal` again with the updated value.
3. WHEN a component using `useAIGlobal` unmounts, THE Hook SHALL call
   `removeGlobal` on the AIContextRegistry with the key.
4. THE `useAIGlobal` Hook SHALL resolve the AIContextRegistry instance using
   `useInject` from `@stackra/ts-container-react`.
5. IF multiple components call `useAIGlobal` with the same key, THEN THE
   AIContextRegistry SHALL hold the value from the most recent `setGlobal` call
   (last-write-wins).

### Requirement 7: AIContextFacade

**User Story:** As a chatbot API developer, I want static-style access to the AI
context registry from outside React components, so that the chatbot service
layer can retrieve snapshots without needing React hooks.

#### Acceptance Criteria

1. THE AIContextFacade SHALL be a typed constant created via
   `Facade.make<AIContextRegistry>(AI_CONTEXT_REGISTRY)` following the monorepo
   facade pattern.
2. WHEN `AIContextFacade.snapshot()` is called after bootstrap, THE Facade SHALL
   return the same AISnapshot as calling `snapshot()` on the injected
   AIContextRegistry instance.
3. WHEN `AIContextFacade.subscribe(callback)` is called, THE Facade SHALL
   forward the subscription to the AIContextRegistry instance.
4. THE AIContextFacade SHALL be exported from the package's public API barrel
   (`src/index.ts`).

### Requirement 8: AIContextModule

**User Story:** As a monorepo developer, I want a standard DI module for the AI
context package with both forRoot() and forFeature() support, so that I can
integrate it into the application module tree and feature modules can
declaratively pre-register their component contexts.

#### Acceptance Criteria

1. THE AIContextModule SHALL expose a static `forRoot` method that accepts an
   optional configuration object with a `debounce` field (number, default
   150ms), an optional `maxPayloadSize` field, and an optional `interceptors`
   array.
2. WHEN `forRoot` is called, THE AIContextModule SHALL return a DynamicModule
   with `global: true` that registers the AIContextRegistry as a singleton
   provider.
3. THE AIContextModule SHALL register the AIContextRegistry under both the class
   token (`AIContextRegistry`) and a Symbol token (`AI_CONTEXT_REGISTRY`).
4. THE AIContextModule SHALL register the configuration object under a Symbol
   token (`AI_CONTEXT_CONFIG`).
5. THE AIContextModule SHALL export `AIContextRegistry`, `AI_CONTEXT_REGISTRY`,
   and `AI_CONTEXT_CONFIG` so that they are available to all modules in the
   application.
6. THE AIContextModule SHALL expose a static `forFeature` method that accepts an
   `AIContextFeatureConfig` object with optional `components` and `globals`
   fields.
7. WHEN `forFeature` is called with a `components` array, THE AIContextModule
   SHALL pre-register each component entry in the global AIContextRegistry
   singleton using the provided `id`, `label`, and `defaultData`.
8. WHEN `forFeature` is called with a `globals` object, THE AIContextModule
   SHALL call `setGlobal` on the global AIContextRegistry singleton for each
   key-value pair.
9. THE `forFeature` method SHALL return a DynamicModule with empty providers and
   exports, consistent with the monorepo forFeature pattern.

### Requirement 9: Semantic Event Integration

**User Story:** As a developer, I want to emit semantic AI events through the
existing event system, so that the AI chatbot has temporal context about user
actions in addition to the current page state.

#### Acceptance Criteria

1. THE package SHALL export a `dispatchAIEvent` utility function that emits
   events through the existing `EventFacade` from `@stackra/ts-events`.
2. WHEN `dispatchAIEvent` is called with an event name and payload, THE Utility
   SHALL emit the event with the name prefixed by `ai:` (e.g.,
   `dispatchAIEvent('customer_selected', data)` emits `ai:customer_selected`).
3. THE `dispatchAIEvent` payload SHALL be JSON-serializable.
4. THE package SHALL export a `useAIEvent` hook that provides a bound `dispatch`
   function for emitting semantic AI events from within React components.
5. WHEN `useAIEvent` is called, THE Hook SHALL return a `dispatch` function that
   calls `dispatchAIEvent` with the provided event name and payload.

### Requirement 10: Payload Size Safety

**User Story:** As a performance-conscious developer, I want safeguards against
oversized AI context payloads, so that the chatbot API calls remain fast and
within token limits.

#### Acceptance Criteria

1. THE AIContextRegistry SHALL accept an optional `maxPayloadSize` configuration
   (in bytes) via the AIContextModule configuration.
2. WHEN `snapshot` is called and the serialized AISnapshot exceeds the
   configured `maxPayloadSize`, THE AIContextRegistry SHALL truncate component
   contexts by removing entries in least-recently-updated order until the
   payload fits within the limit.
3. WHEN truncation occurs, THE AISnapshot SHALL include a `_truncated` boolean
   field set to `true` and a `_truncatedCount` number field indicating how many
   component contexts were removed.
4. WHILE `maxPayloadSize` is not configured (undefined), THE AIContextRegistry
   SHALL return the full snapshot without truncation.

### Requirement 11: Snapshot Serialization

**User Story:** As a developer, I want to serialize and deserialize AI
snapshots, so that snapshots can be persisted, logged, and transmitted reliably.

#### Acceptance Criteria

1. THE package SHALL export a `serializeSnapshot` function that accepts an
   AISnapshot and returns a valid JSON string.
2. THE package SHALL export a `deserializeSnapshot` function that accepts a JSON
   string and returns an AISnapshot object.
3. FOR ALL valid AISnapshot objects,
   `deserializeSnapshot(serializeSnapshot(snapshot))` SHALL produce an
   AISnapshot deeply equal to the original (round-trip property).
4. IF `deserializeSnapshot` is called with invalid JSON, THEN THE Function SHALL
   throw a descriptive error.
5. IF `deserializeSnapshot` is called with valid JSON that does not conform to
   the AISnapshot structure, THEN THE Function SHALL throw a descriptive
   validation error.

### Requirement 12: Registry Reset and Testability

**User Story:** As a test author, I want to reset the AI context registry
between tests and swap it via the facade, so that tests are isolated and
deterministic.

#### Acceptance Criteria

1. THE AIContextRegistry SHALL override the inherited `clear()` method to remove
   all ComponentContext entries (via `super.clear()`), all GlobalContext
   entries, and all SnapshotSubscriber callbacks.
2. WHEN `clear` is called, THE AIContextRegistry SHALL notify any remaining
   subscribers with an empty snapshot before removing the subscribers.
3. THE AIContextFacade SHALL support
   `Facade.swap(AI_CONTEXT_REGISTRY, mockInstance)` for replacing the registry
   in tests.
4. WHEN `Facade.clearResolvedInstances()` is called, THE AIContextFacade SHALL
   resolve a fresh AIContextRegistry instance on next access.

### Requirement 13: Package Structure

**User Story:** As a monorepo maintainer, I want the AI context package to
follow all monorepo conventions, so that it integrates seamlessly with the
existing toolchain and CI/CD pipeline.

#### Acceptance Criteria

1. THE package SHALL be located at `packages/ai-context/` and named
   `@stackra/react-ai-context` in package.json.
2. THE package SHALL list `@stackra/ts-container`, `@stackra/ts-support`,
   `@stackra/ts-events`, and `react` as peer dependencies.
3. THE package SHALL list `@stackra/ts-container-react` as a peer dependency for
   the React hook bindings.
4. THE package SHALL use tsup for building with the standard `basePreset` from
   `@nesvel/tsup-config`.
5. THE package SHALL use vitest for testing.
6. THE package SHALL follow the standard folder structure: `src/services/`,
   `src/hooks/`, `src/facades/`, `src/interfaces/`, `src/constants/`,
   `src/types/`, `src/utils/`, and a root module file.
7. THE package SHALL export all public symbols from `src/index.ts` with section
   headers following the barrel export convention.
8. THE package SHALL contain zero DOM dependencies (THE package SHALL work in
   Node.js test environments without jsdom for non-hook code).

### Requirement 14: Documentation Standards

**User Story:** As a monorepo contributor, I want all AI Context Engine code to
follow the docblocks-and-comments.md standard, so that every file and exported
symbol is fully self-documenting and consistent with the rest of the codebase.

#### Acceptance Criteria

1. EVERY source file SHALL begin with a file-level `@module` JSDoc docblock
   describing the file's contents and role in the architecture.
2. EVERY exported class, interface, type alias, function, hook, constant, and
   enum SHALL have a full multi-line JSDoc docblock with a summary, description
   (when non-obvious), and relevant tags.
3. EVERY public method SHALL include `@param`, `@returns`, `@throws` (when
   applicable), and `@example` tags in its JSDoc docblock.
4. EVERY interface property SHALL be documented individually with `@default` and
   `@example` tags where applicable.
5. ALL DI tokens (Symbol-based constants) SHALL have full docblocks including
   injection examples.
6. ALL barrel export files (`index.ts`) SHALL have a module-level docblock
   listing what is exported and why.
7. THE root `src/index.ts` SHALL use section separators (`// ── Section ──`) for
   grouping related exports.
8. ALL classes with multiple method groups SHALL use section separators
   (`// ── Section ──`) for grouping related methods.
9. ALL inline comments SHALL explain _why_, not _what_, and SHALL document edge
   cases, workarounds, and non-obvious logic.

### Requirement 15: Context Interceptors (Middleware)

**User Story:** As a developer, I want to transform or enrich context data
before it enters the registry, so that I can auto-attach timestamps, route info,
user IDs, or transform data without modifying individual component hooks.

#### Acceptance Criteria

1. THE package SHALL export an `AIContextInterceptor` interface with a
   `beforeRegister(id, label, data, insight)` method that returns a transformed
   `{ id, label, data, insight }` object.
2. THE AIContextRegistry SHALL accept an array of AIContextInterceptor instances
   via the AIContextConfig (registered through `forRoot()`).
3. WHEN `registerComponent` is called, THE AIContextRegistry SHALL execute all
   registered interceptors in order, passing the output of each interceptor as
   input to the next.
4. THE final output of the interceptor chain SHALL be the values stored in the
   registry.
5. IF no interceptors are registered, THEN THE AIContextRegistry SHALL store the
   original values unchanged.
6. IF an interceptor throws an error, THEN THE AIContextRegistry SHALL skip that
   interceptor and continue with the remaining interceptors, logging a warning.

### Requirement 16: Context Selectors

**User Story:** As a developer, I want to read a specific component's context
from the registry and subscribe to its changes, so that I can build
cross-component AI features where one component reacts to another's context.

#### Acceptance Criteria

1. THE AIContextRegistry SHALL expose a `select(componentId)` method that
   returns the ComponentContextEntry for the given ID, or `undefined` if not
   registered.
2. THE package SHALL export a `useAIComponentSnapshot(id)` hook that returns the
   current ComponentContextEntry for the given component ID.
3. WHEN the selected component's context changes, THE `useAIComponentSnapshot`
   hook SHALL re-render the consuming component with the updated entry.
4. WHEN the selected component is unregistered, THE `useAIComponentSnapshot`
   hook SHALL return `undefined`.
5. THE `select` method SHALL leverage the inherited `get(key)` method from
   BaseRegistry.

### Requirement 17: Snapshot Diffing

**User Story:** As a chatbot API developer, I want to compute the difference
between two snapshots, so that I can send incremental updates to the AI API and
reduce token usage.

#### Acceptance Criteria

1. THE package SHALL export a `diffSnapshots(previous, current)` utility
   function that accepts two AISnapshot objects and returns a SnapshotDiff.
2. THE SnapshotDiff SHALL contain `added` (components and globals present in
   current but not previous), `removed` (present in previous but not current),
   and `modified` (present in both but with different values) sections.
3. FOR ALL identical snapshots, `diffSnapshots(snapshot, snapshot)` SHALL return
   a SnapshotDiff with empty `added`, `removed`, and `modified` sections.
4. FOR ALL snapshot pairs, applying the diff to the previous snapshot SHALL
   produce the current snapshot (the diff is a complete and correct delta).
5. THE `diffSnapshots` function SHALL perform deep equality comparison on
   component data payloads and global values to detect modifications.
