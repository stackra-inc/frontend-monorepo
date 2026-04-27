/** @fileoverview useUpdatePassword hook. @module @stackra/react-auth @category Hooks */
import { useMutation } from "@tanstack/react-query";
import { useInject } from "@stackra/ts-container";
import { AUTH_SERVICE } from "@/constants";
import type { IAuthService } from "@/interfaces/auth-service.interface";
import type { AuthActionResponse } from "@/interfaces/auth-action-response.interface";
import type { UseMutationHookResult } from "@/interfaces/use-mutation-hook-result.interface";

/** Variables for the update password mutation. */
export interface UpdatePasswordVariables {
  currentPassword: string;
  password: string;
}

/**
 * Hook for updating the current user's password.
 *
 * Wraps `authService.updatePassword(currentPassword, password)` as a TanStack mutation.
 *
 * @returns Mutation result for the update password operation.
 */
export function useUpdatePassword(): UseMutationHookResult<
  AuthActionResponse,
  Error,
  UpdatePasswordVariables
> {
  const authService = useInject<IAuthService>(AUTH_SERVICE);
  const mutation = useMutation({
    mutationFn: (variables: UpdatePasswordVariables) =>
      authService.updatePassword(variables.currentPassword, variables.password),
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
