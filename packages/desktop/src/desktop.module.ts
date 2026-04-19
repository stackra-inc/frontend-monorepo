/**
 * Desktop Module
 *
 * |--------------------------------------------------------------------------
 * | DI Module for @stackra-inc/ts-desktop
 * |--------------------------------------------------------------------------
 * |
 * | forRoot(config)         — registers all 23 desktop services
 * | forFeature(menus)       — registers @Menu classes from feature modules
 * | registerMenu(menuClass) — register a single @Menu class
 * |
 * | Menu classes decorated with @Menu() are collected by the MenuRegistry.
 * | Each module can contribute its own menu items via forFeature().
 * |
 * @example
 * ```typescript
 * // Root module
 * @Module({
 *   imports: [
 *     DesktopModule.forRoot({ appName: 'My POS' }),
 *     DesktopModule.forFeature([FileMenu, EditMenu]),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */

import { Module, type DynamicModule } from '@stackra-inc/ts-container';

import type { DesktopModuleOptions } from './interfaces';
import { DESKTOP_CONFIG, DESKTOP_MANAGER } from './constants';

/*
|--------------------------------------------------------------------------
| Core Services
|--------------------------------------------------------------------------
*/
import { DesktopManager } from './services/desktop-manager.service';
import { MenuRegistry } from './services/menu-registry.service';

/*
|--------------------------------------------------------------------------
| POS Hardware Services
|--------------------------------------------------------------------------
*/
import { PrinterService } from './services/printer.service';
import { EscPosFormatter } from './services/escpos-formatter.service';
import { CashDrawerService } from './services/cash-drawer.service';
import { ScannerService } from './services/scanner.service';
import { ScaleService } from './services/scale.service';
import { DisplayService } from './services/display.service';

/*
|--------------------------------------------------------------------------
| Permission Service
|--------------------------------------------------------------------------
*/
import { PermissionService } from './services/permission.service';

/*
|--------------------------------------------------------------------------
| Offline & Sync Services
|--------------------------------------------------------------------------
*/
import { OfflineService } from './services/offline.service';
import { SyncService } from './services/sync.service';

/*
|--------------------------------------------------------------------------
| Window & Shell Services
|--------------------------------------------------------------------------
*/
import { WindowService } from './services/window.service';
import { TrayService } from './services/tray.service';
import { DockService } from './services/dock.service';

/*
|--------------------------------------------------------------------------
| Auto-Update Service
|--------------------------------------------------------------------------
*/
import { AutoUpdateService } from './services/auto-update.service';

/*
|--------------------------------------------------------------------------
| Security Services
|--------------------------------------------------------------------------
*/
import { AuthNativeService } from './services/auth-native.service';
import { KeychainService } from './services/keychain.service';
import { LockService } from './services/lock.service';

/*
|--------------------------------------------------------------------------
| System Integration Services
|--------------------------------------------------------------------------
*/
import { ClipboardService } from './services/clipboard.service';
import { FileSystemService } from './services/file-system.service';
import { ProtocolService } from './services/protocol.service';
import { PowerService } from './services/power.service';
import { NotificationService } from './services/notification.service';

/*
|--------------------------------------------------------------------------
| Updates & Diagnostics Services
|--------------------------------------------------------------------------
*/
import { CrashReporterService } from './services/crash-reporter.service';
import { DiagnosticsService } from './services/diagnostics.service';

/** Token for the global MenuRegistry. */
export const MENU_REGISTRY = Symbol.for('MENU_REGISTRY');

/** Global singleton MenuRegistry — shared across forRoot and forFeature. */
const globalMenuRegistry = new MenuRegistry();

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern
export class DesktopModule {
  /*
  |--------------------------------------------------------------------------
  | forRoot
  |--------------------------------------------------------------------------
  |
  | Registers all 23 desktop services as global singletons:
  |
  |   Core:           DesktopManager, MenuRegistry
  |   POS Hardware:   PrinterService, EscPosFormatter, CashDrawerService,
  |                   ScannerService, ScaleService, DisplayService
  |   Permissions:    PermissionService
  |   Offline & Sync: OfflineService, SyncService
  |   Window & Shell: WindowService, TrayService, DockService
  |   Auto-Update:    AutoUpdateService
  |   Security:       AuthNativeService, KeychainService, LockService
  |   System:         ClipboardService, FileSystemService, ProtocolService,
  |                   PowerService, NotificationService
  |   Diagnostics:    CrashReporterService, DiagnosticsService
  |
  */
  static forRoot(config: DesktopModuleOptions): DynamicModule {
    return {
      module: DesktopModule,
      global: true,
      providers: [
        /*
        |--------------------------------------------------------------------------
        | Config
        |--------------------------------------------------------------------------
        */
        { provide: DESKTOP_CONFIG, useValue: config },

        /*
        |--------------------------------------------------------------------------
        | Core
        |--------------------------------------------------------------------------
        */
        { provide: DesktopManager, useClass: DesktopManager },
        { provide: DESKTOP_MANAGER, useExisting: DesktopManager },
        { provide: MenuRegistry, useValue: globalMenuRegistry },
        { provide: MENU_REGISTRY, useValue: globalMenuRegistry },

        /*
        |--------------------------------------------------------------------------
        | POS Hardware
        |--------------------------------------------------------------------------
        */
        { provide: EscPosFormatter, useClass: EscPosFormatter },
        { provide: PrinterService, useClass: PrinterService },
        { provide: CashDrawerService, useClass: CashDrawerService },
        { provide: ScannerService, useClass: ScannerService },
        { provide: ScaleService, useClass: ScaleService },
        { provide: DisplayService, useClass: DisplayService },

        /*
        |--------------------------------------------------------------------------
        | Permissions
        |--------------------------------------------------------------------------
        */
        { provide: PermissionService, useClass: PermissionService },

        /*
        |--------------------------------------------------------------------------
        | Offline & Sync
        |--------------------------------------------------------------------------
        */
        { provide: OfflineService, useClass: OfflineService },
        { provide: SyncService, useClass: SyncService },

        /*
        |--------------------------------------------------------------------------
        | Window & Shell
        |--------------------------------------------------------------------------
        */
        { provide: WindowService, useClass: WindowService },
        { provide: TrayService, useClass: TrayService },
        { provide: DockService, useClass: DockService },

        /*
        |--------------------------------------------------------------------------
        | Auto-Update
        |--------------------------------------------------------------------------
        */
        { provide: AutoUpdateService, useClass: AutoUpdateService },

        /*
        |--------------------------------------------------------------------------
        | Security
        |--------------------------------------------------------------------------
        */
        { provide: AuthNativeService, useClass: AuthNativeService },
        { provide: KeychainService, useClass: KeychainService },
        { provide: LockService, useClass: LockService },

        /*
        |--------------------------------------------------------------------------
        | System Integration
        |--------------------------------------------------------------------------
        */
        { provide: ClipboardService, useClass: ClipboardService },
        { provide: FileSystemService, useClass: FileSystemService },
        { provide: ProtocolService, useClass: ProtocolService },
        { provide: PowerService, useClass: PowerService },
        { provide: NotificationService, useClass: NotificationService },

        /*
        |--------------------------------------------------------------------------
        | Updates & Diagnostics
        |--------------------------------------------------------------------------
        */
        { provide: CrashReporterService, useClass: CrashReporterService },
        { provide: DiagnosticsService, useClass: DiagnosticsService },
      ],
      exports: [
        /* Config */
        DESKTOP_CONFIG,
        /* Core */
        DesktopManager,
        DESKTOP_MANAGER,
        MenuRegistry,
        MENU_REGISTRY,
        /* POS Hardware */
        EscPosFormatter,
        PrinterService,
        CashDrawerService,
        ScannerService,
        ScaleService,
        DisplayService,
        /* Permissions */
        PermissionService,
        /* Offline & Sync */
        OfflineService,
        SyncService,
        /* Window & Shell */
        WindowService,
        TrayService,
        DockService,
        /* Auto-Update */
        AutoUpdateService,
        /* Security */
        AuthNativeService,
        KeychainService,
        LockService,
        /* System Integration */
        ClipboardService,
        FileSystemService,
        ProtocolService,
        PowerService,
        NotificationService,
        /* Updates & Diagnostics */
        CrashReporterService,
        DiagnosticsService,
      ],
    };
  }

  /*
  |--------------------------------------------------------------------------
  | forFeature
  |--------------------------------------------------------------------------
  |
  | Register @Menu decorated classes from a feature module.
  | Each class is instantiated and its @Menu/@MenuItem metadata
  | is collected into the global MenuRegistry.
  |
  */
  static forFeature(menuClasses: Array<new (...args: any[]) => any>): DynamicModule {
    for (const MenuClass of menuClasses) {
      const instance = new MenuClass();
      globalMenuRegistry.register(instance);
    }
    return { module: DesktopModule, providers: [], exports: [] };
  }

  /*
  |--------------------------------------------------------------------------
  | registerMenu
  |--------------------------------------------------------------------------
  |
  | Register a single @Menu class. Convenience method for inline use.
  |
  */
  static registerMenu(menuClass: new (...args: any[]) => any): void {
    const instance = new menuClass();
    globalMenuRegistry.register(instance);
  }
}
