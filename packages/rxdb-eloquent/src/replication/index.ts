/**
 * @file replication/index.ts
 * @description Barrel export for the replication layer.
 */

export {
  generateTableSQL,
  generateSupabaseMigrationSQL,
} from './supabase-migration.helper';
