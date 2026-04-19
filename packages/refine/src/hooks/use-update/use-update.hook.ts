/** @fileoverview useUpdate hook. @module @stackra-inc/react-refine @category Hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveService } from '@/use-service.util';
import { QueryKeyFactory } from '@/utils/query-key-factory.util';
import type { UseUpdateProps } from '@/interfaces/use-update-props.interface';
import type { UpdateMutationVariables } from '@/interfaces/update-mutation-variables.interface';
import type { UseUpdateReturnType } from '@/types/use-update-return-type.type';
import type { HttpError } from '@/interfaces/http-error.interface';

export function useUpdate<TData = any>(props: UseUpdateProps): UseUpdateReturnType<TData> {
  const { resource } = props;
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (variables: UpdateMutationVariables<TData>) =>
      resolveService(resource).update(variables.id, variables.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeyFactory.invalidate(resource) });
    },
  });
  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync as any,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    isIdle: mutation.isIdle,
    error: mutation.error as unknown as HttpError | null,
    data: mutation.data as TData | undefined,
    reset: mutation.reset,
    mutation,
  };
}
