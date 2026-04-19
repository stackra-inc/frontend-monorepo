/** @fileoverview useSecurity hook. @module @stackra-inc/react-auth @category Hooks */
import { useQuery } from '@tanstack/react-query';
import { useInject } from '@stackra-inc/ts-container';
import { SECURITY_SERVICE } from '@/constants';
import type { SecurityService } from '@/services/security.service';
import type { SecurityCheckResult } from '@/interfaces/security-check-result.interface';
import type { UseQueryHookResult } from '@/interfaces/use-query-hook-result.interface';

/**
 * Hook for performing a security check on the current user's account.
 *
 * Wraps `securityService.check()` as a TanStack query.
 *
 * @returns Query result for the security check operation.
 */
export function useSecurity(): UseQueryHookResult<SecurityCheckResult, Error> {
  const securityService = useInject<SecurityService>(SECURITY_SERVICE);
  const query = useQuery({
    queryKey: ['auth', 'security'],
    queryFn: () => securityService.check(),
  });
  return {
    data: query.data as SecurityCheckResult | undefined,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    error: query.error,
    refetch: query.refetch,
    query,
  };
}
