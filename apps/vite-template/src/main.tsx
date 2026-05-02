/**
 * Application Entry Point
 *
 * |--------------------------------------------------------------------------
 * | Bootstraps the DI container and renders the React app.
 * |--------------------------------------------------------------------------
 * |
 * | Order:
 * |   1. Capture PWA beforeinstallprompt event (fires before React mounts)
 * |   2. Bootstrap DI container via Application.create()
 * |      — registers app globally, ContainerProvider needs no props
 * |   3. Detect Electron environment
 * |   4. Render React app
 * |   5. Register beforeunload for graceful DI shutdown
 * |
 * @module main
 */

import "reflect-metadata";
import ReactDOM from "react-dom/client";
import { BrowserRouter, ScrollRestoration } from "@stackra/react-router";
import { Application } from "@stackra/ts-container";
import { ContainerProvider } from "@stackra/ts-container/react";
import { Facade } from "@stackra/ts-support";
import { bootI18nGlobals } from "@stackra/react-i18n";

import { Provider } from "./provider";
import App from "./App";

// NOTE: AppModule is imported dynamically in bootstrap() to ensure
// env() globals are available when config files are evaluated
import "@/styles/globals.css";

/*
|--------------------------------------------------------------------------
| PWA: Capture beforeinstallprompt early
|--------------------------------------------------------------------------
|
| The browser fires this event once during page load — often before
| React mounts. Stash it on window so PwaProvider can pick it up.
|
*/
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  (window as any).__PWA_DEFERRED_PROMPT__ = e;
});

/**
 * Bootstrap the DI container, then render the React app.
 */
async function bootstrap() {
  console.log("[Bootstrap] Starting application bootstrap...");

  // Dynamically import AppModule to ensure env() globals are available
  // when config files are evaluated. Static imports at the top of this file
  // would be evaluated before the virtual:stackra-env-boot module runs.
  const { AppModule } = await import("@/lib/app.module");

  // Application.create() bootstraps the DI container and registers
  // the app globally — ContainerProvider works without a context prop.
  const app: Application = await Application.create(AppModule);

  console.log("[Bootstrap] Application created:", app);

  // Wire all facades to the bootstrapped application.
  // After this call, every XxxFacade.proxy() and XxxFacade.instance
  // resolves from the DI container without needing explicit injection.
  Facade.setApplication(app);

  console.log("[Bootstrap] Facades wired to application");

  // Register i18n global functions (t, __, trans) on globalThis.
  // Must be called after DI bootstrap so i18next is initialized with resources.
  bootI18nGlobals();

  /*
  |--------------------------------------------------------------------------
  | Electron: add CSS class for traffic light padding and drag region.
  |--------------------------------------------------------------------------
  */
  if ((window as any).electronAPI) {
    document.body.classList.add("is-electron");
  }

  console.log("[Bootstrap] Rendering React app...");

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <ContainerProvider context={app}>
        <ScrollRestoration restoreDelay={50} smoothScroll={false} />
        <Provider>
          <App />
        </Provider>
      </ContainerProvider>
    </BrowserRouter>,
  );

  /*
  |--------------------------------------------------------------------------
  | Graceful shutdown — browser only
  |--------------------------------------------------------------------------
  |
  | beforeunload fires when the tab closes, refreshes, or navigates away.
  | Calls onModuleDestroy / onApplicationShutdown hooks on all providers.
  |
  | Note: the browser does not wait for async work here. Hooks must be
  | synchronous or near-instant. For async teardown (e.g. flushing
  | analytics), use navigator.sendBeacon() instead.
  |
  */
  window.addEventListener("beforeunload", () => {
    app.close();
  });
}

bootstrap().catch((error) => {
  console.error("[Bootstrap] Failed to bootstrap application:", error);
});
