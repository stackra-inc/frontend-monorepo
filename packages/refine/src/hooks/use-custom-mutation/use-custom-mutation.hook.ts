/** @fileoverview useCustomMutation hook. @module @stackra-inc/react-refine @category Hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeyFactory } from '@/utils/query-key-factory.util';
import type { CustomParams } from '@/interfaces/custom-params.interface';
import type { UseCustomMutationProps } from '@/interfaces/use-custom-mutation-props.interface';
import type { UseCustomMutationReturnType } from '@/types/use-custom-mutation-return-type.type';
import type { HttpError } from '@/interfaces/http-error.interface';
import { resolveService } from '@/hooks/use-service.util';

export function useCustomMutation<TData = any>(
  props: UseCustomMutationProps
): UseCustomMutationReturnType<TData> {
  const { resource } = props;
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (params: CustomParams) => resolveService(resource).custom(params),
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
