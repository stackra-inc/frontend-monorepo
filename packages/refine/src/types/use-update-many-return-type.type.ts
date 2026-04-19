/**
 * @fileoverview Return type for the useUpdateMany hook.
 *
 * @module @stackra-inc/react-refine
 * @category Types
 */

import type { UseMutationHookResult } from '@/interfaces/use-mutation-hook-result.interface';
import type { HttpError } from '@/interfaces/http-error.interface';
import type { UpdateManyMutationVariables } from '@/interfaces/update-many-mutation-variables.interface';

/** Return type for the `useUpdateMany` hook. */
export type UseUpdateManyReturnType<TData = any> = UseMutationHookResult<
  TData[],
  HttpError,
  UpdateManyMutationVariables<TData>
>;
