/**
 * Example 1: Module Setup + React Application
 *
 * Demonstrates how to configure `I18nModule.forRoot()` in your DI module
 * and wrap your React app with `<I18nProvider>`. The provider uses
 * `useInject(I18N_SERVICE)` internally to resolve the service from the
 * DI container — no manual wiring needed.
 *
 * ## What this example covers:
 * - Registering the i18n module with `@stackra/ts-container`
 * - Configuring languages, resolvers, and middleware options
 * - Wiring the React context provider (auto-resolves from DI)
 * - Using `useTranslation()` and `useLocale()` in components
 *
 * ## File structure assumed:
 * ```
 * src/
 * ├── app.module.ts        ← DI module configuration
 * ├── main.tsx             ← React entry point
 * ├── App.tsx              ← Root component
 * └── i18n/
 *     ├── en.json          ← English translations
 *     └── ar.json          ← Arabic translations
 * ```
 */

// ============================================================================
// Step 1: Configure the DI Module (app.module.ts)
// ============================================================================

import { Module } from "@stackra/ts-container";
import { HttpModule } from "@stackra/ts-http";
import { I18nModule } from "@stackra/react-i18n";

/**
 * Root application module.
 *
 * Imports `I18nModule.forRoot()` which registers:
 * - `I18N_CONFIG` — merged configuration
 * - `I18N_SERVICE` / `I18nService` — high-level injectable service
 * - `I18NEXT_SERVICE` / `I18nextService` — low-level i18next wrapper
 * - `LOCALE_RESOLVER_CHAIN` — composed resolver chain
 * - All 5 locale resolver tokens
 * - `LocaleMiddleware` — auto-discovered by HttpModule
 */
@Module({
  imports: [
    // HTTP module (required for LocaleMiddleware auto-discovery)
    HttpModule.forRoot({
      baseURL: "https://api.example.com/v1",
    }),

    // i18n module with full configuration
    I18nModule.forRoot({
      // Default language when no resolver returns a value
      defaultLanguage: "en",

      // All supported languages — used by resolvers for validation
      languages: ["en", "ar", "es"],

      // Resolver chain: tried in this order until one returns a locale
      resolvers: ["url-path", "storage", "navigator"],

      // Query parameter name for the query-param resolver
      queryParam: "lang",

      // localStorage key for persisting the selected locale
      storageKey: "app_locale",

      // HTTP headers for the LocaleMiddleware
      requestHeader: "Accept-Language",
      responseHeader: "content-language",

      // Sync locale from API response headers back to the provider
      syncFromResponse: true,

      // Enable debug logging during development
      debug: (import.meta as any).env?.NODE_ENV === "development",
    }),
  ],
})
export class AppModule {}

// ============================================================================
// Step 2: React Entry Point (main.tsx)
// ============================================================================

import React from "react";
import ReactDOM from "react-dom/client";
import { ContainerProvider, Application } from "@stackra/ts-container";
import { I18nProvider } from "@stackra/react-i18n";

// Bootstrap the DI container from the root module
const app = await Application.create(AppModule);

/**
 * The `<I18nProvider>` uses `useInject(I18N_SERVICE)` internally
 * to resolve the service from the DI container. No need to manually
 * call `container.get()` — just nest it inside `<ContainerProvider>`.
 *
 * The provider automatically:
 * 1. Resolves `I18nService` from the container
 * 2. Runs the locale resolver chain on mount
 * 3. Switches i18next to the detected locale
 * 4. Provides context to all child components
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ContainerProvider context={app}>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ContainerProvider>
  </React.StrictMode>,
);

// ============================================================================
// Step 3: Using Hooks in Components (App.tsx)
// ============================================================================

import { useTranslation, useLocale, useChangeLocale } from "@stackra/react-i18n";

/**
 * Root application component demonstrating all three hooks.
 *
 * No imports from the DI container needed — hooks read from
 * the React context provided by `<I18nProvider>`.
 */
function App() {
  // useTranslation — provides t(), __(), trans() functions
  const { t, isLoading: translationsLoading } = useTranslation();

  // useLocale — provides current locale, available languages, RTL direction
  const { locale, languages, isRTL } = useLocale();

  // useChangeLocale — provides changeLocale() with loading/error state
  const { changeLocale, isChanging } = useChangeLocale();

  if (translationsLoading) {
    return <div>Loading translations...</div>;
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <h1>{t("greeting")}</h1>
      <p>{t("welcome_message", { name: "John" })}</p>

      {/* Language switcher */}
      <select value={locale} onChange={(e) => changeLocale(e.target.value)} disabled={isChanging}>
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
