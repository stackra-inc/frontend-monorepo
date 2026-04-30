/**
 * @stackra/ts-container
 *
 * NestJS-style dependency injection for React and client-side applications.
 * Built from scratch — no Inversify, no heavy runtime.
 *
 * This is the main entry point. It exports:
 * - Decorators (@Injectable, @Inject, @Module, @Optional, @Global)
 * - The DI engine (Container, Injector, Scanner, Module, InstanceWrapper)
 * - Application bootstrap (Application)
 * - React bindings (ContainerProvider, useInject, useOptionalInject, useContainer)
 * - Interfaces and types
 * - Utilities (forwardRef)
 *
 * @example
 * ```typescript
 * import 'reflect-metadata';
 * import { Injectable, Inject, Module, Application } from '@stackra/ts-container';
 *
 * @Injectable()
 * class UserService {
 *   constructor(private logger: LoggerService) {}
 * }
 *
 * @Module({
 *   providers: [LoggerService, UserService],
 *   exports: [UserService],
 * })
 * class AppModule {}
 *
 * const app = await Application.create(AppModule);
 * const userService = app.get(UserService);
 * ```
 *
 * @module @stackra/ts-container
 */

import 'reflect-metadata';

// ============================================================================
// Decorators
// ============================================================================
export { Inject } from './decorators/inject.decorator';
export { Module } from './decorators/module.decorator';
export { Global } from './decorators/global.decorator';
export { Optional } from './decorators/optional.decorator';
export { Injectable } from './decorators/injectable.decorator';

// ============================================================================
// Interfaces & Types
// ============================================================================
export type { Type } from './interfaces/type.interface';
export type { Provider } from './interfaces/provider.interface';
export type { IApplication } from './interfaces/application.interface';
export type { ScopeOptions } from './interfaces/scope-options.interface';
export type { OnModuleInit } from './interfaces/on-module-init.interface';
export type { DynamicModule } from './interfaces/dynamic-module.interface';
export type { ClassProvider } from './interfaces/class-provider.interface';
export type { ValueProvider } from './interfaces/value-provider.interface';
export type { ModuleMetadata } from './interfaces/module-metadata.interface';
export type { ModuleMetatype } from './interfaces/module-metatype.interface';
export type { InjectionToken } from './interfaces/injection-token.interface';
export type { FactoryProvider } from './interfaces/factory-provider.interface';
export type { OnModuleDestroy } from './interfaces/on-module-destroy.interface';
export type { ExistingProvider } from './interfaces/existing-provider.interface';
export type { ForwardReference } from './interfaces/forward-reference.interface';
export type { ContainerResolver } from './interfaces/container-resolver.interface';
export type { ApplicationOptions } from './interfaces/application-options.interface';
export type { OnApplicationShutdown } from './interfaces/on-application-shutdown.interface';
export type { OnApplicationBootstrap } from './interfaces/on-application-bootstrap.interface';
export type { ContainerProviderProps } from './interfaces/container-provider-props.interface';
export type { BeforeApplicationShutdown } from './interfaces/before-application-shutdown.interface';

// ============================================================================
// Enums
// ============================================================================
export { Scope } from './enums/scope.enum';

// ============================================================================
// Utilities
// ============================================================================
export { forwardRef } from './utils/forward-ref.util';
export { defineConfig } from './utils/define-config.util';
export { hasOnModuleInit } from './interfaces/on-module-init.interface';
export { hasOnModuleDestroy } from './interfaces/on-module-destroy.interface';

// ============================================================================
// Application Bootstrap
// ============================================================================
export {
  getGlobalApplication,
  hasGlobalApplication,
  clearGlobalApplication,
} from './application/global.application';
export { Application } from './application/application';

// ============================================================================
// DI Engine (Container, Injector, Scanner, Module, etc.)
// ============================================================================
export { Injector } from './injector/injector';
export { ModuleContainer } from './injector/container';
export { Module as ModuleRef } from './injector/module';
export { DependenciesScanner } from './injector/scanner';
export { InstanceLoader } from './injector/instance-loader';
export { InstanceWrapper } from './injector/instance-wrapper';
export { RegistryScanner } from './injector/registry-scanner';

// ============================================================================
// React Bindings
// ============================================================================
export { useInject } from './hooks/use-inject';
export { useContainer } from './hooks/use-container';
export { ContainerContext } from './contexts/container.context';
export { useOptionalInject } from './hooks/use-optional-inject';
export { ContainerProvider } from './providers/container.provider';

// ============================================================================
// Constants (for library authors building on top of this)
// ============================================================================
export {
  MODULE_METADATA,
  PARAMTYPES_METADATA,
  INJECTABLE_WATERMARK,
  GLOBAL_MODULE_METADATA,
  SCOPE_OPTIONS_METADATA,
  OPTIONAL_DEPS_METADATA,
  PROPERTY_DEPS_METADATA,
  SELF_DECLARED_DEPS_METADATA,
  OPTIONAL_PROPERTY_DEPS_METADATA,
} from './constants/tokens.constant';
// test
