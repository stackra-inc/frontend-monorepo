/**
 * i18n Demo Page
 *
 * Demonstrates @stackra/react-i18n features:
 * - `useTranslation()` hook — get the `t()` function
 * - `useLocale()` hook — get the current locale
 * - `useChangeLocale()` hook — switch languages
 * - Language switcher buttons (en, ar, es, fr, de)
 * - Display translated strings and current locale
 *
 * @module pages/demos/react-i18n
 */

import { useState, useCallback } from "react";
import { useTranslation, useLocale, useChangeLocale } from "@stackra/react-i18n";
import { Card, Button, Chip } from "@heroui/react";
import { Link } from "react-router-dom";

import DefaultLayout from "@/layouts/default";

/**
 * Supported languages with display labels.
 */
const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
] as const;

/**
 * Represents a log entry in the demo output.
 */
interface LogEntry {
  /** Timestamp label */
  time: string;
  /** Log message content */
  message: string;
}

/**
 * ReactI18nDemo — interactive demo of the i18n package.
 *
 * Users can switch languages, see translated strings, and observe
 * how the hooks respond to locale changes.
 *
 * @returns The i18n demo page
 */
export default function ReactI18nDemo() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const { t } = useTranslation();
  const locale = useLocale();
  const changeLocale = useChangeLocale();

  /**
   * Append a message to the demo log output.
   *
   * @param message - The message to display
   */
  const addLog = useCallback((message: string) => {
    setLogs((prev) => [...prev, { time: new Date().toLocaleTimeString(), message }]);
  }, []);

  /**
   * Switch to a new locale and log the change.
   *
   * @param code - The language code to switch to
   */
  const handleChangeLocale = useCallback(
    (code: string) => {
      try {
        changeLocale(code);
        addLog(`Locale changed to: ${code}`);
      } catch (err) {
        addLog(`Error: ${err instanceof Error ? err.message : String(err)}`);
      }
    },
    [changeLocale, addLog],
  );

  /**
   * Demonstrate the t() function with various translation keys.
   */
  const handleTranslate = useCallback(() => {
    try {
      const keys = ["common.welcome", "common.greeting", "common.goodbye"];

      for (const key of keys) {
        const translated = t(key);

        addLog(`t("${key}") → "${String(translated)}"`);
      }
    } catch (err) {
      addLog(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [t, addLog]);

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6 py-8 md:py-10 max-w-4xl mx-auto">
        <div>
          <Link className="text-sm text-accent hover:underline" to="/demos">
            ← Back to Demos
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-foreground">@stackra/react-i18n</h1>
          <p className="mt-1 text-muted">
            Internationalization with locale detection, language switching, and translation hooks.
          </p>
        </div>

        {/* ── Current Locale ───────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Current Locale</Card.Title>
            <Card.Description>
              The active locale detected by <code>useLocale()</code>.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">Active locale:</span>
              <Chip color="success" size="sm">
                {locale}
              </Chip>
            </div>
          </Card.Content>
        </Card>

        {/* ── Language Switcher ─────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>1. Switch Language</Card.Title>
            <Card.Description>
              Use <code>useChangeLocale()</code> to switch the active language.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex flex-wrap gap-3">
              {LANGUAGES.map((lang) => (
                <Button
                  key={lang.code}
                  variant={locale === lang.code ? "primary" : "outline"}
                  onPress={() => handleChangeLocale(lang.code)}
                >
                  {lang.flag} {lang.label}
                </Button>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* ── Translation Demo ─────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>2. Translate Keys</Card.Title>
            <Card.Description>
              Use <code>useTranslation()</code> to get the <code>t()</code> function and resolve
              translation keys.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex flex-wrap gap-3 mb-4">
              <Button onPress={handleTranslate}>Translate Sample Keys</Button>
              <Button variant="outline" onPress={() => setLogs([])}>
                Clear Log
              </Button>
            </div>
            <div className="bg-accent/10 rounded-lg p-4 text-sm">
              <p className="text-muted mb-2">
                Translation files go in <code>src/locales/&#123;lang&#125;/</code>:
              </p>
              <pre className="font-mono text-foreground">
                {`src/locales/
├── en/
│   └── common.json    → { "welcome": "Welcome", "greeting": "Hello!" }
├── ar/
│   └── common.json    → { "welcome": "مرحبا", "greeting": "أهلاً!" }
├── es/
│   └── common.json    → { "welcome": "Bienvenido", "greeting": "¡Hola!" }
├── fr/
│   └── common.json    → { "welcome": "Bienvenue", "greeting": "Bonjour!" }
└── de/
    └── common.json    → { "welcome": "Willkommen", "greeting": "Hallo!" }`}
              </pre>
            </div>
          </Card.Content>
        </Card>

        {/* ── Code Example ─────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Code Pattern</Card.Title>
          </Card.Header>
          <Card.Content>
            <pre className="bg-accent/10 rounded-lg p-4 font-mono text-sm overflow-x-auto text-foreground">
              {`import {
  useTranslation,
  useLocale,
  useChangeLocale,
} from "@stackra/react-i18n";

function MyComponent() {
  // Get the translation function
  const { t } = useTranslation();

  // Get the current locale
  const locale = useLocale();

  // Get the locale switcher
  const changeLocale = useChangeLocale();

  return (
    <div>
      <p>{t("common.welcome")}</p>
      <p>Current: {locale}</p>
      <button onClick={() => changeLocale("es")}>
        Switch to Spanish
      </button>
    </div>
  );
}`}
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
                <span className="text-muted">
                  Switch a language or translate keys to see output...
                </span>
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
