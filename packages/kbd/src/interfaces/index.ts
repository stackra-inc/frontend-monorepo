/**
 * @fileoverview Interfaces exports
 *
 * Central export point for all interface definitions
 */

// Shortcut types
export type { ShortcutCategory } from './shortcut-category.type';
export type { ShortcutContext } from './shortcut-context.type';
export type { Platform } from './platform.type';
export type { ShortcutPriority } from './shortcut-priority.type';

// Core shortcut interfaces
export type { KeyboardShortcut } from './keyboard-shortcut.interface';
export type { PlatformKeys } from './platform-keys.interface';
export type { ShortcutGroup } from './shortcut-group.interface';
export type { ShortcutConflict } from './shortcut-conflict.interface';
export type { ShortcutRegistrationOptions } from './shortcut-registration-options.interface';
export type { ShortcutQueryOptions } from './shortcut-query-options.interface';

// Component props
export type { RefineKbdProps } from './refine-kbd-props.interface';
export type { KbdProps } from './kbd-props.interface';
export type { KbdAbbrProps } from './kbd-abbr-props.interface';
export type { KbdContentProps } from './kbd-content-props.interface';
