/**
 * @fileoverview TemplateDialog — modal dialog for selecting page templates.
 *
 * Lists all registered templates from the TemplateRegistry with name,
 * description, and optional thumbnail. Loads the selected template's
 * Page_JSON into the canvas when confirmed.
 *
 * @module @stackra/react-page-builder
 * @category Components
 */

"use client";

import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { useInject } from "@stackra/ts-container";
import { PAGE_BUILDER_TEMPLATE_REGISTRY } from "@/constants/tokens.constant";
import type { TemplateRegistry } from "@/registries/template.registry";
import type { PageTemplate } from "@/interfaces/page-template.interface";

/**
 * Props for the {@link TemplateDialog} component.
 */
export interface TemplateDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback to close the dialog */
  onClose: () => void;
  /** Callback invoked when a template is selected and confirmed */
  onSelect: (template: PageTemplate) => void;
}

/**
 * Template selection dialog component.
 *
 * Displays a modal with all registered templates from the TemplateRegistry.
 * Each template shows its name, description, and optional thumbnail.
 * The user selects a template and confirms to load it into the canvas.
 *
 * @example
 * ```tsx
 * <TemplateDialog
 *   isOpen={showTemplates}
 *   onClose={() => setShowTemplates(false)}
 *   onSelect={handleTemplateSelect}
 * />
 * ```
 */
export function TemplateDialog({ isOpen, onClose, onSelect }: TemplateDialogProps) {
  const templateRegistry = useInject<TemplateRegistry>(PAGE_BUILDER_TEMPLATE_REGISTRY);
  const templates = templateRegistry.getTemplates();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedId) {
      const template = templates.find((t) => t.id === selectedId);
      if (template) {
        onSelect(template);
        onClose();
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>Choose a Template</ModalHeader>
        <ModalBody>
          {templates.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--color-foreground-500)" }}>
              No templates available.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 16,
              }}
            >
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedId(template.id)}
                  style={{
                    padding: 16,
                    border:
                      selectedId === template.id
                        ? "2px solid var(--color-primary, #006FEE)"
                        : "1px solid var(--color-divider, #e0e0e0)",
                    borderRadius: 8,
                    cursor: "pointer",
                    backgroundColor:
                      selectedId === template.id
                        ? "var(--color-primary-50, #f0f7ff)"
                        : "var(--color-content1, #ffffff)",
                    textAlign: "left",
                    transition: "all 150ms ease",
                  }}
                  aria-pressed={selectedId === template.id}
                  aria-label={`Select ${template.name} template`}
                >
                  {template.thumbnail && (
                    <img
                      src={template.thumbnail}
                      alt={`${template.name} preview`}
                      style={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 4,
                        marginBottom: 8,
                      }}
                    />
                  )}
                  <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600 }}>
                    {template.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--color-foreground-500)" }}>
                    {template.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" isDisabled={!selectedId} onPress={handleConfirm}>
            Use Template
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
