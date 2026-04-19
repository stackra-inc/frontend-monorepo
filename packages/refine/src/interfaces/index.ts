/**
 * @fileoverview Barrel export for refine interfaces.
 *
 * Auth interfaces have been moved to @stackra-inc/react-auth.
 *
 * @module @stackra-inc/react-refine
 * @category Interfaces
 */

// ─── Core Data Interfaces ──────────────────────────────────────────
export type { Pagination } from './pagination.interface';
export type { SortDescriptor } from './sort-descriptor.interface';
export type { FilterDescriptor } from './filter-descriptor.interface';
export type { GetListParams } from './get-list-params.interface';
export type { GetListResult } from './get-list-result.interface';
export type { CustomParams } from './custom-params.interface';
export type { HttpError } from './http-error.interface';

// ─── Decorator Metadata Interfaces ─────────────────────────────────
export type { ResourceMetadata } from './resource-metadata.interface';

// ─── Hook Result Interfaces ────────────────────────────────────────
export type { UseQueryHookResult } from './use-query-hook-result.interface';
export type { UseListResult } from './use-list-result.interface';
export type { UseMutationHookResult } from './use-mutation-hook-result.interface';
export type { UseInfiniteListResult } from './use-infinite-list-result.interface';

// ─── Hook Prop Interfaces ──────────────────────────────────────────
export type { UseOneProps } from './use-one-props.interface';
export type { UseListProps } from './use-list-props.interface';
export type { UseManyProps } from './use-many-props.interface';
export type { UseShowProps } from './use-show-props.interface';
export type { UseInfiniteListProps } from './use-infinite-list-props.interface';
export type { UseCustomProps } from './use-custom-props.interface';
export type { UseCreateProps } from './use-create-props.interface';
export type { CreateMutationVariables } from './create-mutation-variables.interface';
export type { UseUpdateProps } from './use-update-props.interface';
export type { UpdateMutationVariables } from './update-mutation-variables.interface';
export type { UseDeleteProps } from './use-delete-props.interface';
export type { DeleteMutationVariables } from './delete-mutation-variables.interface';
export type { UseCreateManyProps } from './use-create-many-props.interface';
export type { CreateManyMutationVariables } from './create-many-mutation-variables.interface';
export type { UseUpdateManyProps } from './use-update-many-props.interface';
export type { UpdateManyMutationVariables } from './update-many-mutation-variables.interface';
export type { UseDeleteManyProps } from './use-delete-many-props.interface';
export type { DeleteManyMutationVariables } from './delete-many-mutation-variables.interface';
export type { UseCustomMutationProps } from './use-custom-mutation-props.interface';
export type { UseSubscriptionProps } from './use-subscription-props.interface';

// ─── Realtime Interfaces ───────────────────────────────────────────
export type { SubscribeParams } from './subscribe-params.interface';
export type { PublishParams } from './publish-params.interface';
export type { LiveEvent } from './live-event.interface';
export type { IRealtimeService } from './realtime-service.interface';

// ─── Notification ──────────────────────────────────────────────────
export type { OpenNotificationParams } from './open-notification-params.interface';
export type { INotificationService } from './notification-service.interface';

// ─── Undoable Queue ────────────────────────────────────────────────
export {
  UndoableActionType,
  type IUndoableQueue,
  type UndoableAction,
} from './undoable-queue.interface';

// ─── Audit Log ─────────────────────────────────────────────────────
export type {
  AuditLogCreateParams,
  AuditLogGetParams,
  AuditLogUpdateParams,
  IAuditLogService,
} from './audit-log.interface';

// ─── Query String Serializer ───────────────────────────────────────
export type { QueryStringSerializer } from './query-string-serializer.interface';

// ─── SDUI Shared Interfaces ───────────────────────────────────────
export type { PageDefinition } from './page-definition.interface';
export type { ResourceConfig } from './resource-config.interface';
export type { FieldDefinition } from './field-definition.interface';
export type { SchemaComponent } from './schema-component.interface';
export type { RelationDefinition } from './relation-definition.interface';
export type { FilterConfig } from './filter-config.interface';
export type { ColumnDefinition } from './column-definition.interface';
