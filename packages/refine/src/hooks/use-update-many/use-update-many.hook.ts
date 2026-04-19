/** @fileoverview useUpdateMany hook. @module @stackra-inc/react-refine @category Hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveService } from '@/hooks/use-service.util';
import { QueryKeyFactory } from '@/utils/query-key-factory.util';
import type { UseUpdateManyProps } from '@/interfaces/use-update-many-props.interface';
import type { UpdateManyMutationVariables } from '@/interfaces/update-many-mutation-variables.interface';
import type { UseUpdateManyReturnType } from '@/types/use-update-many-return-type.type';
import type { HttpError } from '@/interfaces/http-error.interface';

export function useUpdateMany<TData = any>(
  props: UseUpdateManyProps
): UseUpdateManyReturnType<TData> {
  const { resource } = props;
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (variables: UpdateManyMutationVariables<TData>) =>
      resolveService(resource).updateMany(variables.ids, variables.values),
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
    data: mutation.data as TData[] | undefined,
    reset: mutation.reset,
    mutation,
  };
}
