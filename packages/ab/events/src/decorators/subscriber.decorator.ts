/**
 * @Subscriber Decorator
 *
 * Marks a class as an event subscriber.
 *
 * All metadata writes go through `@vivtel/metadata` for a consistent,
 * typed API instead of raw `Reflect.*` calls.
 *
 * @module @stackra/ts-events
 * @category Decorators
 */

import { defineMetadata } from '@vivtel/metadata';
import { EVENT_SUBSCRIBER_METADATA } from '@/constants';

/** Marks a class as an event subscriber for auto-discovery. */
export function Subscriber(): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function) => {
    defineMetadata(EVENT_SUBSCRIBER_METADATA, true, target as object);
  };
}
