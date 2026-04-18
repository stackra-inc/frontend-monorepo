/**
 * Middleware Barrel Export
 *
 * Centralized entry point for HTTP middleware integrations.
 *
 * - {@link LocaleMiddleware} — Injects locale headers on requests and syncs from responses
 *
 * @module middleware
 */

export { LocaleMiddleware } from './locale.middleware';
