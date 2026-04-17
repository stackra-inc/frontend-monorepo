/** @fileoverview useCan hook — access control check. @module @abdokouta/react-refine @category Hooks */
import { useQuery } from '@tanstack/react-query';
import type { IAccessControlService } from '@/interfaces/i-access-control-service.interface';
import type { CanResponse } from '@/interfaces/can-response.interface';
import type { UseQueryHookResult } from '@/interfaces/use-query-hook-result.interface';
import type { UseCanProps } from '@/interfaces/use-can-props.interface';

let _aclService: IAccessControlService | undefined;
export function setAccessControlService(svc: IAccessControlService) {
  _aclService = svc;
}

export function useCan(props: UseCanProps): UseQueryHookResult<CanResponse, Error> {
  const { resource, action, params } = props;
  const query = useQuery({
    queryKey: ['acl', 'can', resource, action, params],
    queryFn: () => {
      // Permissive default if no service registered
      if (!_aclService) return Promise.resolve({ can: true } as CanResponse);
      return _aclService.can({ resource, action, params });
    },
  });
  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    error: query.error,
    refetch: query.refetch,
    query,
  };
}
