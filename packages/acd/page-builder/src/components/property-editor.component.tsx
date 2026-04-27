/**
 * @fileoverview PropertyEditor — dynamic form for editing component properties.
 *
 * Renders a form from the selected component's PropertySchema. Maps field
 * types to HeroUI v3 controls: Input for text, Input type="number" for
 * number, Input type="color" for color, Select for select, Switch for
 * boolean, Textarea for textarea. Validates input against schema constraints
 * and shows inline errors.
 *
 * @module @stackra/react-page-builder
 * @category Components
 */

"use client";

import React, { useState, useCallback } from "react";
import { Input, Select, SelectItem, Switch, Textarea } from "@heroui/react";
import { usePageBuilder } from "@/hooks/use-page-builder.hook";
import { useSelectedNode } from "@/hooks/use-selected-node.hook";
import { usePageBuilderContext } from "@/contexts/page-builder.context";
import { useContainer } from "@stackra/ts-container";
import {
  PAGE_BUILDER_COMPONENT_REGISTRY,
  PAGE_BUILDER_HISTORY_MANAGER,
} from "@/constants/tokens.constant";
import type { ComponentRegistry } from "@/registries/component.registry";
import type { HistoryManager } from "@/services/history-manager.service";
import type { PropertySchemaField } from "@/interfaces/property-schema-field.interface";
import { FieldType } from "@/enums/field-type.enum";

/**
 * Props for the {@link PropertyEditor} component.
 */
export interface PropertyEditorProps {
  /** Optional CSS class name */
  className?: string;
}

/**
 * Validate a value against a property schema field's constraints.
 *
 * @param field - The property schema field with validation rules
 * @param value - The value to validate
 * @returns An error message string, or null if valid
 */
function validateField(field: PropertySchemaField, value: unknown): string | null {
  const validation = field.validation;
  if (!validation) return null;

  if (validation.required && (value === undefined || value === null || value === "")) {
    return `${field.label} is required`;
  }

  if (typeof value === "number") {
    if (validation.min !== undefined && value < validation.min) {
      return `${field.label} must be at least ${validation.min}`;
    }
    if (validation.max !== undefined && value > validation.max) {
      return `${field.label} must be at most ${validation.max}`;
    }
  }

  if (typeof value === "string") {
    if (validation.minLength !== undefined && value.length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`;
    }
    if (validation.maxLength !== undefined && value.length > validation.maxLength) {
      return `${field.label} must be at most ${validation.maxLength} characters`;
    }
    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return `${field.label} does not match the required pattern`;
      }
    }
  }

  return null;
}

/**
 * PropertyEditor component for editing component properties.
 *
 * Renders a dynamic form based on the selected component's property schema.
 * Each field type maps to a specific HeroUI v3 form control. Changes are
 * applied to the page tree via the PageBuilderManager.
 *
 * @example
 * ```tsx
 * <PropertyEditor />
 * ```
 */
export function PropertyEditor({ className }: PropertyEditorProps) {
  const manager = usePageBuilder();
  const { selectedNode } = useSelectedNode();
  const { setPageTree } = usePageBuilderContext();
  const componentRegistry = useContainer(PAGE_BUILDER_COMPONENT_REGISTRY) as ComponentRegistry;
  const historyManager = useContainer(PAGE_BUILDER_HISTORY_MANAGER) as HistoryManager;
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const handleChange = useCallback(
    (field: PropertySchemaField, value: unknown) => {
      if (!selectedNode) return;

      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field.key]: error }));

      if (!error) {
        historyManager.pushSnapshot(manager.getTree());
        manager.updateNodeProps(selectedNode.id, { [field.key]: value });
        setPageTree(manager.getTree());
      }
    },
    [selectedNode, manager, historyManager, setPageTree],
  );

  if (!selectedNode) {
    return (
      <div
        className={className}
        style={{
          padding: 24,
          textAlign: "center",
          color: "var(--color-foreground-500)",
        }}
        role="complementary"
        aria-label="Property editor"
      >
        <p>Select a component to edit its properties.</p>
      </div>
    );
  }

  const metadata = componentRegistry.get(selectedNode.type);
  const schema = metadata?.propertySchema ?? [];

  return (
    <div
      className={className}
      style={{
        padding: 16,
        overflow: "auto",
      }}
      role="complementary"
      aria-label="Property editor"
    >
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600 }}>
          {metadata?.icon && <span style={{ marginRight: 8 }}>{metadata.icon}</span>}
          {metadata?.displayName ?? selectedNode.type}
        </h3>
        <p style={{ margin: 0, fontSize: 12, color: "var(--color-foreground-500)" }}>
          ID: {selectedNode.id}
        </p>
      </div>

      {schema.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--color-foreground-500)" }}>
          No editable properties.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {schema.map((field) => (
            <PropertyField
              key={field.key}
              field={field}
              value={selectedNode.props[field.key]}
              error={errors[field.key] ?? null}
              onChange={(value) => handleChange(field, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Props for the internal PropertyField component.
 */
interface PropertyFieldProps {
  field: PropertySchemaField;
  value: unknown;
  error: string | null;
  onChange: (value: unknown) => void;
}

/**
 * Renders a single property field based on its type.
 */
function PropertyField({ field, value, error, onChange }: PropertyFieldProps) {
  switch (field.type) {
    case FieldType.TEXT:
      return (
        <Input
          label={field.label}
          value={String(value ?? "")}
          onValueChange={(v) => onChange(v)}
          isInvalid={!!error}
          errorMessage={error ?? undefined}
          size="sm"
          isRequired={field.validation?.required}
        />
      );

    case FieldType.NUMBER:
      return (
        <Input
          type="number"
          label={field.label}
          value={String(value ?? "")}
          onValueChange={(v) => onChange(v === "" ? "" : Number(v))}
          isInvalid={!!error}
          errorMessage={error ?? undefined}
          size="sm"
          isRequired={field.validation?.required}
        />
      );

    case FieldType.COLOR:
      return (
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>{field.label}</label>
          <input
            type="color"
            value={String(value ?? "#000000")}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: "100%", height: 32, border: "none", cursor: "pointer" }}
            aria-label={field.label}
          />
          {error && (
            <p style={{ fontSize: 11, color: "var(--color-danger, #f31260)", marginTop: 2 }}>
              {error}
            </p>
          )}
        </div>
      );

    case FieldType.SELECT:
      return (
        <Select
          label={field.label}
          selectedKeys={value !== undefined && value !== null ? [String(value)] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            if (selected !== undefined) onChange(selected);
          }}
          isInvalid={!!error}
          errorMessage={error ?? undefined}
          size="sm"
          isRequired={field.validation?.required}
        >
          {(field.options ?? []).map((opt) => (
            <SelectItem key={opt.value}>{opt.label}</SelectItem>
          ))}
        </Select>
      );

    case FieldType.BOOLEAN:
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ fontSize: 13 }}>{field.label}</label>
          <Switch
            isSelected={Boolean(value)}
            onValueChange={(v) => onChange(v)}
            size="sm"
            aria-label={field.label}
          />
        </div>
      );

    case FieldType.TEXTAREA:
      return (
        <Textarea
          label={field.label}
          value={String(value ?? "")}
          onValueChange={(v) => onChange(v)}
          isInvalid={!!error}
          errorMessage={error ?? undefined}
          size="sm"
          isRequired={field.validation?.required}
          minRows={3}
        />
      );

    default:
      return (
        <Input
          label={field.label}
          value={String(value ?? "")}
          onValueChange={(v) => onChange(v)}
          size="sm"
        />
      );
  }
}
