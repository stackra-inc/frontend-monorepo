/**
 * Providers
 */

export {
  withMultitenancy,
  createTenantSwitcher,
  createTenantContext,
} from './auth-multitenancy.provider';

export type { MultitenancyConfig } from '@/interfaces/multitenancy-config.interface';
