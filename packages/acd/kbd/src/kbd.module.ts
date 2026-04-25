/**
 * KBD Module
 *
 * |--------------------------------------------------------------------------
 * | DI Module for @stackra/kbd
 * |--------------------------------------------------------------------------
 * |
 * | Registers:
 * |   - `KBD_CONFIG`          — raw config object
 * |   - `ShortcutRegistry`    — container-managed singleton
 * |   - `SHORTCUT_REGISTRY`   — alias token to the same singleton
 * |
 * | Users inject `ShortcutRegistry` and call register/unregister/query
 * | directly. The container manages the singleton lifecycle.
 * |
 * | ## Why the Type Assertion
 * |
 * | The container's `Type<T>` interface requires `new (...args: unknown[]): T`,
 * | but `BaseRegistry` has an optional typed constructor param. This is a
 * | TypeScript-level mismatch only — the DI container resolves the class
 * | correctly at runtime. The `as Type<T>` assertion bridges this gap.
 * |
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     KbdModule.forRoot({ registerBuiltIn: true }),
 *     KbdModule.forFeature([
 *       { id: 'pos:scan', name: 'Scan Barcode', keys: ['F2'], ... },
 *     ]),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @module @stackra/kbd
 */

import { Module, type DynamicModule, type Type } from '@stackra/ts-container';

import type { KeyboardShortcut, ShortcutGroup } from '@/interfaces';
import { ShortcutRegistry } from '@/registries/shortcut.registry';
import { BUILT_IN_SHORTCUTS, BUILT_IN_GROUPS } from '@/shortcuts/built-in-shortcuts';
import { KBD_CONFIG, SHORTCUT_REGISTRY } from '@/constants';

/*
|--------------------------------------------------------------------------
| KbdModuleOptions
|--------------------------------------------------------------------------
*/

/** Configuration for KbdModule.forRoot(). */
export interface KbdModuleOptions {
  /** Initial shortcuts to register. */
  shortcuts?: KeyboardShortcut[];

  /** Initial groups to register. */
  groups?: ShortcutGroup[];

  /** Whether to register built-in shortcuts. @default true */
  registerBuiltIn?: boolean;

  /** Whether to enable debug logging. @default false */
  debug?: boolean;
}

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern
export class KbdModule {
  /*
  |--------------------------------------------------------------------------
  | forRoot
  |--------------------------------------------------------------------------
  |
  | Registers the ShortcutRegistry as a container-managed singleton.
  |
  | Applies options:
  |   - registerBuiltIn: registers navigation, search, editing shortcuts
  |   - shortcuts: registers additional shortcuts from config
  |   - groups: registers shortcut groups from config
  |
  | Built-in shortcuts and config-provided shortcuts are registered via
  | a factory provider that runs during container resolution, ensuring
  | the registry is populated before any consumer reads from it.
  |
  */
  static forRoot(config?: KbdModuleOptions): DynamicModule {
    const options: KbdModuleOptions = {
      registerBuiltIn: true,
      debug: false,
      ...config,
    };

    return {
      module: KbdModule,
      global: true,
      providers: [
        { provide: KBD_CONFIG, useValue: options },
        ShortcutRegistry as Type<ShortcutRegistry>,
        { provide: SHORTCUT_REGISTRY, useExisting: ShortcutRegistry as Type<ShortcutRegistry> },
        {
          provide: 'KBD_INIT',
          useFactory: (registry: ShortcutRegistry) => {
            /*
            |--------------------------------------------------------------------------
            | Register built-in shortcuts and groups.
            |--------------------------------------------------------------------------
            */
            if (options.registerBuiltIn !== false) {
              for (const shortcut of BUILT_IN_SHORTCUTS) {
                registry.register(shortcut, { onConflict: 'skip' });
              }
              for (const group of BUILT_IN_GROUPS) {
                registry.registerGroup(group);
              }

              if (options.debug) {
                console.log(`[KbdModule] Registered ${BUILT_IN_SHORTCUTS.length} built-in shortcuts`);
                console.log(`[KbdModule] Registered ${BUILT_IN_GROUPS.length} built-in groups`);
              }
            }

            /*
            |--------------------------------------------------------------------------
            | Register shortcuts from config.
            |--------------------------------------------------------------------------
            */
            if (options.shortcuts) {
              for (const shortcut of options.shortcuts) {
                registry.register(shortcut, { onConflict: 'skip' });
              }
            }

            /*
            |--------------------------------------------------------------------------
            | Register groups from config.
            |--------------------------------------------------------------------------
            */
            if (options.groups) {
              for (const group of options.groups) {
                registry.registerGroup(group);
              }
            }

            if (options.debug) {
              console.log('[KbdModule] Initialized. Total shortcuts:', registry.getAll().length);
            }

            return true;
          },
          inject: [ShortcutRegistry as Type<ShortcutRegistry>],
        },
      ],
      exports: [ShortcutRegistry as Type<ShortcutRegistry>, SHORTCUT_REGISTRY, KBD_CONFIG],
    };
  }

  /*
  |--------------------------------------------------------------------------
  | forFeature
  |--------------------------------------------------------------------------
  |
  | Register additional shortcuts from a feature module.
  | Shortcuts are added to the container-managed ShortcutRegistry singleton
  | via a factory provider.
  |
  */
  static forFeature(shortcuts: KeyboardShortcut[]): DynamicModule {
    return {
      module: KbdModule,
      providers: [
        {
          provide: 'KBD_FEATURE_INIT',
          useFactory: (registry: ShortcutRegistry) => {
            for (const shortcut of shortcuts) {
              registry.register(shortcut, { onConflict: 'skip' });
            }
            return true;
          },
          inject: [ShortcutRegistry as Type<ShortcutRegistry>],
        },
      ],
      exports: [],
    };
  }
}
