/**
 * Consent Facade
 *
 * Typed proxy for {@link ConsentService} from `@stackra/react-tracking`.
 *
 * Manages user consent state for tracking operations. Gates pixel loading,
 * event dispatch, and identity sync behind per-category consent.
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
 * import { ConsentFacade } from '@stackra/react-tracking';
 * import { ConsentCategory } from '@stackra/react-tracking';
 *
 * ConsentFacade.grantConsent(ConsentCategory.MARKETING);
 * ConsentFacade.hasConsent(ConsentCategory.MARKETING); // true
 * ```
 *
 * ## Testing — swap in a mock
 *
 * ```typescript
 * import { Facade } from '@stackra/ts-support';
 * import { CONSENT_SERVICE } from '@/constants/tokens.constant';
 *
 * Facade.swap(CONSENT_SERVICE, mockInstance);
 * // After test
 * Facade.clearResolvedInstances();
 * ```
 *
 * @module facades/consent
 * @see {@link ConsentService} — the underlying service
 */

import { Facade } from "@stackra/ts-support";

import { CONSENT_SERVICE } from "@/constants/tokens.constant";
import type { ConsentService } from "@/services/consent.service";

/**
 * ConsentFacade — typed proxy for {@link ConsentService}.
 *
 * Resolves `ConsentService` from the DI container via the `CONSENT_SERVICE` token.
 *
 * @example
 * ```typescript
 * ConsentFacade.grantConsent(ConsentCategory.MARKETING);
 * ```
 */
export const ConsentFacade: ConsentService = Facade.make<ConsentService>(CONSENT_SERVICE);
