/** @fileoverview useDelete hook. @module @stackra/react-refine @category Hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveService } from '@/use-service.util';
import { QueryKeyFactory } from '@/utils/query-key-factory.util';
import type { UseDeleteProps } from '@/interfaces/use-delete-props.interface';
import type { DeleteMutationVariables } from '@/interfaces/delete-mutation-variables.interface';
import type { UseDeleteReturnType } from '@/types/use-delete-return-type.type';
import type { HttpError } from '@/interfaces/http-error.interface';

export function useDelete(props: UseDeleteProps): UseDeleteReturnType {
  const { resource } = props;
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (variables: DeleteMutationVariables) =>
      resolveService(resource).deleteOne(variables.id),
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
