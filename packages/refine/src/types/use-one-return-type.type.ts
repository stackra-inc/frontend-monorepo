/**
 * @fileoverview Return type for the useOne hook.
 *
 * @module @stackra-inc/react-refine
 * @category Types
 */

import type { UseQueryHookResult } from '@/interfaces/use-query-hook-result.interface';
import type { HttpError } from '@/interfaces/http-error.interface';

/** Return type for the `useOne` hook. */
export type UseOneReturnType<TData = any> = UseQueryHookResult<TData, HttpError>;
