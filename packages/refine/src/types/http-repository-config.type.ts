/**
 * @fileoverview Configuration type for HttpRepository instances.
 *
 * @module @abdokouta/react-refine
 * @category Types
 */

/**
 * Configuration for an {@link HttpRepository} instance.
 *
 * Injected via the `HTTP_REPOSITORY_CONFIG` token.
 */
export type HttpRepositoryConfig = {
  /** Base API endpoint (e.g. `'/api/posts'`). */
  endpoint: string;

  /** Optional custom headers to include in every request. */
  headers?: Record<string, string>;

  /** Optional base URL prefix (e.g. `'https://api.example.com'`). */
  baseUrl?: string;
};
