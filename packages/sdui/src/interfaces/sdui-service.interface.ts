/**
 * @fileoverview SDUI service interface.
 * @module @stackra-inc/react-sdui
 * @category Interfaces
 */

import type { PageDefinition, ResourceConfig } from '@stackra-inc/react-refine';

/**
 * Interface for the Server-Driven UI service.
 */
export interface ISDUIService {
  /** Fetch page definitions from the backend Pages API. */
  fetchPages(): Promise<PageDefinition[]>;
  /** Auto-register routes from page definitions. */
  autoRegisterRoutes(pages: PageDefinition[]): void;
  /** Auto-register services from resource configurations. */
  autoRegisterServices(resources: ResourceConfig[]): void;
}
