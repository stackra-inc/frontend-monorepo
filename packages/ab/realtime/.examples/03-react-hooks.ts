/**
 * React Hooks Example
 *
 * |--------------------------------------------------------------------------
 * | @stackra/ts-realtime — React Hooks
 * |--------------------------------------------------------------------------
 * |
 * | This example demonstrates using realtime in React components:
 * | - useChannel() — subscribe to channel events with auto-cleanup
 * | - usePresence() — track presence channel members
 * | - useRealtime() — connection status and manager access
 * | - Full app setup with module + provider
 * | - Conditional subscriptions with enabled option
 * |
 * | These hooks integrate with @stackra/ts-container's DI container.
 * | The RealtimeManager must be registered via RealtimeModule.forRoot().
 * |
 * | NOTE: This file shows the code patterns — it won't run standalone
 * | because it requires a React rendering environment.
 * |
 * | @example
 * | ```tsx
 * | // In your React app:
 * | import { useChannel, usePresence, useRealtime } from '@stackra/ts-realtime';
 * | ```
 * |
 */

// ─── Example 1: useChannel() — Subscribe to Channel Events ─────────────────
//
// useChannel() subscribes to a channel event and auto-cleans up on unmount.
// Returns { data, connected, error } for declarative rendering.
//

/*
|--------------------------------------------------------------------------
| OrderNotifications Component
|--------------------------------------------------------------------------
|
| Subscribes to the 'orders' channel and listens for '.order.created' events.
| The hook handles:
|   - Subscribing on mount
|   - Unsubscribing on unmount
|   - Re-subscribing when channelName or eventName change
|   - Tracking connection status
|   - Capturing errors
|
| useChannel<T>(channelName, eventName, options?)
|   - channelName: string — the channel to subscribe to
|   - eventName: string — the broadcast event (dot-prefixed)
|   - options.enabled: boolean — conditional subscription (default: true)
|
*/
const OrderNotificationsExample = `
import { useChannel } from '@stackra/ts-realtime';

interface OrderEvent {
  id: number;
  status: string;
  total: number;
}

function OrderNotifications() {
  const { data, connected, error } = useChannel<OrderEvent>(
    'orders',
    '.order.created',
  );

  if (error) return <div className="error">Error: {error.message}</div>;
  if (!connected) return <div className="loading">Connecting...</div>;
  if (!data) return <div>Waiting for orders...</div>;

  return (
    <div className="notification">
      <h3>New Order #{data.id}</h3>
      <p>Status: {data.status}</p>
      <p>Total: \${data.total}</p>
    </div>
  );
}
`;

// ─── Example 2: usePresence() — Track Presence Members ──────────────────────
//
// usePresence() joins a presence channel and tracks members.
// Returns { members, connected, error } with auto-cleanup.
//

/*
|--------------------------------------------------------------------------
| OnlineUsers Component
|--------------------------------------------------------------------------
|
| Joins the 'chat-room.1' presence channel and displays online members.
| The hook handles:
|   - Joining on mount
|   - Leaving on unmount
|   - Tracking here/joining/leaving events
|   - Maintaining the members array
|
| usePresence<TMember>(channelName)
|   - channelName: string — the presence channel to join
|   - TMember: generic type for member objects
|
*/
const OnlineUsersExample = `
import { usePresence } from '@stackra/ts-realtime';

interface User {
  id: number;
  name: string;
  avatar: string;
}

function OnlineUsers() {
  const { members, connected, error } = usePresence<User>('chat-room.1');

  if (error) return <div>Error: {error.message}</div>;
  if (!connected) return <div>Connecting...</div>;

  return (
    <div className="online-users">
      <h3>Online ({members.length})</h3>
      <ul>
        {members.map((user) => (
          <li key={user.id}>
            <img src={user.avatar} alt={user.name} />
            <span>{user.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
`;

// ─── Example 3: useRealtime() — Connection Status ───────────────────────────
//
// useRealtime() provides connection status and manager access.
// Useful for connection indicators and manual reconnection.
//

/*
|--------------------------------------------------------------------------
| ConnectionIndicator Component
|--------------------------------------------------------------------------
|
| Displays the current WebSocket connection status and provides
| a reconnect button when disconnected.
|
| useRealtime() returns:
|   - status: ConnectionStatus — current connection state
|   - isConnected: boolean — shorthand for status === Connected
|   - manager: RealtimeManager — for imperative operations
|
*/
const ConnectionIndicatorExample = `
import { useRealtime, ConnectionStatus } from '@stackra/ts-realtime';

function ConnectionIndicator() {
  const { status, isConnected, manager } = useRealtime();

  const statusColors: Record<ConnectionStatus, string> = {
    [ConnectionStatus.Connected]: 'green',
    [ConnectionStatus.Connecting]: 'yellow',
    [ConnectionStatus.Reconnecting]: 'orange',
    [ConnectionStatus.Disconnected]: 'gray',
    [ConnectionStatus.Error]: 'red',
  };

  return (
    <div className="connection-indicator">
      <span
        className="status-dot"
        style={{ backgroundColor: statusColors[status] }}
      />
      <span>{status}</span>
      {!isConnected && (
        <button onClick={() => manager.connect()}>
          Reconnect
        </button>
      )}
    </div>
  );
}
`;

// ─── Example 4: Conditional Subscriptions ───────────────────────────────────
//
// useChannel() supports an enabled option for conditional subscriptions.
// Useful when the channel depends on user state or route params.
//

/*
|--------------------------------------------------------------------------
| UserNotifications Component
|--------------------------------------------------------------------------
|
| Only subscribes to the user's private notification channel when
| the user is authenticated. The enabled option controls this.
|
*/
const ConditionalSubscriptionExample = `
import { useChannel } from '@stackra/ts-realtime';
import { useAuth } from './hooks/use-auth';

interface NotificationEvent {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error';
}

function UserNotifications() {
  const { user, isAuthenticated } = useAuth();

  // Only subscribe when authenticated
  const { data, error } = useChannel<NotificationEvent>(
    \`user.\${user?.id}\`,
    '.notification',
    { enabled: isAuthenticated },
  );

  if (!isAuthenticated) return null;
  if (error) return <div>Notification error: {error.message}</div>;
  if (!data) return null;

  return (
    <div className={\`notification notification--\${data.type}\`}>
      {data.message}
    </div>
  );
}
`;

// ─── Example 5: Multiple Hooks in One Component ────────────────────────────
//
// Combine multiple realtime hooks in a single component.
//

/*
|--------------------------------------------------------------------------
| ChatRoom Component
|--------------------------------------------------------------------------
|
| Combines usePresence for member tracking, useChannel for messages,
| and useRealtime for connection status — all in one component.
|
*/
const ChatRoomExample = `
import { useChannel, usePresence, useRealtime } from '@stackra/ts-realtime';

interface User { id: number; name: string; }
interface Message { userId: number; text: string; timestamp: number; }

function ChatRoom({ roomId }: { roomId: string }) {
  const { isConnected } = useRealtime();
  const { members } = usePresence<User>(\`chat-room.\${roomId}\`);
  const { data: message } = useChannel<Message>(
    \`chat-room.\${roomId}\`,
    '.message.sent',
  );

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (message) {
      setMessages((prev) => [...prev, message]);
    }
  }, [message]);

  if (!isConnected) return <div>Connecting to chat...</div>;

  return (
    <div className="chat-room">
      <aside className="members">
        <h3>Online ({members.length})</h3>
        {members.map((u) => <span key={u.id}>{u.name}</span>)}
      </aside>

      <main className="messages">
        {messages.map((msg, i) => (
          <div key={i} className="message">
            <strong>{members.find(m => m.id === msg.userId)?.name}:</strong>
            <span>{msg.text}</span>
          </div>
        ))}
      </main>
    </div>
  );
}
`;

// ─── Example 6: Full App Setup ──────────────────────────────────────────────
//
// Complete example showing module setup + provider + hooks in a React app.
//

/*
|--------------------------------------------------------------------------
| Full App Setup
|--------------------------------------------------------------------------
|
| 1. Create the root module with RealtimeModule.forRoot()
| 2. Wrap your app with the DI provider
| 3. Use hooks in any component
|
*/
const FullAppSetupExample = `
// ── app.module.ts ───────────────────────────────────────────────────────

import { Module } from '@stackra/ts-container';
import { RealtimeModule } from '@stackra/ts-realtime';

@Module({
  imports: [
    RealtimeModule.forRoot({
      driver: 'pusher',
      key: import.meta.env.VITE_PUSHER_KEY,
      wsHost: import.meta.env.VITE_PUSHER_HOST,
      wsPort: Number(import.meta.env.VITE_PUSHER_PORT),
      authEndpoint: '/broadcasting/auth',
      forceTLS: import.meta.env.PROD,
      authHeaders: {
        Authorization: \`Bearer \${getToken()}\`,
      },
    }),
  ],
})
export class AppModule {}

// ── App.tsx ─────────────────────────────────────────────────────────────

import { ModuleProvider } from '@stackra/ts-container';
import { AppModule } from './app.module';

function App() {
  return (
    <ModuleProvider module={AppModule}>
      <ConnectionIndicator />
      <OrderNotifications />
      <OnlineUsers />
      <ChatRoom roomId="general" />
    </ModuleProvider>
  );
}
`;

// ─── Print Examples ─────────────────────────────────────────────────────────

function main() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   Realtime — React Hooks (Patterns)    ║");
  console.log("╚════════════════════════════════════════╝");

  console.log(
    "\n=== Example 1: useChannel() — Subscribe to Channel Events ===\n",
  );
  console.log(OrderNotificationsExample);

  console.log("\n=== Example 2: usePresence() — Track Presence Members ===\n");
  console.log(OnlineUsersExample);

  console.log("\n=== Example 3: useRealtime() — Connection Status ===\n");
  console.log(ConnectionIndicatorExample);

  console.log("\n=== Example 4: Conditional Subscriptions ===\n");
  console.log(ConditionalSubscriptionExample);

  console.log("\n=== Example 5: Multiple Hooks in One Component ===\n");
  console.log(ChatRoomExample);

  console.log("\n=== Example 6: Full App Setup ===\n");
  console.log(FullAppSetupExample);

  console.log("\n✅ All React hook patterns demonstrated!\n");
}

main();
