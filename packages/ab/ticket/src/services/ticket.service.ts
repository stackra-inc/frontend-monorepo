/**
 * @fileoverview Ticket service with business logic on top of CRUD.
 *
 * Extends {@link BaseService} which delegates all standard CRUD operations
 * to the injected {@link TicketRepository}. This class adds ticket-specific
 * business methods: assign, close, reopen, escalate.
 *
 * Inherited CRUD methods (from BaseService):
 * - `getOne(id)` — fetch a single ticket
 * - `getList(params)` — fetch paginated list
 * - `getMany(ids)` — fetch multiple by IDs
 * - `create(data)` — create a new ticket
 * - `update(id, data)` — update an existing ticket
 * - `deleteOne(id)` — delete a single ticket
 * - `deleteMany(ids)` — delete multiple tickets
 * - `createMany(data)` — bulk create
 * - `updateMany(ids, data)` — bulk update
 * - `custom(params)` — ad-hoc operations
 *
 * @module @stackra/react-ticket
 * @category Services
 *
 * @example
 * ```typescript
 * // Via DI
 * @Injectable()
 * class TicketController {
 *   constructor(
 *     @Inject(TICKET_SERVICE) private ticketService: TicketService
 *   ) {}
 *
 *   async assignTicket(ticketId: string, userId: string) {
 *     return this.ticketService.assign(ticketId, userId);
 *   }
 * }
 *
 * // Via Facade
 * import { TicketFacade } from '@stackra/react-ticket';
 * const ticket = await TicketFacade.assign('tkt_abc', 'usr_456');
 * ```
 */

import { Injectable } from '@stackra/ts-container';
import { BaseService } from '@stackra/react-refine';
import type { Ticket } from '@/interfaces/ticket.interface';

/**
 * TicketService — business logic layer for ticket operations.
 *
 * Extends {@link BaseService} with ticket-specific methods.
 * All standard CRUD operations are inherited and delegate to
 * the injected repository.
 */
@Injectable()
export class TicketService extends BaseService<Ticket, string> {
  // ── Ticket-Specific Business Logic ──────────────────────────────────

  /**
   * Assign a ticket to a user.
   *
   * Sets the ticket status to `'in_progress'` and assigns the user.
   *
   * @param ticketId - The ticket to assign.
   * @param assigneeId - The user to assign the ticket to.
   * @returns The updated ticket.
   *
   * @example
   * ```typescript
   * const ticket = await ticketService.assign('tkt_abc', 'usr_456');
   * // ticket.status === 'in_progress'
   * // ticket.assigneeId === 'usr_456'
   * ```
   */
  public async assign(ticketId: string, assigneeId: string): Promise<Ticket> {
    return this.update(ticketId, {
      assigneeId,
      status: 'in_progress',
    } as Partial<Ticket>);
  }

  /**
   * Close a resolved ticket.
   *
   * Sets the ticket status to `'closed'`.
   *
   * @param ticketId - The ticket to close.
   * @returns The updated ticket.
   *
   * @example
   * ```typescript
   * const ticket = await ticketService.close('tkt_abc');
   * // ticket.status === 'closed'
   * ```
   */
  public async close(ticketId: string): Promise<Ticket> {
    return this.update(ticketId, { status: 'closed' } as Partial<Ticket>);
  }

  /**
   * Reopen a closed or resolved ticket.
   *
   * Sets the ticket status back to `'open'`.
   *
   * @param ticketId - The ticket to reopen.
   * @returns The updated ticket.
   *
   * @example
   * ```typescript
   * const ticket = await ticketService.reopen('tkt_abc');
   * // ticket.status === 'open'
   * ```
   */
  public async reopen(ticketId: string): Promise<Ticket> {
    return this.update(ticketId, { status: 'open' } as Partial<Ticket>);
  }

  /**
   * Mark a ticket as resolved.
   *
   * Sets the ticket status to `'resolved'`.
   *
   * @param ticketId - The ticket to resolve.
   * @returns The updated ticket.
   *
   * @example
   * ```typescript
   * const ticket = await ticketService.resolve('tkt_abc');
   * // ticket.status === 'resolved'
   * ```
   */
  public async resolve(ticketId: string): Promise<Ticket> {
    return this.update(ticketId, { status: 'resolved' } as Partial<Ticket>);
  }

  /**
   * Escalate a ticket to critical priority.
   *
   * Sets the priority to `'critical'` regardless of current priority.
   *
   * @param ticketId - The ticket to escalate.
   * @returns The updated ticket.
   *
   * @example
   * ```typescript
   * const ticket = await ticketService.escalate('tkt_abc');
   * // ticket.priority === 'critical'
   * ```
   */
  public async escalate(ticketId: string): Promise<Ticket> {
    return this.update(ticketId, { priority: 'critical' } as Partial<Ticket>);
  }
}
