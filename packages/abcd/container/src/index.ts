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
export { Injectable } from './decorators/injectable.decorator';
export { Inject } from './decorators/inject.decorator';
export { Optional } from './decorators/optional.decorator';
export { Module } from './decorators/module.decorator';
export { Global } from './decorators/global.decorator';

// ============================================================================
// Interfaces & Types
// ============================================================================
export type { Type } from './interfaces/type.interface';
export type { InjectionToken } from './interfaces/injection-token.interface';
export type { Provider } from './interfaces/provider.interface';
export type { ClassProvider } from './interfaces/class-provider.interface';
export type { ValueProvider } from './interfaces/value-provider.interface';
export type { FactoryProvider } from './interfaces/factory-provider.interface';
export type { ExistingProvider } from './interfaces/existing-provider.interface';
export type { ModuleMetadata } from './interfaces/module-metadata.interface';
export type { DynamicModule } from './interfaces/dynamic-module.interface';
export type { ForwardReference } from './interfaces/forward-reference.interface';
export type { OnModuleInit } from './interfaces/on-module-init.interface';
export type { OnModuleDestroy } from './interfaces/on-module-destroy.interface';
export type { OnApplicationBootstrap } from './interfaces/on-application-bootstrap.interface';
export type { OnApplicationShutdown } from './interfaces/on-application-shutdown.interface';
export type { BeforeApplicationShutdown } from './interfaces/before-application-shutdown.interface';
export type { ContainerResolver } from './interfaces/container-resolver.interface';
export type { ScopeOptions } from './interfaces/scope-options.interface';
export type { IApplication } from './interfaces/application.interface';
export type { ApplicationOptions } from './interfaces/application-options.interface';
export type { ModuleMetatype } from './interfaces/module-metatype.interface';
export type { ContainerProviderProps } from './interfaces/container-provider-props.interface';

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
export { Application } from './application/application';
export {
  getGlobalApplication,
  hasGlobalApplication,
  clearGlobalApplication,
} from './application/global-application';

// ============================================================================
// DI Engine (Container, Injector, Scanner, Module, etc.)
// ============================================================================
export { ModuleContainer } from './injector/container';
export { Module as ModuleRef } from './injector/module';
export { Injector } from './injector/injector';
export { InstanceWrapper } from './injector/instance-wrapper';
export { InstanceLoader } from './injector/instance-loader';
export { DependenciesScanner } from './injector/scanner';
export { RegistryScanner } from './injector/registry-scanner';

// ============================================================================
// React Bindings
// ============================================================================
export { ContainerContext } from './contexts/container.context';
export { ContainerProvider } from './providers/container.provider';
export { useContainer } from './hooks/use-container';
export { useInject } from './hooks/use-inject';
export { useOptionalInject } from './hooks/use-optional-inject';

// ============================================================================
// Constants (for library authors building on top of this)
// ============================================================================
export {
  MODULE_METADATA,
  GLOBAL_MODULE_METADATA,
  INJECTABLE_WATERMARK,
  SCOPE_OPTIONS_METADATA,
  PARAMTYPES_METADATA,
  SELF_DECLARED_DEPS_METADATA,
  OPTIONAL_DEPS_METADATA,
  PROPERTY_DEPS_METADATA,
  OPTIONAL_PROPERTY_DEPS_METADATA,
} from './constants/tokens.constant';
