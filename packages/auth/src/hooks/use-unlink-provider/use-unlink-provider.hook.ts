/** @fileoverview useUnlinkProvider hook. @module @stackra/react-auth @category Hooks */
import { useMutation } from '@tanstack/react-query';
import { useInject } from '@stackra/ts-container';
import { AUTH_SERVICE } from '@/constants';
import type { IAuthService } from '@/interfaces/auth-service.interface';
import type { AuthActionResponse } from '@/interfaces/auth-action-response.interface';
import type { UseMutationHookResult } from '@/interfaces/use-mutation-hook-result.interface';

/** Variables for the unlink provider mutation. */
export interface UnlinkProviderVariables {
  provider: string;
}

/**
 * Hook for unlinking an external identity provider from the current user.
 *
 * Wraps `authService.unlink(provider)` as a TanStack mutation.
 *
 * @returns Mutation result for the unlink provider operation.
 */
export function useUnlinkProvider(): UseMutationHookResult<
  AuthActionResponse,
  Error,
  UnlinkProviderVariables
> {
  const authService = useInject<IAuthService>(AUTH_SERVICE);
  const mutation = useMutation({
    mutationFn: (variables: UnlinkProviderVariables) => authService.unlink(variables.provider),
  });
  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync as any,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    isIdle: mutation.isIdle,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
    mutation,
  };
}
