/**
 * @fileoverview Ticket model class decorated with @Resource.
 *
 * This is the primary entity class for the ticket system. It is
 * decorated with `@Resource` so that `RefineModule.forFeature([Ticket])`
 * auto-creates the Repository + Service pair and registers them in
 * the ServiceRegistry.
 *
 * The model class itself is a plain data class — all CRUD operations
 * are handled by the repository and service layers.
 *
 * @module @stackra/react-ticket
 * @category Models
 *
 * @example
 * ```typescript
 * import { Ticket } from '@stackra/react-ticket';
 * import { RefineModule } from '@stackra/react-refine';
 *
 * // Register in a feature module
 * RefineModule.forFeature([Ticket])
 *
 * // Or use directly as a type
 * const ticket: Ticket = await ticketService.getOne('tkt_abc123');
 * ```
 */

import { Resource } from '@stackra/react-refine';
import { TicketRepository } from '@/repositories/ticket.repository';
import { TicketService } from '@/services/ticket.service';

/**
 * Ticket model — decorated with `@Resource` for auto-registration.
 *
 * When passed to `RefineModule.forFeature([TicketModel])`, the framework
 * reads the metadata and creates a TicketRepository + TicketService pair,
 * registering them in the ServiceRegistry under the `'tickets'` key.
 *
 * @example
 * ```typescript
 * // In your feature module
 * @Module({
 *   imports: [
 *     RefineModule.forFeature([TicketModel]),
 *   ],
 * })
 * export class TicketFeatureModule {}
 * ```
 */
@Resource({
  name: 'tickets',
  endpoint: '/api/tickets',
  repository: TicketRepository,
  service: TicketService,
})
export class TicketModel {
  /** Unique ticket identifier */
  declare id: string;

  /** Short summary of the ticket */
  declare title: string;

  /** Detailed description */
  declare description: string;

  /** Current status */
  declare status: 'open' | 'in_progress' | 'resolved' | 'closed';

  /** Priority level */
  declare priority: 'low' | 'medium' | 'high' | 'critical';

  /** Assigned user ID (null when unassigned) */
  declare assigneeId: string | null;

  /** Reporter user ID */
  declare reporterId: string;

  /** Tags/labels */
  declare tags: string[];

  /** ISO 8601 creation timestamp */
  declare createdAt: string;

  /** ISO 8601 last update timestamp */
  declare updatedAt: string;
}
