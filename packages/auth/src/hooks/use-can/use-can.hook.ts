/** @fileoverview useCan hook — access control check. @module @stackra-inc/react-auth @category Hooks */
import { useQuery } from '@tanstack/react-query';
import { useInject } from '@stackra-inc/ts-container';
import { ACCESS_CONTROL_SERVICE } from '@/constants';
import type { IAccessControlService } from '@/interfaces/access-control-service.interface';
import type { CanResponse } from '@/interfaces/can-response.interface';
import type { UseQueryHookResult } from '@/interfaces/use-query-hook-result.interface';
import type { UseCanProps } from '@/interfaces/use-can-props.interface';

export function useCan(props: UseCanProps): UseQueryHookResult<CanResponse, Error> {
  const accessControlService = useInject<IAccessControlService>(ACCESS_CONTROL_SERVICE);
  const { resource, action, params } = props;
  const query = useQuery({
    queryKey: ['acl', 'can', resource, action, params],
    queryFn: () => {
      // Permissive default if no service registered
      if (!accessControlService) return Promise.resolve({ can: true } as CanResponse);
      return accessControlService.can({ resource, action, params });
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
