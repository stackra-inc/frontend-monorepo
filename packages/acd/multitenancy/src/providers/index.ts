/**
 * Providers
 */

export type { MultitenancyConfig } from '@/interfaces/multitenancy-config.interface';
export { withMultitenancy, createTenantSwitcher, createTenantContext } from './auth-multitenancy';

export { createDataProvider } from './data';
export type { CreateDataProviderOptions } from './data';
