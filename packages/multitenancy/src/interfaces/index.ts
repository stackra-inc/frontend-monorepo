/**
 * Interface definitions for the multi-tenancy package.
 *
 * @description
 * This module exports all interface definitions used throughout the package.
 * Interfaces are stored in separate files following the convention:
 * - One interface per file
 * - File name: {interface-name}.interface.ts
 * - Exported via barrel export
 *
 * @module interfaces
 * @public
 */

export type { TenantResolver } from './tenant-resolver.interface';
export type { TenantConfig, TenantDomainConfig } from './tenant-config-extended.interface';
export type { IMultiTenancyProvider } from './multi-tenancy-provider.interface';
export type { IMultiTenancyContext } from './multi-tenancy-context.interface';
export type { MultiTenancyOptions } from './multitenancy-options.interface';
