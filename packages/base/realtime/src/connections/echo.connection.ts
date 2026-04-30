/**
 * @fileoverview EchoConnection — RealtimeConnection implementation wrapping Laravel Echo.
 * @module @stackra/ts-realtime
 * @category Connections
 */

import Echo from 'laravel-echo';
import type { BroadcastDriver } from 'laravel-echo';

import { ConnectionStatus } from '../enums/connection-status.enum';
import type { RealtimeConnection } from '../interfaces/realtime-connection.interface';
import type { RealtimeConnectionConfig } from '../interfaces/realtime-connection-config.interface';
import { ChannelWrapper } from '../services/channel-wrapper.service';
import { PresenceChannelWrapper } from '../services/presence-channel-wrapper.service';

/**
 * Concrete `RealtimeConnection` implementation wrapping a Laravel Echo instance.
 *
 * Encapsulates all Echo-specific logic: instance creation, Pusher event binding,
 * connection status tracking with listener notification, exponential backoff
 * reconnection, channel/private/presence subscription with `ChannelWrapper` /
 * `PresenceChannelWrapper`, and channel re-subscription after reconnection.
 *
 * @description
 * Extracted from the original monolithic `RealtimeManager`. Created by
 * `LaravelEchoConnector.connect()` and managed by the refactored
 * `RealtimeManager` via `MultipleInstanceManager`.
 *
 * @example
 * ```typescript
 * const connection = new EchoConnection(config, 'main');
 * connection.connect();
 *
 * connection.channel('orders')
 *   .listen<OrderEvent>('.order.created', (data) => {
 *     console.log('New order:', data.id);
 *   });
 * ```
 */
export class EchoConnection implements RealtimeConnection {
  /** The Laravel Echo instance, or null when disconnected. */
  private echo: Echo<BroadcastDriver> | null = null;

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
   * Creates a new EchoConnection.
   *
   * @param config - The connection configuration
   * @param name - The connection name
   */
  constructor(
    private readonly config: RealtimeConnectionConfig,
    private readonly name: string
  ) {}

  // ---------------------------------------------------------------------------
  // RealtimeConnection interface
  // ---------------------------------------------------------------------------

  /**
   * Get the connection name.
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get the current connection status.
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Whether the connection is currently active.
   */
  isConnected(): boolean {
    return this.status === ConnectionStatus.Connected;
  }

  /**
   * The number of consecutive failed reconnection attempts.
   */
  get reconnectAttempts(): number {
    return this._reconnectAttempts;
  }

  /**
   * Register a listener for connection status changes.
   * Returns an unsubscribe function.
   */
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
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

    this.echo = new Echo(echoOptions as any);

    this._bindConnectionEvents();
  }

  /**
   * Disconnect the WebSocket and release all resources.
   *
   * Calls `echo.disconnect()`, clears all channel tracking maps, cancels
   * any pending reconnection timer, and sets the status to `Disconnected`.
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
  // Channel subscriptions
  // ---------------------------------------------------------------------------

  /**
   * Subscribe to a public Laravel Broadcasting channel.
   *
   * @param name - The channel name
   * @returns A ChannelWrapper for the channel
   * @throws {Error} If the connection is not connected
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
   * @param name - The channel name (without the `private-` prefix)
   * @returns A ChannelWrapper for the private channel
   * @throws {Error} If the connection is not connected
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
   * @param name - The channel name (without the `presence-` prefix)
   * @returns A PresenceChannelWrapper for the presence channel
   * @throws {Error} If the connection is not connected
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
   * Assert that the connection is connected before channel operations.
   * @internal
   */
  private _assertConnected(): void {
    if (!this.echo || this.status !== ConnectionStatus.Connected) {
      throw new Error(
        'EchoConnection is not connected. Check isConnected() or getStatus() before subscribing to channels.'
      );
    }
  }

  /**
   * Remove a public/private channel from tracking.
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
      this._resubscribeChannels();
    });

    connection.bind('disconnected', () => {
      if (this.status === ConnectionStatus.Disconnected) return;
      this._startReconnect();
    });

    connection.bind('error', (error: any) => {
      const err = error instanceof Error ? error : new Error(error?.message ?? 'Connection error');

      for (const wrapper of this.channels.values()) {
        wrapper._notifyError(err);
      }
      for (const wrapper of this.presenceChannels.values()) {
        wrapper._notifyError(err);
      }

      if (this.status === ConnectionStatus.Connecting) {
        this._startReconnect();
      }
    });
  }

  /**
   * Start the exponential backoff reconnection sequence.
   * @internal
   */
  private _startReconnect(): void {
    if (this.status === ConnectionStatus.Disconnected) return;

    this._setStatus(ConnectionStatus.Reconnecting);
    this._scheduleReconnect();
  }

  /**
   * Schedule a single reconnection attempt with exponential backoff.
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
   * @internal
   */
  private _attemptReconnect(): void {
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

    this.echo = new Echo(echoOptions as any);
    this._bindConnectionEvents();
  }

  /**
   * Cancel any pending reconnection timer.
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
   * @internal
   */
  private _resubscribeChannels(): void {
    if (!this.echo) return;

    for (const [name, wrapper] of this.channels.entries()) {
      if (wrapper.isLeft) {
        this.channels.delete(name);
        continue;
      }

      if (name.startsWith('private:')) {
        const channelName = name.slice('private:'.length);
        const echoChannel = this.echo.private(channelName);
        (wrapper as any).echoChannel = echoChannel;
      } else {
        const echoChannel = this.echo.channel(name);
        (wrapper as any).echoChannel = echoChannel;
      }
    }

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
