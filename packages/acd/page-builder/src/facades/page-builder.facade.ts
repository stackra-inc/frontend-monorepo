/**
 * @fileoverview PageBuilderFacade — typed proxy for {@link PageBuilderManager}
 *
 * The facade is a module-level constant typed as `PageBuilderManager`.
 * It lazily resolves the service from the DI container on first property
 * access — safe to use at module scope before bootstrap completes.
 *
 * ## Setup (once, in main.tsx)
 *
 * ```typescript
 * import { Application } from '@stackra/ts-container';
 * import { Facade } from '@stackra/ts-support';
 *
 * const app = await Application.create(AppModule);
 * Facade.setApplication(app); // wires all facades
 * ```
 *
 * ## Usage
 *
 * ```typescript
 * import { PageBuilderFacade } from '@stackra/react-page-builder';
 *
 * // Full autocomplete — no .proxy() call needed
 * PageBuilderFacade.getTree();
 * PageBuilderFacade.insertNode(parentId, 0, metadata);
 * ```
 *
 * ## Available methods (from {@link PageBuilderManager})
 *
 * - `getTree(): PageTree`
 * - `setTree(tree: PageTree): void`
 * - `insertNode(parentId, position, metadata): ComponentNode`
 * - `moveNode(nodeId, newParentId, newPosition): void`
 * - `removeNode(nodeId): void`
 * - `duplicateNode(nodeId): ComponentNode | null`
 * - `updateNodeProps(nodeId, props): void`
 * - `updateNodeStyles(nodeId, styles): void`
 * - `serialize(): PageJson`
 * - `deserialize(json): void`
 * - `savePage(pageId, pageJson?): Promise<void>`
 * - `loadPage(pageId): Promise<void>`
 * - `loadTemplate(templateId): void`
 * - `fetchVersionHistory(pageId, page?): Promise<VersionListResponse>`
 * - `loadVersion(pageId, versionId): Promise<PageJson>`
 * - `restoreVersion(pageId, versionId): Promise<void>`
 *
 * ## Testing — swap in a mock
 *
 * ```typescript
 * import { Facade } from '@stackra/ts-support';
 * import { PAGE_BUILDER_MANAGER } from '@stackra/react-page-builder';
 *
 * Facade.swap(PAGE_BUILDER_MANAGER, mockInstance);
 * // After test
 * Facade.clearResolvedInstances();
 * ```
 *
 * @module @stackra/react-page-builder
 * @category Facades
 */

import { Facade } from "@stackra/ts-support";
import { PageBuilderManager } from "@/services/page-builder-manager.service";
import { PAGE_BUILDER_MANAGER } from "@/constants/tokens.constant";

/**
 * PageBuilderFacade — typed proxy for {@link PageBuilderManager}.
 *
 * Resolves `PageBuilderManager` from the DI container via the
 * `PAGE_BUILDER_MANAGER` token. All property and method access is
 * forwarded to the resolved instance with correct `this` binding.
 *
 * Call `Facade.setApplication(app)` once during bootstrap before using this.
 *
 * @example
 * ```typescript
 * PageBuilderFacade.getTree();
 * PageBuilderFacade.insertNode("root", 0, headingMetadata);
 * ```
 */
export const PageBuilderFacade: PageBuilderManager =
  Facade.make<PageBuilderManager>(PAGE_BUILDER_MANAGER);
