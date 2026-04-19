/**
 * Theme Facade
 *
 * Typed proxy for {@link ThemeRegistry} from `@stackra-inc/react-theming`.
 *
 * Theme registry. Stores and retrieves registered theme configurations.
 *
 * The facade is a module-level constant typed as `ThemeRegistry`.
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
 * import { ThemeFacade } from '@stackra-inc/react-theming';
 *
 * // Full autocomplete — no .proxy() call needed
 * ThemeFacade.register();
 * ```
 *
 * ## Available methods (from {@link ThemeRegistry})
 *
 * - `register(key: string, theme: ThemeConfig): void`
 * - `get(id: string): ThemeConfig | undefined`
 * - `getThemes(): ThemeConfig[]`
 * - `getThemeIds(): string[]`
 * - `has(id: string): boolean`
 *
 * ## Testing — swap in a mock
 *
 * ```typescript
 * import { Facade } from '@stackra-inc/ts-support';
 * import { THEME_REGISTRY } from '@/constants/tokens.constant';
 *
 * // Before test — replace the resolved instance
 * Facade.swap(THEME_REGISTRY, mockInstance);
 *
 * // After test — restore
 * Facade.clearResolvedInstances();
 * ```
 *
 * @module facades/theme
 * @see {@link ThemeRegistry} — the underlying service
 * @see {@link Facade} — the base class providing `make()`
 */

import { Facade } from '@stackra-inc/ts-support';
import { ThemeRegistry } from '@/registries/theme.registry';
import { THEME_REGISTRY } from '@/constants/tokens.constant';

/**
 * ThemeFacade — typed proxy for {@link ThemeRegistry}.
 *
 * Resolves `ThemeRegistry` from the DI container via the `THEME_REGISTRY` token.
 * All property and method access is forwarded to the resolved instance
 * with correct `this` binding.
 *
 * Call `Facade.setApplication(app)` once during bootstrap before using this.
 *
 * @example
 * ```typescript
 * ThemeFacade.register();
 * ```
 */
export const ThemeFacade: ThemeRegistry = Facade.make<ThemeRegistry>(THEME_REGISTRY);
