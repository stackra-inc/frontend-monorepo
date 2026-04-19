/**
 * Settings Facade
 *
 * Typed proxy for {@link SettingsStoreManager} from `@stackra/ts-settings`.
 *
 * Settings store manager. Manages named stores (localStorage, memory, api).
 *
 * The facade is a module-level constant typed as `SettingsStoreManager`.
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
 * import { SettingsFacade } from '@stackra/ts-settings';
 *
 * // Full autocomplete — no .proxy() call needed
 * SettingsFacade.store();
 * ```
 *
 * ## Available methods (from {@link SettingsStoreManager})
 *
 * - `store(name?: string): SettingsStore`
 * - `extend(driver: string, creator: DriverCreator<SettingsStore>): this`
 * - `getDefaultInstance(): string`
 *
 * ## Testing — swap in a mock
 *
 * ```typescript
 * import { Facade } from '@stackra/ts-support';
 * import { SettingsStoreManager } from '@/services/settings-manager.service';
 *
 * // Before test — replace the resolved instance
 * Facade.swap(SettingsStoreManager, mockInstance);
 *
 * // After test — restore
 * Facade.clearResolvedInstances();
 * ```
 *
 * @module facades/settings
 * @see {@link SettingsStoreManager} — the underlying service
 * @see {@link Facade} — the base class providing `make()`
 */

import { Facade } from '@stackra/ts-support';
import { SettingsStoreManager } from '@/services/settings-manager.service';

/**
 * SettingsFacade — typed proxy for {@link SettingsStoreManager}.
 *
 * Resolves `SettingsStoreManager` from the DI container via the `SettingsStoreManager` token.
 * All property and method access is forwarded to the resolved instance
 * with correct `this` binding.
 *
 * Call `Facade.setApplication(app)` once during bootstrap before using this.
 *
 * @example
 * ```typescript
 * SettingsFacade.store();
 * ```
 */
export const SettingsFacade: SettingsStoreManager =
  Facade.make<SettingsStoreManager>(SettingsStoreManager);
