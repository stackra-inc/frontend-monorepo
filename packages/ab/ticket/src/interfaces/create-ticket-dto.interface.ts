/**
 * @fileoverview DTO interface for creating a new ticket.
 *
 * @module @stackra/react-ticket
 * @category Interfaces
 */

/**
 * Data transfer object for creating a new ticket.
 *
 * Contains only the fields required/allowed at creation time.
 * Server-generated fields (id, createdAt, updatedAt) are excluded.
 *
 * @example
 * ```typescript
 * const dto: CreateTicketDto = {
 *   title: 'Fix login page',
 *   description: 'Users cannot log in on iOS Safari',
 *   priority: 'high',
 *   reporterId: 'usr_789',
 *   tags: ['bug', 'mobile'],
 * };
 * ```
 */
export interface CreateTicketDto {
  /** Short summary of the ticket. */
  title: string;

  /**
   * Detailed description of the issue or request.
   * @default ""
   */
  description?: string;

  /**
   * Ticket priority level.
   * @default "medium"
   */
  priority?: 'low' | 'medium' | 'high' | 'critical';

  /**
   * ID of the user assigned to this ticket.
   * @default null
   */
  assigneeId?: string | null;

  /** ID of the user creating this ticket. */
  reporterId: string;

  /**
   * Tags/labels to attach.
   * @default []
   */
  tags?: string[];
}
