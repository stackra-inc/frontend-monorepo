/** @fileoverview useCreateMany hook. @module @stackra/react-refine @category Hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveService } from '@/hooks/use-service.util';
import { QueryKeyFactory } from '@/utils/query-key-factory.util';
import type { UseCreateManyProps } from '@/interfaces/use-create-many-props.interface';
import type { CreateManyMutationVariables } from '@/interfaces/create-many-mutation-variables.interface';
import type { UseCreateManyReturnType } from '@/types/use-create-many-return-type.type';
import type { HttpError } from '@/interfaces/http-error.interface';

export function useCreateMany<TData = any>(
  props: UseCreateManyProps
): UseCreateManyReturnType<TData> {
  const { resource } = props;
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (variables: CreateManyMutationVariables<TData>) =>
      resolveService(resource).createMany(variables.values),
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
