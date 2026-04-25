/**
 * @file index.ts
 * @description Barrel export for all rxdb-eloquent decorators.
 *
 * Re-exports every class, property, relation, and method decorator so consumers
 * can import them from a single entry point:
 *
 * ```ts
 * import { Collection, Column, HasMany, BeforeCreate } from 'rxdb-eloquent/decorators';
 * ```
 */

// ---------------------------------------------------------------------------
// Class Decorators
// ---------------------------------------------------------------------------
export { Collection } from './collection.decorator';
export { Connection } from './connection.decorator';
export { Timestamps } from './timestamps.decorator';
export { SoftDeletes } from './soft-deletes.decorator';
export { ObservedBy } from './observed-by.decorator';

// ---------------------------------------------------------------------------
// Property Decorators
// ---------------------------------------------------------------------------
export { Column } from './column.decorator';
export { PrimaryKey } from './primary-key.decorator';
export { Fillable } from './fillable.decorator';
export { Guarded } from './guarded.decorator';
export { Hidden } from './hidden.decorator';
export { Visible } from './visible.decorator';
export { Cast } from './cast.decorator';
export { Index } from './index.decorator';
export { Final } from './final.decorator';
export { Default } from './default.decorator';
export { Ref } from './ref.decorator';

// ---------------------------------------------------------------------------
// Relation Decorators
// ---------------------------------------------------------------------------
export { HasOne } from './has-one.decorator';
export { HasMany } from './has-many.decorator';
export { BelongsTo } from './belongs-to.decorator';
export { BelongsToMany } from './belongs-to-many.decorator';

// ---------------------------------------------------------------------------
// Method Decorators
// ---------------------------------------------------------------------------
export { Scope } from './scope.decorator';
export { GlobalScope } from './global-scope.decorator';
export { Accessor } from './accessor.decorator';
export { Mutator } from './mutator.decorator';
export { BeforeCreate } from './before-create.decorator';
export { AfterCreate } from './after-create.decorator';
export { BeforeUpdate } from './before-update.decorator';
export { AfterUpdate } from './after-update.decorator';
export { BeforeDelete } from './before-delete.decorator';
export { AfterDelete } from './after-delete.decorator';
