/** @fileoverview useForgotPassword hook. @module @stackra/react-auth @category Hooks */
import { useMutation } from "@tanstack/react-query";
import { useInject } from "@stackra/ts-container";
import { AUTH_SERVICE } from "@/constants";
import type { IAuthService } from "@/interfaces/auth-service.interface";
import type { AuthActionResponse } from "@/interfaces/auth-action-response.interface";
import type { UseMutationHookResult } from "@/interfaces/use-mutation-hook-result.interface";

/** Variables for the forgot password mutation. */
export interface ForgotPasswordVariables {
  email: string;
}

/**
 * Hook for requesting a password reset email.
 *
 * Wraps `authService.forgotPassword(email)` as a TanStack mutation.
 *
 * @returns Mutation result for the forgot password operation.
 */
export function useForgotPassword(): UseMutationHookResult<
  AuthActionResponse,
  Error,
  ForgotPasswordVariables
> {
  const authService = useInject<IAuthService>(AUTH_SERVICE);
  const mutation = useMutation({
    mutationFn: (variables: ForgotPasswordVariables) => authService.forgotPassword(variables.email),
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
