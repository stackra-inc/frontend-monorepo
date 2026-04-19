/** @fileoverview useRegister hook. @module @stackra-inc/react-auth @category Hooks */
import { useMutation } from '@tanstack/react-query';
import { useInject } from '@stackra-inc/ts-container';
import { AUTH_SERVICE } from '@/constants';
import type { IAuthService } from '@/interfaces/auth-service.interface';
import type { AuthActionResponse } from '@/interfaces/auth-action-response.interface';
import type { UseMutationHookResult } from '@/interfaces/use-mutation-hook-result.interface';

/**
 * Hook for registering a new user.
 *
 * Wraps `authService.register(params)` as a TanStack mutation.
 *
 * @returns Mutation result for the register operation.
 */
export function useRegister(): UseMutationHookResult<AuthActionResponse, Error, any> {
  const authService = useInject<IAuthService>(AUTH_SERVICE);
  const mutation = useMutation({
    mutationFn: (params: any) => authService.register(params),
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
