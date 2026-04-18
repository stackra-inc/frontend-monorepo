/** @fileoverview useResetPassword hook. @module @stackra/react-auth @category Hooks */
import { useMutation } from '@tanstack/react-query';
import { useInject } from '@stackra/ts-container';
import { AUTH_SERVICE } from '@/constants';
import type { IAuthService } from '@/interfaces/auth-service.interface';
import type { AuthActionResponse } from '@/interfaces/auth-action-response.interface';
import type { UseMutationHookResult } from '@/interfaces/use-mutation-hook-result.interface';

/** Variables for the reset password mutation. */
export interface ResetPasswordVariables {
  email: string;
  token: string;
  password: string;
}

/**
 * Hook for resetting a user's password with a reset token.
 *
 * Wraps `authService.resetPassword(email, token, password)` as a TanStack mutation.
 *
 * @returns Mutation result for the reset password operation.
 */
export function useResetPassword(): UseMutationHookResult<
  AuthActionResponse,
  Error,
  ResetPasswordVariables
> {
  const authService = useInject<IAuthService>(AUTH_SERVICE);
  const mutation = useMutation({
    mutationFn: (variables: ResetPasswordVariables) =>
      authService.resetPassword(variables.email, variables.token, variables.password),
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
