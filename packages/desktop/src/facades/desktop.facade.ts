/**
 * Desktop Facade
 *
 * Typed proxy for {@link DesktopManager} from `@stackra-inc/ts-desktop`.
 *
 * Desktop integration manager. Provides Electron bridge, menu, and IPC access.
 *
 * The facade is a module-level constant typed as `DesktopManager`.
 * It lazily resolves the service from the DI container on first property
 * access — safe to use at module scope before bootstrap completes.
 *
 * ## Setup (once, in main.tsx)
 *
 * ```typescript
 * import { Application } from '@stackra-inc/ts-container';
 * import { Facade } from '@stackra-inc/ts-support';
 *
 * const app = await Application.create(AppModule);
 * Facade.setApplication(app); // wires all facades
 * ```
 *
 * ## Usage
 *
 * ```typescript
 * import { DesktopFacade } from '@stackra-inc/ts-desktop';
 *
 * // Full autocomplete — no .proxy() call needed
 * DesktopFacade.bridge();
 * ```
 *
 * ## Available methods (from {@link DesktopManager})
 *
 * - `get bridge(): DesktopBridge`
 * - `isElectron(): boolean`
 * - `send(channel: string, ...args: unknown[]): void`
 * - `on(channel: string, handler: (...args: unknown[]) => void): void`
 *
 * ## Testing — swap in a mock
 *
 * ```typescript
 * import { Facade } from '@stackra-inc/ts-support';
 * import { DesktopManager } from '@/services/desktop-manager.service';
 *
 * // Before test — replace the resolved instance
 * Facade.swap(DesktopManager, mockInstance);
 *
 * // After test — restore
 * Facade.clearResolvedInstances();
 * ```
 *
 * @module facades/desktop
 * @see {@link DesktopManager} — the underlying service
 * @see {@link Facade} — the base class providing `make()`
 */

import { Facade } from '@stackra-inc/ts-support';
import { DesktopManager } from '@/services/desktop-manager.service';

/**
 * DesktopFacade — typed proxy for {@link DesktopManager}.
 *
 * Resolves `DesktopManager` from the DI container via the `DesktopManager` token.
 * All property and method access is forwarded to the resolved instance
 * with correct `this` binding.
 *
 * Call `Facade.setApplication(app)` once during bootstrap before using this.
 *
 * @example
 * ```typescript
 * DesktopFacade.bridge();
 * ```
 */
export const DesktopFacade: DesktopManager = Facade.make<DesktopManager>(DesktopManager);
