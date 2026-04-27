/** @fileoverview useChallenge hook. @module @stackra/react-auth @category Hooks */
import { useMutation } from "@tanstack/react-query";
import { useInject } from "@stackra/ts-container";
import { AUTH_SERVICE } from "@/constants";
import type { IAuthService } from "@/interfaces/auth-service.interface";
import type { UseMutationHookResult } from "@/interfaces/use-mutation-hook-result.interface";

/** Variables for the challenge mutation. */
export interface ChallengeVariables {
  provider: string;
  input?: Record<string, any>;
}

/**
 * Hook for initiating a multi-factor or provider challenge.
 *
 * Wraps `authService.challenge(provider, input)` as a TanStack mutation.
 *
 * @returns Mutation result for the challenge operation.
 */
export function useChallenge(): UseMutationHookResult<any, Error, ChallengeVariables> {
  const authService = useInject<IAuthService>(AUTH_SERVICE);
  const mutation = useMutation({
    mutationFn: (variables: ChallengeVariables) =>
      authService.challenge(variables.provider, variables.input),
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
