/**
 * @fileoverview Ticket Module — DI module for the ticket system.
 *
 * Registers:
 * - `TICKET_CONFIG`     — raw config object
 * - `TicketRepository`  — HTTP-backed CRUD repository
 * - `TICKET_REPOSITORY` — token alias for TicketRepository
 * - `TicketService`     — business logic service
 * - `TICKET_SERVICE`    — token alias for TicketService
 *
 * `forRoot(config)` configures the ticket endpoint and registers
 * all providers as global singletons.
 *
 * @module @stackra/react-ticket
 * @category Module
 *
 * @example
 * ```typescript
 * import { TicketModule } from '@stackra/react-ticket';
 *
 * @Module({
 *   imports: [
 *     TicketModule.forRoot({
 *       endpoint: '/api/tickets',
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */

import { Module, type DynamicModule } from '@stackra/ts-container';
import { TICKET_CONFIG, TICKET_SERVICE, TICKET_REPOSITORY } from '@/constants/tokens.constant';
import { TicketRepository } from '@/repositories/ticket.repository';
import { TicketService } from '@/services/ticket.service';
import type { TicketModuleOptions } from '@/interfaces/ticket-module-options.interface';

/**
 * TicketModule — provides ticket CRUD with DI integration.
 *
 * Follows the standard module pattern:
 * - `TICKET_CONFIG` — raw config object
 * - `TicketRepository` — class-based injection
 * - `TICKET_REPOSITORY` — useExisting alias
 * - `TicketService` — class-based injection
 * - `TICKET_SERVICE` — useExisting alias
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     TicketModule.forRoot({
 *       endpoint: '/api/tickets',
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern requires static methods
export class TicketModule {
  /**
   * Configure the ticket module with runtime configuration.
   *
   * Registers providers as global singletons:
   *
   * 1. `TICKET_CONFIG` — the raw {@link TicketModuleOptions} object
   * 2. `TicketRepository` — HTTP-backed CRUD repository
   * 3. `TICKET_REPOSITORY` — token alias for TicketRepository
   * 4. `TicketService` — business logic service
   * 5. `TICKET_SERVICE` — token alias for TicketService
   *
   * The returned module is marked `global: true`, so these providers are
   * available throughout the application without re-importing.
   *
   * @param config - Ticket configuration (endpoint, isGlobal)
   * @returns A DynamicModule with all ticket providers registered and exported
   *
   * @example
   * ```typescript
   * @Module({
   *   imports: [
   *     TicketModule.forRoot({
   *       endpoint: '/api/tickets',
   *     }),
   *   ],
   * })
   * export class AppModule {}
   * ```
   */
  public static forRoot(config: TicketModuleOptions = {}): DynamicModule {
    const resolvedConfig: TicketModuleOptions = {
      endpoint: '/api/tickets',
      isGlobal: true,
      ...config,
    };

    return {
      module: TicketModule,
      global: resolvedConfig.isGlobal ?? true,
      providers: [
        // Config
        { provide: TICKET_CONFIG, useValue: resolvedConfig },

        // Repository (created by DI so @Inject decorators fire)
        { provide: TicketRepository, useClass: TicketRepository },
        { provide: TICKET_REPOSITORY, useExisting: TicketRepository },

        // Service (created by DI so @Inject decorators fire)
        { provide: TicketService, useClass: TicketService },
        { provide: TICKET_SERVICE, useExisting: TicketService },
      ],
      exports: [TICKET_CONFIG, TicketRepository, TICKET_REPOSITORY, TicketService, TICKET_SERVICE],
    };
  }
}
