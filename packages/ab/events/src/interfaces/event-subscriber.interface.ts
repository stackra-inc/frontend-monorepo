/**
 * @fileoverview Event subscriber interface.
 *
 * An event subscriber is a class that subscribes to multiple events.
 *
 * @module @stackra/ts-events
 * @category Interfaces
 */

import type { Dispatcher } from './dispatcher.interface';
import type { EventListener } from './dispatcher.interface';

/**
 * An event subscriber — a class that subscribes to multiple events.
 */
export interface EventSubscriber {
  subscribe(dispatcher: Dispatcher): Record<string, EventListener> | void;
}
