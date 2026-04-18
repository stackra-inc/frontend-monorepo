/**
 * usePwaConfig Hook
 *
 * |--------------------------------------------------------------------------
 * | Reads the PWA config from the DI container.
 * |--------------------------------------------------------------------------
 * |
 * | Returns undefined if no ContainerProvider or PwaModule is present.
 * | Used internally by PwaProvider and OnboardingProvider.
 * |
 * @module pwa/hooks/use-pwa-config
 */

import { PWA_CONFIG } from '@/constants';
import type { PwaModuleOptions } from '@/interfaces/pwa-module-options.interface';

/**
 * Reads the PWA module config from the DI container.
 *
 * Returns undefined if the DI container is not available.
 */
export function usePwaConfig(): PwaModuleOptions | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = Function('return require("@stackra/ts-container")')() as {
      useOptionalInject: (token: symbol) => unknown;
    };
    return mod.useOptionalInject(PWA_CONFIG) as PwaModuleOptions | undefined;
  } catch {
    return undefined;
  }
}
