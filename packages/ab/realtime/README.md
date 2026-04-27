# @stackra/ts-realtime

Platform-agnostic Laravel Echo wrapper with DI module, typed channels,
reconnection, and React hooks for real-time WebSocket communication.

## Installation

```bash
pnpm add @stackra/ts-realtime
```

## Features

- 🏗️ `RealtimeModule.forRoot()` with DI integration
- 🔌 `RealtimeManager` — connection lifecycle with exponential backoff
- 📡 Typed channel abstractions: public, private, and presence
- ⚛️ React hooks: `useChannel()`, `usePresence()`, `useRealtime()`
- 🎭 `RealtimeFacade` for static-style access outside React
- 🏷️ DI tokens: `REALTIME_CONFIG`, `REALTIME_MANAGER`
- 🌐 Platform-agnostic: works in browser, React Native, and Electron

## Usage

### Module Registration

```typescript
import { Module } from '@stackra/ts-container';
import { RealtimeModule } from '@stackra/ts-realtime';

@Module({
  imports: [
    RealtimeModule.forRoot({
      driver: 'pusher',
      key: 'your-app-key',
      wsHost: 'ws.example.com',
      wsPort: 6001,
      authEndpoint: '/broadcasting/auth',
    }),
  ],
})
export class AppModule {}
```

### React Hook

```tsx
import { useChannel } from '@stackra/ts-realtime';

function NotificationBell() {
  const { data, connected } = useChannel<{ message: string }>(
    'notifications',
    '.new-notification'
  );

  return <span>{connected ? data?.message : 'Connecting...'}</span>;
}
```

## License

MIT
