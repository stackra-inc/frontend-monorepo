/**
 * @fileoverview PageBuilderManager — the central orchestrator service for
 * the page builder.
 *
 * Manages the current PageTree state and delegates to:
 * - {@link ComponentRegistry} for component metadata lookups
 * - {@link TemplateRegistry} for template loading
 * - {@link HistoryManager} for undo/redo
 * - {@link PageJsonSerializer} for serialization/deserialization
 * - {@link HttpClient} for backend API communication
 *
 * All tree mutation methods delegate to the pure functions in
 * `utils/tree-operations.util.ts` and return new tree references
 * (immutable updates).
 *
 * @module @stackra/react-page-builder
 * @category Services
 */

import { Injectable, Inject } from "@stackra/ts-container";
import { HTTP_CLIENT } from "@stackra/ts-http";
import type { HttpClient } from "@stackra/ts-http";

import {
  PAGE_BUILDER_COMPONENT_REGISTRY,
  PAGE_BUILDER_TEMPLATE_REGISTRY,
  PAGE_BUILDER_HISTORY_MANAGER,
  PAGE_BUILDER_CONFIG,
} from "@/constants/tokens.constant";
import type { PageBuilderConfig } from "@/interfaces/page-builder-config.interface";
import type { PageTree } from "@/interfaces/page-tree.interface";
import type { PageJson } from "@/interfaces/page-json.interface";
import type { PageMetadata } from "@/interfaces/page-metadata.interface";
import type { ComponentMetadata } from "@/interfaces/component-metadata.interface";
import type { ComponentNode } from "@/interfaces/component-node.interface";
import type { VersionListResponse } from "@/interfaces/version-list-response.interface";
import { ComponentRegistry } from "@/registries/component.registry";
import { TemplateRegistry } from "@/registries/template.registry";
import { HistoryManager } from "./history-manager.service";
import { PageJsonSerializer } from "./page-json-serializer.service";
import {
  insertNode,
  moveNode,
  removeNode,
  duplicateNode,
  updateNodeProps,
  updateNodeStyles,
} from "@/utils/tree-operations.util";

/**
 * Central orchestrator service for the page builder.
 *
 * Manages the current page tree state and coordinates between registries,
 * history manager, serializer, and the backend API. All tree mutations
 * produce new tree references (immutable updates) and are delegated to
 * the pure utility functions in `tree-operations.util.ts`.
 *
 * @example
 * ```typescript
 * // Via DI injection
 * @Injectable()
 * class MyComponent {
 *   constructor(
 *     @Inject(PAGE_BUILDER_MANAGER) private manager: PageBuilderManager,
 *   ) {}
 *
 *   addHeading() {
 *     const metadata = this.manager.getComponentRegistry().get("heading");
 *     if (metadata) {
 *       this.manager.insertNode("root", 0, metadata);
 *     }
 *   }
 * }
 * ```
 */
@Injectable()
export class PageBuilderManager {
  /** The current page tree state. */
  private currentTree: PageTree = {
    root: {
      id: "root",
      type: "container",
      props: { maxWidth: 1200 },
      styles: {},
      children: [],
    },
  };

  /** The current page metadata. */
  private currentMetadata: PageMetadata = {
    title: "Untitled Page",
    description: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  /** Internal serializer instance for serialize/deserialize operations. */
  private readonly serializer: PageJsonSerializer = new PageJsonSerializer();

  /**
   * Create a new PageBuilderManager.
   *
   * @param componentRegistry - Registry of available component metadata
   * @param templateRegistry - Registry of available page templates
   * @param historyManager - Undo/redo history manager
   * @param config - Page builder configuration
   * @param httpClient - HTTP client for backend API communication
   */
  constructor(
    @Inject(PAGE_BUILDER_COMPONENT_REGISTRY)
    private readonly componentRegistry: ComponentRegistry,
    @Inject(PAGE_BUILDER_TEMPLATE_REGISTRY)
    private readonly templateRegistry: TemplateRegistry,
    @Inject(PAGE_BUILDER_HISTORY_MANAGER)
    private readonly historyManager: HistoryManager,
    @Inject(PAGE_BUILDER_CONFIG)
    private readonly config: PageBuilderConfig,
    @Inject(HTTP_CLIENT)
    private readonly httpClient: HttpClient,
  ) {}

  /*
  |--------------------------------------------------------------------------
  | Page Tree Operations
  |--------------------------------------------------------------------------
  |
  | All tree mutations delegate to the pure functions in
  | tree-operations.util.ts and produce new tree references.
  |
  */

  /**
   * Get the current page tree.
   *
   * @returns The current {@link PageTree}
   */
  public getTree(): PageTree {
    return this.currentTree;
  }

  /**
   * Replace the current page tree with a new one.
   *
   * @param tree - The new page tree
   */
  public setTree(tree: PageTree): void {
    this.currentTree = tree;
  }

  /**
   * Insert a new component node as a child of the specified parent.
   *
   * Creates a new ComponentNode from the provided metadata with default
   * props and inserts it at the specified position. Delegates to the
   * `insertNode` utility function.
   *
   * @param parentId - The ID of the parent node to insert into
   * @param position - The index at which to insert
   * @param metadata - The ComponentMetadata for the new node
   * @returns The newly created ComponentNode
   */
  public insertNode(
    parentId: string,
    position: number,
    metadata: ComponentMetadata,
  ): ComponentNode {
    const result = insertNode(this.currentTree.root, parentId, position, metadata);
    this.currentTree = { root: result.root };
    return result.newNode;
  }

  /**
   * Move a node from its current position to a new parent and position.
   *
   * Delegates to the `moveNode` utility function. The node and all its
   * descendants are preserved structurally.
   *
   * @param nodeId - The ID of the node to move
   * @param newParentId - The ID of the new parent node
   * @param newPosition - The index at which to insert in the new parent
   */
  public moveNode(nodeId: string, newParentId: string, newPosition: number): void {
    const newRoot = moveNode(this.currentTree.root, nodeId, newParentId, newPosition);
    this.currentTree = { root: newRoot };
  }

  /**
   * Remove a node and all its descendants from the tree.
   *
   * Delegates to the `removeNode` utility function.
   *
   * @param nodeId - The ID of the node to remove
   */
  public removeNode(nodeId: string): void {
    const newRoot = removeNode(this.currentTree.root, nodeId);
    if (newRoot) {
      this.currentTree = { root: newRoot };
    }
  }

  /**
   * Duplicate a node and all its descendants with fresh unique IDs.
   *
   * The duplicate is inserted immediately after the original in the
   * same parent's children array. Delegates to the `duplicateNode`
   * utility function.
   *
   * @param nodeId - The ID of the node to duplicate
   * @returns The duplicated ComponentNode, or `null` if the node was not found
   */
  public duplicateNode(nodeId: string): ComponentNode | null {
    const result = duplicateNode(this.currentTree.root, nodeId);
    this.currentTree = { root: result.root };
    return result.duplicatedNode;
  }

  /**
   * Update the props of a specific node in the tree.
   *
   * Merges the provided props into the target node's existing props.
   * Delegates to the `updateNodeProps` utility function.
   *
   * @param nodeId - The ID of the node to update
   * @param props - The prop key-value pairs to merge
   */
  public updateNodeProps(nodeId: string, props: Record<string, unknown>): void {
    const newRoot = updateNodeProps(this.currentTree.root, nodeId, props);
    this.currentTree = { root: newRoot };
  }

  /**
   * Update the styles of a specific node in the tree.
   *
   * Merges the provided styles into the target node's existing styles.
   * Delegates to the `updateNodeStyles` utility function.
   *
   * @param nodeId - The ID of the node to update
   * @param styles - The style key-value pairs to merge
   */
  public updateNodeStyles(nodeId: string, styles: Record<string, unknown>): void {
    const newRoot = updateNodeStyles(this.currentTree.root, nodeId, styles);
    this.currentTree = { root: newRoot };
  }

  /*
  |--------------------------------------------------------------------------
  | Serialization
  |--------------------------------------------------------------------------
  |
  | Delegates to the PageJsonSerializer for converting between the
  | in-memory PageTree and the serialized PageJson format.
  |
  */

  /**
   * Serialize the current page tree and metadata into a PageJson document.
   *
   * @returns A {@link PageJson} document with deterministic key ordering
   */
  public serialize(): PageJson {
    return this.serializer.serialize(this.currentTree, this.currentMetadata);
  }

  /**
   * Deserialize a PageJson document and replace the current page tree.
   *
   * Validates the schema version and replaces unknown component types
   * with placeholder nodes.
   *
   * @param json - The PageJson document to deserialize
   */
  public deserialize(json: PageJson): void {
    const tree = this.serializer.deserialize(json, this.componentRegistry);
    this.currentTree = tree;
    this.currentMetadata = { ...json.metadata };
  }

  /*
  |--------------------------------------------------------------------------
  | Backend Integration
  |--------------------------------------------------------------------------
  |
  | Uses the HttpClient to communicate with the page builder backend API.
  | All endpoints are relative to `config.apiBaseUrl`.
  |
  */

  /**
   * Save the current page to the backend.
   *
   * Serializes the current tree and metadata, then sends a PUT request
   * to the backend API.
   *
   * @param pageId - The page identifier
   * @param pageJson - Optional pre-serialized PageJson (serializes current state if omitted)
   */
  public async savePage(pageId: string, pageJson?: PageJson): Promise<void> {
    const json = pageJson ?? this.serialize();
    await this.httpClient.put(`${this.config.apiBaseUrl}/pages/${pageId}`, json);
  }

  /**
   * Load a page from the backend and replace the current state.
   *
   * Sends a GET request to the backend API and deserializes the response
   * into the current page tree.
   *
   * @param pageId - The page identifier to load
   */
  public async loadPage(pageId: string): Promise<void> {
    const response = await this.httpClient.get<PageJson>(
      `${this.config.apiBaseUrl}/pages/${pageId}`,
    );
    this.deserialize(response.data);
  }

  /*
  |--------------------------------------------------------------------------
  | Templates
  |--------------------------------------------------------------------------
  */

  /**
   * Load a template by ID and replace the current page tree.
   *
   * Looks up the template in the TemplateRegistry and deserializes
   * its PageJson into the current state.
   *
   * @param templateId - The template identifier to load
   * @throws {Error} If the template is not found in the registry
   */
  public loadTemplate(templateId: string): void {
    const template = this.templateRegistry.get(templateId);
    if (!template) {
      throw new Error(`Template "${templateId}" not found in registry`);
    }
    this.deserialize(template.pageJson);
  }

  /*
  |--------------------------------------------------------------------------
  | Version History
  |--------------------------------------------------------------------------
  |
  | Communicates with the backend API to fetch, load, and restore
  | page versions.
  |
  */

  /**
   * Fetch the version history for a page from the backend.
   *
   * @param pageId - The page identifier
   * @param page - Optional page number for pagination (default: 1)
   * @returns A paginated {@link VersionListResponse}
   */
  public async fetchVersionHistory(pageId: string, page = 1): Promise<VersionListResponse> {
    const response = await this.httpClient.get<VersionListResponse>(
      `${this.config.apiBaseUrl}/pages/${pageId}/versions`,
      { params: { page } },
    );
    return response.data;
  }

  /**
   * Load a specific version of a page from the backend.
   *
   * @param pageId - The page identifier
   * @param versionId - The version identifier to load
   * @returns The {@link PageJson} for the specified version
   */
  public async loadVersion(pageId: string, versionId: string): Promise<PageJson> {
    const response = await this.httpClient.get<PageJson>(
      `${this.config.apiBaseUrl}/pages/${pageId}/versions/${versionId}`,
    );
    return response.data;
  }

  /**
   * Restore a specific version of a page.
   *
   * Loads the version from the backend and replaces the current page
   * tree with the restored version's content.
   *
   * @param pageId - The page identifier
   * @param versionId - The version identifier to restore
   */
  public async restoreVersion(pageId: string, versionId: string): Promise<void> {
    const json = await this.loadVersion(pageId, versionId);
    this.deserialize(json);
  }
}
