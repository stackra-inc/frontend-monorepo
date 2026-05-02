/**
 * i18n Demo Page
 *
 * Demonstrates @stackra/react-i18n features:
 * - `useTranslation()` hook — `t()`, `__()`, `trans()` functions
 * - `useLocale()` hook — current locale, languages, RTL detection
 * - `useChangeLocale()` hook — switch languages with loading state
 * - Language switcher buttons (en, ar, es, fr, de)
 * - Live translated strings and interpolation
 *
 * @module pages/demos/react-i18n
 */

import { useState, useCallback } from "react";
import { useTranslation, useLocale, useChangeLocale } from "@stackra/react-i18n";
import { Card, Button, Chip, Separator } from "@heroui/react";
import { Link } from "react-router-dom";
import { Globe, Languages, ArrowLeftRight, Code, Terminal } from "lucide-react";

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
  time: string;
  message: string;
  type: "info" | "success" | "error";
}

/**
 * ReactI18nDemo — interactive demo of the i18n package.
 */
export default function ReactI18nDemo() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Only destructure trans from hook — t() and __() come from globals
  const _translation = useTranslation();
  const { locale, languages, isRTL } = useLocale();
  const { changeLocale, isChanging } = useChangeLocale();

  const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [...prev, { time: new Date().toLocaleTimeString(), message, type }]);
  }, []);

  const handleChangeLocale = useCallback(
    async (code: string) => {
      try {
        await changeLocale(code);
        addLog(`✓ Locale changed to: ${code}`, "success");
      } catch (err) {
        addLog(`✗ Error: ${err instanceof Error ? err.message : String(err)}`, "error");
      }
    },
    [changeLocale, addLog],
  );

  /**
   * Test t() — the primary translation function with interpolation support.
   */
  const handleTestT = useCallback(() => {
    addLog("── t() — Primary translation function ──", "info");
    addLog(`t("welcome") → "${t("welcome")}"`, "success");
    addLog(`t("greeting") → "${t("greeting")}"`, "success");
    addLog(`t("goodbye") → "${t("goodbye")}"`, "success");
    addLog(`t("hello_user", { name: "Kiro" }) → "${t("hello_user", { name: "Kiro" })}"`, "success");
    addLog(`t("items_count", { count: 5 }) → "${t("items_count", { count: 5 })}"`, "success");
    addLog(`t("nav.home") → "${t("nav.home")}"`, "success");
    addLog(`t("actions.save") → "${t("actions.save")}"`, "success");
  }, [t, addLog]);

  /**
   * Test __() — simple translation function (no interpolation).
   */
  const handleTestUnderscore = useCallback(() => {
    addLog("── __() — Simple translation (no interpolation) ──", "info");
    addLog(`__("welcome") → "${__("welcome")}"`, "success");
    addLog(`__("greeting") → "${__("greeting")}"`, "success");
    addLog(`__("app_name") → "${__("app_name")}"`, "success");
    addLog(`__("nav.docs") → "${__("nav.docs")}"`, "success");
    addLog(`__("actions.cancel") → "${__("actions.cancel")}"`, "success");
  }, [__, addLog]);

  /**
   * Test trans() — alias for t() with interpolation.
   */
  const handleTestTrans = useCallback(() => {
    addLog("── trans() — Translation alias with interpolation ──", "info");
    addLog(`trans("welcome") → "${trans("welcome")}"`, "success");
    addLog(
      `trans("hello_user", { name: "World" }) → "${trans("hello_user", { name: "World" })}"`,
      "success",
    );
    addLog(`trans("demo_title") → "${trans("demo_title")}"`, "success");
    addLog(`trans("nav.pricing") → "${trans("nav.pricing")}"`, "success");
    addLog(`trans("actions.submit") → "${trans("actions.submit")}"`, "success");
  }, [trans, addLog]);

  /**
   * Test all nested keys.
   */
  const handleTestNested = useCallback(() => {
    addLog("── Nested keys ──", "info");
    const navKeys = ["home", "about", "docs", "demos", "pricing"];
    for (const key of navKeys) {
      addLog(`t("nav.${key}") → "${t(`nav.${key}`)}"`, "success");
    }
    const actionKeys = ["save", "cancel", "delete", "edit", "submit", "reset"];
    for (const key of actionKeys) {
      addLog(`t("actions.${key}") → "${t(`actions.${key}`)}"`, "success");
    }
  }, [t, addLog]);

  /**
   * Test missing key fallback.
   */
  const handleTestMissing = useCallback(() => {
    addLog("── Missing key fallback ──", "info");
    addLog(`t("nonexistent") → "${t("nonexistent")}"`, "info");
    addLog(`__("this.key.does.not.exist") → "${__("this.key.does.not.exist")}"`, "info");
    addLog(`trans("missing.key") → "${trans("missing.key")}"`, "info");
    addLog("↑ Missing keys return the key itself as fallback", "info");
  }, [t, __, trans, addLog]);

  return (
    <section className="flex flex-col gap-6 py-8 md:py-10 max-w-4xl mx-auto">
      <div>
        <Link className="text-sm text-accent hover:underline" to="/demos">
          ← Back to Demos
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-foreground">@stackra/react-i18n</h1>
        <p className="mt-1 text-muted">{t("demo_description")}</p>
      </div>

      {/* ── Current Locale ───────────────────────────────────────── */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent" />
            <Card.Title>{t("current_locale")}</Card.Title>
          </div>
          <Card.Description>
            The active locale detected by <code>useLocale()</code>.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Active locale:</span>
              <Chip color="success" size="sm">
                {locale}
              </Chip>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Direction:</span>
              <Chip color={isRTL ? "warning" : "default"} size="sm">
                {isRTL ? "RTL ←" : "LTR →"}
              </Chip>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Languages:</span>
              <span className="text-sm font-mono">{languages?.join(", ") ?? "—"}</span>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* ── Language Switcher ─────────────────────────────────────── */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-accent" />
            <Card.Title>1. {t("switch_language")}</Card.Title>
          </div>
          <Card.Description>
            Use <code>useChangeLocale()</code> to switch the active language.
            {isChanging && <span className="ml-2 text-warning">Switching...</span>}
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-wrap gap-3">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                variant={locale === lang.code ? "primary" : "outline"}
                onPress={() => handleChangeLocale(lang.code)}
                isDisabled={isChanging}
              >
                {lang.flag} {lang.label}
              </Button>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* ── Live Translation Preview ─────────────────────────────── */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-accent" />
            <Card.Title>2. Live Translation Preview</Card.Title>
          </div>
          <Card.Description>
            These strings update automatically when you switch languages.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted">Basic Keys</h4>
              <div className="bg-surface rounded-lg p-3 space-y-1 text-sm">
                <p>
                  <span className="text-muted">welcome:</span> {t("welcome")}
                </p>
                <p>
                  <span className="text-muted">greeting:</span> {t("greeting")}
                </p>
                <p>
                  <span className="text-muted">goodbye:</span> {t("goodbye")}
                </p>
                <p>
                  <span className="text-muted">app_name:</span> {t("app_name")}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted">Interpolation</h4>
              <div className="bg-surface rounded-lg p-3 space-y-1 text-sm">
                <p>
                  <span className="text-muted">hello_user:</span>{" "}
                  {t("hello_user", { name: "Kiro" })}
                </p>
                <p>
                  <span className="text-muted">items_count:</span> {t("items_count", { count: 3 })}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted">Navigation Keys</h4>
              <div className="bg-surface rounded-lg p-3 space-y-1 text-sm">
                {["home", "about", "docs", "demos", "pricing"].map((key) => (
                  <p key={key}>
                    <span className="text-muted">nav.{key}:</span> {t(`nav.${key}`)}
                  </p>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted">Action Keys</h4>
              <div className="bg-surface rounded-lg p-3 space-y-1 text-sm">
                {["save", "cancel", "delete", "edit", "submit", "reset"].map((key) => (
                  <p key={key}>
                    <span className="text-muted">actions.{key}:</span> {t(`actions.${key}`)}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* ── Test Translation Functions ────────────────────────────── */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-accent" />
            <Card.Title>3. Test Translation Functions</Card.Title>
          </div>
          <Card.Description>
            Click each button to test <code>t()</code>, <code>__()</code>, and <code>trans()</code>{" "}
            and see the output in the log below.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-wrap gap-3 mb-4">
            <Button onPress={handleTestT} variant="primary" size="sm">
              Test t()
            </Button>
            <Button onPress={handleTestUnderscore} variant="secondary" size="sm">
              Test __()
            </Button>
            <Button onPress={handleTestTrans} variant="outline" size="sm">
              Test trans()
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <Button onPress={handleTestNested} variant="outline" size="sm">
              Test Nested Keys
            </Button>
            <Button onPress={handleTestMissing} variant="outline" size="sm">
              Test Missing Keys
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <Button variant="ghost" size="sm" onPress={() => setLogs([])}>
              Clear Log
            </Button>
          </div>

          <div className="bg-surface rounded-lg p-4 font-mono text-xs max-h-80 overflow-y-auto">
            {logs.length === 0 ? (
              <span className="text-muted">Click a test button to see translation output...</span>
            ) : (
              logs.map((entry, i) => (
                <div key={i} className="py-0.5">
                  <span className="text-muted">[{entry.time}]</span>{" "}
                  <span
                    className={
                      entry.type === "success"
                        ? "text-success"
                        : entry.type === "error"
                          ? "text-danger"
                          : "text-foreground"
                    }
                  >
                    {entry.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card.Content>
      </Card>

      {/* ── File Structure ───────────────────────────────────────── */}
      <Card>
        <Card.Header>
          <Card.Title>Translation File Structure</Card.Title>
          <Card.Description>
            Translation files are auto-discovered from <code>src/i18n/</code> by the Vite plugin.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <pre className="bg-surface rounded-lg p-4 text-sm font-mono overflow-x-auto">
            {`src/i18n/
├── common.en.json    → English translations
├── common.ar.json    → Arabic translations (RTL)
├── common.es.json    → Spanish translations
├── common.fr.json    → French translations
└── common.de.json    → German translations`}
          </pre>
        </Card.Content>
      </Card>

      {/* ── Code Pattern ─────────────────────────────────────────── */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-accent" />
            <Card.Title>Code Pattern</Card.Title>
          </div>
        </Card.Header>
        <Card.Content>
          <pre className="bg-surface rounded-lg p-4 font-mono text-sm overflow-x-auto">
            {`import {
  useTranslation,
  useLocale,
  useChangeLocale,
} from "@stackra/react-i18n";

function MyComponent() {
  // t() — primary, supports interpolation
  const { t, __, trans } = useTranslation();

  // Locale info — locale code, languages, RTL
  const { locale, languages, isRTL } = useLocale();

  // Language switcher with loading state
  const { changeLocale, isChanging } = useChangeLocale();

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      {/* t() — with interpolation */}
      <p>{t("hello_user", { name: "Kiro" })}</p>

      {/* __() — simple, no interpolation */}
      <p>{__("welcome")}</p>

      {/* trans() — alias for t() */}
      <p>{trans("greeting")}</p>

      {/* Switch language */}
      <button
        onClick={() => changeLocale("ar")}
        disabled={isChanging}
      >
        Switch to Arabic
      </button>
    </div>
  );
}`}
          </pre>
        </Card.Content>
      </Card>
    </section>
  );
}
