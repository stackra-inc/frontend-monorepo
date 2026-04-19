/**
 * @Channel Decorator
 *
 * Marks a subscriber class as belonging to a specific event channel.
 *
 * All metadata reads and writes go through `@vivtel/metadata` for a consistent,
 * typed API instead of raw `Reflect.*` calls.
 *
 * @module @stackra/ts-events
 * @category Decorators
 */

import { defineMetadata, getMetadata } from '@vivtel/metadata';

/** Metadata key for the @Channel decorator. */
export const CHANNEL_METADATA = Symbol.for('CHANNEL_METADATA');

/** Assigns a subscriber class to a specific event channel. */
export function Channel(channel: string): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function) => {
    defineMetadata(CHANNEL_METADATA, channel, target as object);
  };
}

/** Reads the channel name from a class decorated with @Channel. */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function getChannel(target: Function): string {
  return getMetadata<string>(CHANNEL_METADATA, target as object) ?? 'default';
}
