/**
 * Interfaces Barrel Export
 *
 * - {@link Ticket} — Core ticket entity interface
 * - {@link TicketModuleOptions} — Module configuration
 * - {@link CreateTicketDto} — Data for creating a ticket
 * - {@link UpdateTicketDto} — Data for updating a ticket
 *
 * @module interfaces
 */

export type { Ticket } from './ticket.interface';
export type { TicketModuleOptions } from './ticket-module-options.interface';
export type { CreateTicketDto } from './create-ticket-dto.interface';
export type { UpdateTicketDto } from './update-ticket-dto.interface';
