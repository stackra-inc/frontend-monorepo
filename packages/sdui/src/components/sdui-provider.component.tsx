/**
 * @fileoverview SDUIProvider — React component that wraps the app and fetches page definitions.
 *
 * @module @stackra/react-sdui
 * @category Components
 */

import React, { useEffect, useState, type ReactNode } from 'react';
import type { PageDefinition } from '@stackra/react-refine';
import type { SDUIService } from '@/services/sdui.service';

/** Props for the SDUIProvider component. */
export interface SDUIProviderProps {
  /** The SDUIService instance. */
  sduiService: SDUIService;
  /** Child components. */
  children: ReactNode;
}

/**
 * Provider component that fetches page definitions on mount
 * and auto-registers routes and services.
 */
export function SDUIProvider({ sduiService, children }: SDUIProviderProps): React.JSX.Element {
  const [_pages, setPages] = useState<PageDefinition[]>([]);
  const [_isReady, setIsReady] = useState(false);

  useEffect(() => {
    sduiService
      .fetchPages()
      .then((fetchedPages) => {
        setPages(fetchedPages);
        sduiService.autoRegisterRoutes(fetchedPages);
        setIsReady(true);
      })
      .catch((err) => {
        console.warn('SDUIProvider: Failed to fetch pages', err);
        setIsReady(true); // Continue without SDUI pages
      });
  }, [sduiService]);

  return <>{children}</>;
}
