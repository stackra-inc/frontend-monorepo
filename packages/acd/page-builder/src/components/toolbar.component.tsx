/**
 * @fileoverview Toolbar — top action bar for the page builder.
 *
 * Provides undo/redo buttons (disabled when stacks are empty), a save
 * button, preview toggle, device-width selector (desktop/tablet/mobile),
 * and a version history button. In preview mode, only the preview toggle
 * and device-width selector are shown.
 *
 * @module @stackra/react-page-builder
 * @category Components
 */

"use client";

import React from "react";
import { Button, Select, SelectItem } from "@heroui/react";
import { useHistory } from "@/hooks/use-history.hook";
import { useBuilderMode } from "@/hooks/use-builder-mode.hook";
import { BuilderMode } from "@/enums/builder-mode.enum";
import { DeviceWidth } from "@/enums/device-width.enum";

/**
 * Props for the {@link Toolbar} component.
 */
export interface ToolbarProps {
  /** Callback invoked when the save button is clicked */
  onSave?: () => void;
  /** Callback invoked when the version history button is clicked */
  onVersionHistory?: () => void;
  /** The currently selected device width */
  deviceWidth: DeviceWidth;
  /** Callback to change the device width */
  onDeviceWidthChange: (width: DeviceWidth) => void;
}

/** Device width options for the selector dropdown. */
const DEVICE_OPTIONS = [
  { label: "Desktop", value: String(DeviceWidth.DESKTOP) },
  { label: "Tablet", value: String(DeviceWidth.TABLET) },
  { label: "Mobile", value: String(DeviceWidth.MOBILE) },
];

/**
 * Toolbar component for the page builder.
 *
 * Renders action buttons for undo/redo, save, preview toggle,
 * device-width selection, and version history access.
 *
 * @example
 * ```tsx
 * <Toolbar
 *   onSave={handleSave}
 *   onVersionHistory={openVersionHistory}
 *   deviceWidth={DeviceWidth.DESKTOP}
 *   onDeviceWidthChange={setDeviceWidth}
 * />
 * ```
 */
export function Toolbar({
  onSave,
  onVersionHistory,
  deviceWidth,
  onDeviceWidthChange,
}: ToolbarProps) {
  const { undo, redo, canUndo, canRedo } = useHistory();
  const { mode, setMode } = useBuilderMode();

  const isPreview = mode === BuilderMode.PREVIEW;

  const handlePreviewToggle = () => {
    setMode(isPreview ? BuilderMode.EDIT : BuilderMode.PREVIEW);
  };

  const handleDeviceChange = (keys: any) => {
    const selected = Array.from(keys)[0] as string;
    if (selected) {
      onDeviceWidthChange(Number(selected) as DeviceWidth);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderBottom: "1px solid var(--color-divider, #e0e0e0)",
        backgroundColor: "var(--color-content1, #ffffff)",
      }}
      role="toolbar"
      aria-label="Page builder toolbar"
    >
      {!isPreview && (
        <>
          <Button size="sm" variant="flat" isDisabled={!canUndo} onPress={undo} aria-label="Undo">
            Undo
          </Button>
          <Button size="sm" variant="flat" isDisabled={!canRedo} onPress={redo} aria-label="Redo">
            Redo
          </Button>

          <div style={{ width: 1, height: 24, backgroundColor: "var(--color-divider, #e0e0e0)" }} />

          <Button size="sm" color="primary" onPress={onSave} aria-label="Save page">
            Save
          </Button>
        </>
      )}

      <div style={{ flex: 1 }} />

      <Select
        size="sm"
        label="Device"
        selectedKeys={[String(deviceWidth)]}
        onSelectionChange={handleDeviceChange}
        style={{ maxWidth: 140 }}
        aria-label="Device width selector"
      >
        {DEVICE_OPTIONS.map((opt) => (
          <SelectItem key={opt.value}>{opt.label}</SelectItem>
        ))}
      </Select>

      <Button
        size="sm"
        variant={isPreview ? "solid" : "flat"}
        color={isPreview ? "primary" : "default"}
        onPress={handlePreviewToggle}
        aria-label={isPreview ? "Exit preview" : "Preview page"}
      >
        {isPreview ? "Edit" : "Preview"}
      </Button>

      {!isPreview && (
        <Button size="sm" variant="flat" onPress={onVersionHistory} aria-label="Version history">
          History
        </Button>
      )}
    </div>
  );
}
