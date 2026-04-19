/**
 * @fileoverview Props interface for the useCan access-control hook.
 *
 * @module @stackra-inc/react-auth
 * @category Interfaces
 */

/**
 * Props for the {@link useCan} hook.
 *
 * Specifies the resource, action, and optional params for an access-control check.
 */
export interface UseCanProps {
  /** Resource name to check access for. */
  resource: string;
  /** Action to check (e.g. "create", "edit", "delete"). */
  action: string;
  /** Optional additional parameters. */
  params?: any;
}
