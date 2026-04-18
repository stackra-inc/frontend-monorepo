/**
 * @fileoverview Internal utility for resolving services in hooks.
 *
 * @module @stackra/react-refine
 * @category Hooks
 * @internal
 */

import { RefineModule } from '@/refine.module';
import type { BaseService } from '@/services/base.service';

/**
 * Resolve a service from the global ServiceRegistry by resource name.
 *
 * @param resource - The resource name string.
 * @returns The registered service instance.
 * @throws {Error} If no service is registered for the resource.
 * @internal
 */
export function resolveService(resource: string): BaseService<any, any> {
  return RefineModule.getServiceRegistry().resolve(resource);
}
