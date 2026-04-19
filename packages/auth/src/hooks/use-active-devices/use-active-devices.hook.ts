/** @fileoverview useActiveDevices hook. @module @stackra-inc/react-auth @category Hooks */
import { useQuery, useMutation } from '@tanstack/react-query';
import { useInject } from '@stackra-inc/ts-container';
import { SECURITY_SERVICE } from '@/constants';
import type { SecurityService } from '@/services/security.service';
import type { ActiveDevice } from '@/interfaces/active-device.interface';
import type { UseQueryHookResult } from '@/interfaces/use-query-hook-result.interface';
import type { UseMutationHookResult } from '@/interfaces/use-mutation-hook-result.interface';

/** Return shape for the useActiveDevices hook. */
export interface UseActiveDevicesResult {
  /** Query for listing all active devices. */
  devices: UseQueryHookResult<ActiveDevice[], Error>;
  /** Mutation for revoking a device by fingerprint hash. */
  revoke: UseMutationHookResult<void, Error, string>;
}

/**
 * Hook for managing active devices.
 *
 * Uses the {@link SecurityService} instance resolved via DI container.
 *
 * @returns An object with `devices` query and `revoke` mutation.
 */
export function useActiveDevices(): UseActiveDevicesResult {
  const securityService = useInject<SecurityService>(SECURITY_SERVICE);

  const devicesQuery = useQuery({
    queryKey: ['auth', 'devices'],
    queryFn: () => securityService.getActiveDevices(),
  });

  const revokeMutation = useMutation({
    mutationFn: (fingerprint: string) => securityService.revokeDevice(fingerprint),
  });

  return {
    devices: {
      data: devicesQuery.data as ActiveDevice[] | undefined,
      isLoading: devicesQuery.isLoading,
      isFetching: devicesQuery.isFetching,
      isError: devicesQuery.isError,
      isSuccess: devicesQuery.isSuccess,
      error: devicesQuery.error,
      refetch: devicesQuery.refetch,
      query: devicesQuery,
    },
    revoke: {
      mutate: revokeMutation.mutate,
      mutateAsync: revokeMutation.mutateAsync as any,
      isLoading: revokeMutation.isPending,
      isError: revokeMutation.isError,
      isSuccess: revokeMutation.isSuccess,
      isIdle: revokeMutation.isIdle,
      error: revokeMutation.error,
      data: revokeMutation.data,
      reset: revokeMutation.reset,
      mutation: revokeMutation,
    },
  };
}
