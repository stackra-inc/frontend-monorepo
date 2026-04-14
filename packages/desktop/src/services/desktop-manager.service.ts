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
 * |
 * @module @abdokouta/ts-desktop
 */

import { Injectable, Inject, Optional, type OnModuleInit } from "@abdokouta/ts-container";

import { DESKTOP_CONFIG } from "@/constants";
import type { DesktopModuleOptions, DesktopBridge } from "@/interfaces";
import { ElectronBridge } from "@/bridge/electron-bridge";
import { BrowserBridge } from "@/bridge/browser-bridge";
import { MenuRegistry } from "./menu-registry.service";

@Injectable()
export class DesktopManager implements OnModuleInit {
  private _bridge: DesktopBridge | null = null;
  private readonly config: DesktopModuleOptions;
  private readonly menuRegistry: MenuRegistry;

  constructor(
    @Inject(DESKTOP_CONFIG) config: DesktopModuleOptions,
    @Optional() @Inject(MenuRegistry) menuRegistry?: MenuRegistry,
  ) {
    this.config = config;
    this.menuRegistry = menuRegistry ?? new MenuRegistry();
  }

  /*
  |--------------------------------------------------------------------------
  | onModuleInit — called after DI container is fully bootstrapped
  |--------------------------------------------------------------------------
  */
  onModuleInit(): void {
    console.log("[DesktopManager] ──────────────────────────────────────");
    console.log("[DesktopManager] onModuleInit called");
    console.log("[DesktopManager] Platform:", this.isDesktop ? "Electron" : "Browser");
    console.log("[DesktopManager] App name:", this.config.appName);
    console.log("[DesktopManager] MenuRegistry size:", this.menuRegistry.size);

    // Log all collected menus.
    const template = this.menuRegistry.buildTemplate();
    console.log(
      "[DesktopManager] Menu sections:",
      template.map((m) => `${m.label} (${m.items.length} items)`),
    );

    if (template.length > 0) {
      console.log("[DesktopManager] Full menu template:");
      for (const menu of template) {
        console.log(`  [${menu.id}] ${menu.label} (order: ${menu.order})`);
        for (const item of menu.items) {
          if (item.type === "separator") {
            console.log("    ── separator ──");
          } else if (item.role) {
            console.log(`    [role] ${item.role}`);
          } else {
            console.log(
              `    ${item.label} ${item.accelerator ? `(${item.accelerator})` : ""} → ${item.ipcChannel || "no handler"}`,
            );
          }
        }
      }
    } else {
      console.log("[DesktopManager] ⚠️ No menu items registered");
    }

    console.log("[DesktopManager] IPC channels:", this.menuRegistry.getChannels());

    if (!this.isDesktop) {
      console.log("[DesktopManager] Not in Electron — skipping IPC send");
      console.log("[DesktopManager] ──────────────────────────────────────");
      return;
    }

    // Send the window config to the Electron main process.
    this.bridge.send("window:config", {
      title: this.config.appName,
      titleBarStyle: this.config.titleBarStyle,
      width: this.config.width,
      height: this.config.height,
      minWidth: this.config.minWidth,
      minHeight: this.config.minHeight,
      devUrl: this.config.devUrl,
    });
    console.log("[DesktopManager] ✅ Sent window:config IPC");

    // Send the menu template to the Electron main process.
    if (template.length > 0) {
      this.bridge.send("menu:set", template);
      console.log("[DesktopManager] ✅ Sent menu:set IPC to main process");
    }

    // Register IPC listeners for menu action callbacks.
    for (const channel of this.menuRegistry.getChannels()) {
      const handler = this.menuRegistry.getHandler(channel);
      if (handler) {
        this.bridge.onMenuAction(channel, handler);
        console.log(`[DesktopManager] ✅ Registered handler: ${channel}`);
      }
    }

    console.log("[DesktopManager] ──────────────────────────────────────");
  }

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

  private _detectBridge(): DesktopBridge {
    if (typeof window !== "undefined" && (window as any).electronAPI) {
      return new ElectronBridge();
    }
    return new BrowserBridge();
  }
}
