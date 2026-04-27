/**
 * Basic Realtime Usage Example
 *
 * |--------------------------------------------------------------------------
 * | @stackra/ts-realtime — Basic Usage
 * |--------------------------------------------------------------------------
 * |
 * | This example demonstrates the fundamental realtime operations:
 * | - Module registration with RealtimeModule.forRoot()
 * | - Connecting and disconnecting
 * | - Subscribing to public channels
 * | - Subscribing to private channels
 * | - Listening for broadcast events
 * | - Stopping listeners and leaving channels
 * | - Connection status tracking
 * |
 * | The realtime package wraps Laravel Echo with DI integration,
 * | typed channels, and automatic reconnection.
 * |
 * | NOTE: This file shows the code patterns — it won't run standalone
 * | because it requires a WebSocket server (Soketi/Pusher).
 * |
 * | @example
 * | ```bash
 * | npx ts-node .examples/01-basic-usage.ts
 * | ```
 * |
 */

import { Module } from "@stackra/ts-container";
import {
  RealtimeModule,
  RealtimeManager,
  ConnectionStatus,
  REALTIME_MANAGER,
} from "@stackra/ts-realtime";

// ─── Module Setup ───────────────────────────────────────────────────────────
//
// RealtimeModule.forRoot() registers the RealtimeManager as a global singleton
// in the DI container. It manages the Laravel Echo WebSocket connection.
//

/*
|--------------------------------------------------------------------------
| Module Registration
|--------------------------------------------------------------------------
|
| RealtimeModule.forRoot() accepts a RealtimeConfig object with:
|   - driver: 'pusher' (currently the only supported driver)
|   - key: your Pusher/Soketi application key
|   - wsHost: WebSocket server hostname
|   - wsPort: WebSocket server port
|   - authEndpoint: endpoint for private/presence channel auth
|
| Optional fields (with defaults):
|   - forceTLS: false
|   - cluster: 'mt1'
|   - encrypted: false
|   - disableStats: true
|   - reconnectInitialDelay: 1000 (ms)
|   - reconnectMaxDelay: 30000 (ms)
|   - reconnectMultiplier: 2
|
*/
function moduleSetup() {
  console.log("\n=== Module Setup ===\n");

  console.log("  @Module({");
  console.log("    imports: [");
  console.log("      RealtimeModule.forRoot({");
  console.log("        driver: 'pusher',");
  console.log("        key: 'your-app-key',");
  console.log("        wsHost: 'ws.example.com',");
  console.log("        wsPort: 6001,");
  console.log("        authEndpoint: '/broadcasting/auth',");
  console.log("        forceTLS: true,");
  console.log("      }),");
  console.log("    ],");
  console.log("  })");
  console.log("  export class AppModule {}");
  console.log("");
  console.log("  // Registers:");
  console.log("  //   REALTIME_CONFIG  — merged config object");
  console.log("  //   RealtimeManager  — core service (class provider)");
  console.log("  //   REALTIME_MANAGER — Symbol alias (useExisting)");
  console.log("  ✓ Module setup demonstrated");
}

// ─── Example 1: Connection Lifecycle ────────────────────────────────────────
//
// RealtimeManager handles the WebSocket connection lifecycle.
// It auto-connects on module init and auto-disconnects on destroy.
//

function connectionLifecycle() {
  console.log("\n=== Example 1: Connection Lifecycle ===\n");

  /*
  |--------------------------------------------------------------------------
  | RealtimeManager — connection lifecycle.
  |--------------------------------------------------------------------------
  |
  | The manager auto-connects during module bootstrap (onModuleInit).
  | You can also manually connect/disconnect:
  |
  |   manager.connect()    — establish the WebSocket connection
  |   manager.disconnect() — tear down and release all resources
  |
  | Connection status transitions:
  |   Disconnected → Connecting → Connected (normal flow)
  |   Connected → Reconnecting → Connecting → Connected (recovery)
  |
  */
  console.log("  // Inject RealtimeManager via DI:");
  console.log("  @Injectable()");
  console.log("  class MyService {");
  console.log("    constructor(");
  console.log(
    "      @Inject(REALTIME_MANAGER) private realtime: RealtimeManager",
  );
  console.log("    ) {}");
  console.log("");
  console.log("    checkConnection() {");
  console.log("      const status = this.realtime.getStatus();");
  console.log("      const connected = this.realtime.isConnected();");
  console.log(
    "      console.log(`Status: ${status}, Connected: ${connected}`);",
  );
  console.log("    }");
  console.log("");
  console.log("    manualReconnect() {");
  console.log("      this.realtime.disconnect();");
  console.log("      this.realtime.connect();");
  console.log("    }");
  console.log("  }");
  console.log("");
  console.log("  ✓ Connection lifecycle demonstrated");
}

// ─── Example 2: Public Channel Subscription ─────────────────────────────────
//
// Subscribe to a public Laravel Broadcasting channel.
// Public channels don't require authentication.
//

function publicChannel() {
  console.log("\n=== Example 2: Public Channel Subscription ===\n");

  /*
  |--------------------------------------------------------------------------
  | Public channels — no auth required.
  |--------------------------------------------------------------------------
  |
  | manager.channel(name) returns a ChannelWrapper with:
  |   - listen<T>(event, callback) — typed event listener
  |   - stopListening(event) — remove a specific listener
  |   - onError(callback) — error handling
  |   - leave() — unsubscribe from the channel
  |
  | The ChannelWrapper supports method chaining for fluent API usage.
  |
  */
  console.log("  // Subscribe to a public channel:");
  console.log('  const channel = manager.channel("orders");');
  console.log("");
  console.log("  // Listen for a broadcast event (note the dot prefix):");
  console.log('  channel.listen<OrderEvent>(".order.created", (data) => {');
  console.log('    console.log("New order:", data.id, data.total);');
  console.log("  });");
  console.log("");
  console.log("  // Chain multiple listeners:");
  console.log("  channel");
  console.log('    .listen<OrderEvent>(".order.created", handleCreate)');
  console.log('    .listen<OrderEvent>(".order.updated", handleUpdate)');
  console.log('    .onError((err) => console.error("Channel error:", err));');
  console.log("");
  console.log("  ✓ Public channel subscription demonstrated");
}

// ─── Example 3: Private Channel Subscription ────────────────────────────────
//
// Subscribe to a private Laravel Broadcasting channel.
// Private channels require authentication via the authEndpoint.
//

function privateChannel() {
  console.log("\n=== Example 3: Private Channel Subscription ===\n");

  /*
  |--------------------------------------------------------------------------
  | Private channels — auth required.
  |--------------------------------------------------------------------------
  |
  | manager.private(name) subscribes to a private channel.
  | Laravel Echo sends an auth request to the configured authEndpoint.
  |
  | The channel name should NOT include the 'private-' prefix —
  | Laravel Echo adds it automatically.
  |
  | Auth headers can be set in the module config:
  |   authHeaders: { Authorization: 'Bearer <token>' }
  |
  */
  console.log("  // Subscribe to a private channel:");
  console.log('  const channel = manager.private("user.123");');
  console.log("");
  console.log("  channel");
  console.log('    .listen<NotificationEvent>(".notification", (data) => {');
  console.log('      console.log("Notification:", data.message);');
  console.log("    })");
  console.log("    .onError((error) => {");
  console.log("      // Auth failures surface here");
  console.log('      console.error("Auth failed:", error.message);');
  console.log("    });");
  console.log("");
  console.log("  // With auth headers in config:");
  console.log("  RealtimeModule.forRoot({");
  console.log("    driver: 'pusher',");
  console.log("    key: 'app-key',");
  console.log("    wsHost: 'ws.example.com',");
  console.log("    wsPort: 6001,");
  console.log("    authEndpoint: '/broadcasting/auth',");
  console.log("    authHeaders: {");
  console.log("      Authorization: `Bearer ${token}`,");
  console.log("    },");
  console.log("  })");
  console.log("");
  console.log("  ✓ Private channel subscription demonstrated");
}

// ─── Example 4: Stopping Listeners & Leaving Channels ──────────────────────
//
// Clean up subscriptions when they're no longer needed.
//

function cleanupExample() {
  console.log("\n=== Example 4: Stopping Listeners & Leaving Channels ===\n");

  /*
  |--------------------------------------------------------------------------
  | Cleanup — stopListening and leave.
  |--------------------------------------------------------------------------
  |
  | stopListening(event) removes a specific event listener but keeps
  | the channel subscription active.
  |
  | leave() unsubscribes from the channel entirely. After calling leave(),
  | any attempt to call listen() on the wrapper will throw an error.
  |
  | The manager tracks all active channels internally. When leave() is
  | called, the wrapper notifies the manager to remove the channel
  | from its tracking map.
  |
  */
  console.log('  const channel = manager.channel("orders");');
  console.log("");
  console.log('  channel.listen<OrderEvent>(".order.created", handleCreate);');
  console.log('  channel.listen<OrderEvent>(".order.updated", handleUpdate);');
  console.log("");
  console.log("  // Stop listening to a specific event:");
  console.log('  channel.stopListening(".order.updated");');
  console.log("");
  console.log("  // Leave the channel entirely:");
  console.log("  channel.leave();");
  console.log("");
  console.log("  // After leave(), listen() throws:");
  console.log(
    '  // channel.listen(...) → Error: Cannot listen on channel "orders" — it has been left.',
  );
  console.log("");
  console.log("  ✓ Cleanup demonstrated");
}

// ─── Example 5: Connection Status Tracking ──────────────────────────────────
//
// Monitor connection status changes for UI indicators.
//

function statusTracking() {
  console.log("\n=== Example 5: Connection Status Tracking ===\n");

  /*
  |--------------------------------------------------------------------------
  | Connection status — observable state.
  |--------------------------------------------------------------------------
  |
  | manager.onStatusChange(callback) registers a listener that fires
  | whenever the connection status transitions. Returns an unsubscribe
  | function.
  |
  | ConnectionStatus enum values:
  |   Connected    — WebSocket is active and ready
  |   Connecting   — Initial connection attempt in progress
  |   Disconnected — Not connected
  |   Reconnecting — Re-establishing a lost connection
  |   Error        — Connection failed
  |
  */
  console.log("  // Track connection status:");
  console.log("  const unsubscribe = manager.onStatusChange((status) => {");
  console.log("    switch (status) {");
  console.log("      case ConnectionStatus.Connected:");
  console.log('        console.log("✓ Connected");');
  console.log("        break;");
  console.log("      case ConnectionStatus.Connecting:");
  console.log('        console.log("⏳ Connecting...");');
  console.log("        break;");
  console.log("      case ConnectionStatus.Reconnecting:");
  console.log('        console.log("🔄 Reconnecting...");');
  console.log("        break;");
  console.log("      case ConnectionStatus.Disconnected:");
  console.log('        console.log("✗ Disconnected");');
  console.log("        break;");
  console.log("      case ConnectionStatus.Error:");
  console.log('        console.log("❌ Error");');
  console.log("        break;");
  console.log("    }");
  console.log("  });");
  console.log("");
  console.log("  // Later, remove the listener:");
  console.log("  unsubscribe();");
  console.log("");
  console.log("  ✓ Status tracking demonstrated");
}

// ─── Run All Examples ───────────────────────────────────────────────────────

function main() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   Realtime — Basic Usage Examples       ║");
  console.log("╚════════════════════════════════════════╝");

  moduleSetup();
  connectionLifecycle();
  publicChannel();
  privateChannel();
  cleanupExample();
  statusTracking();

  console.log("\n✅ All examples completed successfully!\n");
}

main();
