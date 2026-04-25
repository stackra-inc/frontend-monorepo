/**
 * @fileoverview Generic constructor type alias.
 *
 * @module @stackra/react-refine
 * @category Types
 *
 * @example
 * ```typescript
 * import type { Type } from '@stackra/react-refine';
 *
 * function createInstance<T>(ctor: Type<T>): T {
 *   return new ctor();
 * }
 * ```
 */

/**
 * A constructor type that produces instances of `T`.
 *
 * Used throughout the DI system and `forFeature` to accept
 * class references that can be instantiated with `new`.
 *
 * @typeParam T - The instance type produced by the constructor.
 */
export type Type<T = any> = new (...args: any[]) => T;
