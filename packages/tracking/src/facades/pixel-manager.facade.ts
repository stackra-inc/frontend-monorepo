/**
 * Pixel Manager Facade
 *
 * Typed proxy for {@link PixelManager} from `@stackra/react-tracking`.
 *
 * Orchestrates event dispatch across all configured pixel platforms
 * (Meta, Google, TikTok). Consent-gated and offline-aware.
 *
 * ## Setup (once, in main.tsx)
 *
 * ```typescript
 * import { Application } from '@stackra/ts-container';
 * import { Facade } from '@stackra/ts-support';
 *
 * const app = await Application.create(AppModule);
 * Facade.setApplication(app);
 * ```
 *
 * ## Usage
 *
 * ```typescript
 * import { PixelManagerFacade } from '@stackra/react-tracking';
 *
 * PixelManagerFacade.loadAll();
 * PixelManagerFacade.fireEvent('PageView', { url: '/products' }, 'abc-123');
 * ```
 *
 * ## Testing — swap in a mock
 *
 * ```typescript
 * import { Facade } from '@stackra/ts-support';
 * import { PIXEL_MANAGER } from '@/constants/tokens.constant';
 *
 * Facade.swap(PIXEL_MANAGER, mockInstance);
 * // After test
 * Facade.clearResolvedInstances();
 * ```
 *
 * @module facades/pixel-manager
 * @see {@link PixelManager} — the underlying service
 */

import { Facade } from "@stackra/ts-support";

import { PIXEL_MANAGER } from "@/constants/tokens.constant";
import type { PixelManager } from "@/services/pixel-manager.service";

/**
 * PixelManagerFacade — typed proxy for {@link PixelManager}.
 *
 * Resolves `PixelManager` from the DI container via the `PIXEL_MANAGER` token.
 *
 * @example
 * ```typescript
 * PixelManagerFacade.loadAll();
 * PixelManagerFacade.fireEvent('Purchase', { value: 99.99 });
 * ```
 */
export const PixelManagerFacade: PixelManager = Facade.make<PixelManager>(PIXEL_MANAGER);
