"use client";

/**
 * @file app/config/page.tsx
 * @description Config package showcase page.
 *
 * Demonstrates @abdokouta/ts-config:
 *   - Reading typed values (string, number, boolean, array, JSON)
 *   - Default values when a key is missing
 *   - Feature flags pattern
 *   - Live env var display
 */

import React, { useState } from "react";
import { useInject } from "@abdokouta/ts-container-react";
import { ConfigService } from "@abdokouta/ts-config";
import { Card, Chip, Separator } from "@heroui/react";

import { title, subtitle } from "@/components/primitives";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single config entry shown in the UI. */
interface ConfigEntry {
  key: string;
  value: unknown;
  type: string;
  source: "env" | "default";
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/** Derive a display type label from a JS value. */
function typeLabel(value: unknown): string {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ConfigPage — interactive showcase of the Config package.
 *
 * Uses useInject(ConfigService) to access the DI-provided config service
 * and renders a live table of resolved configuration values.
 */
export default function ConfigPage() {
  const config = useInject(ConfigService);

  /** Custom key the user can look up interactively. */
  const [customKey, setCustomKey] = useState("");
  const [customValue, setCustomValue] = useState<string | null>(null);

  // ── Resolve demo entries ──────────────────────────────────────────────────

  const entries: ConfigEntry[] = [
    {
      key: "NODE_ENV",
      value: config.getString("NODE_ENV", "development"),
      type: "string",
      source: config.has("NODE_ENV") ? "env" : "default",
    },
    {
      key: "NEXT_PUBLIC_APP_NAME",
      value: config.getString("NEXT_PUBLIC_APP_NAME", "Pixielity Next.js"),
      type: "string",
      source: config.has("NEXT_PUBLIC_APP_NAME") ? "env" : "default",
    },
    {
      key: "NEXT_PUBLIC_API_URL",
      value: config.getString("NEXT_PUBLIC_API_URL", "http://localhost:8000"),
      type: "string",
      source: config.has("NEXT_PUBLIC_API_URL") ? "env" : "default",
    },
    {
      key: "NEXT_PUBLIC_DEBUG",
      value: config.getBool("NEXT_PUBLIC_DEBUG", false),
      type: "boolean",
      source: config.has("NEXT_PUBLIC_DEBUG") ? "env" : "default",
    },
    {
      key: "NEXT_PUBLIC_PAGE_SIZE",
      value: config.getNumber("NEXT_PUBLIC_PAGE_SIZE", 20),
      type: "number",
      source: config.has("NEXT_PUBLIC_PAGE_SIZE") ? "env" : "default",
    },
  ];

  /** Feature flags derived from env vars. */
  const features = {
    darkMode: config.getBool("NEXT_PUBLIC_FEATURE_DARK_MODE", true),
    analytics: config.getBool("NEXT_PUBLIC_FEATURE_ANALYTICS", false),
    notifications: config.getBool("NEXT_PUBLIC_FEATURE_NOTIFICATIONS", true),
    betaFeatures: config.getBool("NEXT_PUBLIC_FEATURE_BETA", false),
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleLookup() {
    if (!customKey.trim()) return;
    const val = config.getString(customKey.trim(), "(not set)") ?? "(not set)";
    setCustomValue(val);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section className="flex flex-col gap-8 py-8 md:py-10">
      {/* Header */}
      <div>
        <h1 className={title()}>Config Package</h1>
        <p className={subtitle({ class: "mt-2" })}>
          @abdokouta/ts-config — type-safe environment configuration
        </p>
      </div>

      {/* Resolved values table */}
      <Card>
        <Card.Header className="flex flex-col items-start gap-1">
          <h2 className="text-lg font-semibold">Resolved Configuration</h2>
          <p className="text-sm text-default-500">
            Values resolved from environment variables with typed getters and
            fallback defaults.
          </p>
        </Card.Header>
        <Separator />
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-default-500 border-b border-divider">
                  <th className="pb-2 pr-4 font-medium">Key</th>
                  <th className="pb-2 pr-4 font-medium">Value</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.key}
                    className="border-b border-divider last:border-0"
                  >
                    <td className="py-2 pr-4 font-mono text-xs text-primary">
                      {entry.key}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs">
                      {String(entry.value)}
                    </td>
                    <td className="py-2 pr-4">
                      <Chip size="sm" variant="soft">
                        {typeLabel(entry.value)}
                      </Chip>
                    </td>
                    <td className="py-2">
                      <Chip
                        size="sm"
                        variant="soft"
                        color={entry.source === "env" ? "success" : "warning"}
                      >
                        {entry.source}
                      </Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>

      {/* Feature flags */}
      <Card>
        <Card.Header className="flex flex-col items-start gap-1">
          <h2 className="text-lg font-semibold">Feature Flags</h2>
          <p className="text-sm text-default-500">
            Boolean config values used as feature toggles (NEXT_PUBLIC_FEATURE_*).
          </p>
        </Card.Header>
        <Separator />
        <Card.Content>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(features).map(([name, enabled]) => (
              <div
                key={name}
                className="flex flex-col items-center gap-2 rounded-xl border border-divider p-4"
              >
                <span className="text-2xl">{enabled ? "✅" : "❌"}</span>
                <span className="text-xs font-medium capitalize">
                  {name.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <Chip
                  size="sm"
                  color={enabled ? "success" : "default"}
                  variant="soft"
                >
                  {enabled ? "enabled" : "disabled"}
                </Chip>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Interactive lookup */}
      <Card>
        <Card.Header className="flex flex-col items-start gap-1">
          <h2 className="text-lg font-semibold">Interactive Lookup</h2>
          <p className="text-sm text-default-500">
            Look up any environment variable by key using config.getString().
          </p>
        </Card.Header>
        <Separator />
        <Card.Content className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-divider bg-default-100 px-3 py-2 text-sm font-mono outline-none focus:border-primary"
              placeholder="e.g. NODE_ENV"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            />
            <button
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              onClick={handleLookup}
            >
              Lookup
            </button>
          </div>
          {customValue !== null && (
            <div className="rounded-lg bg-default-100 p-3 font-mono text-sm">
              <span className="text-default-500">{customKey} = </span>
              <span className="text-foreground">{customValue}</span>
            </div>
          )}
        </Card.Content>
      </Card>
    </section>
  );
}
