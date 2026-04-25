/**
 * @fileoverview Configuration interface for TicketModule.forRoot().
 *
 * @module @stackra/react-ticket
 * @category Interfaces
 */

/**
 * Configuration options for the ticket module.
 *
 * Passed to `TicketModule.forRoot()` to configure the ticket
 * service and repository.
 *
 * @example
 * ```typescript
 * TicketModule.forRoot({
 *   endpoint: '/api/tickets',
 *   isGlobal: true,
 * })
 * ```
 */
export interface TicketModuleOptions {
  /**
   * API endpoint for ticket CRUD operations.
   * @default "/api/tickets"
   * @example "/api/v2/tickets"
   */
  endpoint?: string;

  /**
   * Whether the module should be registered globally.
   * When `true`, exports are available to all modules without re-importing.
   * @default true
   */
  isGlobal?: boolean;
}
