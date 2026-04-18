/** @fileoverview useCreate hook. @module @stackra/react-refine @category Hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveService } from '@/use-service.util';
import { QueryKeyFactory } from '@/utils/query-key-factory.util';
import type { UseCreateProps } from '@/interfaces/use-create-props.interface';
import type { CreateMutationVariables } from '@/interfaces/create-mutation-variables.interface';
import type { UseCreateReturnType } from '@/types/use-create-return-type.type';
import type { HttpError } from '@/interfaces/http-error.interface';

export function useCreate<TData = any>(props: UseCreateProps): UseCreateReturnType<TData> {
  const { resource } = props;
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (variables: CreateMutationVariables<TData>) =>
      resolveService(resource).create(variables.values),
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
