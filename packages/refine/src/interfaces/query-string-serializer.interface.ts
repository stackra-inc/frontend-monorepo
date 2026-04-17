/**
 * @fileoverview QueryStringSerializer interface for pluggable query string formats.
 *
 * Implementations convert {@link GetListParams} objects into URL query strings
 * in various formats (Laravel, JSON:API, etc.).
 *
 * @module @abdokouta/react-refine
 * @category Interfaces
 */

import type { GetListParams } from './get-list-params.interface';

/**
 * Interface for pluggable query string serialization.
 *
 * Registered globally via `RefineModule.forRoot({ queryStringSerializer })`.
 * Used by `HttpRepository` to convert `GetListParams` to URL query strings.
 */
export interface QueryStringSerializer {
  /**
   * Serialize query parameters into a URL query string.
   *
   * @param params - The list parameters to serialize.
   * @returns A URL query string (including the leading `?`), or empty string if no params.
   */
  serialize(params: GetListParams): string;
}
