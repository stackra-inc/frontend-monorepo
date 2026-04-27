/**
 * @stackra/ts-realtime
 *
 * Platform-agnostic Laravel Echo wrapper with DI module, typed channels,
 * reconnection, and React hooks for real-time WebSocket communication.
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
// Interfaces
// ---------------------------------------------------------------------------
export type { RealtimeConfig } from './interfaces/realtime-config.interface';
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
export { REALTIME_CONFIG, REALTIME_MANAGER } from './constants/tokens.constant';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
export { defaultRealtimeConfig } from './config/realtime.config';
