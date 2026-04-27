# Realtime Examples

This folder contains examples demonstrating how to use `@stackra/ts-realtime` in
various scenarios.

## Examples Overview

### 1. Basic Usage (`01-basic-usage.ts`)

Learn the fundamental realtime operations:

- ✅ Module registration with `RealtimeModule.forRoot()`
- ✅ Connecting and disconnecting
- ✅ Subscribing to public channels
- ✅ Subscribing to private channels
- ✅ Listening for broadcast events
- ✅ Stopping listeners and leaving channels
- ✅ Connection status tracking

**View patterns:**

```bash
npx ts-node .examples/01-basic-usage.ts
```

### 2. Presence Channels (`02-presence-channels.ts`)

Master presence channel member tracking:

- ✅ Joining a presence channel
- ✅ `here()` — initial member list
- ✅ `joining()` — member join events
- ✅ `leaving()` — member leave events
- ✅ `getMembers()` — current member snapshot
- ✅ Multiple presence channels
- ✅ Leaving and cleanup

**View patterns:**

```bash
npx ts-node .examples/02-presence-channels.ts
```

### 3. React Hooks (`03-react-hooks.ts`)

Integrate realtime with React components:

- ✅ `useChannel()` — subscribe to channel events with auto-cleanup
- ✅ `usePresence()` — track presence channel members
- ✅ `useRealtime()` — connection status and manager access
- ✅ Full app setup with module + provider
- ✅ Conditional subscriptions with `enabled` option

**View patterns:**

```bash
npx ts-node .examples/03-react-hooks.ts
```

### 4. Reconnection & Error Handling (`04-reconnection-and-errors.ts`)

Handle connection failures gracefully:

- ✅ Exponential backoff reconnection
- ✅ Configuring reconnection parameters
- ✅ Connection status transitions
- ✅ Channel error callbacks
- ✅ Automatic channel re-subscription after reconnect
- ✅ Manual reconnection

**View patterns:**

```bash
npx ts-node .examples/04-reconnection-and-errors.ts
```

### 5. Facade & Advanced Patterns (`05-facade-and-advanced.ts`)

Advanced usage patterns:

- ✅ `RealtimeFacade` — static-style access outside React
- ✅ Platform-specific client injection (React Native)
- ✅ Multiple channel subscriptions
- ✅ Shared channel ref counting
- ✅ Testing with mock managers

**View patterns:**

```bash
npx ts-node .examples/05-facade-and-advanced.ts
```

## Quick Start

### Installation

```bash
pnpm add @stackra/ts-realtime laravel-echo pusher-js
```

### Module Setup

```typescript
import { Module } from "@stackra/ts-container";
import { RealtimeModule } from "@stackra/ts-realtime";

@Module({
  imports: [
    RealtimeModule.forRoot({
      driver: "pusher",
      key: "your-app-key",
      wsHost: "ws.example.com",
      wsPort: 6001,
      authEndpoint: "/broadcasting/auth",
    }),
  ],
})
export class AppModule {}
```

### Subscribe to a Channel

```typescript
import { Inject } from "@stackra/ts-container";
import { RealtimeManager } from "@stackra/ts-realtime";

class OrderService {
  constructor(@Inject(RealtimeManager) private realtime: RealtimeManager) {}

  subscribeToOrders() {
    this.realtime
      .channel("orders")
      .listen<OrderEvent>(".order.created", (data) => {
        console.log("New order:", data.id);
      });
  }
}
```

### React Component

```tsx
import { useChannel } from "@stackra/ts-realtime";

function OrderNotifications() {
  const { data, connected, error } = useChannel<OrderEvent>(
    "orders",
    ".order.created",
  );

  if (error) return <div>Error: {error.message}</div>;
  if (!connected) return <div>Connecting...</div>;
  if (!data) return <div>Waiting for events...</div>;

  return <div>New order: {data.id}</div>;
}
```

## API Reference

### RealtimeManager

| Method               | Description                          |
| -------------------- | ------------------------------------ |
| `connect()`          | Establish the WebSocket connection   |
| `disconnect()`       | Disconnect and release all resources |
| `channel(name)`      | Subscribe to a public channel        |
| `private(name)`      | Subscribe to a private channel       |
| `join(name)`         | Join a presence channel              |
| `getStatus()`        | Get current connection status        |
| `onStatusChange(cb)` | Register a status change listener    |
| `isConnected()`      | Check if connected                   |

### ChannelWrapper

| Method                    | Description                      |
| ------------------------- | -------------------------------- |
| `listen(event, callback)` | Listen for a broadcast event     |
| `stopListening(event)`    | Remove a specific event listener |
| `onError(callback)`       | Register an error callback       |
| `leave()`                 | Leave the channel                |

### PresenceChannelWrapper (extends ChannelWrapper)

| Method              | Description                  |
| ------------------- | ---------------------------- |
| `here(callback)`    | Initial member list callback |
| `joining(callback)` | Member join callback         |
| `leaving(callback)` | Member leave callback        |
| `getMembers()`      | Get current members snapshot |

### React Hooks

| Hook                    | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `useChannel(ch, event)` | Subscribe to a channel event with auto-cleanup |
| `usePresence(ch)`       | Track presence channel members                 |
| `useRealtime()`         | Connection status and manager access           |

### Connection Status

| Status         | Description                                          |
| -------------- | ---------------------------------------------------- |
| `Connected`    | WebSocket connection is active and ready             |
| `Connecting`   | Initial connection attempt is in progress            |
| `Disconnected` | Not connected (initial or after explicit disconnect) |
| `Reconnecting` | Re-establishing a lost connection                    |
| `Error`        | Connection failed with no reconnection configured    |
