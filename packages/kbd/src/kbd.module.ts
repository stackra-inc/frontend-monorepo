/**
 * @fileoverview KBD Module
 *
 * Main module for keyboard shortcut management.
 * Provides static methods for registering shortcuts and accessing the registry.
 *
 * @module KbdModule
 */

import type {
  KeyboardShortcut,
  ShortcutGroup,
  ShortcutRegistrationOptions,
  ShortcutQueryOptions,
} from "@/interfaces";
import {
  shortcutRegistry,
  type ShortcutRegistry,
} from "@/registries/shortcut.registry";
import { BUILT_IN_SHORTCUTS, BUILT_IN_GROUPS } from "@/shortcuts/built-in-shortcuts";

/**
 * KBD Module Configuration
 */
export interface KbdModuleOptions {
  /**
   * Initial shortcuts to register
   */
  shortcuts?: KeyboardShortcut[];

  /**
   * Initial groups to register
   */
  groups?: ShortcutGroup[];

  /**
   * Default registration options
   */
  defaultOptions?: ShortcutRegistrationOptions;

  /**
   * Whether to register built-in shortcuts
   *
   * @default true
   */
  registerBuiltIn?: boolean;

  /**
   * Whether to enable debug logging
   *
   * @default false
   */
  debug?: boolean;
}

/**
 * KBD Module
 *
 * Main module for keyboard shortcut management in Refine applications.
 * Provides static methods for registering shortcuts, accessing the registry,
 * and managing keyboard shortcuts globally.
 *
 * @example
 * Basic usage:
 * ```typescript
 * import { KbdModule } from '@abdokouta/kbd';
 *
 * // Register a shortcut
 * KbdModule.register({
 *   id: 'search',
 *   name: 'Open Search',
 *   category: 'search',
 *   context: 'global',
 *   keys: ['command', 'K'],
 *   callback: () => openSearch(),
 * });
 *
 * // Get all shortcuts
 * const shortcuts = KbdModule.getAll();
 * ```
 *
 * @example
 * With configuration:
 * ```typescript
 * KbdModule.configure({
 *   shortcuts: [
 *     {
 *       id: 'save',
 *       name: 'Save',
 *       category: 'file',
 *       context: 'global',
 *       keys: ['command', 'S'],
 *       callback: () => save(),
 *     },
 *   ],
 *   registerBuiltIn: true,
 *   debug: true,
 * });
 * ```
 */
export class KbdModule {
  /**
   * Module configuration
   */
  private static config: KbdModuleOptions = {
    registerBuiltIn: true,
    debug: false,
  };

  /**
   * Whether the module has been initialized
   */
  private static initialized = false;

  /**
   * Get the shortcut registry instance
   *
   * @returns The global shortcut registry
   */
  public static getRegistry(): ShortcutRegistry {
    return shortcutRegistry;
  }

  // ============================================================================
  // Configuration
  // ============================================================================

  /**
   * Configure the KBD module
   *
   * @param config - Module configuration
   *
   * @example
   * ```typescript
   * KbdModule.configure({
   *   shortcuts: [...],
   *   groups: [...],
   *   registerBuiltIn: true,
   *   debug: true,
   * });
   * ```
   */
  public static configure(config: KbdModuleOptions): void {
    this.config = { ...this.config, ...config };

    if (!this.initialized) {
      this.initialize();
    }
  }

  /**
   * Initialize the module
   */
  private static initialize(): void {
    if (this.initialized) {
      return;
    }

    // Register built-in shortcuts
    if (this.config.registerBuiltIn) {
      this.registerBuiltInShortcuts();
    }

    // Register configured shortcuts
    if (this.config.shortcuts) {
      for (const shortcut of this.config.shortcuts) {
        this.register(shortcut, this.config.defaultOptions);
      }
    }

    // Register configured groups
    if (this.config.groups) {
      for (const group of this.config.groups) {
        this.registerGroup(group);
      }
    }

    this.initialized = true;

    if (this.config.debug) {
      console.log("[KbdModule] Initialized with config:", this.config);
      console.log("[KbdModule] Registered shortcuts:", this.getAll().length);
    }
  }

  /**
   * Register built-in shortcuts
   */
  private static registerBuiltInShortcuts(): void {
    // Register all built-in shortcuts
    for (const shortcut of BUILT_IN_SHORTCUTS) {
      this.register(shortcut);
    }

    // Register all built-in groups
    for (const group of BUILT_IN_GROUPS) {
      this.registerGroup(group);
    }

    if (this.config.debug) {
      console.log(
        "[KbdModule] Registered built-in shortcuts:",
        BUILT_IN_SHORTCUTS.length,
      );
      console.log(
        "[KbdModule] Registered built-in groups:",
        BUILT_IN_GROUPS.length,
      );
    }
  }

  // ============================================================================
  // Registration
  // ============================================================================

  /**
   * Register a keyboard shortcut
   *
   * @param shortcut - Shortcut configuration
   * @param options - Registration options
   * @returns The registered shortcut
   *
   * @example
   * ```typescript
   * KbdModule.register({
   *   id: 'search',
   *   name: 'Open Search',
   *   category: 'search',
   *   context: 'global',
   *   keys: ['command', 'K'],
   *   callback: () => openSearch(),
   * });
   * ```
   */
  public static register(
    shortcut: KeyboardShortcut,
    options?: ShortcutRegistrationOptions,
  ): KeyboardShortcut {
    const mergedOptions = { ...this.config.defaultOptions, ...options };
    const registered = shortcutRegistry.register(shortcut, mergedOptions);

    if (this.config.debug) {
      console.log("[KbdModule] Registered shortcut:", registered.id);
    }

    return registered;
  }

  /**
   * Register multiple shortcuts at once
   *
   * @param shortcuts - Array of shortcuts to register
   * @param options - Registration options
   * @returns Array of registered shortcuts
   *
   * @example
   * ```typescript
   * KbdModule.registerMany([
   *   { id: 'save', name: 'Save', ... },
   *   { id: 'undo', name: 'Undo', ... },
   * ]);
   * ```
   */
  public static registerMany(
    shortcuts: KeyboardShortcut[],
    options?: ShortcutRegistrationOptions,
  ): KeyboardShortcut[] {
    return shortcuts.map((shortcut) => this.register(shortcut, options));
  }

  /**
   * Unregister a keyboard shortcut
   *
   * @param id - Shortcut ID to unregister
   * @returns True if shortcut was unregistered
   *
   * @example
   * ```typescript
   * KbdModule.unregister('search');
   * ```
   */
  public static unregister(id: string): boolean {
    const result = shortcutRegistry.unregister(id);

    if (this.config.debug && result) {
      console.log("[KbdModule] Unregistered shortcut:", id);
    }

    return result;
  }

  /**
   * Unregister multiple shortcuts
   *
   * @param ids - Array of shortcut IDs to unregister
   * @returns Number of shortcuts unregistered
   */
  public static unregisterMany(ids: string[]): number {
    return shortcutRegistry.unregisterMany(ids);
  }

  /**
   * Clear all shortcuts
   */
  public static clear(): void {
    shortcutRegistry.clear();
    this.initialized = false;

    if (this.config.debug) {
      console.log("[KbdModule] Cleared all shortcuts");
    }
  }

  // ============================================================================
  // Lookup
  // ============================================================================

  /**
   * Get a shortcut by ID
   *
   * @param id - Shortcut ID
   * @returns The shortcut or undefined if not found
   *
   * @example
   * ```typescript
   * const searchShortcut = KbdModule.get('search');
   * ```
   */
  public static get(id: string): KeyboardShortcut | undefined {
    return shortcutRegistry.get(id);
  }

  /**
   * Check if a shortcut exists
   *
   * @param id - Shortcut ID
   * @returns True if shortcut exists
   */
  public static has(id: string): boolean {
    return shortcutRegistry.has(id);
  }

  /**
   * Get all shortcuts
   *
   * @returns Array of all shortcuts
   *
   * @example
   * ```typescript
   * const allShortcuts = KbdModule.getAll();
   * ```
   */
  public static getAll(): KeyboardShortcut[] {
    return shortcutRegistry.getAll();
  }

  /**
   * Get shortcuts by category
   *
   * @param category - Category to filter by
   * @returns Array of shortcuts in the category
   *
   * @example
   * ```typescript
   * const searchShortcuts = KbdModule.getByCategory('search');
   * ```
   */
  public static getByCategory(
    category: KeyboardShortcut["category"],
  ): KeyboardShortcut[] {
    return shortcutRegistry.getByCategory(category);
  }

  /**
   * Get shortcuts by context
   *
   * @param context - Context to filter by
   * @returns Array of shortcuts in the context
   */
  public static getByContext(
    context: KeyboardShortcut["context"],
  ): KeyboardShortcut[] {
    return shortcutRegistry.getByContext(context);
  }

  /**
   * Get shortcuts by group
   *
   * @param group - Group name to filter by
   * @returns Array of shortcuts in the group
   */
  public static getByGroup(group: string): KeyboardShortcut[] {
    return shortcutRegistry.getByGroup(group);
  }

  /**
   * Query shortcuts with filters
   *
   * @param options - Query options
   * @returns Array of matching shortcuts
   *
   * @example
   * ```typescript
   * const enabledSearchShortcuts = KbdModule.query({
   *   category: 'search',
   *   enabled: true,
   * });
   * ```
   */
  public static query(options: ShortcutQueryOptions): KeyboardShortcut[] {
    return shortcutRegistry.query(options);
  }

  // ============================================================================
  // Groups
  // ============================================================================

  /**
   * Register a shortcut group
   *
   * @param group - Group configuration
   *
   * @example
   * ```typescript
   * KbdModule.registerGroup({
   *   id: 'navigation',
   *   name: 'Navigation',
   *   description: 'Shortcuts for navigating the application',
   *   shortcuts: [...],
   * });
   * ```
   */
  public static registerGroup(group: ShortcutGroup): void {
    shortcutRegistry.registerGroup(group);

    if (this.config.debug) {
      console.log("[KbdModule] Registered group:", group.id);
    }
  }

  /**
   * Get a group by ID
   *
   * @param id - Group ID
   * @returns The group or undefined if not found
   */
  public static getGroup(id: string): ShortcutGroup | undefined {
    return shortcutRegistry.getGroup(id);
  }

  /**
   * Get all groups
   *
   * @returns Array of all groups
   */
  public static getAllGroups(): ShortcutGroup[] {
    return shortcutRegistry.getAllGroups();
  }

  // ============================================================================
  // State Management
  // ============================================================================

  /**
   * Enable a shortcut
   *
   * @param id - Shortcut ID
   * @returns True if shortcut was enabled
   */
  public static enable(id: string): boolean {
    return shortcutRegistry.enable(id);
  }

  /**
   * Disable a shortcut
   *
   * @param id - Shortcut ID
   * @returns True if shortcut was disabled
   */
  public static disable(id: string): boolean {
    return shortcutRegistry.disable(id);
  }

  /**
   * Toggle a shortcut's enabled state
   *
   * @param id - Shortcut ID
   * @returns The new enabled state, or undefined if not found
   */
  public static toggle(id: string): boolean | undefined {
    return shortcutRegistry.toggle(id);
  }

  // ============================================================================
  // Platform
  // ============================================================================

  /**
   * Get the current platform
   *
   * @returns The current platform
   */
  public static getPlatform() {
    return shortcutRegistry.getPlatform();
  }

  /**
   * Set the platform manually
   *
   * @param platform - The platform to set
   */
  public static setPlatform(
    platform: Parameters<ShortcutRegistry["setPlatform"]>[0],
  ): void {
    shortcutRegistry.setPlatform(platform);
  }

  /**
   * Resolve platform-specific keys
   *
   * @param keys - Keys configuration
   * @returns Resolved keys for the current platform
   */
  public static resolveKeys(
    keys: Parameters<ShortcutRegistry["resolveKeys"]>[0],
  ): ReturnType<ShortcutRegistry["resolveKeys"]> {
    return shortcutRegistry.resolveKeys(keys);
  }

  // ============================================================================
  // Events
  // ============================================================================

  /**
   * Subscribe to registry events
   *
   * @param listener - Event listener function
   * @returns Unsubscribe function
   *
   * @example
   * ```typescript
   * const unsubscribe = KbdModule.subscribe((event) => {
   *   console.log('Registry event:', event);
   * });
   *
   * // Later...
   * unsubscribe();
   * ```
   */
  public static subscribe(
    listener: Parameters<ShortcutRegistry["subscribe"]>[0],
  ): ReturnType<ShortcutRegistry["subscribe"]> {
    return shortcutRegistry.subscribe(listener);
  }
}
