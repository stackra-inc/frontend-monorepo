/**
 * Reconnection & Error Handling Example
 *
 * |--------------------------------------------------------------------------
 * | @stackra/ts-realtime — Reconnection & Error Handling
 * |--------------------------------------------------------------------------
 * |
 * | This example demonstrates handling connection failures:
 * | - Exponential backoff reconnection
 * | - Configuring reconnection parameters
 * | - Connection status transitions
 * | - Channel error callbacks
 * | - Automatic channel re-subscription after reconnect
 * | - Manual reconnection
 * |
 * | The RealtimeManager handles reconnection automatically using
 * | exponential backoff. Channels are re-subscribed after recovery.
 * |
 * | NOTE: This file shows the code patterns — it won't run standalone
 * | because it requires a WebSocket server (Soketi/Pusher).
 * |
 * | @example
 * | ```bash
 * | npx ts-node .examples/04-reconnection-and-errors.ts
 * | ```
 * |
 */

import { RealtimeModule, RealtimeManager, ConnectionStatus } from '@stackra/ts-realtime';

// ─── Example 1: Exponential Backoff Reconnection ────────────────────────────
//
// When the WebSocket connection drops, the manager automatically
// attempts to reconnect using exponential backoff.
//

function exponentialBackoff() {
  console.log('\n=== Example 1: Exponential Backoff Reconnection ===\n');

  /*
  |--------------------------------------------------------------------------
  | Automatic reconnection with exponential backoff.
  |--------------------------------------------------------------------------
  |
  | When the connection drops (not an explicit disconnect()):
  |   1. Status transitions to Reconnecting
  |   2. Manager waits initialDelay * multiplier^attempts ms
  |   3. Tears down the old Echo instance
  |   4. Creates a new Echo instance and re-binds events
  |   5. On success: status → Connected, channels re-subscribed
  |   6. On failure: increment attempts, schedule next retry
  |
  | Default backoff schedule:
  |   Attempt 0: 1000ms  (1s)
  |   Attempt 1: 2000ms  (2s)
  |   Attempt 2: 4000ms  (4s)
  |   Attempt 3: 8000ms  (8s)
  |   Attempt 4: 16000ms (16s)
  |   Attempt 5: 30000ms (30s — capped at maxDelay)
  |
  | The attempt counter resets to 0 on successful connection.
  |
  */
  console.log('  // Default reconnection config:');
  console.log('  RealtimeModule.forRoot({');
  console.log("    driver: 'pusher',");
  console.log("    key: 'app-key',");
  console.log("    wsHost: 'ws.example.com',");
  console.log('    wsPort: 6001,');
  console.log("    authEndpoint: '/broadcasting/auth',");
  console.log('    // Reconnection defaults:');
  console.log('    reconnectInitialDelay: 1000,   // 1s initial delay');
  console.log('    reconnectMaxDelay: 30000,      // 30s max delay');
  console.log('    reconnectMultiplier: 2,        // double each attempt');
  console.log('  })');
  console.log('');
  console.log('  // Backoff formula:');
  console.log('  // delay = min(initialDelay * multiplier^attempts, maxDelay)');
  console.log('');
  console.log('  ✓ Exponential backoff demonstrated');
}

// ─── Example 2: Custom Reconnection Config ──────────────────────────────────
//
// Customize the reconnection behavior for your use case.
//

function customReconnectionConfig() {
  console.log('\n=== Example 2: Custom Reconnection Config ===\n');

  /*
  |--------------------------------------------------------------------------
  | Custom reconnection parameters.
  |--------------------------------------------------------------------------
  |
  | Adjust the backoff for different environments:
  |   - Development: fast retries (500ms initial, 5s max)
  |   - Production: conservative retries (2s initial, 60s max)
  |   - Mobile: aggressive retries with lower multiplier
  |
  */
  console.log('  // Development — fast retries:');
  console.log('  RealtimeModule.forRoot({');
  console.log("    driver: 'pusher',");
  console.log("    key: 'dev-key',");
  console.log("    wsHost: 'localhost',");
  console.log('    wsPort: 6001,');
  console.log("    authEndpoint: '/broadcasting/auth',");
  console.log('    reconnectInitialDelay: 500,    // 500ms');
  console.log('    reconnectMaxDelay: 5000,       // 5s max');
  console.log('    reconnectMultiplier: 1.5,      // gentler backoff');
  console.log('  })');
  console.log('');
  console.log('  // Production — conservative:');
  console.log('  RealtimeModule.forRoot({');
  console.log("    driver: 'pusher',");
  console.log("    key: 'prod-key',");
  console.log("    wsHost: 'ws.production.com',");
  console.log('    wsPort: 443,');
  console.log("    authEndpoint: '/broadcasting/auth',");
  console.log('    forceTLS: true,');
  console.log('    reconnectInitialDelay: 2000,   // 2s');
  console.log('    reconnectMaxDelay: 60000,      // 60s max');
  console.log('    reconnectMultiplier: 2,        // standard doubling');
  console.log('  })');
  console.log('');
  console.log('  ✓ Custom reconnection config demonstrated');
}

// ─── Example 3: Connection Status Transitions ───────────────────────────────
//
// Understanding the full state machine for connection status.
//

function statusTransitions() {
  console.log('\n=== Example 3: Connection Status Transitions ===\n');

  /*
  |--------------------------------------------------------------------------
  | Connection status state machine.
  |--------------------------------------------------------------------------
  |
  | Normal connection:
  |   Disconnected → Connecting → Connected
  |
  | Connection drop + recovery:
  |   Connected → Reconnecting → Connecting → Connected
  |
  | Connection drop + failure:
  |   Connected → Reconnecting → Connecting → Reconnecting → ...
  |   (continues until successful or explicit disconnect)
  |
  | Explicit disconnect:
  |   [any state] → Disconnected
  |   (cancels pending reconnection, clears all channels)
  |
  | Error (no reconnection):
  |   Connecting → Error
  |
  */
  console.log('  ┌──────────────┐');
  console.log('  │ Disconnected │ ← disconnect() from any state');
  console.log('  └──────┬───────┘');
  console.log('         │ connect()');
  console.log('         ▼');
  console.log('  ┌──────────────┐');
  console.log('  │  Connecting  │ ← initial or reconnect attempt');
  console.log('  └──────┬───────┘');
  console.log('         │');
  console.log('    ┌────┴────┐');
  console.log('    │ success │ failure');
  console.log('    ▼         ▼');
  console.log('  ┌─────────┐  ┌──────────────┐');
  console.log('  │Connected│  │ Reconnecting │');
  console.log('  └────┬────┘  └──────┬───────┘');
  console.log('       │ drop         │ backoff timer');
  console.log('       └──────────────┘');
  console.log('');
  console.log('  // Track transitions:');
  console.log('  manager.onStatusChange((status) => {');
  console.log('    console.log(`[${new Date().toISOString()}] ${status}`);');
  console.log('    console.log(`  Reconnect attempts: ${manager.reconnectAttempts}`);');
  console.log('  });');
  console.log('');
  console.log('  ✓ Status transitions demonstrated');
}

// ─── Example 4: Channel Error Handling ──────────────────────────────────────
//
// Handle errors at the channel level (auth failures, transport errors).
//

function channelErrorHandling() {
  console.log('\n=== Example 4: Channel Error Handling ===\n');

  /*
  |--------------------------------------------------------------------------
  | Channel-level error handling.
  |--------------------------------------------------------------------------
  |
  | Errors can occur at two levels:
  |   1. Connection level — affects all channels (handled by reconnection)
  |   2. Channel level — affects a specific channel (auth failure, etc.)
  |
  | Channel errors are surfaced via onError() callbacks.
  | Connection errors are propagated to ALL channel error callbacks.
  |
  */
  console.log('  // Channel-level error handling:');
  console.log('  const channel = manager.private("user.123");');
  console.log('');
  console.log('  channel');
  console.log('    .listen<NotificationEvent>(".notification", (data) => {');
  console.log('      console.log("Notification:", data.message);');
  console.log('    })');
  console.log('    .onError((error) => {');
  console.log('      // Auth failure, transport error, etc.');
  console.log('      console.error("Channel error:", error.message);');
  console.log('');
  console.log('      // Common errors:');
  console.log('      // - "Auth rejected" — invalid token or permissions');
  console.log('      // - "Connection error" — transport-level failure');
  console.log('    });');
  console.log('');
  console.log('  // Multiple error callbacks:');
  console.log('  channel');
  console.log('    .onError(logToSentry)');
  console.log('    .onError(showUserNotification)');
  console.log('    .onError(trackAnalytics);');
  console.log('');
  console.log('  ✓ Channel error handling demonstrated');
}

// ─── Example 5: Automatic Channel Re-subscription ──────────────────────────
//
// After a successful reconnection, all tracked channels are re-subscribed.
//

function autoResubscription() {
  console.log('\n=== Example 5: Automatic Channel Re-subscription ===\n');

  /*
  |--------------------------------------------------------------------------
  | Automatic re-subscription after reconnection.
  |--------------------------------------------------------------------------
  |
  | When the connection recovers:
  |   1. Manager creates a new Echo instance
  |   2. All tracked channels are re-subscribed automatically
  |   3. Public channels → echo.channel(name)
  |   4. Private channels → echo.private(name)
  |   5. Presence channels → echo.join(name)
  |   6. The internal echoChannel reference is updated on each wrapper
  |
  | Channels that were left (wrapper.isLeft === true) are cleaned up
  | instead of re-subscribed.
  |
  | Your existing listen() callbacks continue to work — no re-registration
  | needed on the consumer side.
  |
  */
  console.log('  // Subscribe to channels:');
  console.log('  const orders = manager.channel("orders");');
  console.log('  const userChannel = manager.private("user.123");');
  console.log('  const chatRoom = manager.join("chat-room.1");');
  console.log('');
  console.log('  orders.listen<OrderEvent>(".order.created", handleOrder);');
  console.log('  userChannel.listen<Notification>(".notification", handleNotif);');
  console.log('  chatRoom.here<User>(handleMembers);');
  console.log('');
  console.log('  // If the connection drops and recovers:');
  console.log('  //   1. All three channels are re-subscribed automatically');
  console.log('  //   2. Your callbacks (handleOrder, handleNotif, handleMembers)');
  console.log('  //      continue to work without any changes');
  console.log('  //   3. Presence channel fires here() again with current members');
  console.log('');
  console.log('  ✓ Auto re-subscription demonstrated');
}

// ─── Example 6: Manual Reconnection ─────────────────────────────────────────
//
// Manually trigger a reconnection (e.g., from a "Reconnect" button).
//

function manualReconnection() {
  console.log('\n=== Example 6: Manual Reconnection ===\n');

  /*
  |--------------------------------------------------------------------------
  | Manual reconnection — disconnect + connect.
  |--------------------------------------------------------------------------
  |
  | To manually reconnect:
  |   1. Call disconnect() — clears all state
  |   2. Call connect() — establishes a fresh connection
  |
  | Note: disconnect() clears all channel tracking. After connect(),
  | you'll need to re-subscribe to channels.
  |
  | For a "soft" reconnect that preserves channels, the automatic
  | reconnection (exponential backoff) is preferred.
  |
  */
  console.log('  // Manual reconnect (clears channels):');
  console.log('  function hardReconnect(manager: RealtimeManager) {');
  console.log('    manager.disconnect();');
  console.log('    manager.connect();');
  console.log('    // Need to re-subscribe to channels after this');
  console.log('  }');
  console.log('');
  console.log('  // React component with reconnect button:');
  console.log('  function ReconnectButton() {');
  console.log('    const { isConnected, manager } = useRealtime();');
  console.log('');
  console.log('    if (isConnected) return null;');
  console.log('');
  console.log('    return (');
  console.log('      <button onClick={() => {');
  console.log('        manager.disconnect();');
  console.log('        manager.connect();');
  console.log('      }}>');
  console.log('        Reconnect');
  console.log('      </button>');
  console.log('    );');
  console.log('  }');
  console.log('');
  console.log('  ✓ Manual reconnection demonstrated');
}

// ─── Run All Examples ───────────────────────────────────────────────────────

function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Realtime — Reconnection & Errors     ║');
  console.log('╚════════════════════════════════════════╝');

  exponentialBackoff();
  customReconnectionConfig();
  statusTransitions();
  channelErrorHandling();
  autoResubscription();
  manualReconnection();

  console.log('\n✅ All examples completed successfully!\n');
}

main();
