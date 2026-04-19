/**
 * @fileoverview Barrel export for all types in the refine package.
 *
 * @module @stackra/react-refine
 * @category Types
 */

export type { Type } from './type-constructor.type';
export type { HttpRepositoryConfig } from './http-repository-config.type';
export type { RefineRootOptions } from './refine-root-options.type';
export type { MutationMode } from './mutation-mode.type';
export type { SuccessErrorNotification } from './success-error-notification.type';

// ─── Hook Return Types ─────────────────────────────────────────────
export type { UseOneReturnType } from './use-one-return-type.type';
export type { UseListReturnType } from './use-list-return-type.type';
export type { UseManyReturnType } from './use-many-return-type.type';
export type { UseShowReturnType } from './use-show-return-type.type';
export type { UseInfiniteListReturnType } from './use-infinite-list-return-type.type';
export type { UseCustomReturnType } from './use-custom-return-type.type';
export type { UseCreateReturnType } from './use-create-return-type.type';
export type { UseUpdateReturnType } from './use-update-return-type.type';
export type { UseDeleteReturnType } from './use-delete-return-type.type';
export type { UseCreateManyReturnType } from './use-create-many-return-type.type';
export type { UseUpdateManyReturnType } from './use-update-many-return-type.type';
export type { UseDeleteManyReturnType } from './use-delete-many-return-type.type';
export type { UseCustomMutationReturnType } from './use-custom-mutation-return-type.type';
