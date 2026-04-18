/**
 * Crash Reporter Service
 *
 * |--------------------------------------------------------------------------
 * | Crash reporting via Electron crashReporter and Sentry integration.
 * |--------------------------------------------------------------------------
 * |
 * | In Electron: starts the Electron crashReporter + Sentry SDK.
 * | In browser: uses the Sentry browser SDK for error reporting.
 * |
 * | Sentry is loaded dynamically to avoid a hard dependency.
 * | Initialization is best-effort — failures are logged, not thrown.
 * |
 * | Usage:
 * |   const crash = container.get(CrashReporterService);
 * |   await crash.initialize({ sentryDsn: 'https://...@sentry.io/123' });
 * |   crash.captureException(new Error('Something broke'));
 * |
 * @module @stackra/ts-desktop
 */

import { Injectable, Inject } from '@stackra/ts-container';

import { DESKTOP_CONFIG } from '@/constants';
import type { DesktopModuleOptions } from '@/interfaces/desktop-module-options.interface';
import type { CrashReporterConfig } from '@/interfaces/diagnostics.interface';
import { DesktopManager } from './desktop-manager.service';

/**
 * Minimal Sentry-like interface so we don't need @sentry/browser as a dependency.
 * The real Sentry SDK is loaded dynamically at runtime.
 */
interface SentryLike {
  init(options: { dsn: string; environment?: string; release?: string }): void;
  captureException(error: Error, options?: { extra?: Record<string, unknown> }): void;
  captureMessage(message: string, level?: string): void;
  setUser(user: { id: string; email?: string; username?: string } | null): void;
}

@Injectable()
export class CrashReporterService {
  /** Whether the service has been initialized. */
  private initialized = false;

  /** Lazily loaded Sentry SDK reference. */
  private sentry: SentryLike | null = null;

  constructor(
    @Inject(DesktopManager) private readonly desktop: DesktopManager,
    @Inject(DESKTOP_CONFIG) private readonly moduleConfig: DesktopModuleOptions
  ) {
    /*
    |--------------------------------------------------------------------------
    | Auto-initialize if config is provided in module options.
    |--------------------------------------------------------------------------
    */
    if (this.moduleConfig.crashReporter) {
      this.initialize(this.moduleConfig.crashReporter).catch((err) => {
        console.warn('[CrashReporterService] Auto-initialization failed:', err);
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | initialize
  |--------------------------------------------------------------------------
  |
  | Starts the crash reporter. Best-effort — never throws.
  |
  */
  async initialize(config: CrashReporterConfig): Promise<void> {
    if (this.initialized) return;

    try {
      /*
      |--------------------------------------------------------------------------
      | Start Electron crashReporter if in desktop mode.
      |--------------------------------------------------------------------------
      */
      if (this.desktop.isDesktop && config.enableElectronCrashReporter !== false) {
        await this.desktop.bridge.invoke('crash-reporter:start', config);
      }

      /*
      |--------------------------------------------------------------------------
      | Load Sentry SDK dynamically (works in both Electron and browser).
      | This avoids a hard dependency on @sentry/browser.
      |--------------------------------------------------------------------------
      */
      if (config.sentryDsn) {
        this.sentry = await this.loadSentry();
        if (this.sentry) {
          this.sentry.init({
            dsn: config.sentryDsn,
            environment: config.environment ?? 'production',
            release: config.release,
          });
        }
      }

      this.initialized = true;
    } catch (err) {
      console.warn('[CrashReporterService] Initialization failed:', err);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | captureException
  |--------------------------------------------------------------------------
  */
  captureException(error: Error, context?: Record<string, unknown>): void {
    if (!this.initialized || !this.sentry) {
      console.error('[CrashReporterService] Not initialized. Error:', error);
      return;
    }

    try {
      this.sentry.captureException(error, { extra: context });
    } catch {
      console.error('[CrashReporterService] Failed to capture exception:', error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | captureMessage
  |--------------------------------------------------------------------------
  */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' | 'fatal' = 'info'): void {
    if (!this.initialized || !this.sentry) {
      console.log(`[CrashReporterService] Not initialized. Message (${level}):`, message);
      return;
    }

    try {
      this.sentry.captureMessage(message, level);
    } catch {
      console.log(`[CrashReporterService] Failed to capture message:`, message);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | setUser
  |--------------------------------------------------------------------------
  */
  setUser(user: { id: string; email?: string; username?: string }): void {
    if (this.sentry) {
      try {
        this.sentry.setUser(user);
      } catch {
        /* Best-effort. */
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Private: load Sentry dynamically
  |--------------------------------------------------------------------------
  */
  private async loadSentry(): Promise<SentryLike | null> {
    try {
      /* Dynamic require to avoid bundler issues with optional deps. */
      const mod = await (Function('return import("@sentry/browser")')() as Promise<SentryLike>);
      return mod;
    } catch {
      console.warn('[CrashReporterService] @sentry/browser not installed — Sentry disabled.');
      return null;
    }
  }
}
