/**
 * @fileoverview Return type for the useInfiniteList hook.
 *
 * @module @stackra/react-refine
 * @category Types
 */

import type { UseInfiniteListResult } from '@/interfaces/use-infinite-list-result.interface';
import type { HttpError } from '@/interfaces/http-error.interface';

/** Return type for the `useInfiniteList` hook. */
export type UseInfiniteListReturnType<TData = any> = UseInfiniteListResult<TData, HttpError>;
