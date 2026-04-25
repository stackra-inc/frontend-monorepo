/**
 * @stackra/react-multitenancy
 *
 * |--------------------------------------------------------------------------
 * | Multi-tenancy support for React applications.
 * |--------------------------------------------------------------------------
 * |
 * | Flexible tenant resolution strategies, data provider integration,
 * | and React components for tenant management.
 * |
 * @module @stackra/react-multitenancy
 */

// ============================================================================
// Module
// ============================================================================
export { MultiTenancyModule } from './multitenancy.module';

// ============================================================================
// Enums
// ============================================================================
export { TenantMode, ResolverPriority } from './enums';

// ============================================================================
// Types
// ============================================================================
export type {
  Tenant,
  TenantResponse,
  GetTenantParams,
  SetTenantParams,
  ResolverName,
  BuiltInResolver,
} from './types';

// ============================================================================
// Interfaces
// ============================================================================
export type {
  TenantResolver,
  IMultiTenancyProvider,
  IMultiTenancyContext,
  TenantConfig,
  TenantDomainConfig,
  MultiTenancyOptions,
} from './interfaces';

// ============================================================================
// Constants
// ============================================================================
export {
  DEFAULT_TENANT_CONFIG,
  MULTITENANCY_CONFIG,
  MULTITENANCY_OPTIONS,
  TENANT_RESOLVERS,
  DOMAIN_RESOLVER,
  SUBDOMAIN_RESOLVER,
  ROUTER_RESOLVER,
  HEADER_RESOLVER,
  QUERY_RESOLVER,
  SERVER_DOMAIN_RESOLVER,
  DYNAMIC_DOMAIN_RESOLVER,
} from './constants';

// ============================================================================
// Contexts
// ============================================================================
export { MultiTenancyContext, MultiTenancyProvider, useMultiTenancyContext } from './contexts';
export type { MultiTenancyProviderProps } from './contexts/multi-tenancy.context';

// ============================================================================
// Hooks
// ============================================================================
export { useTenant, useTenantSwitch } from './hooks';
export type { UseTenantReturn, UseTenantSwitchOptions, UseTenantSwitchReturn } from './hooks';

// ============================================================================
// Components
// ============================================================================
export { WithTenant, TenantSelect, TenantBadge, TenantSwitcher, TenantCard } from './components';
export type {
  WithTenantProps,
  TenantSelectProps,
  TenantBadgeProps,
  TenantSwitcherProps,
  TenantCardProps,
} from './components';

// ============================================================================
// Resolvers
// ============================================================================
export {
  DomainResolver,
  DynamicDomainResolver,
  HeaderResolver,
  QueryResolver,
  RouterResolver,
  ServerDomainResolver,
  SubdomainResolver,
} from './resolvers';
export type { DynamicDomainResolverConfig } from './resolvers';

// ============================================================================
// Factories
// ============================================================================
export { createMultiTenancyProvider } from './factories';
export type { CreateMultiTenancyProviderOptions } from './factories';

// ============================================================================
// Data Provider
// ============================================================================
export { createDataProvider } from './providers/data';
export type { CreateDataProviderOptions } from './providers/data';

// ============================================================================
// Presets
// ============================================================================
export { defaultPreset, headerPreset, subdomainPreset, domainPreset } from './presets';

// ============================================================================
// Utilities
// ============================================================================
export { createResolverChain, loadTenantConfig, defineConfig } from './utils';

// ============================================================================
// Auth Provider Integration
// ============================================================================
export {
  withMultitenancy,
  createTenantSwitcher,
  createTenantContext,
} from './providers/auth-multitenancy';
export type { MultitenancyConfig } from './providers/auth-multitenancy';
