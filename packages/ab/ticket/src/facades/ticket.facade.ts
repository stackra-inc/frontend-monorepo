/**
 * Ticket Facade
 *
 * Typed proxy for {@link TicketService} from `@stackra/react-ticket`.
 *
 * The facade is a module-level constant typed as `TicketService`.
 * It lazily resolves the service from the DI container on first property
 * access — safe to use at module scope before bootstrap completes.
 *
 * ## Setup (once, in main.tsx)
 *
 * ```typescript
 * import { Application } from '@stackra/ts-container';
 * import { Facade } from '@stackra/ts-support';
 *
 * const app = await Application.create(AppModule);
 * Facade.setApplication(app); // wires all facades
 * ```
 *
 * ## Usage
 *
 * ```typescript
 * import { TicketFacade } from '@stackra/react-ticket';
 *
 * // Full autocomplete — no .proxy() call needed
 * const ticket = await TicketFacade.getOne('tkt_abc123');
 * await TicketFacade.assign('tkt_abc123', 'usr_456');
 * await TicketFacade.close('tkt_abc123');
 * ```
 *
 * ## Available methods (from {@link TicketService})
 *
 * Inherited CRUD:
 * - `getOne(id)` — fetch a single ticket
 * - `getList(params)` — fetch paginated list
 * - `create(data)` — create a new ticket
 * - `update(id, data)` — update a ticket
 * - `deleteOne(id)` — delete a ticket
 *
 * Ticket-specific:
 * - `assign(ticketId, assigneeId)` — assign to a user
 * - `close(ticketId)` — close a ticket
 * - `reopen(ticketId)` — reopen a ticket
 * - `resolve(ticketId)` — mark as resolved
 * - `escalate(ticketId)` — escalate to critical
 *
 * ## Testing — swap in a mock
 *
 * ```typescript
 * import { Facade } from '@stackra/ts-support';
 * import { TICKET_SERVICE } from '@stackra/react-ticket';
 *
 * // Before test — replace the resolved instance
 * Facade.swap(TICKET_SERVICE, mockInstance);
 *
 * // After test — restore
 * Facade.clearResolvedInstances();
 * ```
 *
 * @module facades/ticket
 * @see {@link TicketService} — the underlying service
 * @see {@link Facade} — the base class providing `make()`
 */

import { Facade } from '@stackra/ts-support';
import { TicketService } from '@/services/ticket.service';
import { TICKET_SERVICE } from '@/constants/tokens.constant';

/**
 * TicketFacade — typed proxy for {@link TicketService}.
 *
 * Provides static-style access to ticket CRUD and business operations
 * from anywhere in the application without needing React hooks or
 * manual DI resolution.
 */
export const TicketFacade: TicketService = Facade.make<TicketService>(TICKET_SERVICE);
