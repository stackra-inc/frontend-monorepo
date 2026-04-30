/**
 * @fileoverview Type Aliases Index
 *
 * Re-exports commonly used type aliases for convenience.
 * These are shorthand references to types defined in the interfaces.
 *
 * @module @stackra/ts-http
 * @category Types
 */

import type { HttpMiddlewareInterface } from '@/interfaces/http-middleware.interface';

/**
 * A middleware class constructor.
 * Used when registering middleware classes (not instances) in module providers.
 */
export type HttpMiddlewareClass = new (...args: any[]) => HttpMiddlewareInterface;
