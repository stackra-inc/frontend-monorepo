/**
 * @fileoverview Return type for the useCustomMutation hook.
 *
 * @module @stackra-inc/react-refine
 * @category Types
 */

import type { UseMutationHookResult } from '@/interfaces/use-mutation-hook-result.interface';
import type { HttpError } from '@/interfaces/http-error.interface';
import type { CustomParams } from '@/interfaces/custom-params.interface';

/** Return type for the `useCustomMutation` hook. */
export type UseCustomMutationReturnType<TData = any> = UseMutationHookResult<
  TData,
  HttpError,
  CustomParams
>;
