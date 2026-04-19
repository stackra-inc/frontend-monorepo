/**
 * Event Facade
 *
 * Typed proxy for {@link EventManager} from `@stackra-inc/ts-events`.
 *
 * Event dispatcher manager. Manages named dispatchers (memory, redis, null).
 *
 * The facade is a module-level constant typed as `EventManager`.
 * It lazily resolves the service from the DI container on first property
 * access — safe to use at module scope before bootstrap completes.
 *
 * ## Setup (once, in main.tsx)
 *
 * ```typescript
 * import { Application } from '@stackra-inc/ts-container';
 * import { Facade } from '@stackra-inc/ts-support';
 *
 * const app = await Application.create(AppModule);
 * Facade.setApplication(app); // wires all facades
 * ```
 *
 * ## Usage
 *
 * ```typescript
 * import { EventFacade } from '@stackra-inc/ts-events';
 *
 * // Full autocomplete — no .proxy() call needed
 * EventFacade.dispatcher();
 * ```
 *
 * ## Available methods (from {@link EventManager})
 *
 * - `dispatcher(name?: string): EventService`
 * - `extend(driver: string, creator: DriverCreator<Dispatcher>): this`
 * - `getDefaultInstance(): string`
 *
 * ## Testing — swap in a mock
 *
 * ```typescript
 * import { Facade } from '@stackra-inc/ts-support';
 * import { EVENT_MANAGER } from '@/constants/tokens.constant';
 *
 * // Before test — replace the resolved instance
 * Facade.swap(EVENT_MANAGER, mockInstance);
 *
 * // After test — restore
 * Facade.clearResolvedInstances();
 * ```
 *
 * @module facades/event
 * @see {@link EventManager} — the underlying service
 * @see {@link Facade} — the base class providing `make()`
 */

import { Facade } from '@stackra-inc/ts-support';
import { EventManager } from '@/services/event-manager.service';
import { EVENT_MANAGER } from '@/constants/tokens.constant';

/**
 * EventFacade — typed proxy for {@link EventManager}.
 *
 * Resolves `EventManager` from the DI container via the `EVENT_MANAGER` token.
 * All property and method access is forwarded to the resolved instance
 * with correct `this` binding.
 *
 * Call `Facade.setApplication(app)` once during bootstrap before using this.
 *
 * @example
 * ```typescript
 * EventFacade.dispatcher();
 * ```
 */
export const EventFacade: EventManager = Facade.make<EventManager>(EVENT_MANAGER);
