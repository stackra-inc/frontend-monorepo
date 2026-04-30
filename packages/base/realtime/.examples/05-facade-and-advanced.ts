/**
 * Facade & Advanced Patterns Example
 *
 * |--------------------------------------------------------------------------
 * | @stackra/ts-realtime — Facade & Advanced Patterns
 * |--------------------------------------------------------------------------
 * |
 * | This example demonstrates advanced usage patterns:
 * | - RealtimeFacade — static-style access outside React
 * | - Platform-specific client injection (React Native)
 * | - Multiple channel subscriptions
 * | - Shared channel ref counting (useChannel internals)
 * | - Testing with mock managers
 * |
 * | The facade pattern provides static-style access to the RealtimeManager
 * | without requiring React hooks or explicit DI injection.
 * |
 * | NOTE: This file shows the code patterns — it won't run standalone
 * | because it requires a WebSocket server and DI container.
 * |
 * | @example
 * | ```bash
 * | npx ts-node .examples/05-facade-and-advanced.ts
 * | ```
 * |
 */

import {
  RealtimeModule,
  RealtimeFacade,
  RealtimeManager,
  REALTIME_MANAGER,
  ConnectionStatus,
} from '@stackra/ts-realtime';

// ─── Example 1: RealtimeFacade — Static-Style Access ────────────────────────
//
// The facade provides static-style access to RealtimeManager
// without React hooks or explicit DI injection.
//

function facadeUsage() {
  console.log('\n=== Example 1: RealtimeFacade — Static-Style Access ===\n');

  /*
  |--------------------------------------------------------------------------
  | RealtimeFacade — typed proxy for RealtimeManager.
  |--------------------------------------------------------------------------
  |
  | The facade is a module-level constant that lazily resolves the
  | RealtimeManager from the DI container on first property access.
  |
  | Setup (once, in main.tsx):
  |   const app = await Application.create(AppModule);
  |   Facade.setApplication(app);
  |
  | After setup, use RealtimeFacade anywhere — no imports of the
  | container or injection tokens needed.
  |
  | All RealtimeManager methods are available:
  |   - connect(), disconnect()
  |   - channel(name), private(name), join(name)
  |   - getStatus(), onStatusChange(cb), isConnected()
  |
  */
  console.log('  // Setup (once, in main.tsx):');
  console.log('  import { Application } from "@stackra/ts-container";');
  console.log('  import { Facade } from "@stackra/ts-support";');
  console.log('');
  console.log('  const app = await Application.create(AppModule);');
  console.log('  Facade.setApplication(app);');
  console.log('');
  console.log('  // Usage anywhere:');
  console.log('  import { RealtimeFacade } from "@stackra/ts-realtime";');
  console.log('');
  console.log('  // Subscribe to a channel:');
  console.log('  RealtimeFacade.channel("orders")');
  console.log('    .listen<OrderEvent>(".order.created", (data) => {');
  console.log('      console.log("New order:", data.id);');
  console.log('    });');
  console.log('');
  console.log('  // Join a presence channel:');
  console.log('  RealtimeFacade.join("chat-room.1")');
  console.log('    .here<User>((members) => console.log("Online:", members));');
  console.log('');
  console.log('  // Check connection:');
  console.log('  if (RealtimeFacade.isConnected()) {');
  console.log('    console.log("WebSocket is active");');
  console.log('  }');
  console.log('');
  console.log('  ✓ Facade usage demonstrated');
}

// ─── Example 2: Platform-Specific Client Injection ──────────────────────────
//
// Inject a pre-configured Pusher client for React Native or Electron.
//

function platformClientInjection() {
  console.log('\n=== Example 2: Platform-Specific Client Injection ===\n');

  /*
  |--------------------------------------------------------------------------
  | Client injection — React Native, Electron, etc.
  |--------------------------------------------------------------------------
  |
  | The default pusher-js package works in browsers but may not work
  | in React Native or Electron. Use the `client` config option to
  | inject a platform-specific Pusher client.
  |
  | For React Native:
  |   @pusher/pusher-websocket-react-native
  |
  | For Electron:
  |   pusher-js with custom WebSocket transport
  |
  | The client option bypasses Laravel Echo's default Pusher import.
  |
  */
  console.log('  // React Native setup:');
  console.log('  import { Pusher } from "@pusher/pusher-websocket-react-native";');
  console.log('');
  console.log('  const pusherClient = Pusher.getInstance();');
  console.log('  await pusherClient.init({');
  console.log('    apiKey: "your-app-key",');
  console.log('    cluster: "mt1",');
  console.log('  });');
  console.log('  await pusherClient.connect();');
  console.log('');
  console.log('  RealtimeModule.forRoot({');
  console.log("    driver: 'pusher',");
  console.log("    key: 'your-app-key',");
  console.log("    wsHost: 'ws.example.com',");
  console.log('    wsPort: 6001,');
  console.log("    authEndpoint: '/broadcasting/auth',");
  console.log('    client: pusherClient,  // ← inject the RN client');
  console.log('  })');
  console.log('');
  console.log('  // The RealtimeManager passes the client to Laravel Echo:');
  console.log('  //   new Echo({ ..., client: pusherClient })');
  console.log('  // Echo uses the injected client instead of importing pusher-js.');
  console.log('');
  console.log('  ✓ Platform client injection demonstrated');
}

// ─── Example 3: Multiple Channel Subscriptions ─────────────────────────────
//
// Subscribe to multiple channels for different concerns.
//

function multipleChannels() {
  console.log('\n=== Example 3: Multiple Channel Subscriptions ===\n');

  /*
  |--------------------------------------------------------------------------
  | Multiple channels — different concerns.
  |--------------------------------------------------------------------------
  |
  | Subscribe to different channels for different parts of your app.
  | The manager tracks all active channels internally.
  |
  | Channel types:
  |   - Public: manager.channel(name) — no auth
  |   - Private: manager.private(name) — auth required
  |   - Presence: manager.join(name) — auth + member tracking
  |
  */
  console.log('  // Public channel — global notifications:');
  console.log('  manager.channel("announcements")');
  console.log('    .listen<Announcement>(".new", (data) => {');
  console.log('      showBanner(data.message);');
  console.log('    });');
  console.log('');
  console.log('  // Private channel — user-specific:');
  console.log('  manager.private(`user.${userId}`)');
  console.log('    .listen<Notification>(".notification", handleNotification)');
  console.log('    .listen<Message>(".message", handleMessage);');
  console.log('');
  console.log('  // Presence channel — team collaboration:');
  console.log('  manager.join(`team.${teamId}`)');
  console.log('    .here<User>(setTeamMembers)');
  console.log('    .joining<User>(addMember)');
  console.log('    .leaving<User>(removeMember)');
  console.log('    .listen<Activity>(".activity", handleActivity);');
  console.log('');
  console.log('  ✓ Multiple channels demonstrated');
}

// ─── Example 4: Shared Channel Ref Counting ────────────────────────────────
//
// useChannel() uses internal ref counting so multiple hooks sharing
// the same channel don't cause duplicate subscriptions.
//

function refCounting() {
  console.log('\n=== Example 4: Shared Channel Ref Counting ===\n');

  /*
  |--------------------------------------------------------------------------
  | Ref counting — shared channel subscriptions.
  |--------------------------------------------------------------------------
  |
  | When multiple useChannel() hooks subscribe to the same channel:
  |   1. First hook: creates the ChannelWrapper, ref count = 1
  |   2. Second hook: reuses the wrapper, ref count = 2
  |   3. First hook unmounts: ref count = 1 (channel stays)
  |   4. Second hook unmounts: ref count = 0 → channel.leave()
  |
  | This prevents duplicate subscriptions and ensures the channel
  | is only left when the last consumer unmounts.
  |
  | The ref counting is internal to useChannel() — consumers don't
  | need to manage it.
  |
  */
  console.log('  // Two components subscribing to the same channel:');
  console.log('');
  console.log('  function OrderList() {');
  console.log('    // Subscribes to "orders" channel');
  console.log('    const { data } = useChannel<OrderEvent>("orders", ".order.created");');
  console.log('    return <div>{data?.id}</div>;');
  console.log('  }');
  console.log('');
  console.log('  function OrderCount() {');
  console.log('    // Also subscribes to "orders" channel — shares the wrapper');
  console.log('    const { data } = useChannel<OrderEvent>("orders", ".order.created");');
  console.log('    return <span>Latest: {data?.id}</span>;');
  console.log('  }');
  console.log('');
  console.log('  // Both components share a single ChannelWrapper.');
  console.log('  // The channel is only left when BOTH unmount.');
  console.log('');
  console.log('  ✓ Ref counting demonstrated');
}

// ─── Example 5: Testing with Mock Managers ──────────────────────────────────
//
// Swap the RealtimeManager with a mock for testing.
//

function testingPatterns() {
  console.log('\n=== Example 5: Testing with Mock Managers ===\n');

  /*
  |--------------------------------------------------------------------------
  | Testing — swap in a mock RealtimeManager.
  |--------------------------------------------------------------------------
  |
  | Use Facade.swap() to replace the resolved instance in tests.
  | This prevents actual WebSocket connections during testing.
  |
  | The mock should implement the RealtimeManager interface:
  |   - connect(), disconnect()
  |   - channel(name), private(name), join(name)
  |   - getStatus(), onStatusChange(cb), isConnected()
  |
  */
  console.log('  import { Facade } from "@stackra/ts-support";');
  console.log('  import { REALTIME_MANAGER } from "@stackra/ts-realtime";');
  console.log('');
  console.log('  // Create a mock manager:');
  console.log('  const mockManager = {');
  console.log('    connect: vi.fn(),');
  console.log('    disconnect: vi.fn(),');
  console.log('    channel: vi.fn().mockReturnValue(mockChannel),');
  console.log('    private: vi.fn().mockReturnValue(mockChannel),');
  console.log('    join: vi.fn().mockReturnValue(mockPresenceChannel),');
  console.log('    getStatus: vi.fn().mockReturnValue(ConnectionStatus.Connected),');
  console.log('    onStatusChange: vi.fn().mockReturnValue(() => {}),');
  console.log('    isConnected: vi.fn().mockReturnValue(true),');
  console.log('    reconnectAttempts: 0,');
  console.log('  };');
  console.log('');
  console.log('  // Before test — swap in the mock:');
  console.log('  Facade.swap(REALTIME_MANAGER, mockManager);');
  console.log('');
  console.log('  // Run your test...');
  console.log('  expect(mockManager.channel).toHaveBeenCalledWith("orders");');
  console.log('');
  console.log('  // After test — restore:');
  console.log('  Facade.clearResolvedInstances();');
  console.log('');
  console.log('  ✓ Testing patterns demonstrated');
}

// ─── Example 6: Feature Comparison ──────────────────────────────────────────

function featureComparison() {
  console.log('\n=== Example 6: Feature Comparison ===\n');

  console.log('  ┌──────────────────────┬──────────┬──────────┬──────────────┐');
  console.log('  │ Feature              │ Public   │ Private  │ Presence     │');
  console.log('  ├──────────────────────┼──────────┼──────────┼──────────────┤');
  console.log('  │ Auth required        │ ✗ No     │ ✓ Yes    │ ✓ Yes        │');
  console.log('  │ Event listening      │ ✓ Yes    │ ✓ Yes    │ ✓ Yes        │');
  console.log('  │ Member tracking      │ ✗ No     │ ✗ No     │ ✓ Yes        │');
  console.log('  │ here() callback      │ ✗ No     │ ✗ No     │ ✓ Yes        │');
  console.log('  │ joining() callback   │ ✗ No     │ ✗ No     │ ✓ Yes        │');
  console.log('  │ leaving() callback   │ ✗ No     │ ✗ No     │ ✓ Yes        │');
  console.log('  │ Error callbacks      │ ✓ Yes    │ ✓ Yes    │ ✓ Yes        │');
  console.log('  │ Auto re-subscribe    │ ✓ Yes    │ ✓ Yes    │ ✓ Yes        │');
  console.log('  │ Method               │ channel  │ private  │ join         │');
  console.log('  │ React hook           │ useChannel│useChannel│ usePresence │');
  console.log('  │ Use case             │ Global   │ User     │ Collaboration│');
  console.log('  └──────────────────────┴──────────┴──────────┴──────────────┘');
}

// ─── Run All Examples ───────────────────────────────────────────────────────

function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Realtime — Facade & Advanced         ║');
  console.log('╚════════════════════════════════════════╝');

  facadeUsage();
  platformClientInjection();
  multipleChannels();
  refCounting();
  testingPatterns();
  featureComparison();

  console.log('\n✅ All examples completed successfully!\n');
}

main();
