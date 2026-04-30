/**
 * @file index.ts
 * @description Barrel export for the schema layer. Re-exports all public
 * classes from the schema module: ColumnDefinition, Blueprint, SchemaBuilder,
 * SchemaResolver, and all Grammar implementations.
 */

export { ColumnDefinition } from './column.definition';
export type { ColumnType } from './column.definition';
export { Blueprint } from './blueprint';
export { SchemaBuilder } from './schema.builder';
export { SchemaResolver } from './schema.resolver';
export { SchemaGrammar } from './grammars/schema.grammar';
export { RxDBSchemaGrammar } from './grammars/rxdb-schema.grammar';
export { SupabaseSchemaGrammar } from './grammars/supabase-schema.grammar';
