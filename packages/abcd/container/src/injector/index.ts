/**
 * Injector Barrel Export
 *
 * The core DI engine — module graph management, dependency resolution,
 * instance creation, and lifecycle orchestration.
 *
 * - {@link ModuleContainer} — Top-level container holding all modules and their bindings
 * - {@link Module} — Runtime representation of a `@Module()` class with its providers
 * - {@link Injector} — Resolves dependencies and creates provider instances
 * - {@link InstanceWrapper} — Wraps a provider binding with metadata and cached instance
 * - {@link InstanceLoader} — Orchestrates provider instantiation and lifecycle hooks
 * - {@link DependenciesScanner} — Recursively scans the module tree and populates the container (runtime reflection)
 * - {@link RegistryScanner} — Scans the module tree using pre-compiled registries (compile-time, zero overhead)
 *
 * @module injector
 */

export { ModuleContainer } from './container';
export { Module } from './module';
export { Injector } from './injector';
export { InstanceWrapper } from './instance-wrapper';
export { InstanceLoader } from './instance-loader';
export { DependenciesScanner } from './scanner';
export { RegistryScanner } from './registry-scanner';
