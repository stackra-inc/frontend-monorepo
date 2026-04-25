/**
 * @fileoverview DI tokens for the ticket package.
 *
 * All injection tokens are Symbol-based constants. Never use raw string
 * literals as metadata keys — always reference these constants.
 *
 * @module @stackra/react-ticket
 * @category Constants
 */

// ─── Core Tokens ─────────────────────────────────────────────────────

/**
 * DI token for the {@link TicketService} singleton.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class SomeConsumer {
 *   constructor(
 *     @Inject(TICKET_SERVICE) private ticketService: TicketService
 *   ) {}
 * }
 * ```
 */
export const TICKET_SERVICE = Symbol.for('TICKET_SERVICE');

/**
 * DI token for the {@link TicketRepository} singleton.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class SomeConsumer {
 *   constructor(
 *     @Inject(TICKET_REPOSITORY) private ticketRepo: TicketRepository
 *   ) {}
 * }
 * ```
 */
export const TICKET_REPOSITORY = Symbol.for('TICKET_REPOSITORY');

/**
 * DI token for the {@link TicketModuleOptions} configuration object.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class TicketService {
 *   constructor(
 *     @Inject(TICKET_CONFIG) private config: TicketModuleOptions
 *   ) {}
 * }
 * ```
 */
export const TICKET_CONFIG = Symbol.for('TICKET_CONFIG');
