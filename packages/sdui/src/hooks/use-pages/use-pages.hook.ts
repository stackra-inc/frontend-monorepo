/**
 * @fileoverview usePages hook — fetch page definitions from SDUIService.
 * @module @stackra/react-sdui
 * @category Hooks
 */

import { useState, useEffect } from 'react';
import type { PageDefinition } from '@stackra/react-refine';
import type { SDUIService } from '@/services/sdui.service';

/** Props for the usePages hook. */
export interface UsePagesProps {
  /** The SDUIService instance. */
  sduiService: SDUIService;
  /** Whether to fetch on mount. Defaults to true. */
  enabled?: boolean;
}

/** Return type for the usePages hook. */
export interface UsePagesResult {
  /** Fetched page definitions. */
  pages: PageDefinition[];
  /** Whether the fetch is in progress. */
  isLoading: boolean;
  /** Error if the fetch failed. */
  error: Error | null;
}

/**
 * Hook that fetches page definitions from the SDUIService.
 */
export function usePages(props: UsePagesProps): UsePagesResult {
  const { sduiService, enabled = true } = props;
  const [pages, setPages] = useState<PageDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;
    setIsLoading(true);
    sduiService
      .fetchPages()
      .then(setPages)
      .catch((err) => setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => setIsLoading(false));
  }, [sduiService, enabled]);

  return { pages, isLoading, error };
}
