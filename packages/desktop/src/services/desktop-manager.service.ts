/**
 * Desktop Manager
 *
 * |--------------------------------------------------------------------------
 * | Central orchestrator for the desktop integration.
 * |--------------------------------------------------------------------------
 * |
 * | On init:
 * |   1. Detects platform (Electron vs browser)
 * |   2. Reads MenuRegistry for collected @Menu items
 * |   3. Sends the menu template to the Electron main process via IPC
 * |   4. Registers IPC listeners for menu action callbacks
 * |   5. Registers menu shortcuts with kbd (if injected via DI)
 * |
 * @module @stackra-inc/ts-desktop
 */

import { Injectable, Inject, Optional, type OnModuleInit } from '@stackra-inc/ts-container';

import { DESKTOP_CONFIG } from '@/constants';
import type { DesktopModuleOptions, DesktopBridge } from '@/interfaces';
import { ElectronBridge } from '@/bridge/electron-bridge';
import { BrowserBridge } from '@/bridge/browser-bridge';
import { MenuRegistry } from './menu-registry.service';

/*
|--------------------------------------------------------------------------
| SHORTCUT_REGISTRY token
|--------------------------------------------------------------------------
|
| Matches the token exported by @stackra-inc/kbd.
| Used for optional DI injection — if kbd is imported in the app module,
| the ShortcutRegistry will be injected. Otherwise it's undefined.
|
*/
const SHORTCUT_REGISTRY = Symbol.for('SHORTCUT_REGISTRY');

/**
 * Minimal interface for the ShortcutRegistry from @stackra-inc/kbd.
 * Avoids a hard import dependency on the kbd package.
 */
interface ShortcutRegistryLike {
  register(
    shortcut: {
      id: string;
      name: string;
      keys: string[];
      category: string;
      context: string;
      callback: () => void;
      showInHelp: boolean;
    },
    options?: { override?: boolean; onConflict?: string }
  ): unknown;
}

@Injectable()
export class DesktopManager implements OnModuleInit {
  private _bridge: DesktopBridge | null = null;
  private readonly config: DesktopModuleOptions;
  private readonly menuRegistry: MenuRegistry;
  private readonly shortcutRegistry: ShortcutRegistryLike | null;

  constructor(
    @Inject(DESKTOP_CONFIG) config: DesktopModuleOptions,
    @Optional() @Inject(MenuRegistry) menuRegistry?: MenuRegistry,
    @Optional() @Inject(SHORTCUT_REGISTRY) shortcutRegistry?: ShortcutRegistryLike
  ) {
    this.config = config;
    this.menuRegistry = menuRegistry ?? new MenuRegistry();
    this.shortcutRegistry = shortcutRegistry ?? null;
  }

  /*
  |--------------------------------------------------------------------------
  | onModuleInit — called after DI container is fully bootstrapped
  |--------------------------------------------------------------------------
  */
  onModuleInit(): void {
    console.log('[DesktopManager] ──────────────────────────────────────');
    console.log('[DesktopManager] onModuleInit called');
    console.log('[DesktopManager] Platform:', this.isDesktop ? 'Electron' : 'Browser');
    console.log('[DesktopManager] App name:', this.config.appName);
    console.log('[DesktopManager] MenuRegistry size:', this.menuRegistry.size);

    const template = this.menuRegistry.buildTemplate();
    console.log(
      '[DesktopManager] Menu sections:',
      template.map((m) => `${m.label} (${m.items.length} items)`)
    );

    if (template.length > 0) {
      console.log('[DesktopManager] Full menu template:');
      for (const menu of template) {
        console.log(`  [${menu.id}] ${menu.label} (order: ${menu.order})`);
        for (const item of menu.items) {
          if (item.type === 'separator') {
            console.log('    ── separator ──');
          } else if (item.role) {
            console.log(`    [role] ${item.role}`);
          } else {
            console.log(
              `    ${item.label} ${item.accelerator ? `(${item.accelerator})` : ''} → ${item.ipcChannel || 'no handler'}`
            );
          }
        }
      }
    } else {
      console.log('[DesktopManager] ⚠️ No menu items registered');
    }

    console.log('[DesktopManager] IPC channels:', this.menuRegistry.getChannels());

    /*
    |--------------------------------------------------------------------------
    | Register menu shortcuts with kbd (via DI, not dynamic require).
    |--------------------------------------------------------------------------
    |
    | In browser mode: kbd handles keyboard shortcuts via addEventListener.
    |   This is the ONLY way shortcuts work without a native menu.
    |
    | In Electron mode: native menu handles accelerators, but we still
    |   register with kbd so <ShortcutList> and <ShortcutHint> work.
    |
    | Shortcuts are registered in BOTH modes if kbd is available.
    |
    */
    this.registerShortcuts();

    if (!this.isDesktop) {
      console.log('[DesktopManager] Not in Electron — skipping IPC send');
      console.log('[DesktopManager] ──────────────────────────────────────');
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Send window config and menu template to the Electron main process.
    |--------------------------------------------------------------------------
    */
    this.bridge.send('window:config', {
      title: this.config.appName,
      titleBarStyle: this.config.titleBarStyle,
      width: this.config.width,
      height: this.config.height,
      minWidth: this.config.minWidth,
      minHeight: this.config.minHeight,
      devUrl: this.config.devUrl,
    });
    console.log('[DesktopManager] ✅ Sent window:config IPC');

    if (template.length > 0) {
      this.bridge.send('menu:set', template);
      console.log('[DesktopManager] ✅ Sent menu:set IPC to main process');
    }

    /*
    |--------------------------------------------------------------------------
    | Register IPC listeners for menu action callbacks.
    |--------------------------------------------------------------------------
    */
    for (const channel of this.menuRegistry.getChannels()) {
      const handler = this.menuRegistry.getHandler(channel);
      if (handler) {
        this.bridge.onMenuAction(channel, handler);
        console.log(`[DesktopManager] ✅ Registered handler: ${channel}`);
      }
    }

    console.log('[DesktopManager] ──────────────────────────────────────');
  }

  /*
  |--------------------------------------------------------------------------
  | Public API
  |--------------------------------------------------------------------------
  */

  /** Get the platform bridge. */
  get bridge(): DesktopBridge {
    if (!this._bridge) {
      this._bridge = this._detectBridge();
    }
    return this._bridge;
  }

  /** Whether the app is running inside Electron. */
  get isDesktop(): boolean {
    return this.bridge.isDesktop;
  }

  /** Get the module configuration. */
  getConfig(): DesktopModuleOptions {
    return this.config;
  }

  /** Get the app name from config. */
  getAppName(): string {
    return this.config.appName;
  }

  /** Get the menu registry. */
  getMenuRegistry(): MenuRegistry {
    return this.menuRegistry;
  }

  /*
  |--------------------------------------------------------------------------
  | Private
  |--------------------------------------------------------------------------
  */

  /** Register menu shortcuts with the kbd ShortcutRegistry (if available via DI). */
  private registerShortcuts(): void {
    const shortcuts = this.menuRegistry.getShortcuts();
    if (shortcuts.length === 0) return;

    if (!this.shortcutRegistry) {
      console.log(
        '[DesktopManager] ShortcutRegistry not injected — shortcuts not registered with kbd'
      );
      console.log(
        '[DesktopManager] Import KbdModule.forRoot() in your app module to enable keyboard shortcuts'
      );
      return;
    }

    for (const shortcut of shortcuts) {
      this.shortcutRegistry.register(
        {
          id: shortcut.id,
          name: shortcut.name,
          keys: shortcut.keys,
          category: shortcut.category,
          context: 'global',
          callback: shortcut.callback,
          showInHelp: true,
        },
        { override: true, onConflict: 'skip' }
      );
    }

    console.log(`[DesktopManager] ✅ Registered ${shortcuts.length} menu shortcuts with kbd`);
  }

  /** Detect the correct bridge implementation based on the runtime environment. */
  private _detectBridge(): DesktopBridge {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return new ElectronBridge();
    }
    return new BrowserBridge();
  }
}
