/**
 * @fileoverview DTO interface for updating an existing ticket.
 *
 * @module @stackra/react-ticket
 * @category Interfaces
 */

/**
 * Data transfer object for updating an existing ticket.
 *
 * All fields are optional — only provided fields are updated.
 * Server-managed fields (id, createdAt) cannot be changed.
 *
 * @example
 * ```typescript
 * const dto: UpdateTicketDto = {
 *   status: 'in_progress',
 *   assigneeId: 'usr_456',
 * };
 * ```
 */
export interface UpdateTicketDto {
  /** Updated title. */
  title?: string;

  /** Updated description. */
  description?: string;

  /** Updated status. */
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';

  /** Updated priority. */
  priority?: 'low' | 'medium' | 'high' | 'critical';

  /** Updated assignee (set to `null` to unassign). */
  assigneeId?: string | null;

  /** Updated tags. */
  tags?: string[];
}
