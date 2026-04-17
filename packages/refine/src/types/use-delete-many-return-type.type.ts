/**
 * @fileoverview Return type for the useDeleteMany hook.
 *
 * @module @abdokouta/react-refine
 * @category Types
 */

import type { UseMutationHookResult } from '@/interfaces/use-mutation-hook-result.interface';
import type { HttpError } from '@/interfaces/http-error.interface';
import type { DeleteManyMutationVariables } from '@/interfaces/delete-many-mutation-variables.interface';

/** Return type for the `useDeleteMany` hook. */
export type UseDeleteManyReturnType = UseMutationHookResult<
  void,
  HttpError,
  DeleteManyMutationVariables
>;
