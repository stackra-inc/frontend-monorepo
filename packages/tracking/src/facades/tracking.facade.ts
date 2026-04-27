/**
 * Tracking Facade
 *
 * Typed proxy for {@link TrackingService} from `@stackra/react-tracking`.
 *
 * Engagement tracking service. Handles page views, scroll depth,
 * time on page, and CTA click events across configured advertising pixels.
 *
 * The facade is a module-level constant typed as `ITrackingService`.
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
 * import { TrackingFacade } from '@stackra/react-tracking';
 *
 * // Full autocomplete — no .proxy() call needed
 * TrackingFacade.trackPageView('/products', 'abc-123');
 * TrackingFacade.trackScrollDepth(50, '/products');
 * ```
 *
 * ## Available methods (from {@link ITrackingService})
 *
 * - `trackPageView(url: string, eventId?: string): void`
 * - `trackScrollDepth(depth: number, url: string): void`
 * - `trackTimeOnPage(duration: number, url: string): void`
 * - `trackCtaClick(ctaId: string, url: string): void`
 *
 * ## Testing — swap in a mock
 *
 * ```typescript
 * import { Facade } from '@stackra/ts-support';
 * import { TRACKING_SERVICE } from '@/constants/tokens.constant';
 *
 * // Before test — replace the resolved instance
 * Facade.swap(TRACKING_SERVICE, mockInstance);
 *
 * // After test — restore
 * Facade.clearResolvedInstances();
 * ```
 *
 * @module facades/tracking
 * @see {@link TrackingService} — the underlying service
 * @see {@link Facade} — the base class providing `make()`
 */

import { Facade } from "@stackra/ts-support";

import { TRACKING_SERVICE } from "@/constants/tokens.constant";
import type { ITrackingService } from "@/interfaces/tracking-service.interface";

/**
 * TrackingFacade — typed proxy for {@link TrackingService}.
 *
 * Resolves `TrackingService` from the DI container via the `TRACKING_SERVICE` token.
 * All property and method access is forwarded to the resolved instance
 * with correct `this` binding.
 *
 * Call `Facade.setApplication(app)` once during bootstrap before using this.
 *
 * @example
 * ```typescript
 * TrackingFacade.trackPageView('/products', 'abc-123');
 * ```
 */
export const TrackingFacade: ITrackingService = Facade.make<ITrackingService>(TRACKING_SERVICE);
