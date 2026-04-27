/**
 * @fileoverview Palette — component browser sidebar for the page builder.
 *
 * Reads from the ComponentRegistry to display available components grouped
 * by category with collapsible headers. Each entry shows an icon and
 * displayName and is a @dnd-kit draggable source. Includes a search field
 * for filtering by displayName or category (case-insensitive).
 *
 * @module @stackra/react-page-builder
 * @category Components
 */

"use client";

import { useState, useMemo } from "react";
import { Input } from "@heroui/react";
import { useDraggable } from "@dnd-kit/core";
import { useContainer } from "@stackra/ts-container";
import { PAGE_BUILDER_COMPONENT_REGISTRY } from "@/constants/tokens.constant";
import type { ComponentRegistry } from "@/registries/component.registry";
import type { ComponentMetadata } from "@/interfaces/component-metadata.interface";

/**
 * Props for the {@link Palette} component.
 */
export interface PaletteProps {
  /** Optional CSS class name */
  className?: string;
}

/**
 * Palette component for browsing available page builder components.
 *
 * Displays components grouped by category with collapsible headers.
 * Each component entry is a draggable source that can be dropped onto
 * the Canvas. Includes a search field for filtering.
 *
 * @example
 * ```tsx
 * <Palette />
 * ```
 */
export function Palette({ className }: PaletteProps) {
  const componentRegistry = useContainer(PAGE_BUILDER_COMPONENT_REGISTRY) as ComponentRegistry;
  const [search, setSearch] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const allComponents = componentRegistry.getAll();
  const categories = componentRegistry.getCategories();

  const filteredComponents = useMemo(() => {
    if (!search.trim()) return allComponents;
    const query = search.toLowerCase();
    return allComponents.filter(
      (meta) =>
        meta.displayName.toLowerCase().includes(query) ||
        meta.category.toLowerCase().includes(query),
    );
  }, [allComponents, search]);

  const groupedComponents = useMemo(() => {
    const groups: Record<string, ComponentMetadata[]> = {};
    for (const meta of filteredComponents) {
      if (!groups[meta.category]) {
        groups[meta.category] = [];
      }
      groups[meta.category].push(meta);
    }
    return groups;
  }, [filteredComponents]);

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const visibleCategories = categories.filter((cat) => groupedComponents[cat]?.length);

  return (
    <div
      className={className}
      style={{
        width: 240,
        borderRight: "1px solid var(--color-divider, #e0e0e0)",
        backgroundColor: "var(--color-content1, #ffffff)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
      role="complementary"
      aria-label="Component palette"
    >
      <div style={{ padding: "12px 12px 8px" }}>
        <Input
          size="sm"
          placeholder="Search components..."
          value={search}
          onValueChange={setSearch}
          aria-label="Search components"
          isClearable
          onClear={() => setSearch("")}
        />
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "0 8px 8px" }}>
        {visibleCategories.length === 0 && (
          <p
            style={{
              textAlign: "center",
              padding: 16,
              fontSize: 13,
              color: "var(--color-foreground-500)",
            }}
          >
            No components match your search.
          </p>
        )}

        {visibleCategories.map((category) => {
          const isCollapsed = collapsedCategories.has(category);
          const components = groupedComponents[category] ?? [];

          return (
            <div key={category} style={{ marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  padding: "6px 8px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-foreground-700)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
                aria-expanded={!isCollapsed}
                aria-label={`${category} category`}
              >
                <span style={{ marginRight: 4, fontSize: 10 }}>{isCollapsed ? "▶" : "▼"}</span>
                {category}
                <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 400 }}>
                  {components.length}
                </span>
              </button>

              {!isCollapsed && (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {components.map((meta) => (
                    <DraggablePaletteItem key={meta.type} metadata={meta} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Props for the internal DraggablePaletteItem component.
 */
interface DraggablePaletteItemProps {
  metadata: ComponentMetadata;
}

/**
 * A single draggable palette entry.
 */
function DraggablePaletteItem({ metadata }: DraggablePaletteItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${metadata.type}`,
    data: { type: "palette-item", metadata },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 8px",
        borderRadius: 6,
        cursor: "grab",
        fontSize: 13,
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isDragging ? "var(--color-default-100)" : "transparent",
        transition: "background-color 150ms ease",
      }}
      role="option"
      aria-label={`Drag ${metadata.displayName} component`}
    >
      <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{metadata.icon}</span>
      <span>{metadata.displayName}</span>
    </div>
  );
}
