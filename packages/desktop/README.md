# @stackra/ts-desktop

Platform-agnostic Electron desktop integration with DI, decorators, and 23
injectable services.

## Installation

```bash
pnpm add @stackra/ts-desktop
```

## Features

- 23 injectable services across 7 domains (POS hardware, offline/sync, window
  management, security, system integration, updates, diagnostics)
- Platform abstraction — ElectronBridge (real IPC) or BrowserBridge (graceful
  fallbacks)
- @Menu() / @MenuItem() decorators for native Electron menus
- Kbd integration — menu shortcuts auto-register with ShortcutRegistry
- Generic IPC — services use `bridge.invoke('channel', ...args)`, no preload
  changes needed
- Handler map pattern — one file per domain in the main process

## Usage

```typescript
import { Module } from '@stackra/ts-container';
import { DesktopModule } from '@stackra/ts-desktop';

@Module({
  imports: [
    DesktopModule.forRoot({
      appName: 'My POS',
      titleBarStyle: 'hiddenInset',
      autoUpdate: true,
      printer: { type: 'usb', vendorId: 0x04b8, productId: 0x0202 },
      scanner: { keystrokeThreshold: 50, minLength: 8 },
      offline: { pingUrl: '/api/health', pingInterval: 30000 },
      lock: { idleTimeout: 300 },
    }),
    DesktopModule.forFeature([FileMenu, EditMenu]),
  ],
})
export class AppModule {}
```

## Services

| Domain         | Services                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| POS Hardware   | PrinterService, EscPosFormatter, CashDrawerService, ScannerService, ScaleService, DisplayService           |
| Offline & Sync | OfflineService, SyncService                                                                                |
| Window & Shell | WindowService, TrayService, DockService                                                                    |
| Security       | AuthNativeService, KeychainService, LockService                                                            |
| System         | ClipboardService, FileSystemService, ProtocolService, PowerService, NotificationService, PermissionService |
| Updates        | AutoUpdateService, CrashReporterService, DiagnosticsService                                                |

## License

MIT
