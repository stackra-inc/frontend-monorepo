/**
 * @fileoverview Return type for the useDelete hook.
 *
 * @module @stackra/react-refine
 * @category Types
 */

import type { UseMutationHookResult } from '@/interfaces/use-mutation-hook-result.interface';
import type { HttpError } from '@/interfaces/http-error.interface';
import type { DeleteMutationVariables } from '@/interfaces/delete-mutation-variables.interface';

/** Return type for the `useDelete` hook. */
export type UseDeleteReturnType = UseMutationHookResult<void, HttpError, DeleteMutationVariables>;
