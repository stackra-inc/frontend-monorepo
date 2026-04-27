/**
 * @fileoverview VersionHistory — panel for browsing and restoring page versions.
 *
 * Fetches the version list from the backend API with pagination. Displays
 * version number, author, timestamp, and optional label. Supports
 * side-by-side preview comparison and restore action. Records restore
 * operations in the HistoryManager.
 *
 * @module @stackra/react-page-builder
 * @category Components
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/react";
import { usePageBuilder } from "@/hooks/use-page-builder.hook";
import { usePageBuilderContext } from "@/contexts/page-builder.context";
import { useContainer } from "@stackra/ts-container";
import { PAGE_BUILDER_HISTORY_MANAGER } from "@/constants/tokens.constant";
import type { HistoryManager } from "@/services/history-manager.service";
import type { VersionEntry } from "@/interfaces/version-entry.interface";
import type { VersionListResponse } from "@/interfaces/version-list-response.interface";

/**
 * Props for the {@link VersionHistory} component.
 */
export interface VersionHistoryProps {
  /** The page ID to fetch version history for */
  pageId: string;
  /** Whether the panel is visible */
  isOpen: boolean;
  /** Callback to close the panel */
  onClose: () => void;
}

/**
 * Version history panel component.
 *
 * Fetches and displays the version history for a page with pagination.
 * Each version entry shows the version number, author, timestamp, and
 * optional label. Users can preview a version or restore it, which
 * records the operation in the HistoryManager.
 *
 * @example
 * ```tsx
 * <VersionHistory
 *   pageId="page-1"
 *   isOpen={showHistory}
 *   onClose={() => setShowHistory(false)}
 * />
 * ```
 */
export function VersionHistory({ pageId, isOpen, onClose }: VersionHistoryProps) {
  const manager = usePageBuilder();
  const { setPageTree } = usePageBuilderContext();
  const historyManager = useContainer(PAGE_BUILDER_HISTORY_MANAGER) as HistoryManager;

  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = useCallback(
    async (page: number) => {
      setLoading(true);
      setError(null);
      try {
        const response: VersionListResponse = await manager.fetchVersionHistory(pageId, page);
        setVersions(response.versions);
        setTotal(response.total);
        setCurrentPage(response.page);
        setPerPage(response.perPage);
      } catch (err) {
        setError("Failed to load version history.");
      } finally {
        setLoading(false);
      }
    },
    [manager, pageId],
  );

  useEffect(() => {
    if (isOpen) {
      fetchVersions(1);
    }
  }, [isOpen, fetchVersions]);

  const handleRestore = async (versionId: string) => {
    try {
      // Record current state in history before restoring
      historyManager.pushSnapshot(manager.getTree());
      await manager.restoreVersion(pageId, versionId);
      setPageTree(manager.getTree());
    } catch {
      setError("Failed to restore version.");
    }
  };

  const totalPages = Math.ceil(total / perPage);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        width: 320,
        borderLeft: "1px solid var(--color-divider, #e0e0e0)",
        backgroundColor: "var(--color-content1, #ffffff)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
      role="complementary"
      aria-label="Version history"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid var(--color-divider, #e0e0e0)",
        }}
      >
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Version History</h3>
        <Button size="sm" variant="light" onPress={onClose} aria-label="Close version history">
          ✕
        </Button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
        {loading && (
          <p style={{ textAlign: "center", padding: 16, color: "var(--color-foreground-500)" }}>
            Loading...
          </p>
        )}

        {error && (
          <p style={{ textAlign: "center", padding: 16, color: "var(--color-danger, #f31260)" }}>
            {error}
          </p>
        )}

        {!loading && !error && versions.length === 0 && (
          <p style={{ textAlign: "center", padding: 16, color: "var(--color-foreground-500)" }}>
            No versions found.
          </p>
        )}

        {!loading &&
          versions.map((version) => (
            <div
              key={version.id}
              style={{
                padding: 12,
                borderBottom: "1px solid var(--color-divider, #e0e0e0)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>v{version.versionNumber}</span>
                <span style={{ fontSize: 12, color: "var(--color-foreground-500)" }}>
                  {new Date(version.timestamp).toLocaleDateString()}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--color-foreground-500)", marginBottom: 8 }}>
                {version.authorName}
                {version.label && (
                  <span style={{ marginLeft: 8, fontStyle: "italic" }}>{version.label}</span>
                )}
              </div>
              <Button
                size="sm"
                variant="flat"
                onPress={() => handleRestore(version.id)}
                aria-label={`Restore version ${version.versionNumber}`}
              >
                Restore
              </Button>
            </div>
          ))}
      </div>

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            padding: "8px 16px",
            borderTop: "1px solid var(--color-divider, #e0e0e0)",
          }}
        >
          <Button
            size="sm"
            variant="flat"
            isDisabled={currentPage <= 1}
            onPress={() => fetchVersions(currentPage - 1)}
            aria-label="Previous page"
          >
            Prev
          </Button>
          <span style={{ fontSize: 12, lineHeight: "32px" }}>
            {currentPage} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="flat"
            isDisabled={currentPage >= totalPages}
            onPress={() => fetchVersions(currentPage + 1)}
            aria-label="Next page"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
