/**
 * @fileoverview Access control service interface.
 *
 * Defines the contract for authorization checks.
 *
 * @module @stackra-inc/react-auth
 * @category Interfaces
 */

import type { CanResponse } from './can-response.interface';

/**
 * Access control service interface.
 *
 * Implementations determine whether a user can perform
 * a given action on a given resource.
 */
export interface IAccessControlService {
  /**
   * Check if the current user can perform an action.
   * @param params - The resource, action, and optional extra params.
   * @returns Whether the action is allowed.
   */
  can(params: { resource: string; action: string; params?: any }): Promise<CanResponse>;
}
