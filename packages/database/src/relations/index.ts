/**
 * @file relations/index.ts
 * @description Barrel export for the relations layer. Re-exports the abstract
 * Relation base class and all concrete relation implementations.
 */

export { Relation } from './relation';
export { HasOneRelation } from './has-one.relation';
export { HasManyRelation } from './has-many.relation';
export { BelongsToRelation } from './belongs-to.relation';
export { BelongsToManyRelation } from './belongs-to-many.relation';
