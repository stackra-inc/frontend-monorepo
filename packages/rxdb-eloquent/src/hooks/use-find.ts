/**
 * @file hooks/use-find.ts
 * @description React hook for finding a single Model instance by primary key.
 *
 * Supports both one-shot and live (reactive) modes. In live mode, the hook
 * subscribes to the RxDocument's `$` observable and re-renders on changes.
 *
 * @example
 * ```tsx
 * import { useFind } from '@stackra-inc/ts-eloquent';
 * import { User } from './models/user.model';
 *
 * function UserProfile({ userId }: { userId: string }) {
 *   const { data: user, loading, error } = useFind(User, userId, { live: true });
 *
 *   if (loading) return <p>Loading...</p>;
 *   if (error) return <p>Error: {error.message}</p>;
 *   if (!user) return <p>User not found</p>;
 *
 *   return <p>{user.getAttribute('first_name')}</p>;
 * }
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Model } from '@/model/model';
import type { ModelClass, RefetchableHookResult, QueryHookOptions } from './types';

/**
 * Find a single Model instance by its primary key.
 *
 * @typeParam T - The Model type.
 * @param model   - The Model class (e.g., `User`).
 * @param id      - The primary key value to search for.
 * @param options - Optional configuration (`live`, `enabled`).
 * @returns Hook result with `data`, `loading`, `error`, and `refetch`.
 */
export function useFind<T extends Model>(
  model: ModelClass<T>,
  id: string | null | undefined,
  options: QueryHookOptions = {}
): RefetchableHookResult<T> {
  const { live = false, enabled = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled && !!id);
  const [error, setError] = useState<Error | null>(null);

  /** Ref to track the subscription for cleanup. */
  const subRef = useRef<any>(null);

  /** Execute the find query. */
  const execute = useCallback(async () => {
    if (!id || !enabled) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await model.find(id);
      setData(result);

      // If live mode and we found a document, subscribe to changes
      if (live && result && (result as any)._rxDocument) {
        // Unsubscribe from previous subscription
        if (subRef.current) {
          subRef.current.unsubscribe();
        }

        subRef.current = (result as any).$.subscribe({
          next: (updated: T) => setData(updated),
          error: (err: Error) => setError(err),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [model, id, live, enabled]);

  /** Run on mount and when dependencies change. */
  useEffect(() => {
    execute();

    return () => {
      // Cleanup subscription on unmount
      if (subRef.current) {
        subRef.current.unsubscribe();
        subRef.current = null;
      }
    };
  }, [execute]);

  return { data, loading, error, refetch: execute };
}
