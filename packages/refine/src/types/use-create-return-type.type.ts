/**
 * @fileoverview Return type for the useCreate hook.
 *
 * @module @abdokouta/react-refine
 * @category Types
 */

import type { UseMutationHookResult } from '@/interfaces/use-mutation-hook-result.interface';
import type { HttpError } from '@/interfaces/http-error.interface';
import type { CreateMutationVariables } from '@/interfaces/create-mutation-variables.interface';

/** Return type for the `useCreate` hook. */
export type UseCreateReturnType<TData = any> = UseMutationHookResult<
  TData,
  HttpError,
  CreateMutationVariables<TData>
>;
