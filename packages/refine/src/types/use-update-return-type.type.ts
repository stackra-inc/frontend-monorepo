/**
 * @fileoverview Return type for the useUpdate hook.
 *
 * @module @stackra/react-refine
 * @category Types
 */

import type { UseMutationHookResult } from '@/interfaces/use-mutation-hook-result.interface';
import type { HttpError } from '@/interfaces/http-error.interface';
import type { UpdateMutationVariables } from '@/interfaces/update-mutation-variables.interface';

/** Return type for the `useUpdate` hook. */
export type UseUpdateReturnType<TData = any> = UseMutationHookResult<
  TData,
  HttpError,
  UpdateMutationVariables<TData>
>;
