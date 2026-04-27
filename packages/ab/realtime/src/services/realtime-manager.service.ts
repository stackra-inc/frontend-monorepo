/**
 * @fileoverview RealtimeManager service — core singleton managing Laravel Echo lifecycle.
 * @module @stackra/ts-realtime
 * @category Services
 */

import { Injectable, Inject } from '@stackra/ts-container';
import type { OnModuleInit, OnModuleDestroy } from '@stackra/ts-container';
import Echo from 'laravel-echo';

import { REALTIME_CONFIG } from '../constants/tokens.constant';
import { ConnectionStatus } from '../enums/connection-status.enum';
import type { RealtimeConfig } from '../interfaces/realtime-config.interface';
import { ChannelWrapper } from './channel-wrapper.service';
import { PresenceChannelWrapper } from './presence-channel-wrapper.service';

/**
 * Core singleton service managing the Laravel Echo WebSocket connection.
 *
 * Handles connection lifecycle (connect, disconnect, reconnect with exponential
 * backoff), exposes observable connection state, and provides typed channel
 * subscription methods for public, private, and presence channels.
 *
 * @description
 * Registered by `RealtimeModule.forRoot()` and available globally via DI
 * injection, the `RealtimeFacade`, or React hooks (`useChannel`,
 * `usePresence`, `useRealtime`).
 *
 * Implements `OnModuleInit` to auto-connect during bootstrap and
 * `OnModuleDestroy` to auto-disconnect during shutdown.
 *
 * @example
 * ```typescript
 * import { RealtimeManager, ConnectionStatus } from '@stackra/ts-realtime';
 * import { Inject } from '@stackra/ts-container';
 *
 * class OrderService {
 *   constructor(@Inject(RealtimeManager) private readonly realtime: RealtimeManager) {}
 *
 *   subscribeToOrders() {
 *     this.realtime.channel('orders')
 *       .listen<OrderEvent>('.order.created', (data) => {
 *         console.log('New order:', data.id);
 *       });
 *   }
 * }
 * ```
 */
@Injectable()
export class RealtimeManager implements OnModuleInit, OnModuleDestroy {
  /** The Laravel Echo instance, or null when disconnected. */
  private echo: Echo | null = null;

  /** Current connection status. */
  private status: ConnectionStatus = ConnectionStatus.Disconnected;

  /** Registered status change listeners. */
  private readonly listeners = new Set<(status: ConnectionStatus) => void>();

  /** Active public and private channel subscriptions. */
  private readonly channels = new Map<string, ChannelWrapper>();

  /** Active presence channel subscriptions. */
  private readonly presenceChannels = new Map<string, PresenceChannelWrapper>();

  /** Pending reconnection timer. */
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  /** Consecutive failed reconnection attempts since last successful connection. */
  private _reconnectAttempts = 0;

  /**
   * Creates a new RealtimeManager.
   *
   * @param config - The realtime configuration provided by `RealtimeModule.forRoot()`
   */
  constructor(@Inject(REALTIME_CONFIG) private readonly config: RealtimeConfig) {}

  // ---------------------------------------------------------------------------
  // Lifecycle hooks
  // ---------------------------------------------------------------------------

  /**
   * Called automatically by the DI container during application bootstrap.
   * Initiates the WebSocket connection.
   */
  onModuleInit(): void {
    this.connect();
  }

  /**
   * Called automatically by the DI container during application shutdown.
   * Disconnects the WebSocket and releases all resources.
   */
  onModuleDestroy(): void {
    this.disconnect();
  }

  // ---------------------------------------------------------------------------
  // Connection lifecycle
  // ---------------------------------------------------------------------------

  /**
   * Establish the WebSocket connection via Laravel Echo.
   *
   * Creates a new Echo instance with the provided configuration, sets the
   * status to `Connecting`, and binds to Pusher connection events to track
   * state transitions.
   *
   * @example
   * ```typescript
   * manager.connect();
   * ```
   */
  connect(): void {
    if (this.echo) return;

    this._setStatus(ConnectionStatus.Connecting);

    const echoOptions: Record<string, any> = {
      broadcaster: this.config.driver,
      key: this.config.key,
      wsHost: this.config.wsHost,
      wsPort: this.config.wsPort,
      forceTLS: this.config.forceTLS ?? false,
      cluster: this.config.cluster ?? 'mt1',
      encrypted: this.config.encrypted ?? false,
      disableStats: this.config.disableStats ?? true,
      enabledTransports: ['ws', 'wss'],
      auth: { headers: this.config.authHeaders ?? {} },
      authEndpoint: this.config.authEndpoint,
      ...(this.config.client ? { client: this.config.client } : {}),
    };

    this.echo = new Echo(echoOptions);

    this._bindConnectionEvents();
  }

  /**
   * Disconnect the WebSocket and release all resources.
   *
   * Calls `echo.disconnect()`, clears all channel tracking maps, cancels
   * any pending reconnection timer, and sets the status to `Disconnected`.
   *
   * @example
   * ```typescript
   * manager.disconnect();
   * ```
   */
  disconnect(): void {
    this._cancelReconnect();

    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
    }

    this.channels.clear();
    this.presenceChannels.clear();
    this._reconnectAttempts = 0;
    this._setStatus(ConnectionStatus.Disconnected);
  }

  // ---------------------------------------------------------------------------
  // Status
  // ---------------------------------------------------------------------------

  /**
   * Get the current connection status.
   *
   * @returns The current {@link ConnectionStatus}
   *
   * @example
   * ```typescript
   * if (manager.getStatus() === ConnectionStatus.Connected) {
   *   console.log('Ready');
   * }
   * ```
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Register a listener for connection status changes.
   *
   * The callback is invoked synchronously whenever the status transitions.
   * Returns an unsubscribe function to remove the listener.
   *
   * @param callback - Handler invoked with the new status
   * @returns A function that removes the listener when called
   *
   * @example
   * ```typescript
   * const unsubscribe = manager.onStatusChange((status) => {
   *   console.log('Status:', status);
   * });
   *
   * // Later
   * unsubscribe();
   * ```
   */
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Check whether the WebSocket is currently connected.
   *
   * @returns `true` if the current status is `ConnectionStatus.Connected`
   *
   * @example
   * ```typescript
   * if (manager.isConnected()) {
   *   manager.channel('orders');
   * }
   * ```
   */
  isConnected(): boolean {
    return this.status === ConnectionStatus.Connected;
  }

  /**
   * The number of consecutive failed reconnection attempts since the last
   * successful connection.
   */
  get reconnectAttempts(): number {
    return this._reconnectAttempts;
  }

  // ---------------------------------------------------------------------------
  // Channel subscriptions
  // ---------------------------------------------------------------------------

  /**
   * Subscribe to a public Laravel Broadcasting channel.
   *
   * Returns an existing wrapper if the channel is already subscribed,
   * otherwise creates a new subscription via `echo.channel(name)`.
   *
   * @param name - The channel name
   * @returns A {@link ChannelWrapper} for the channel
   * @throws {Error} If the manager is not connected
   *
   * @example
   * ```typescript
   * const channel = manager.channel('orders');
   * channel.listen<OrderEvent>('.order.created', (data) => {
   *   console.log(data);
   * });
   * ```
   */
  channel(name: string): ChannelWrapper {
    this._assertConnected();

    const existing = this.channels.get(name);
    if (existing) return existing;

    const echoChannel = this.echo!.channel(name);
    const wrapper = new ChannelWrapper(echoChannel, name, (n) => this._removeChannel(n));
    this.channels.set(name, wrapper);
    return wrapper;
  }

  /**
   * Subscribe to a private Laravel Broadcasting channel.
   *
   * Returns an existing wrapper if the channel is already subscribed,
   * otherwise creates a new subscription via `echo.private(name)`.
   *
   * @param name - The channel name (without the `private-` prefix)
   * @returns A {@link ChannelWrapper} for the private channel
   * @throws {Error} If the manager is not connected
   *
   * @example
   * ```typescript
   * const channel = manager.private('user.1');
   * channel
   *   .listen<NotificationEvent>('.notification', (data) => {
   *     console.log(data);
   *   })
   *   .onError((error) => {
   *     console.error('Auth failed:', error.message);
   *   });
   * ```
   */
  private(name: string): ChannelWrapper {
    this._assertConnected();

    const existing = this.channels.get(`private:${name}`);
    if (existing) return existing;

    const echoChannel = this.echo!.private(name);
    const wrapper = new ChannelWrapper(echoChannel, `private:${name}`, (n) =>
      this._removeChannel(n)
    );
    this.channels.set(`private:${name}`, wrapper);
    return wrapper;
  }

  /**
   * Join a presence Laravel Broadcasting channel.
   *
   * Returns an existing wrapper if the channel is already joined,
   * otherwise creates a new subscription via `echo.join(name)`.
   *
   * @param name - The channel name (without the `presence-` prefix)
   * @returns A {@link PresenceChannelWrapper} for the presence channel
   * @throws {Error} If the manager is not connected
   *
   * @example
   * ```typescript
   * const presence = manager.join('chat-room.1');
   * presence
   *   .here<User>((members) => console.log('Online:', members))
   *   .joining<User>((member) => console.log(`${member.name} joined`))
   *   .leaving<User>((member) => console.log(`${member.name} left`));
   * ```
   */
  join(name: string): PresenceChannelWrapper {
    this._assertConnected();

    const existing = this.presenceChannels.get(name);
    if (existing) return existing;

    const echoChannel = this.echo!.join(name);
    const wrapper = new PresenceChannelWrapper(echoChannel, name, (n) =>
      this._removePresenceChannel(n)
    );
    this.presenceChannels.set(name, wrapper);
    return wrapper;
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * Update the connection status and notify all listeners.
   *
   * @param newStatus - The new connection status
   * @internal
   */
  private _setStatus(newStatus: ConnectionStatus): void {
    if (this.status === newStatus) return;
    this.status = newStatus;
    for (const listener of this.listeners) {
      listener(newStatus);
    }
  }

  /**
   * Assert that the manager is connected before channel operations.
   *
   * @throws {Error} If the manager is not connected
   * @internal
   */
  private _assertConnected(): void {
    if (!this.echo || this.status !== ConnectionStatus.Connected) {
      throw new Error(
        'RealtimeManager is not connected. Check isConnected() or getStatus() before subscribing to channels.'
      );
    }
  }

  /**
   * Remove a public/private channel from tracking.
   *
   * Called by `ChannelWrapper.leave()` via the `onLeave` callback.
   *
   * @param name - The channel name (may include `private:` prefix)
   * @internal
   */
  private _removeChannel(name: string): void {
    this.channels.delete(name);
    if (this.echo) {
      this.echo.leave(name);
    }
  }

  /**
   * Remove a presence channel from tracking.
   *
   * Called by `PresenceChannelWrapper.leave()` via the `onLeave` callback.
   *
   * @param name - The channel name
   * @internal
   */
  private _removePresenceChannel(name: string): void {
    this.presenceChannels.delete(name);
    if (this.echo) {
      this.echo.leave(name);
    }
  }

  /**
   * Bind to Pusher connection events for state tracking and reconnection.
   *
   * @internal
   */
  private _bindConnectionEvents(): void {
    if (!this.echo) return;

    const pusher = (this.echo as any).connector?.pusher;
    if (!pusher?.connection) return;

    const connection = pusher.connection;

    connection.bind('connected', () => {
      this._reconnectAttempts = 0;
      this._setStatus(ConnectionStatus.Connected);

      // Re-subscribe channels after reconnection
      this._resubscribeChannels();
    });

    connection.bind('disconnected', () => {
      if (this.status === ConnectionStatus.Disconnected) return;
      this._startReconnect();
    });

    connection.bind('error', (error: any) => {
      // Notify channel error callbacks
      const err = error instanceof Error ? error : new Error(error?.message ?? 'Connection error');

      for (const wrapper of this.channels.values()) {
        wrapper._notifyError(err);
      }
      for (const wrapper of this.presenceChannels.values()) {
        wrapper._notifyError(err);
      }

      // If we were connecting and not yet connected, start reconnect or error
      if (this.status === ConnectionStatus.Connecting) {
        this._startReconnect();
      }
    });
  }

  /**
   * Start the exponential backoff reconnection sequence.
   *
   * @internal
   */
  private _startReconnect(): void {
    if (this.status === ConnectionStatus.Disconnected) return;

    this._setStatus(ConnectionStatus.Reconnecting);
    this._scheduleReconnect();
  }

  /**
   * Schedule a single reconnection attempt with exponential backoff.
   *
   * @internal
   */
  private _scheduleReconnect(): void {
    const initialDelay = this.config.reconnectInitialDelay ?? 1000;
    const multiplier = this.config.reconnectMultiplier ?? 2;
    const maxDelay = this.config.reconnectMaxDelay ?? 30000;

    const delay = Math.min(initialDelay * Math.pow(multiplier, this._reconnectAttempts), maxDelay);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this._reconnectAttempts++;
      this._attemptReconnect();
    }, delay);
  }

  /**
   * Attempt a single reconnection by tearing down and re-creating Echo.
   *
   * @internal
   */
  private _attemptReconnect(): void {
    // Tear down existing Echo without clearing channel maps
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
    }

    this._setStatus(ConnectionStatus.Connecting);

    const echoOptions: Record<string, any> = {
      broadcaster: this.config.driver,
      key: this.config.key,
      wsHost: this.config.wsHost,
      wsPort: this.config.wsPort,
      forceTLS: this.config.forceTLS ?? false,
      cluster: this.config.cluster ?? 'mt1',
      encrypted: this.config.encrypted ?? false,
      disableStats: this.config.disableStats ?? true,
      enabledTransports: ['ws', 'wss'],
      auth: { headers: this.config.authHeaders ?? {} },
      authEndpoint: this.config.authEndpoint,
      ...(this.config.client ? { client: this.config.client } : {}),
    };

    this.echo = new Echo(echoOptions);
    this._bindConnectionEvents();
  }

  /**
   * Cancel any pending reconnection timer.
   *
   * @internal
   */
  private _cancelReconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Re-subscribe all tracked channels after a successful reconnection.
   *
   * @internal
   */
  private _resubscribeChannels(): void {
    if (!this.echo) return;

    // Re-subscribe public/private channels
    for (const [name, wrapper] of this.channels.entries()) {
      if (wrapper.isLeft) {
        this.channels.delete(name);
        continue;
      }

      // Determine if this is a private channel by the stored key prefix
      if (name.startsWith('private:')) {
        const channelName = name.slice('private:'.length);
        const echoChannel = this.echo.private(channelName);
        // Update the internal echo channel reference
        (wrapper as any).echoChannel = echoChannel;
      } else {
        const echoChannel = this.echo.channel(name);
        (wrapper as any).echoChannel = echoChannel;
      }
    }

    // Re-subscribe presence channels
    for (const [name, wrapper] of this.presenceChannels.entries()) {
      if (wrapper.isLeft) {
        this.presenceChannels.delete(name);
        continue;
      }

      const echoChannel = this.echo.join(name);
      (wrapper as any).echoChannel = echoChannel;
    }
  }
}
