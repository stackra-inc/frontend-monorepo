/**
 * @fileoverview Return type for the useCreateMany hook.
 *
 * @module @stackra/react-refine
 * @category Types
 */

import type { UseMutationHookResult } from '@/interfaces/use-mutation-hook-result.interface';
import type { HttpError } from '@/interfaces/http-error.interface';
import type { CreateManyMutationVariables } from '@/interfaces/create-many-mutation-variables.interface';

/** Return type for the `useCreateMany` hook. */
export type UseCreateManyReturnType<TData = any> = UseMutationHookResult<
  TData[],
  HttpError,
  CreateManyMutationVariables<TData>
>;
