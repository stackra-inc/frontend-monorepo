/**
 * @file model/index.ts
 * @description Barrel export for the model layer. Re-exports the Model base class,
 * ModelStatic type, Observer base class, all concern mixins, and the
 * HasRelationships concern.
 */

export { Model } from './model';
export type { ModelStatic } from './model';
export { Observer } from './observer';

// Concerns
export { HasAttributes } from './concerns/has-attributes.concern';
export type { HasAttributesInterface, CastType } from './concerns/has-attributes.concern';
export { GuardsAttributes } from './concerns/guards-attributes.concern';
export type { GuardsAttributesInterface } from './concerns/guards-attributes.concern';
export { HidesAttributes } from './concerns/hides-attributes.concern';
export type { HidesAttributesInterface } from './concerns/hides-attributes.concern';
export { HasTimestamps } from './concerns/has-timestamps.concern';
export type { HasTimestampsInterface } from './concerns/has-timestamps.concern';
export { SoftDeletes } from './concerns/soft-deletes.concern';
export type { SoftDeletesInterface } from './concerns/soft-deletes.concern';
export { HasGlobalScopes } from './concerns/has-global-scopes.concern';
export type {
  HasGlobalScopesInterface,
  GlobalScopeEntry,
} from './concerns/has-global-scopes.concern';
export { HasEvents } from './concerns/has-events.concern';
export type {
  HasEventsInterface,
  LifecycleEvent,
  HookCallback,
} from './concerns/has-events.concern';
export { HasRelationships } from './concerns/has-relationships.concern';
export type { HasRelationshipsInterface } from './concerns/has-relationships.concern';
