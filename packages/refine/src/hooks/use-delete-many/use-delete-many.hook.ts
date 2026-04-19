/** @fileoverview useDeleteMany hook. @module @stackra/react-refine @category Hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveService } from '@/hooks/use-service.util';
import { QueryKeyFactory } from '@/utils/query-key-factory.util';
import type { UseDeleteManyProps } from '@/interfaces/use-delete-many-props.interface';
import type { DeleteManyMutationVariables } from '@/interfaces/delete-many-mutation-variables.interface';
import type { UseDeleteManyReturnType } from '@/types/use-delete-many-return-type.type';
import type { HttpError } from '@/interfaces/http-error.interface';

export function useDeleteMany(props: UseDeleteManyProps): UseDeleteManyReturnType {
  const { resource } = props;
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (variables: DeleteManyMutationVariables) =>
      resolveService(resource).deleteMany(variables.ids),
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
    data: mutation.data,
    reset: mutation.reset,
    mutation,
  };
}
