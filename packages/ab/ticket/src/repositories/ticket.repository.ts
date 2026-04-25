/**
 * @fileoverview Ticket repository extending the base HTTP repository.
 *
 * Provides standard CRUD operations for tickets via HTTP, plus
 * ticket-specific query methods (by status, assignee, reporter).
 *
 * Inherits all standard CRUD methods from {@link HttpRepository}:
 * `getOne`, `getList`, `getMany`, `create`, `update`, `deleteOne`,
 * `deleteMany`, `createMany`, `updateMany`, `custom`.
 *
 * @module @stackra/react-ticket
 * @category Repositories
 *
 * @example
 * ```typescript
 * const repo = new TicketRepository(httpClient, config, serializer);
 *
 * // Standard CRUD
 * const ticket = await repo.getOne('tkt_abc123');
 * const list = await repo.getList({ pagination: { current: 1, pageSize: 10 } });
 *
 * // Ticket-specific queries
 * const openTickets = await repo.findByStatus('open');
 * const myTickets = await repo.findByAssignee('usr_456');
 * ```
 */

import { Injectable, Inject } from '@stackra/ts-container';
import { HttpRepository } from '@stackra/react-refine';
import type { GetListResult } from '@stackra/react-refine';
import type { Ticket } from '@/interfaces/ticket.interface';
import {
  HTTP_CLIENT,
  HTTP_REPOSITORY_CONFIG,
  QUERY_STRING_SERIALIZER,
} from '@stackra/react-refine';

/**
 * TicketRepository — HTTP-backed CRUD repository for tickets.
 *
 * Extends {@link HttpRepository} with ticket-specific query methods.
 * All standard CRUD operations are inherited and work out of the box.
 *
 * @example
 * ```typescript
 * // Injected via DI
 * @Injectable()
 * class SomeConsumer {
 *   constructor(
 *     @Inject(TICKET_REPOSITORY) private repo: TicketRepository
 *   ) {}
 * }
 * ```
 */
@Injectable()
export class TicketRepository extends HttpRepository<Ticket, string> {
  // ── Ticket-Specific Queries ─────────────────────────────────────────

  /**
   * Find all tickets with a given status.
   *
   * @param status - The ticket status to filter by.
   * @returns Paginated list of matching tickets.
   *
   * @example
   * ```typescript
   * const openTickets = await repo.findByStatus('open');
   * ```
   */
  public async findByStatus(status: Ticket['status']): Promise<GetListResult<Ticket>> {
    return this.getList({
      filters: [{ field: 'status', operator: 'eq', value: status }],
    });
  }

  /**
   * Find all tickets assigned to a specific user.
   *
   * @param assigneeId - The assignee's user ID.
   * @returns Paginated list of matching tickets.
   *
   * @example
   * ```typescript
   * const myTickets = await repo.findByAssignee('usr_456');
   * ```
   */
  public async findByAssignee(assigneeId: string): Promise<GetListResult<Ticket>> {
    return this.getList({
      filters: [{ field: 'assigneeId', operator: 'eq', value: assigneeId }],
    });
  }

  /**
   * Find all tickets created by a specific user.
   *
   * @param reporterId - The reporter's user ID.
   * @returns Paginated list of matching tickets.
   *
   * @example
   * ```typescript
   * const reported = await repo.findByReporter('usr_789');
   * ```
   */
  public async findByReporter(reporterId: string): Promise<GetListResult<Ticket>> {
    return this.getList({
      filters: [{ field: 'reporterId', operator: 'eq', value: reporterId }],
    });
  }

  /**
   * Find all tickets matching a specific priority level.
   *
   * @param priority - The priority to filter by.
   * @returns Paginated list of matching tickets.
   *
   * @example
   * ```typescript
   * const critical = await repo.findByPriority('critical');
   * ```
   */
  public async findByPriority(priority: Ticket['priority']): Promise<GetListResult<Ticket>> {
    return this.getList({
      filters: [{ field: 'priority', operator: 'eq', value: priority }],
    });
  }
}
