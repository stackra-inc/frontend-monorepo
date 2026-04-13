/**
 * @file index.ts
 * @description Barrel export for the query layer. Re-exports all public
 * classes, interfaces, and types from the query module: QueryBuilder,
 * QueryBuilderState, WhereClause, OrderByClause, and all Grammar
 * implementations.
 */

export { QueryBuilder } from './query.builder';
export type { QueryBuilderState, WhereClause, WhereOperator, OrderByClause } from './query.builder';
export { QueryGrammar } from './grammars/query.grammar';
export { MangoQueryGrammar } from './grammars/mango-query.grammar';
export type { MangoQuery } from './grammars/mango-query.grammar';
export { SqlQueryGrammar } from './grammars/sql-query.grammar';
