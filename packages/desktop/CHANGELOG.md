# @stackra/ts-desktop

## 1.0.0

### Major Features

- 🎉 Initial release of @stackra/ts-desktop
- 🖥️ Platform-agnostic desktop integration (Electron + browser fallbacks)
- 💉 Full DI integration with @stackra/ts-container
- 🔌 23 injectable services across 7 domains

### Core

- **DesktopModule** — forRoot() / forFeature() DI registration
- **DesktopManager** — platform detection, bridge auto-selection, menu
  orchestration
- **ElectronBridge** — real IPC via window.electronAPI
- **BrowserBridge** — graceful fallbacks (window.print, Notification API, etc.)
- **MenuRegistry** — collects @Menu/@MenuItem decorated classes

### POS Hardware (6 services)

- **PrinterService** — ESC/POS thermal receipt printing
- **EscPosFormatter** — injectable receipt formatter (swappable for
  Star/Citizen)
- **CashDrawerService** — serial/printer-kick drawer control with 5s timeout
- **ScannerService** — HID barcode scanner detection via DOM keydown events
- **ScaleService** — serial weight scale reading with 3s timeout
- **DisplayService** — pole display and second screen management

### Offline & Sync (2 services)

- **OfflineService** — online/offline detection, operation queuing to
  localStorage
- **SyncService** — FIFO queue processing with retry backoff, auto-sync on
  reconnect

### Window & Shell (3 services)

- **WindowService** — multi-window management, fullscreen, kiosk mode
- **TrayService** — system tray icon and context menu
- **DockService** — macOS dock badge and bounce

### Security (3 services)

- **AuthNativeService** — Touch ID / Windows Hello biometric authentication
- **KeychainService** — OS keychain credential storage with safeStorage fallback
- **LockService** — idle timeout detection and screen lock events

### System Integration (5 services)

- **ClipboardService** — system clipboard read/write
- **FileSystemService** — native file dialogs and drag-and-drop
- **ProtocolService** — custom URL protocol registration and deep linking
- **PowerService** — sleep prevention with Wake Lock API fallback
- **NotificationService** — rich OS notifications with action buttons and
  queuing

### Updates & Diagnostics (3 services)

- **AutoUpdateService** — electron-updater integration with lifecycle events
- **CrashReporterService** — Electron crashReporter + Sentry integration
- **DiagnosticsService** — system info, memory, GPU, network status

### Other

- **PermissionService** — USB, Bluetooth, Serial, Camera, Microphone permission
  management
- **@Menu()**, **@MenuItem()**, **@OnIpc()** decorators
- **useDesktop()**, **useMenuAction()** React hooks
- Error types: DesktopServiceError, HardwareTimeoutError,
  HardwareNotConfiguredError
- 21 DI tokens for all services
- Kbd integration via @Inject(SHORTCUT_REGISTRY)
