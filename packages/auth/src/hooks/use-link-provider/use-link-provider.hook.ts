/** @fileoverview useLinkProvider hook. @module @stackra-inc/react-auth @category Hooks */
import { useMutation } from '@tanstack/react-query';
import { useInject } from '@stackra-inc/ts-container';
import { AUTH_SERVICE } from '@/constants';
import type { IAuthService } from '@/interfaces/auth-service.interface';
import type { AuthActionResponse } from '@/interfaces/auth-action-response.interface';
import type { UseMutationHookResult } from '@/interfaces/use-mutation-hook-result.interface';

/** Variables for the link provider mutation. */
export interface LinkProviderVariables {
  provider: string;
  input?: Record<string, any>;
}

/**
 * Hook for linking an external identity provider to the current user.
 *
 * Wraps `authService.link(provider, input)` as a TanStack mutation.
 *
 * @returns Mutation result for the link provider operation.
 */
export function useLinkProvider(): UseMutationHookResult<
  AuthActionResponse,
  Error,
  LinkProviderVariables
> {
  const authService = useInject<IAuthService>(AUTH_SERVICE);
  const mutation = useMutation({
    mutationFn: (variables: LinkProviderVariables) =>
      authService.link(variables.provider, variables.input),
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
