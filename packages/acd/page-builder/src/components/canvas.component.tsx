/**
 * @fileoverview Canvas — the drag-and-drop editing surface for the page builder.
 *
 * Uses @dnd-kit/core DndContext for drag-and-drop operations. Renders
 * component nodes recursively with selection outlines, drag handles,
 * and delete/duplicate buttons in edit mode. Handles drop events by
 * calling insertNode or moveNode on the manager. Validates drops against
 * allowedChildren and maxChildren constraints. Supports node selection,
 * deselection (click empty area), deletion (Delete key), and duplication.
 * Records all operations in the HistoryManager.
 *
 * @module @stackra/react-page-builder
 * @category Components
 */

"use client";

import React, { useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useContainer } from "@stackra/ts-container";
import {
  PAGE_BUILDER_COMPONENT_REGISTRY,
  PAGE_BUILDER_HISTORY_MANAGER,
} from "@/constants/tokens.constant";
import type { ComponentRegistry } from "@/registries/component.registry";
import type { HistoryManager } from "@/services/history-manager.service";
import { usePageBuilder } from "@/hooks/use-page-builder.hook";
import { usePageBuilderContext } from "@/contexts/page-builder.context";
import { useSelectedNode } from "@/hooks/use-selected-node.hook";
import type { ComponentNode } from "@/interfaces/component-node.interface";
import type { ComponentMetadata } from "@/interfaces/component-metadata.interface";
import { validateDrop, findNode } from "@/utils/tree-operations.util";
import { DropZone } from "./drop-zone.component";

/**
 * Props for the {@link Canvas} component.
 */
export interface CanvasProps {
  /** Optional CSS class name */
  className?: string;
}

/**
 * Canvas component — the main drag-and-drop editing surface.
 *
 * Renders the page tree recursively with interactive editing controls.
 * Handles drag-and-drop for inserting new components from the Palette
 * and reordering existing components within the tree.
 *
 * @example
 * ```tsx
 * <Canvas />
 * ```
 */
export function Canvas({ className }: CanvasProps) {
  const manager = usePageBuilder();
  const { pageTree, setPageTree } = usePageBuilderContext();
  const { selectedNode, setSelectedNode } = useSelectedNode();
  const componentRegistry = useContainer(PAGE_BUILDER_COMPONENT_REGISTRY) as ComponentRegistry;
  const historyManager = useContainer(PAGE_BUILDER_HISTORY_MANAGER) as HistoryManager;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const [activeDrag, setActiveDrag] = React.useState<{
    type: "palette-item" | "tree-node";
    metadata?: ComponentMetadata;
    node?: ComponentNode;
  } | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === "palette-item") {
      setActiveDrag({ type: "palette-item", metadata: data.metadata });
    } else if (data?.type === "tree-node") {
      setActiveDrag({ type: "tree-node", node: data.node });
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDrag(null);

      const { active, over } = event;
      if (!over) return;

      const overData = over.data.current;
      if (!overData?.parentId) return;

      const parentId: string = overData.parentId;
      const index: number = overData.index ?? 0;

      // Find parent node and its metadata for validation
      const parentNode = findNode(pageTree.root, parentId);
      if (!parentNode) return;

      const parentMetadata = componentRegistry.get(parentNode.type);
      if (!parentMetadata) return;

      const activeData = active.data.current;

      if (activeData?.type === "palette-item" && activeData.metadata) {
        // Inserting a new component from the palette
        const childType = activeData.metadata.type;
        if (!validateDrop(parentMetadata, childType, parentNode.children.length)) {
          return;
        }

        historyManager.pushSnapshot(manager.getTree());
        manager.insertNode(parentId, index, activeData.metadata);
        setPageTree(manager.getTree());
      } else if (activeData?.type === "tree-node" && activeData.node) {
        // Moving an existing node
        const nodeId = activeData.node.id;
        const childType = activeData.node.type;

        // Don't count the node itself if it's already a child of the target parent
        const isAlreadyChild = parentNode.children.some((c) => c.id === nodeId);
        const effectiveChildCount = isAlreadyChild
          ? parentNode.children.length - 1
          : parentNode.children.length;

        if (!validateDrop(parentMetadata, childType, effectiveChildCount)) {
          return;
        }

        historyManager.pushSnapshot(manager.getTree());
        manager.moveNode(nodeId, parentId, index);
        setPageTree(manager.getTree());
      }
    },
    [pageTree, componentRegistry, historyManager, manager, setPageTree],
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedNode) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        // Don't delete if user is typing in an input
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }

        e.preventDefault();
        historyManager.pushSnapshot(manager.getTree());
        manager.removeNode(selectedNode.id);
        setPageTree(manager.getTree());
        setSelectedNode(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedNode, historyManager, manager, setPageTree, setSelectedNode]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      // Deselect when clicking empty canvas area
      if (e.target === e.currentTarget) {
        setSelectedNode(null);
      }
    },
    [setSelectedNode],
  );

  const handleNodeSelect = useCallback(
    (node: ComponentNode) => {
      setSelectedNode(node);
    },
    [setSelectedNode],
  );

  const handleNodeDelete = useCallback(
    (nodeId: string) => {
      historyManager.pushSnapshot(manager.getTree());
      manager.removeNode(nodeId);
      setPageTree(manager.getTree());
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
    },
    [historyManager, manager, setPageTree, selectedNode, setSelectedNode],
  );

  const handleNodeDuplicate = useCallback(
    (nodeId: string) => {
      historyManager.pushSnapshot(manager.getTree());
      const duplicated = manager.duplicateNode(nodeId);
      setPageTree(manager.getTree());
      if (duplicated) {
        setSelectedNode(duplicated);
      }
    },
    [historyManager, manager, setPageTree, setSelectedNode],
  );

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        className={className}
        onClick={handleCanvasClick}
        style={{
          flex: 1,
          padding: 24,
          overflow: "auto",
          backgroundColor: "var(--color-default-50, #fafafa)",
          minHeight: 400,
        }}
        role="main"
        aria-label="Page builder canvas"
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            backgroundColor: "var(--color-background, #ffffff)",
            borderRadius: 8,
            border: "1px solid var(--color-divider, #e0e0e0)",
            minHeight: 200,
            padding: 16,
          }}
        >
          <CanvasNode
            node={pageTree.root}
            selectedNodeId={selectedNode?.id ?? null}
            onSelect={handleNodeSelect}
            onDelete={handleNodeDelete}
            onDuplicate={handleNodeDuplicate}
            componentRegistry={componentRegistry}
          />
        </div>
      </div>

      <DragOverlay>
        {activeDrag && (
          <div
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--color-primary-50, #f0f7ff)",
              border: "1px solid var(--color-primary, #006FEE)",
              borderRadius: 6,
              fontSize: 13,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {activeDrag.type === "palette-item"
              ? activeDrag.metadata?.displayName
              : activeDrag.node?.type}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

/**
 * Props for the internal CanvasNode component.
 */
interface CanvasNodeProps {
  node: ComponentNode;
  selectedNodeId: string | null;
  onSelect: (node: ComponentNode) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
  componentRegistry: ComponentRegistry;
}

/**
 * Recursively renders a component node in the canvas with editing controls.
 */
function CanvasNode({
  node,
  selectedNodeId,
  onSelect,
  onDelete,
  onDuplicate,
  componentRegistry,
}: CanvasNodeProps) {
  const isSelected = node.id === selectedNodeId;
  const metadata = componentRegistry.get(node.type);
  const isRoot = node.id === "root" || node.type === "container";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "relative",
        border: isSelected
          ? "2px solid var(--color-primary, #006FEE)"
          : "1px dashed var(--color-divider, #e0e0e0)",
        borderRadius: 4,
        padding: 8,
        margin: 4,
        minHeight: 40,
        cursor: "pointer",
        backgroundColor: isSelected
          ? "var(--color-primary-50, rgba(0, 111, 238, 0.05))"
          : "transparent",
        transition: "all 150ms ease",
      }}
      data-node-id={node.id}
      data-node-type={node.type}
      role="treeitem"
      aria-selected={isSelected}
      aria-label={`${metadata?.displayName ?? node.type} component`}
    >
      {/* Node header with type label and action buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: node.children.length > 0 ? 8 : 0,
          fontSize: 11,
          color: "var(--color-foreground-500)",
        }}
      >
        <span style={{ fontWeight: 500 }}>{metadata?.displayName ?? node.type}</span>

        {!isRoot && isSelected && (
          <div style={{ display: "flex", gap: 4 }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(node.id);
              }}
              style={{
                padding: "2px 6px",
                fontSize: 10,
                border: "1px solid var(--color-divider, #e0e0e0)",
                borderRadius: 3,
                backgroundColor: "var(--color-content1, #ffffff)",
                cursor: "pointer",
              }}
              aria-label={`Duplicate ${metadata?.displayName ?? node.type}`}
            >
              Dup
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              style={{
                padding: "2px 6px",
                fontSize: 10,
                border: "1px solid var(--color-danger, #f31260)",
                borderRadius: 3,
                backgroundColor: "var(--color-content1, #ffffff)",
                color: "var(--color-danger, #f31260)",
                cursor: "pointer",
              }}
              aria-label={`Delete ${metadata?.displayName ?? node.type}`}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Drop zones and children */}
      <DropZone id={`drop-${node.id}-0`} parentId={node.id} index={0} />
      {node.children.map((child, idx) => (
        <React.Fragment key={child.id}>
          <CanvasNode
            node={child}
            selectedNodeId={selectedNodeId}
            onSelect={onSelect}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            componentRegistry={componentRegistry}
          />
          <DropZone id={`drop-${node.id}-${idx + 1}`} parentId={node.id} index={idx + 1} />
        </React.Fragment>
      ))}
    </div>
  );
}
