/**
 * @fileoverview Response shape for access control checks.
 *
 * @module @abdokouta/react-refine
 * @category Interfaces
 */

/**
 * Response shape for access control checks.
 */
export interface CanResponse {
  /** Whether the action is allowed. */
  can: boolean;

  /** Optional human-readable reason for denial. */
  reason?: string;
}
