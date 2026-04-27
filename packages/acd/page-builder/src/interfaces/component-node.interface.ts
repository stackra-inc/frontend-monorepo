/**
 * @fileoverview ComponentNode interface — a single node in the page tree
 * representing an instance of a registered component.
 *
 * ComponentNodes form a recursive tree structure (the Page_Tree).
 * Each node carries its own props, styles, and ordered children.
 * The `type` field must match a registered ComponentMetadata.type
 * in the ComponentRegistry.
 *
 * @module @stackra/react-page-builder
 * @category Interfaces
 */

/**
 * A single node in the page tree representing a component instance.
 *
 * Nodes are recursive — each node's `children` array contains
 * further ComponentNode objects, forming the hierarchical page layout.
 */
export interface ComponentNode {
  /** Unique identifier for this node instance (UUID v4) */
  id: string;

  /** Component type string, must match a registered ComponentMetadata.type */
  type: string;

  /** Component props (content, configuration values) */
  props: Record<string, unknown>;

  /** Component styles (CSS-like properties for visual customization) */
  styles: Record<string, unknown>;

  /** Ordered child nodes forming the subtree below this node */
  children: ComponentNode[];
}
