/**
 * @OnEvent Decorator
 *
 * Marks a method as an event listener. When the class is registered as a
 * subscriber, the decorated method is automatically bound to the specified
 * event name.
 *
 * All metadata reads and writes go through `@vivtel/metadata` for a consistent,
 * typed API instead of raw `Reflect.*` calls.
 *
 * @module @stackra/ts-events
 * @category Decorators
 *
 * @example
 * ```typescript
 * import { Injectable } from '@stackra/ts-container';
 * import { OnEvent, EventPriority } from '@stackra/ts-events';
 *
 * @Injectable()
 * export class UserListener {
 *   @OnEvent('user.created')
 *   handleUserCreated(payload: { userId: string }) {
 *     console.log('User created:', payload.userId);
 *   }
 *
 *   @OnEvent('user.*', { priority: EventPriority.HIGH })
 *   handleAllUserEvents(eventName: string, payload: unknown) {
 *     console.log(`Event: ${eventName}`, payload);
 *   }
 *
 *   @OnEvent('order.completed', { once: true })
 *   handleFirstOrder(payload: unknown) {
 *     console.log('First order completed!');
 *   }
 * }
 * ```
 */

import { updateMetadata } from '@vivtel/metadata';
import { ON_EVENT_METADATA } from '@/constants';
import type { OnEventOptions, OnEventMetadata } from '@/types';

/**
 * Decorator that marks a method as an event listener.
 *
 * @param event - The event name or wildcard pattern to listen for.
 * @param options - Optional listener options (priority, once).
 * @returns A method decorator.
 */
export function OnEvent(event: string, options: OnEventOptions = {}): MethodDecorator {
  return (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
    updateMetadata(
      ON_EVENT_METADATA,
      [] as OnEventMetadata[],
      (existing) => [...existing, { event, method: String(propertyKey), options }],
      target.constructor as object
    );
  };
}
