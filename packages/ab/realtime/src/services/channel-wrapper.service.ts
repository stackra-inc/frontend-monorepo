/**
 * @fileoverview ChannelWrapper service for typed Laravel Echo channel subscriptions.
 * @module @stackra/ts-realtime
 * @category Services
 */

/**
 * Typed wrapper around a Laravel Echo channel subscription.
 *
 * Provides a fluent API for listening to broadcast events with generic type
 * parameters, error handling, and automatic cleanup via `leave()`. When
 * `leave()` is called, the wrapper notifies the `RealtimeManager` to remove
 * the channel from its internal tracking map.
 *
 * @description
 * Created internally by `RealtimeManager.channel()` and
 * `RealtimeManager.private()`. Consumers interact with this class through
 * the manager or via React hooks — direct instantiation is not typical.
 *
 * @example
 * ```typescript
 * import { RealtimeFacade } from '@stackra/ts-realtime';
 *
 * const channel = RealtimeFacade.channel('orders');
 *
 * channel
 *   .listen<OrderEvent>('.order.created', (data) => {
 *     console.log('New order:', data.id);
 *   })
 *   .onError((error) => {
 *     console.error('Channel error:', error.message);
 *   });
 *
 * // Later, unsubscribe from the channel entirely
 * channel.leave();
 * ```
 */
export class ChannelWrapper {
  /** Whether this channel has been left. */
  private _left = false;

  /** Registered error callbacks. */
  private readonly _errorCallbacks = new Set<(error: Error) => void>();

  /**
   * Creates a new ChannelWrapper.
   *
   * @param echoChannel - The underlying Laravel Echo channel object
   * @param channelName - The name of the channel
   * @param onLeave - Callback invoked when `leave()` is called, used by the manager to remove tracking
   */
  constructor(
    private readonly echoChannel: any,
    private readonly channelName: string,
    private readonly onLeave: (name: string) => void
  ) {}

  /**
   * Register a typed event listener on this channel.
   *
   * Delegates to the underlying Echo channel's `listen()` method. Throws
   * if the channel has already been left.
   *
   * @template T - The expected event payload type
   * @param event - The broadcast event name (e.g., `'.order.created'`)
   * @param callback - Handler invoked with the typed event data
   * @returns This wrapper for method chaining
   * @throws {Error} If the channel has been left
   *
   * @example
   * ```typescript
   * channel.listen<OrderEvent>('.order.created', (data) => {
   *   console.log(data.id);
   * });
   * ```
   */
  listen<T>(event: string, callback: (data: T) => void): ChannelWrapper {
    if (this._left) {
      throw new Error(`Cannot listen on channel "${this.channelName}" — it has been left.`);
    }

    this.echoChannel.listen(event, callback);
    return this;
  }

  /**
   * Remove a specific event listener from this channel.
   *
   * Delegates to the underlying Echo channel's `stopListening()` method.
   *
   * @param event - The broadcast event name to stop listening to
   * @returns This wrapper for method chaining
   *
   * @example
   * ```typescript
   * channel.stopListening('.order.created');
   * ```
   */
  stopListening(event: string): ChannelWrapper {
    this.echoChannel.stopListening(event);
    return this;
  }

  /**
   * Register an error callback for this channel.
   *
   * Error callbacks are invoked when the channel encounters an error,
   * such as an authentication failure on a private or presence channel.
   * The callback is also bound to the underlying Echo channel's error event
   * so that transport-level errors are surfaced automatically.
   *
   * @param callback - Handler invoked with the error
   * @returns This wrapper for method chaining
   *
   * @example
   * ```typescript
   * channel.onError((error) => {
   *   console.error('Auth failed:', error.message);
   * });
   * ```
   */
  onError(callback: (error: Error) => void): ChannelWrapper {
    this._errorCallbacks.add(callback);

    // Bind to the underlying Echo channel error event if available
    if (typeof this.echoChannel.error === 'function') {
      this.echoChannel.error((error: any) => {
        const err = error instanceof Error ? error : new Error(error?.message ?? 'Channel error');
        callback(err);
      });
    }

    return this;
  }

  /**
   * Leave this channel, unsubscribing from all events.
   *
   * Notifies the manager to remove this channel from its internal tracking
   * and marks the wrapper as left. Subsequent calls to `listen()` will throw.
   *
   * @example
   * ```typescript
   * channel.leave();
   * ```
   */
  leave(): void {
    if (this._left) return;
    this._left = true;
    this.onLeave(this.channelName);
  }

  /**
   * The name of this channel.
   *
   * @returns The channel name string
   *
   * @example
   * ```typescript
   * const channel = manager.channel('orders');
   * console.log(channel.name); // 'orders'
   * ```
   */
  get name(): string {
    return this.channelName;
  }

  /**
   * Whether this channel has been left.
   *
   * @returns `true` if `leave()` has been called
   */
  get isLeft(): boolean {
    return this._left;
  }

  /**
   * Notify all registered error callbacks.
   *
   * @param error - The error to propagate
   * @internal
   */
  _notifyError(error: Error): void {
    for (const cb of this._errorCallbacks) {
      cb(error);
    }
  }
}
