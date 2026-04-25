/**
 * @stackra/react-ticket — Ticket Management for React
 *
 * CRUD-based ticket management package providing:
 * - DI module (`TicketModule.forRoot()`) with `@stackra/ts-container`
 * - Ticket model decorated with `@Resource` for auto-registration
 * - Repository layer (`TicketRepository`) extending `HttpRepository`
 * - Service layer (`TicketService`) extending `BaseService` with business logic
 * - Facade (`TicketFacade`) for static-style access
 * - TypeScript interfaces for Ticket, CreateTicketDto, UpdateTicketDto
 *
 * @module @stackra/react-ticket
 */

import 'reflect-metadata';

// ============================================================================
// Module
// ============================================================================

export { TicketModule } from './ticket.module';

// ============================================================================
// Models
// ============================================================================

export { TicketModel } from './models';

// ============================================================================
// Repositories
// ============================================================================

export { TicketRepository } from './repositories';

// ============================================================================
// Services
// ============================================================================

export { TicketService } from './services';

// ============================================================================
// Facades
// ============================================================================

export { TicketFacade } from './facades';

// ============================================================================
// Interfaces
// ============================================================================

export type { Ticket } from './interfaces';
export type { TicketModuleOptions } from './interfaces';
export type { CreateTicketDto } from './interfaces';
export type { UpdateTicketDto } from './interfaces';

// ============================================================================
// Constants & DI Tokens
// ============================================================================

export { TICKET_SERVICE, TICKET_REPOSITORY, TICKET_CONFIG } from './constants';
