/**
 * Realtime Facade
 *
 * Typed proxy for {@link RealtimeManager} from `@stackra/ts-realtime`.
 *
 * Core singleton managing the Laravel Echo WebSocket connection, channel
 * subscriptions, reconnection, and observable connection state.
 *
 * The facade is a module-level constant typed as `RealtimeManager`.
 * It lazily resolves the service from the DI container on first property
 * access — safe to use at module scope before bootstrap completes.
 *
 * ## Setup (once, in main.tsx)
 *
 * ```typescript
 * import { Application } from '@stackra/ts-container';
 * import { Facade } from '@stackra/ts-support';
 *
 * const app = await Application.create(AppModule);
 * Facade.setApplication(app); // wires all facades
 * ```
 *
 * ## Usage
 *
 * ```typescript
 * import { RealtimeFacade } from '@stackra/ts-realtime';
 *
 * // Subscribe to a public channel
 * RealtimeFacade.channel('orders')
 *   .listen<OrderEvent>('.order.created', (data) => {
 *     console.log('New order:', data.id);
 *   });
 *
 * // Join a presence channel
 * RealtimeFacade.join('chat-room.1')
 *   .here<User>((members) => console.log('Online:', members));
 *
 * // Check connection status
 * if (RealtimeFacade.isConnected()) {
 *   console.log('WebSocket is active');
 * }
 * ```
 *
 * ## Available methods (from {@link RealtimeManager})
 *
 * - `connect(): void`
 * - `disconnect(): void`
 * - `channel(name: string): ChannelWrapper`
 * - `private(name: string): ChannelWrapper`
 * - `join(name: string): PresenceChannelWrapper`
 * - `getStatus(): ConnectionStatus`
 * - `onStatusChange(cb): () => void`
 * - `isConnected(): boolean`
 *
 * ## Testing — swap in a mock
 *
 * ```typescript
 * import { Facade } from '@stackra/ts-support';
 * import { REALTIME_MANAGER } from '@stackra/ts-realtime';
 *
 * // Before test — replace the resolved instance
 * Facade.swap(REALTIME_MANAGER, mockInstance);
 *
 * // After test — restore
 * Facade.clearResolvedInstances();
 * ```
 *
 * @module facades/realtime
 * @see {@link RealtimeManager} — the underlying service
 * @see {@link Facade} — the base class providing `make()`
 */

import { Facade } from '@stackra/ts-support';
import { RealtimeManager } from '../services/realtime-manager.service';
import { REALTIME_MANAGER } from '../constants/tokens.constant';

/**
 * RealtimeFacade — typed proxy for {@link RealtimeManager}.
 *
 * Resolves `RealtimeManager` from the DI container via the `REALTIME_MANAGER` token.
 * All property and method access is forwarded to the resolved instance
 * with correct `this` binding.
 *
 * Call `Facade.setApplication(app)` once during bootstrap before using this.
 *
 * @example
 * ```typescript
 * RealtimeFacade.channel('orders')
 *   .listen<OrderEvent>('.order.created', (data) => {
 *     console.log(data);
 *   });
 * ```
 */
export const RealtimeFacade: RealtimeManager = Facade.make<RealtimeManager>(REALTIME_MANAGER);
