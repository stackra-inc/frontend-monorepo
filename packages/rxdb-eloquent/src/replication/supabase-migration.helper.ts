/**
 * @file supabase-migration.helper.ts
 * @description Generates Supabase-compatible SQL DDL from RxDB collection schemas.
 *
 * When using Supabase replication, you need matching tables in Supabase.
 * RxDB replication does NOT create tables — it only syncs data between
 * an existing local collection and an existing Supabase table.
 *
 * This helper reads your model schemas (via SchemaResolver) and generates
 * the SQL you need to run in the Supabase SQL Editor or via migrations.
 *
 * Each generated table includes:
 * - All columns from the RxDB schema mapped to PostgreSQL types
 * - `_modified` timestamp column (auto-updated via moddatetime trigger)
 * - `_deleted` boolean column (for replication soft-delete tracking)
 * - Realtime publication for live sync
 *
 * @example
 * ```ts
 * import { generateSupabaseMigration } from '@abdokouta/ts-eloquent';
 *
 * const sql = generateSupabaseMigration([User, Post, Profile]);
 * console.log(sql);
 * // Copy and paste into Supabase SQL Editor
 * ```
 */

import type { RxJsonSchema } from 'rxdb';

// ---------------------------------------------------------------------------
// Type mapping: RxJsonSchema → PostgreSQL
// ---------------------------------------------------------------------------

/**
 * Map an RxJsonSchema property type to a PostgreSQL column type.
 *
 * @param prop - The JSON Schema property descriptor
 * @returns The PostgreSQL type string
 */
function mapPropertyToPostgresType(prop: Record<string, any>): string {
  const type = typeof prop.type === 'string' ? prop.type : 'string';

  switch (type) {
    case 'string':
      if (prop.format === 'date-time') return 'TIMESTAMPTZ';
      if (prop.maxLength) return `VARCHAR(${prop.maxLength})`;
      return 'TEXT';
    case 'integer':
      return 'INTEGER';
    case 'number':
      return 'DOUBLE PRECISION';
    case 'boolean':
      return 'BOOLEAN';
    case 'array':
      return 'JSONB';
    case 'object':
      return 'JSONB';
    default:
      return 'TEXT';
  }
}

// ---------------------------------------------------------------------------
// SQL generation
// ---------------------------------------------------------------------------

/**
 * Generate a Supabase-compatible CREATE TABLE statement from an RxJsonSchema.
 *
 * Includes:
 * - All schema properties as columns
 * - `_deleted` boolean (default false) for replication soft-delete tracking
 * - `_modified` timestamptz (default now()) for replication checkpointing
 * - moddatetime trigger to auto-update `_modified`
 * - Realtime publication for live sync
 *
 * @param tableName - The Supabase table name (should match the RxDB collection name)
 * @param schema    - The RxJsonSchema for the collection
 * @returns A SQL string ready to run in Supabase SQL Editor
 */
export function generateTableSQL(tableName: string, schema: RxJsonSchema<any>): string {
  const primaryKey = typeof schema.primaryKey === 'string'
    ? schema.primaryKey
    : (schema.primaryKey as any)?.key ?? 'id';

  const requiredSet = new Set<string>(schema.required ?? []);
  const lines: string[] = [];

  // Column definitions
  for (const [name, prop] of Object.entries(schema.properties ?? {})) {
    const pgType = mapPropertyToPostgresType(prop as Record<string, any>);
    const isPK = name === primaryKey;
    const isRequired = requiredSet.has(name) || isPK;

    let line = `    "${name}" ${pgType}`;
    if (isPK) line += ' PRIMARY KEY';
    else if (isRequired) line += ' NOT NULL';

    lines.push(line);
  }

  // Add replication columns
  lines.push('    "_deleted" BOOLEAN DEFAULT false NOT NULL');
  lines.push('    "_modified" TIMESTAMPTZ DEFAULT now() NOT NULL');

  const sql = [
    `-- Enable moddatetime extension (run once per database)`,
    `CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;`,
    ``,
    `-- Create table: ${tableName}`,
    `CREATE TABLE IF NOT EXISTS "public"."${tableName}" (`,
    lines.join(',\n'),
    `);`,
    ``,
    `-- Auto-update _modified on every UPDATE`,
    `CREATE OR REPLACE TRIGGER update_${tableName}_modified`,
    `    BEFORE UPDATE ON "public"."${tableName}"`,
    `    FOR EACH ROW`,
    `    EXECUTE FUNCTION extensions.moddatetime('_modified');`,
    ``,
    `-- Enable realtime for live sync`,
    `ALTER PUBLICATION supabase_realtime ADD TABLE "public"."${tableName}";`,
  ];

  return sql.join('\n');
}

/**
 * Generate Supabase SQL migrations for multiple schemas at once.
 *
 * @param schemas - Array of `{ tableName, schema }` pairs
 * @returns A single SQL string with all CREATE TABLE statements
 *
 * @example
 * ```ts
 * const resolver = new SchemaResolver();
 * const sql = generateSupabaseMigrationSQL([
 *   { tableName: 'users', schema: resolver.resolve(User) },
 *   { tableName: 'posts', schema: resolver.resolve(Post) },
 * ]);
 * console.log(sql);
 * ```
 */
export function generateSupabaseMigrationSQL(
  schemas: Array<{ tableName: string; schema: RxJsonSchema<any> }>
): string {
  const header = [
    `-- ============================================================`,
    `-- Supabase Migration — Generated by @abdokouta/ts-eloquent`,
    `-- ============================================================`,
    `-- Run this SQL in the Supabase SQL Editor to create tables`,
    `-- that match your RxDB collections for replication.`,
    `--`,
    `-- Each table includes:`,
    `--   _deleted  (boolean)    — replication soft-delete flag`,
    `--   _modified (timestamptz) — auto-updated modification timestamp`,
    `--   moddatetime trigger    — keeps _modified current`,
    `--   realtime publication   — enables live sync`,
    `-- ============================================================`,
    ``,
  ];

  const tables = schemas.map(({ tableName, schema }) => generateTableSQL(tableName, schema));

  return [...header, ...tables].join('\n\n');
}
