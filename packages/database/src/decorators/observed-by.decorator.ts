/**
 * @file observed-by.decorator.ts
 * @description Class decorator that registers an Observer class for a Model.
 *
 * The `@ObservedBy` decorator appends the given Observer class to the `observers` array
 * in MetadataStorage. Multiple `@ObservedBy` decorators can be stacked on a single class.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers an Observer class that listens to lifecycle events on this Model.
 *
 * Multiple observers can be registered by stacking `@ObservedBy` decorators.
 * Observers are invoked in the order they are registered.
 *
 * @param observerClass - The Observer class constructor.
 * @returns A class decorator function.
 *
 * @example
 * ```ts
 * @ObservedBy(UserObserver)
 * @ObservedBy(AuditObserver)
 * class User extends Model {
 *   // UserObserver and AuditObserver will receive lifecycle events
 * }
 * ```
 */
export function ObservedBy(observerClass: new (...args: any[]) => any) {
  return function (target: Function) {
    const storage = MetadataStorage.getInstance();
    const existing = storage.getClassMetadata(target);
    const observers = [...existing.observers, observerClass];
    storage.registerClassMetadata(target, 'observers', observers);
  };
}
