/**
 * @fileoverview DropZone — visual drop indicator for drag-and-drop operations.
 *
 * Renders a visual insertion line at valid drop positions using
 * `@dnd-kit`'s `useDroppable` hook. The indicator becomes visible
 * and highlighted when a draggable item is hovering over the zone.
 *
 * @module @stackra/react-page-builder
 * @category Components
 */

"use client";

import { useDroppable } from "@dnd-kit/core";

/**
 * Props for the {@link DropZone} component.
 */
export interface DropZoneProps {
  /** Unique identifier for this drop zone */
  id: string;
  /** The parent node ID this drop zone belongs to */
  parentId: string;
  /** The insertion index within the parent's children */
  index: number;
}

/**
 * Visual drop indicator component for drag-and-drop operations.
 *
 * Uses `@dnd-kit`'s `useDroppable` to register as a valid drop target.
 * Renders a horizontal line that becomes highlighted when a draggable
 * item is hovering over it, indicating a valid insertion point.
 *
 * @example
 * ```tsx
 * <DropZone id="drop-root-0" parentId="root" index={0} />
 * ```
 */
export function DropZone({ id, parentId, index }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { parentId, index },
  });

  return (
    <div
      ref={setNodeRef}
      role="presentation"
      aria-hidden="true"
      style={{
        height: isOver ? 4 : 2,
        backgroundColor: isOver ? "var(--color-primary, #006FEE)" : "transparent",
        transition: "all 150ms ease",
        margin: isOver ? "4px 0" : "1px 0",
        borderRadius: 2,
        minHeight: 2,
      }}
      data-drop-zone={id}
      data-parent-id={parentId}
      data-index={index}
    />
  );
}
