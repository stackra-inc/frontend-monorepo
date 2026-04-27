/** @fileoverview useIdentity hook. @module @stackra/react-auth @category Hooks */
import { useQuery } from "@tanstack/react-query";
import { useInject } from "@stackra/ts-container";
import { AUTH_SERVICE } from "@/constants";
import type { IAuthService } from "@/interfaces/auth-service.interface";
import type { UseQueryHookResult } from "@/interfaces/use-query-hook-result.interface";

/**
 * Hook for fetching the current user's identity and linked providers.
 *
 * Wraps `authService.getIdentity()` as a TanStack query.
 * Returns `{ identity, linked_providers }` from the backend.
 *
 * @returns Query result for the identity operation.
 */
export function useIdentity<TData = any>(): UseQueryHookResult<TData, Error> {
  const authService = useInject<IAuthService>(AUTH_SERVICE);
  const query = useQuery({
    queryKey: ["auth", "identity"],
    queryFn: () => authService.getIdentity(),
  });
  return {
    data: query.data as TData | undefined,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    error: query.error,
    refetch: query.refetch,
    query,
  };
}
