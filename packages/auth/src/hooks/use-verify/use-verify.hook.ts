/** @fileoverview useVerify hook. @module @stackra-inc/react-auth @category Hooks */
import { useMutation } from '@tanstack/react-query';
import { useInject } from '@stackra-inc/ts-container';
import { AUTH_SERVICE } from '@/constants';
import type { IAuthService } from '@/interfaces/auth-service.interface';
import type { AuthActionResponse } from '@/interfaces/auth-action-response.interface';
import type { UseMutationHookResult } from '@/interfaces/use-mutation-hook-result.interface';

/** Variables for the verify mutation. */
export interface VerifyVariables {
  provider: string;
  input?: Record<string, any>;
}

/**
 * Hook for verifying a multi-factor or provider challenge.
 *
 * Wraps `authService.verify(provider, input)` as a TanStack mutation.
 *
 * @returns Mutation result for the verify operation.
 */
export function useVerify(): UseMutationHookResult<AuthActionResponse, Error, VerifyVariables> {
  const authService = useInject<IAuthService>(AUTH_SERVICE);
  const mutation = useMutation({
    mutationFn: (variables: VerifyVariables) =>
      authService.verify(variables.provider, variables.input),
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
