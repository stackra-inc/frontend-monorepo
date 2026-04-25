/**
 * @fileoverview Core ticket entity interface.
 *
 * Defines the shape of a ticket record as returned by the API.
 * All ticket-related services, repositories, and hooks operate
 * on this type.
 *
 * @module @stackra/react-ticket
 * @category Interfaces
 */

/**
 * Ticket entity representing a support/issue ticket.
 *
 * @example
 * ```typescript
 * const ticket: Ticket = {
 *   id: 'tkt_abc123',
 *   title: 'Login page broken on mobile',
 *   description: 'Users cannot log in on iOS Safari',
 *   status: 'open',
 *   priority: 'high',
 *   assigneeId: 'usr_456',
 *   reporterId: 'usr_789',
 *   tags: ['bug', 'mobile'],
 *   createdAt: '2026-04-23T10:00:00Z',
 *   updatedAt: '2026-04-23T10:00:00Z',
 * };
 * ```
 */
export interface Ticket {
  /** Unique ticket identifier */
  id: string;

  /**
   * Short summary of the ticket.
   * @example "Login page broken on mobile"
   */
  title: string;

  /**
   * Detailed description of the issue or request.
   * @default ""
   */
  description: string;

  /**
   * Current ticket status.
   * @default "open"
   * @example "open"
   */
  status: 'open' | 'in_progress' | 'resolved' | 'closed';

  /**
   * Ticket priority level.
   * @default "medium"
   * @example "high"
   */
  priority: 'low' | 'medium' | 'high' | 'critical';

  /**
   * ID of the user assigned to this ticket.
   * `null` when unassigned.
   * @default null
   */
  assigneeId: string | null;

  /**
   * ID of the user who created this ticket.
   */
  reporterId: string;

  /**
   * Tags/labels attached to this ticket.
   * @default []
   * @example ["bug", "mobile"]
   */
  tags: string[];

  /**
   * ISO 8601 timestamp of when the ticket was created.
   * @example "2026-04-23T10:00:00Z"
   */
  createdAt: string;

  /**
   * ISO 8601 timestamp of the last update.
   * @example "2026-04-23T10:00:00Z"
   */
  updatedAt: string;
}
