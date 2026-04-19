/**
 * @fileoverview Return type for the useList hook.
 *
 * @module @stackra-inc/react-refine
 * @category Types
 */

import type { UseListResult } from '@/interfaces/use-list-result.interface';
import type { HttpError } from '@/interfaces/http-error.interface';

/** Return type for the `useList` hook. */
export type UseListReturnType<TData = any> = UseListResult<TData, HttpError>;
