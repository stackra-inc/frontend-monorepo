/**
 * @fileoverview useLog hook — audit log operations.
 *
 * Resolves the AuditLogService from the DI container via `useOptionalInject`.
 *
 * @module @stackra-inc/react-refine
 * @category Hooks
 */

import { useOptionalInject } from '@stackra-inc/ts-container';
import { AUDIT_LOG_SERVICE } from '@/constants';
import type {
  IAuditLogService,
  AuditLogCreateParams,
  AuditLogGetParams,
  AuditLogUpdateParams,
} from '@/interfaces/audit-log.interface';

/** No-op async function for when the service is not available. */
const noopAsync = () => Promise.resolve(undefined);

/**
 * Hook for audit log operations (create, update, get).
 *
 * Resolves the `IAuditLogService` from the DI container. Returns
 * no-op functions when the service is not configured.
 *
 * @returns Object with `log`, `rename`, and `getLogs` methods.
 */
export function useLog(): {
  log: (params: AuditLogCreateParams) => Promise<any>;
  rename: (params: AuditLogUpdateParams) => Promise<any>;
  getLogs: (params: AuditLogGetParams) => Promise<any>;
} {
  const auditLogService = useOptionalInject<IAuditLogService>(AUDIT_LOG_SERVICE);

  if (!auditLogService) {
    return { log: noopAsync, rename: noopAsync, getLogs: noopAsync };
  }

  return {
    log: (params) => auditLogService.create(params),
    rename: (params) => auditLogService.update(params),
    getLogs: (params) => auditLogService.get(params),
  };
}
