/**
 * Config Demo Page
 *
 * Demonstrates @stackra/ts-config features:
 * - `ConfigFacade.source()` — get the default ConfigService
 * - `config.get(key)` — read a config value
 * - `config.get(key, defaultValue)` — read with fallback
 * - `config.has(key)` — check if a key exists
 * - `config.all()` — list all config entries
 * - Environment variable resolution with prefix stripping
 *
 * @module pages/demos/ts-config
 */

import { useState, useCallback, useEffect } from "react";
import { ConfigFacade } from "@stackra/ts-config";
import { Card, Button, TextField, Input, Label, Description } from "@heroui/react";
import { Link } from "react-router-dom";

import DefaultLayout from "@/layouts/default";

/**
 * Represents a single log entry in the config demo output.
 */
interface LogEntry {
  /** Timestamp label */
  time: string;
  /** Log message content */
  message: string;
}

/**
 * TsConfigDemo — interactive config reading demo.
 *
 * Shows how ConfigFacade.source() returns a ConfigService that reads
 * environment variables, strips the VITE_ prefix, and provides typed access.
 *
 * @returns The config demo page
 */
export default function TsConfigDemo() {
  const [configKey, setConfigKey] = useState("APP_NAME");
  const [defaultValue, setDefaultValue] = useState("my-app");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [allConfig, setAllConfig] = useState<string>("");

  /**
   * Append a message to the log output.
   *
   * @param message - The message to log
   */
  const log = useCallback((message: string) => {
    setLogs((prev) => [...prev, { time: new Date().toLocaleTimeString(), message }]);
  }, []);

  /**
   * Load all config entries on mount.
   */
  useEffect(() => {
    try {
      const config = ConfigFacade.source();
      const all = config.all();

      setAllConfig(JSON.stringify(all, null, 2));
    } catch {
      setAllConfig("Could not load config — facade may not be wired yet.");
    }
  }, []);

  /**
   * Read a single config value using `source().get()`.
   */
  const handleGet = useCallback(() => {
    try {
      const config = ConfigFacade.source();
      const result = config.get(configKey);

      log(`config.get("${configKey}") → ${result !== undefined ? String(result) : "undefined"}`);
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [configKey, log]);

  /**
   * Read a config value with a default fallback.
   */
  const handleGetWithDefault = useCallback(() => {
    try {
      const config = ConfigFacade.source();
      const result = config.get(configKey, defaultValue);

      log(`config.get("${configKey}", "${defaultValue}") → ${String(result)}`);
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [configKey, defaultValue, log]);

  /**
   * Check if a config key exists using `source().has()`.
   */
  const handleHas = useCallback(() => {
    try {
      const config = ConfigFacade.source();
      const result = config.has(configKey);

      log(`config.has("${configKey}") → ${String(result)}`);
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [configKey, log]);

  /**
   * Refresh the all-config display.
   */
  const handleRefreshAll = useCallback(() => {
    try {
      const config = ConfigFacade.source();
      const all = config.all();

      setAllConfig(JSON.stringify(all, null, 2));
      log("Refreshed all config entries.");
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [log]);

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6 py-8 md:py-10 max-w-4xl mx-auto">
        <div>
          <Link className="text-sm text-accent hover:underline" to="/demos">
            ← Back to Demos
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-foreground">@stackra/ts-config</h1>
          <p className="mt-1 text-muted">
            Environment-aware configuration with prefix stripping and typed access.
          </p>
        </div>

        {/* ── Input Fields ─────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Read Config</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <TextField name="config-key" value={configKey} onChange={(v) => setConfigKey(v)}>
                <Label>Config Key</Label>
                <Input placeholder="e.g. APP_NAME" />
              </TextField>
              <TextField
                name="default-value"
                value={defaultValue}
                onChange={(v) => setDefaultValue(v)}
              >
                <Label>Default Value</Label>
                <Input placeholder="fallback value" />
              </TextField>
            </div>
            <Description className="mb-3">
              The VITE_ prefix is auto-stripped. Use APP_NAME instead of VITE_APP_NAME.
            </Description>
            <div className="flex flex-wrap gap-3">
              <Button onPress={handleGet}>get(key)</Button>
              <Button onPress={handleGetWithDefault}>get(key, default)</Button>
              <Button onPress={handleHas}>has(key)</Button>
              <Button variant="outline" onPress={handleRefreshAll}>
                Refresh All
              </Button>
              <Button variant="outline" onPress={() => setLogs([])}>
                Clear Log
              </Button>
            </div>
          </Card.Content>
        </Card>

        {/* ── All Config ───────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>All Config Entries</Card.Title>
          </Card.Header>
          <Card.Content>
            <pre className="bg-accent/10 rounded-lg p-4 font-mono text-sm overflow-x-auto max-h-60 overflow-y-auto text-foreground">
              {allConfig || "Loading..."}
            </pre>
          </Card.Content>
        </Card>

        {/* ── Code Example ─────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Code Pattern</Card.Title>
          </Card.Header>
          <Card.Content>
            <pre className="bg-accent/10 rounded-lg p-4 font-mono text-sm overflow-x-auto text-foreground">
              {`import { ConfigFacade } from "@stackra/ts-config";

// Get the default config source (ConfigService)
const config = ConfigFacade.source();

// Read a value (VITE_ prefix is auto-stripped)
const appName = config.get("APP_NAME");

// Read with a default fallback
const port = config.get("PORT", "3000");

// Check if a key exists
if (config.has("API_URL")) {
  const url = config.get("API_URL");
}

// Get all config entries
const all = config.all();`}
            </pre>
          </Card.Content>
        </Card>

        {/* ── Output Log ───────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Output</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="bg-accent/10 rounded-lg p-4 font-mono text-sm max-h-80 overflow-y-auto">
              {logs.length === 0 ? (
                <span className="text-muted">Use the buttons above to read config values...</span>
              ) : (
                logs.map((entry, i) => (
                  <div key={i} className="py-0.5">
                    <span className="text-muted">[{entry.time}]</span>{" "}
                    <span className="text-foreground">{entry.message}</span>
                  </div>
                ))
              )}
            </div>
          </Card.Content>
        </Card>
      </section>
    </DefaultLayout>
  );
}
