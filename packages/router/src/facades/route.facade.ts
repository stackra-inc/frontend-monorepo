/**
 * Route Facade
 *
 * Typed proxy for {@link RouteRegistry} from `@stackra/react-router`.
 *
 * Route registry. Stores and retrieves route definitions registered via @Route.
 *
 * The facade is a module-level constant typed as `RouteRegistry`.
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
 * import { RouteFacade } from '@stackra/react-router';
 *
 * // Full autocomplete — no .proxy() call needed
 * RouteFacade.register();
 * ```
 *
 * ## Available methods (from {@link RouteRegistry})
 *
 * - `register(metadata: RouteMetadata, component: ComponentType<any>): void`
 * - `get(path: string): RouteDefinition | undefined`
 * - `getAll(): RouteDefinition[]`
 * - `has(path: string): boolean`
 *
 * ## Testing — swap in a mock
 *
 * ```typescript
 * import { Facade } from '@stackra/ts-support';
 * import { ROUTE_REGISTRY } from '@/constants/tokens.constant';
 *
 * // Before test — replace the resolved instance
 * Facade.swap(ROUTE_REGISTRY, mockInstance);
 *
 * // After test — restore
 * Facade.clearResolvedInstances();
 * ```
 *
 * @module facades/route
 * @see {@link RouteRegistry} — the underlying service
 * @see {@link Facade} — the base class providing `make()`
 */

import { Facade } from '@stackra/ts-support';
import { RouteRegistry } from '@/registries/route.registry';
import { ROUTE_REGISTRY } from '@/constants/tokens.constant';

/**
 * RouteFacade — typed proxy for {@link RouteRegistry}.
 *
 * Resolves `RouteRegistry` from the DI container via the `ROUTE_REGISTRY` token.
 * All property and method access is forwarded to the resolved instance
 * with correct `this` binding.
 *
 * Call `Facade.setApplication(app)` once during bootstrap before using this.
 *
 * @example
 * ```typescript
 * RouteFacade.register();
 * ```
 */
export const RouteFacade: RouteRegistry = Facade.make<RouteRegistry>(ROUTE_REGISTRY);
