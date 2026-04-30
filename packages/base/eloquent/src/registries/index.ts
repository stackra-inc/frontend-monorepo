/**
 * @file registries/index.ts
 * @description Barrel export for all registries.
 */

export { ModelRegistry } from './model.registry';
export type { ModelClass } from './model.registry';
export { MigrationRegistry } from './migration.registry';
export { SeederRegistry } from './seeder.registry';
export { ObserverRegistry } from './observer.registry';
