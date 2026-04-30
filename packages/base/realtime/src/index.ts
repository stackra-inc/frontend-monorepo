/**
 * @stackra/ts-realtime
 *
 * Platform-agnostic realtime WebSocket framework with DI module, typed channels,
 * multi-connection support, reconnection, and React hooks for real-time
 * WebSocket communication.
 *
 * @example
 * ```typescript
 * import {
 *   RealtimeModule,
 *   RealtimeFacade,
 *   useChannel,
 *   usePresence,
 *   useRealtime,
 *   ConnectionStatus,
 * } from '@stackra/ts-realtime';
 * ```
 *
 * @module @stackra/ts-realtime
 */

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------
export { RealtimeModule } from './realtime.module';

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
export { RealtimeManager } from './services/realtime-manager.service';
export { ChannelWrapper } from './services/channel-wrapper.service';
export { PresenceChannelWrapper } from './services/presence-channel-wrapper.service';

// ---------------------------------------------------------------------------
// Connections
// ---------------------------------------------------------------------------
export { EchoConnection } from './connections/echo.connection';

// ---------------------------------------------------------------------------
// Connectors
// ---------------------------------------------------------------------------
export { LaravelEchoConnector } from './connectors/laravel-echo.connector';

// ---------------------------------------------------------------------------
// Facades
// ---------------------------------------------------------------------------
export { RealtimeFacade } from './facades/realtime.facade';

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export { useChannel } from './hooks/use-channel.hook';
export { usePresence } from './hooks/use-presence.hook';
export { useRealtime } from './hooks/use-realtime.hook';

// ---------------------------------------------------------------------------
// Interfaces (type-only exports)
// ---------------------------------------------------------------------------
export type { RealtimeConfig } from './interfaces/realtime-config.interface';
export type { RealtimeConnection } from './interfaces/realtime-connection.interface';
export type { RealtimeConnector } from './interfaces/realtime-connector.interface';
export type { RealtimeConnectionConfig } from './interfaces/realtime-connection-config.interface';
export type { UseChannelReturn } from './hooks/use-channel.hook';
export type { UsePresenceReturn } from './hooks/use-presence.hook';
export type { UseRealtimeReturn } from './hooks/use-realtime.hook';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export { ConnectionStatus } from './enums/connection-status.enum';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export { REALTIME_CONFIG, REALTIME_MANAGER, REALTIME_CONNECTOR } from './constants/tokens.constant';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
export { defaultRealtimeConfig } from './config/realtime.config';

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------
export { defineConfig } from './utils';
