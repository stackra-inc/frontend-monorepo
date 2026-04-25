/**
 * @fileoverview Root options type for `RefineModule.forRoot()`.
 *
 * Auth options have been moved to @stackra/react-auth.
 *
 * @module @stackra/react-refine
 * @category Types
 */

import type { Type } from './type-constructor.type';
import type { MutationMode } from './mutation-mode.type';
import type { IRealtimeService } from '@/interfaces/realtime-service.interface';
import type { INotificationService } from '@/interfaces/notification-service.interface';
import type { IAuditLogService } from '@/interfaces/audit-log.interface';
import type { QueryStringSerializer } from '@/interfaces/query-string-serializer.interface';

/**
 * Configuration options for `RefineModule.forRoot()`.
 */
export type RefineRootOptions = {
  /** TanStack QueryClient instance. */
  queryClient?: any;

  /** Realtime service class or instance. */
  realtimeService?: Type<IRealtimeService> | IRealtimeService;

  /** Notification service class or instance. */
  notificationService?: Type<INotificationService> | INotificationService;

  /** Audit log service class or instance. */
  auditLogService?: Type<IAuditLogService> | IAuditLogService;

  /** Query string serializer for HttpRepository. */
  queryStringSerializer?: QueryStringSerializer;

  /**
   * Global mutation mode.
   *
   * - `pessimistic` — mutation executes immediately (default).
   * - `optimistic` — UI updates immediately, rolls back on error.
   * - `undoable` — countdown toast before execution.
   *
   * @default 'pessimistic'
   */
  mutationMode?: MutationMode;

  /**
   * Default timeout in milliseconds for undoable mutations.
   * @default 5000
   */
  undoableTimeout?: number;

  /** Whether this module should be registered globally. Defaults to `true`. */
  isGlobal?: boolean;
};
