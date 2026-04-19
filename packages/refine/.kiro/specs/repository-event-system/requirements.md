# Requirements Document

## Introduction

This feature adds automatic event dispatching at the repository layer of
`@stackra-inc/react-refine`. Every CRUD operation (create, read, update, delete,
and their bulk variants) will dispatch before, after, and error events through
the existing `@stackra-inc/ts-events` EventManager. The system uses the
decorator pattern — an `EventDispatchingRepository` wraps any `BaseRepository`
and transparently intercepts calls to dispatch events without modifying existing
repository classes. React hooks are provided for subscribing to resource events.
The `UndoableQueueProvider` is wired to listen to `beforeDelete` events so
undoable deletions are event-driven.

## Glossary

- **EventManager**: The event bus from `@stackra-inc/ts-events` used to dispatch
  and subscribe to named events.
- **BaseRepository**: The abstract class in `@stackra-inc/react-refine` defining
  the CRUD contract (`getOne`, `getList`, `getMany`, `create`, `update`,
  `deleteOne`, `deleteMany`, `createMany`, `updateMany`, `custom`).
- **EventDispatchingRepository**: A concrete decorator class that wraps a
  `BaseRepository`, dispatching events before and after each CRUD operation.
- **ResourceEvent**: An enum defining all resource event name templates (e.g.,
  `BeforeCreate`, `Created`, `Error`).
- **Event_Name**: A fully qualified event string following the
  `{resource}.{operation}` pattern (e.g., `posts.created`,
  `orders.beforeDelete`).
- **RefineModule**: The DI module class providing `forRoot()` and `forFeature()`
  static methods for configuring the data layer.
- **UndoableQueueProvider**: A React context provider managing the queue of
  undoable mutations with countdown timers.

## Requirements

### Requirement 1: ResourceEvent Enum

**User Story:** As a developer, I want a well-defined enum of all resource event
types, so that I can reference event names in a type-safe manner without using
magic strings.

#### Acceptance Criteria

1. THE ResourceEvent enum SHALL define the following before-operation members:
   `BeforeCreate`, `BeforeUpdate`, `BeforeDelete`, `BeforeDeleteMany`,
   `BeforeCreateMany`, `BeforeUpdateMany`.
2. THE ResourceEvent enum SHALL define the following after-operation members:
   `Created`, `Updated`, `Deleted`, `DeletedMany`, `CreatedMany`, `UpdatedMany`,
   `Fetched`, `Listed`, `FetchedMany`.
3. THE ResourceEvent enum SHALL define an `Error` member for operation failure
   events.
4. WHEN `buildEventName` is called with a resource string and a ResourceEvent
   member, THE `buildEventName` function SHALL return a string in the format
   `{resource}.{eventValue}` (e.g.,
   `buildEventName('posts', ResourceEvent.Created)` returns `'posts.created'`).
5. WHEN `buildEventName` is called with an empty resource string, THE
   `buildEventName` function SHALL throw an error indicating the resource name
   is required.

### Requirement 2: EventDispatchingRepository Decorator

**User Story:** As a developer, I want repository operations to automatically
dispatch events, so that cross-cutting concerns can react to data changes
without coupling to specific repository implementations.

#### Acceptance Criteria

1. THE EventDispatchingRepository SHALL accept a wrapped `BaseRepository`
   instance, a resource name string, and an EventManager instance in its
   constructor.
2. WHEN a create operation is invoked, THE EventDispatchingRepository SHALL
   dispatch a `{resource}.beforeCreate` event with payload `{ data }` before
   delegating to the wrapped repository.
3. WHEN a create operation succeeds, THE EventDispatchingRepository SHALL
   dispatch a `{resource}.created` event with payload `{ data: result }`
   containing the created record.
4. WHEN an update operation is invoked, THE EventDispatchingRepository SHALL
   dispatch a `{resource}.beforeUpdate` event with payload `{ id, data }` before
   delegating to the wrapped repository.
5. WHEN an update operation succeeds, THE EventDispatchingRepository SHALL
   dispatch a `{resource}.updated` event with payload `{ id, data: result }`
   containing the updated record.
6. WHEN a deleteOne operation is invoked, THE EventDispatchingRepository SHALL
   dispatch a `{resource}.beforeDelete` event with payload `{ id }` before
   delegating to the wrapped repository.
7. WHEN a deleteOne operation succeeds, THE EventDispatchingRepository SHALL
   dispatch a `{resource}.deleted` event with payload `{ id }`.
8. WHEN a deleteMany operation is invoked, THE EventDispatchingRepository SHALL
   dispatch a `{resource}.beforeDeleteMany` event with payload `{ ids }` before
   delegating to the wrapped repository.
9. WHEN a deleteMany operation succeeds, THE EventDispatchingRepository SHALL
   dispatch a `{resource}.deletedMany` event with payload `{ ids }`.
10. WHEN a createMany operation is invoked, THE EventDispatchingRepository SHALL
    dispatch a `{resource}.beforeCreateMany` event with payload `{ data }`
    before delegating to the wrapped repository.
11. WHEN a createMany operation succeeds, THE EventDispatchingRepository SHALL
    dispatch a `{resource}.createdMany` event with payload `{ data: result }`
    containing the created records.
12. WHEN an updateMany operation is invoked, THE EventDispatchingRepository
    SHALL dispatch a `{resource}.beforeUpdateMany` event with payload
    `{ ids, data }` before delegating to the wrapped repository.
13. WHEN an updateMany operation succeeds, THE EventDispatchingRepository SHALL
    dispatch a `{resource}.updatedMany` event with payload
    `{ ids, data: result }` containing the updated records.
14. WHEN a getOne operation succeeds, THE EventDispatchingRepository SHALL
    dispatch a `{resource}.fetched` event with payload `{ id, data: result }`.
15. WHEN a getList operation succeeds, THE EventDispatchingRepository SHALL
    dispatch a `{resource}.listed` event with payload
    `{ data: result.data, total: result.total, params }`.
16. WHEN a getMany operation succeeds, THE EventDispatchingRepository SHALL
    dispatch a `{resource}.fetchedMany` event with payload
    `{ ids, data: result }`.
17. IF any repository operation throws an error, THEN THE
    EventDispatchingRepository SHALL dispatch a `{resource}.error` event with
    payload `{ operation, error, params }` where `operation` is the method name
    and `params` are the original arguments.
18. IF any repository operation throws an error, THEN THE
    EventDispatchingRepository SHALL re-throw the original error after
    dispatching the error event.
19. THE EventDispatchingRepository SHALL delegate all method calls to the
    wrapped repository without modifying arguments or return values (apart from
    event dispatching).

### Requirement 3: RefineModule.forFeature() Integration

**User Story:** As a developer, I want event dispatching to be automatically
enabled when I register resources, so that I do not need to manually wrap
repositories.

#### Acceptance Criteria

1. WHEN `RefineModule.forFeature()` is called and an EventManager instance is
   available, THE RefineModule SHALL wrap each created repository with an
   EventDispatchingRepository.
2. WHEN `RefineModule.forFeature()` is called and no EventManager instance is
   available, THE RefineModule SHALL use the unwrapped repository directly
   without dispatching events.
3. THE RefineModule SHALL pass the resource name from `@Resource` metadata as
   the resource name argument to EventDispatchingRepository.
4. THE RefineModule SHALL accept an optional EventManager instance via
   `forRoot()` options and store it for use in `forFeature()`.

### Requirement 4: useResourceEvent Hook

**User Story:** As a React developer, I want to subscribe to a single resource
event type in my components, so that I can react to specific data changes
declaratively.

#### Acceptance Criteria

1. WHEN `useResourceEvent` is called with a resource name, a ResourceEvent
   member, and a callback, THE useResourceEvent hook SHALL subscribe to the
   corresponding event on the EventManager.
2. WHEN the subscribed event is dispatched, THE useResourceEvent hook SHALL
   invoke the callback with the event payload.
3. WHEN the component using `useResourceEvent` unmounts, THE useResourceEvent
   hook SHALL unsubscribe from the event to prevent memory leaks.
4. WHEN the resource name, event type, or callback reference changes, THE
   useResourceEvent hook SHALL unsubscribe from the previous event and subscribe
   to the new one.
5. IF no EventManager is available in the application context, THEN THE
   useResourceEvent hook SHALL operate as a no-op without throwing errors.

### Requirement 5: useResourceEvents Hook

**User Story:** As a React developer, I want to subscribe to multiple resource
event types with a single hook call, so that I can handle related events
together without multiple hook invocations.

#### Acceptance Criteria

1. WHEN `useResourceEvents` is called with a resource name, an array of
   ResourceEvent members, and a callback, THE useResourceEvents hook SHALL
   subscribe to each corresponding event on the EventManager.
2. WHEN any of the subscribed events is dispatched, THE useResourceEvents hook
   SHALL invoke the callback with the event type and the event payload.
3. WHEN the component using `useResourceEvents` unmounts, THE useResourceEvents
   hook SHALL unsubscribe from all subscribed events to prevent memory leaks.
4. WHEN the resource name, event array, or callback reference changes, THE
   useResourceEvents hook SHALL unsubscribe from all previous events and
   subscribe to the new set.
5. IF no EventManager is available in the application context, THEN THE
   useResourceEvents hook SHALL operate as a no-op without throwing errors.

### Requirement 6: Barrel Exports

**User Story:** As a developer, I want all new event system types, classes, and
hooks exported from the package barrel, so that I can import them from
`@stackra-inc/react-refine` directly.

#### Acceptance Criteria

1. THE package barrel (`src/index.ts`) SHALL export the ResourceEvent enum.
2. THE package barrel SHALL export the `buildEventName` function.
3. THE package barrel SHALL export the EventDispatchingRepository class.
4. THE package barrel SHALL export the `useResourceEvent` hook.
5. THE package barrel SHALL export the `useResourceEvents` hook.

### Requirement 7: UndoableQueue Event Integration

**User Story:** As a developer, I want the UndoableQueueProvider to listen to
`beforeDelete` events from the event system, so that undoable deletions are
driven by events rather than being hardcoded in mutation hooks.

#### Acceptance Criteria

1. WHEN a `{resource}.beforeDelete` event is dispatched and the
   UndoableQueueProvider is mounted, THE UndoableQueueProvider SHALL enqueue the
   deletion as an undoable mutation with a countdown timer.
2. WHEN the undoable countdown reaches zero, THE UndoableQueueProvider SHALL
   execute the deferred delete mutation.
3. WHEN the user cancels the undoable mutation before the countdown expires, THE
   UndoableQueueProvider SHALL remove the entry from the queue without executing
   the deletion.
4. IF no EventManager is available, THEN THE UndoableQueueProvider SHALL
   continue to function using its existing direct-dispatch mechanism without
   errors.
