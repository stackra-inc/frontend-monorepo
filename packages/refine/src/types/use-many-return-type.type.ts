/**
 * @fileoverview Return type for the useMany hook.
 *
 * @module @stackra-inc/react-refine
 * @category Types
 */

import type { UseQueryHookResult } from '@/interfaces/use-query-hook-result.interface';
import type { HttpError } from '@/interfaces/http-error.interface';

/** Return type for the `useMany` hook. */
export type UseManyReturnType<TData = any> = UseQueryHookResult<TData[], HttpError>;
