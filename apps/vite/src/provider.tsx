/**
 * Provider
 *
 * |--------------------------------------------------------------------------
 * | App shell — wraps all pages with providers, navbar, and footer.
 * |--------------------------------------------------------------------------
 * |
 * | Provider stack (outermost → innermost):
 * |   SlotProvider       — UI slot system for content injection
 * |   PwaProvider        — install prompt, update prompt, network status
 * |   GlobalShortcuts    — activates all registered keyboard shortcuts
 * |   Navbar + content   — visual shell
 * |
 * | The DI container (ContainerProvider) is set up in main.tsx,
 * | wrapping this entire component.
 * |
 * @module provider
 */

import * as React from 'react';

import { Navbar } from '@/components/navbar';
import { GlobalShortcuts } from '@/components/global-shortcuts';

/*
|--------------------------------------------------------------------------
| PWA Providers — auto-read config from DI (PWA_CONFIG)
|--------------------------------------------------------------------------
*/
import { PwaProvider } from '@stackra/ts-pwa';

/*
|--------------------------------------------------------------------------
| Slot Provider — enables <Slot> / slotRegistry across the app
|--------------------------------------------------------------------------
*/
import { SlotProvider } from '@stackra/ts-ui';

export interface ProviderProps {
  children: React.ReactNode;
}

/**
 * Provider — app shell with all providers, navbar, content area, and footer.
 *
 * Every page is rendered inside this shell.
 */
export function Provider({ children }: ProviderProps) {
  return (
    <SlotProvider>
      <PwaProvider>
        <div className="relative flex h-screen flex-col">
          <GlobalShortcuts />
          <Navbar />
          <main className="container mx-auto max-w-7xl flex-grow px-6 pt-16">{children}</main>
          <footer className="flex w-full items-center justify-center py-3">
            <span className="text-muted text-sm">Stackra © {new Date().getFullYear()}</span>
          </footer>
        </div>
      </PwaProvider>
    </SlotProvider>
  );
}
