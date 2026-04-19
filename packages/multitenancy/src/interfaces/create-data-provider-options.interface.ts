/**
 * @fileoverview Options interface for creating a tenant-aware data provider.
 *
 * @module @stackra/react-multitenancy
 * @category Interfaces
 */

import type { DataProvider } from '@refinedev/core';
import type { IMultiTenancyProvider } from './multi-tenancy-provider.interface';
import type { TenantConfig } from './tenant-config.interface';

/**
 * Options for creating a tenant-aware data provider
 */
export interface CreateDataProviderOptions {
  /**
   * Base data provider to wrap
   */
  baseDataProvider: DataProvider;

  /**
   * Multi-tenancy provider instance
   */
  multiTenancyProvider: IMultiTenancyProvider;

  /**
   * Tenant configuration
   */
  config: TenantConfig;
}
