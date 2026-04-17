/**
 * @fileoverview Root options type for `RefineModule.forRoot()`.
 *
 * @module @abdokouta/react-refine
 * @category Types
 */

import type { Type } from './type-constructor.type';
import type { IAuthService } from '@/interfaces/i-auth-service.interface';
import type { IAccessControlService } from '@/interfaces/i-access-control-service.interface';
import type { IRealtimeService } from '@/interfaces/i-realtime-service.interface';
import type { INotificationService } from '@/interfaces/i-notification-service.interface';
import type { IAuditLogService } from '@/interfaces/audit-log.interface';
import type { QueryStringSerializer } from '@/interfaces/query-string-serializer.interface';

/**
 * Configuration options for `RefineModule.forRoot()`.
 *
 * All fields are optional. Provider services that are not supplied
 * will either use permissive defaults or no-op behavior.
 */
export type RefineRootOptions = {
  /**
   * TanStack QueryClient instance.
   * If not provided, a default QueryClient is created.
   */
  queryClient?: any;

  /** Auth service class or instance. */
  authService?: Type<IAuthService> | IAuthService;

  /** Access control service class or instance. */
  accessControlService?: Type<IAccessControlService> | IAccessControlService;

  /** Realtime service class or instance. */
  realtimeService?: Type<IRealtimeService> | IRealtimeService;

  /** Notification service class or instance. */
  notificationService?: Type<INotificationService> | INotificationService;

  /** Audit log service class or instance. */
  auditLogService?: Type<IAuditLogService> | IAuditLogService;

  /**
   * Query string serializer for HttpRepository.
   * Defaults to `LaravelQueryStringSerializer` if not provided.
   */
  queryStringSerializer?: QueryStringSerializer;

  /** Whether this module should be registered globally. Defaults to `true`. */
  isGlobal?: boolean;
};
