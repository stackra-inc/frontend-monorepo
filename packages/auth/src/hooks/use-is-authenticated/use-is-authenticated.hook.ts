/** @fileoverview useIsAuthenticated hook. @module @stackra/react-auth @category Hooks */
import { useQuery } from "@tanstack/react-query";
import { useInject } from "@stackra/ts-container";
import { AUTH_SERVICE } from "@/constants";
import type { IAuthService } from "@/interfaces/auth-service.interface";
import type { CheckResponse } from "@/interfaces/check-response.interface";
import type { UseQueryHookResult } from "@/interfaces/use-query-hook-result.interface";

export function useIsAuthenticated(): UseQueryHookResult<CheckResponse, Error> {
  const authService = useInject<IAuthService>(AUTH_SERVICE);
  const query = useQuery({
    queryKey: ["auth", "check"],
    queryFn: () => authService.check(),
  });
  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    error: query.error,
    refetch: query.refetch,
    query,
  };
}
