/**
 * Shortcut Facade
 *
 * Typed proxy for {@link ShortcutRegistry} from `@stackra/kbd`.
 *
 * Keyboard shortcut registry. Handles registration, lookup, and conflict detection.
 *
 * The facade is a module-level constant typed as `ShortcutRegistry`.
 * It lazily resolves the service from the DI container on first property
 * access — safe to use at module scope before bootstrap completes.
 *
 * ## Setup (once, in main.tsx)
 *
 * ```typescript
 * import { Application } from '@stackra/ts-container';
 * import { Facade } from '@stackra/ts-support';
 *
 * const app = await Application.create(AppModule);
 * Facade.setApplication(app); // wires all facades
 * ```
 *
 * ## Usage
 *
 * ```typescript
 * import { ShortcutFacade } from '@stackra/kbd';
 *
 * // Full autocomplete — no .proxy() call needed
 * ShortcutFacade.register();
 * ```
 *
 * ## Available methods (from {@link ShortcutRegistry})
 *
 * - `register(shortcut: KeyboardShortcut, options?: ShortcutRegistrationOptions): void`
 * - `get(id: string): KeyboardShortcut | undefined`
 * - `getAll(): KeyboardShortcut[]`
 * - `has(id: string): boolean`
 * - `unregister(id: string): void`
 *
 * ## Testing — swap in a mock
 *
 * ```typescript
 * import { Facade } from '@stackra/ts-support';
 * import { ShortcutRegistry } from '@/registries/shortcut.registry';
 *
 * // Before test — replace the resolved instance
 * Facade.swap(ShortcutRegistry, mockInstance);
 *
 * // After test — restore
 * Facade.clearResolvedInstances();
 * ```
 *
 * @module facades/shortcut
 * @see {@link ShortcutRegistry} — the underlying service
 * @see {@link Facade} — the base class providing `make()`
 */

import { Facade } from '@stackra/ts-support';
import { ShortcutRegistry } from '@/registries/shortcut.registry';

/**
 * ShortcutFacade — typed proxy for {@link ShortcutRegistry}.
 *
 * Resolves `ShortcutRegistry` from the DI container via the `ShortcutRegistry` token.
 * All property and method access is forwarded to the resolved instance
 * with correct `this` binding.
 *
 * Call `Facade.setApplication(app)` once during bootstrap before using this.
 *
 * @example
 * ```typescript
 * ShortcutFacade.register();
 * ```
 */
export const ShortcutFacade: ShortcutRegistry = Facade.make<ShortcutRegistry>(ShortcutRegistry);
