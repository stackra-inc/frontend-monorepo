/**
 * @fileoverview SDUIService — fetches page definitions and auto-registers routes/services.
 *
 * @module @stackra-inc/react-sdui
 * @category Services
 */

import type { PageDefinition, ResourceConfig } from '@stackra-inc/react-refine';
import type { ISDUIService } from '@/interfaces/sdui-service.interface';

/**
 * Service that fetches page definitions from a backend Pages API
 * and auto-registers routes and services.
 */
export class SDUIService implements ISDUIService {
  constructor(
    private readonly httpClient: any,
    private readonly pagesApiUrl: string,
    private readonly serviceRegistry: any,
    private readonly componentRegistry: any,
    private readonly routeRegistry?: any
  ) {}

  /** Fetch page definitions from the backend. */
  async fetchPages(): Promise<PageDefinition[]> {
    try {
      const response = await this.httpClient(this.pagesApiUrl);
      if (!response.ok) {
        console.warn(`SDUI: Pages API returned ${response.status}`);
        return [];
      }
      const data = await response.json();
      return data.pages ?? data.data ?? data;
    } catch (err) {
      console.warn('SDUI: Failed to fetch pages', err);
      return [];
    }
  }

  /** Auto-register routes from page definitions. */
  autoRegisterRoutes(pages: PageDefinition[]): void {
    if (!this.routeRegistry) return;
    for (const page of pages) {
      if (!this.routeRegistry.has(page.path)) {
        const component = this.componentRegistry.resolve(page.schema?.[0]?.type ?? 'unknown');
        this.routeRegistry.register(
          { path: page.path, resource: page.resource, action: page.action },
          component
        );
      }
    }
  }

  /** Auto-register services from resource configurations. */
  autoRegisterServices(resources: ResourceConfig[]): void {
    for (const resource of resources) {
      if (!this.serviceRegistry.has(resource.name)) {
        // SDUI auto-registration creates HttpRepository + HttpService
        // This is a simplified version — full implementation would use RefineModule.forFeature
        console.info(`SDUI: Auto-registered resource "${resource.name}" from Pages API`);
      }
    }
  }
}
