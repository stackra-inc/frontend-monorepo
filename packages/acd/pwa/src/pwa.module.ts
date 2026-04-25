/**
 * PWA Module
 *
 * |--------------------------------------------------------------------------
 * | DI Module for @stackra/ts-pwa
 * |--------------------------------------------------------------------------
 * |
 * | Registers:
 * |   - `PWA_CONFIG` — the unified PwaModuleOptions config object
 * |
 * | The PWA package is primarily React-driven (providers, hooks, components),
 * | not service-driven like cache or redis. The module's job is to make the
 * | config available via DI so services and hooks can access it.
 * |
 * | Runtime behavior is handled by:
 * |   - `<PwaProvider config={...}>` — install prompt, update prompt, network status
 * |   - `<OnboardingProvider config={...}>` — onboarding flow
 * |   - `vitePwaPlugin(config.vite)` — build-time service worker generation
 * |
 * | Follows the same pattern as CacheModule, EventsModule, DesktopModule.
 * |
 * @example
 * ```typescript
 * import { Module } from "@stackra/ts-container";
 * import { PwaModule } from "@stackra/ts-pwa";
 * import pwaConfig from "@/config/pwa.config";
 *
 * @Module({
 *   imports: [
 *     PwaModule.forRoot(pwaConfig),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @module @stackra/ts-pwa
 */

import { Module, type DynamicModule } from '@stackra/ts-container';

import type { PwaModuleOptions } from '@/interfaces/pwa-module-options.interface';
import { PWA_CONFIG } from '@/constants/tokens.constant';

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern
export class PwaModule {
  /*
  |--------------------------------------------------------------------------
  | forRoot
  |--------------------------------------------------------------------------
  |
  | Registers the PWA configuration in the DI container.
  |
  | The config is available via @Inject(PWA_CONFIG) for any service
  | that needs to read PWA settings (e.g., a service that checks
  | if the app is in standalone mode).
  |
  | Runtime components (<PwaProvider>, <OnboardingProvider>) receive
  | their config via props, not DI — they're React components.
  | But having the config in DI allows services to access it too.
  |
  */
  static forRoot(config: PwaModuleOptions = {}): DynamicModule {
    return {
      module: PwaModule,
      global: true,
      providers: [{ provide: PWA_CONFIG, useValue: config }],
      exports: [PWA_CONFIG],
    };
  }
}
