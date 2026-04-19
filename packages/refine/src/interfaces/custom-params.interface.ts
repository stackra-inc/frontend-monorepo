/**
 * @fileoverview CustomParams interface for custom/ad-hoc operations.
 *
 * @module @stackra-inc/react-refine
 * @category Interfaces
 */

/**
 * Parameters for custom (non-CRUD) operations.
 */
export interface CustomParams {
  /** Custom URL to call (overrides the resource endpoint). */
  url?: string;

  /** HTTP method. */
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete';

  /** Request body payload. */
  payload?: any;

  /** URL query parameters. */
  query?: Record<string, any>;

  /** Additional HTTP headers. */
  headers?: Record<string, string>;

  /** Arbitrary metadata passed through to the repository. */
  meta?: Record<string, any>;
}
