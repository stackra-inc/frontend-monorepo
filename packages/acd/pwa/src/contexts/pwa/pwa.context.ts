/**
 * @fileoverview PwaContext — unified React context for all PWA features.
 *
 * Provides install prompt, update prompt, network status, and standalone
 * detection through a single context. Consumed via `usePwa()`.
 *
 * @module pwa/contexts/pwa
 */

import { createContext } from 'react';
import type { PwaContextValue } from '@/interfaces';

/**
 * Unified PWA context.
 * Initialized to `null` — the `usePwa` hook throws if consumed outside `PwaProvider`.
 */
export const PwaContext = createContext<PwaContextValue | null>(null);
PwaContext.displayName = 'PwaContext';
