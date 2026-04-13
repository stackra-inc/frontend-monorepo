/**
 * Dependency Injection Tokens for the Settings Package
 *
 * Symbols used to register and resolve settings dependencies
 * in the IoC container. Each token maps to a specific role:
 *
 * - SETTINGS_CONFIG  → raw module options (persistence driver, defaults)
 * - SETTINGS_REGISTRY → the central registry that holds all registered groups
 * - SETTINGS_SERVICE  → the public API service consumers interact with
 *
 * @module constants/tokens
 */

/**
 * Token for the root settings module configuration.
 *
 * Injected into the SettingsService so it knows which persistence
 * driver to use (localStorage, API, etc.) and any global defaults.
 *
 * @example
 * ```ts
 * @Injectable()
 * class SettingsService {
 *   constructor(@Inject(SETTINGS_CONFIG) private config: SettingsModuleOptions) {}
 * }
 * ```
 */
export const SETTINGS_CONFIG = Symbol.for('SETTINGS_CONFIG');

/**
 * Token for the SettingsRegistry singleton.
 *
 * The registry is the source of truth for all registered setting groups.
 * Modules call `forFeature()` to register their DTO classes here.
 *
 * @example
 * ```ts
 * @Injectable()
 * class SomeService {
 *   constructor(@Inject(SETTINGS_REGISTRY) private registry: SettingsRegistry) {
 *     const groups = registry.getAll();
 *   }
 * }
 * ```
 */
export const SETTINGS_REGISTRY = Symbol.for('SETTINGS_REGISTRY');

/**
 * Token for the public SettingsService.
 *
 * This is the primary API consumers use to get/set setting values.
 *
 * @example
 * ```ts
 * const settings = useInject<SettingsService>(SETTINGS_SERVICE);
 * const display = settings.get(DisplaySettings);
 * ```
 */
export const SETTINGS_SERVICE = Symbol.for('SETTINGS_SERVICE');

/**
 * Token for the SettingsStoreManager.
 *
 * The manager creates and caches store instances (localStorage, API, memory).
 * Follows the same pattern as CACHE_MANAGER in the cache package.
 *
 * @example
 * ```ts
 * const manager = useInject<SettingsStoreManager>(SETTINGS_MANAGER);
 * const store = manager.store('api');
 * ```
 */
export const SETTINGS_MANAGER = Symbol.for('SETTINGS_MANAGER');
