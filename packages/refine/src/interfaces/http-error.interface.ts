/**
 * @fileoverview HttpError interface for standardized error responses.
 *
 * @module @stackra-inc/react-refine
 * @category Interfaces
 */

/**
 * Standardized HTTP error shape used across repositories and hooks.
 */
export interface HttpError {
  /** Human-readable error message. */
  message: string;

  /** HTTP status code (e.g. 404, 422, 500). */
  statusCode: number;

  /** Optional field-level validation errors (field → messages). */
  errors?: Record<string, string[]>;
}
