/** @fileoverview useSession hook. @module @stackra/react-auth @category Hooks */
import { useQuery, useMutation } from "@tanstack/react-query";
import { useInject } from "@stackra/ts-container";
import { SESSION_SERVICE } from "@/constants";
import type { SessionService } from "@/services/session.service";
import type { Session } from "@/interfaces/session.interface";
import type { UseQueryHookResult } from "@/interfaces/use-query-hook-result.interface";
import type { UseMutationHookResult } from "@/interfaces/use-mutation-hook-result.interface";

/** Return shape for the useSession hook. */
export interface UseSessionResult {
  /** Query for listing all active sessions. */
  sessions: UseQueryHookResult<Session[], Error>;
  /** Query for the current session. */
  current: UseQueryHookResult<Session | null, Error>;
  /** Mutation for destroying a specific session by ID. */
  destroy: UseMutationHookResult<void, Error, string>;
  /** Mutation for destroying all sessions. */
  destroyAll: UseMutationHookResult<void, Error, void>;
}

/**
 * Hook for managing user sessions.
 *
 * Provides queries for listing sessions and fetching the current session,
 * plus mutations for destroying individual or all sessions.
 *
 * @returns An object with `sessions`, `current`, `destroy`, and `destroyAll`.
 */
export function useSession(): UseSessionResult {
  const sessionService = useInject<SessionService>(SESSION_SERVICE);

  const sessionsQuery = useQuery({
    queryKey: ["auth", "sessions"],
    queryFn: () => sessionService.list(),
  });

  const currentQuery = useQuery({
    queryKey: ["auth", "sessions", "current"],
    queryFn: () => sessionService.getCurrent(),
  });

  const destroyMutation = useMutation({
    mutationFn: (sessionId: string) => sessionService.destroy(sessionId),
  });

  const destroyAllMutation = useMutation({
    mutationFn: () => sessionService.destroyAll(),
  });

  return {
    sessions: {
      data: sessionsQuery.data as Session[] | undefined,
      isLoading: sessionsQuery.isLoading,
      isFetching: sessionsQuery.isFetching,
      isError: sessionsQuery.isError,
      isSuccess: sessionsQuery.isSuccess,
      error: sessionsQuery.error,
      refetch: sessionsQuery.refetch,
      query: sessionsQuery,
    },
    current: {
      data: currentQuery.data as Session | null | undefined,
      isLoading: currentQuery.isLoading,
      isFetching: currentQuery.isFetching,
      isError: currentQuery.isError,
      isSuccess: currentQuery.isSuccess,
      error: currentQuery.error,
      refetch: currentQuery.refetch,
      query: currentQuery,
    },
    destroy: {
      mutate: destroyMutation.mutate,
      mutateAsync: destroyMutation.mutateAsync as any,
      isLoading: destroyMutation.isPending,
      isError: destroyMutation.isError,
      isSuccess: destroyMutation.isSuccess,
      isIdle: destroyMutation.isIdle,
      error: destroyMutation.error,
      data: destroyMutation.data,
      reset: destroyMutation.reset,
      mutation: destroyMutation,
    },
    destroyAll: {
      mutate: destroyAllMutation.mutate as any,
      mutateAsync: destroyAllMutation.mutateAsync as any,
      isLoading: destroyAllMutation.isPending,
      isError: destroyAllMutation.isError,
      isSuccess: destroyAllMutation.isSuccess,
      isIdle: destroyAllMutation.isIdle,
      error: destroyAllMutation.error,
      data: destroyAllMutation.data,
      reset: destroyAllMutation.reset,
      mutation: destroyAllMutation,
    },
  };
}
