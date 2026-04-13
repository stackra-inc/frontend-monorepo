/**
 * Logger Service
 *
 * The high-level API that consumers interact with. Wraps a channel's
 * transporters and provides convenience methods: debug, info, warn, error, fatal.
 *
 * This is NOT injectable — it's created by LoggerManager.channel().
 * Each channel gets its own LoggerService instance.
 *
 * @module services/logger
 */

import type { TransporterInterface } from '@/interfaces/transporter.interface';
import type { LogEntry } from '@/interfaces/log-entry.interface';
import type { LoggerConfig } from '@/interfaces/logger-config.interface';
import { LogLevel } from '@/enums/log-level.enum';
import { ConsoleTransporter } from '@/transporters/console.transporter';

/**
 * LoggerService — the consumer-facing logging API.
 *
 * Created by `LoggerManager.channel(name)`. Wraps a channel's
 * transporters with a rich API including contextual logging.
 *
 * @example
 * ```typescript
 * const logger = manager.channel('console');
 *
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Something failed', { error });
 * logger.withContext({ requestId: 'abc' }).info('Processing');
 * ```
 */
export class LoggerService {
  private readonly _transporters: TransporterInterface[];
  private _sharedContext: Record<string, unknown> = {};

  constructor(private readonly _config: LoggerConfig) {
    this._transporters = _config.transporters ?? [new ConsoleTransporter()];
    if (_config.context) {
      this._sharedContext = { ..._config.context };
    }
  }

  // ── Log methods ─────────────────────────────────────────────────────────

  debug(message: string, context: Record<string, unknown> = {}): void {
    this.dispatch(LogLevel.Debug, message, context);
  }

  info(message: string, context: Record<string, unknown> = {}): void {
    this.dispatch(LogLevel.Info, message, context);
  }

  warn(message: string, context: Record<string, unknown> = {}): void {
    this.dispatch(LogLevel.Warn, message, context);
  }

  error(message: string, context: Record<string, unknown> = {}): void {
    this.dispatch(LogLevel.Error, message, context);
  }

  fatal(message: string, context: Record<string, unknown> = {}): void {
    this.dispatch(LogLevel.Fatal, message, context);
  }

  // ── Context ─────────────────────────────────────────────────────────────

  /**
   * Add persistent context merged into every future log entry.
   */
  withContext(context: Record<string, unknown>): this {
    this._sharedContext = { ...this._sharedContext, ...context };
    return this;
  }

  /**
   * Remove keys from shared context, or clear it entirely.
   */
  withoutContext(keys?: string[]): this {
    if (!keys) {
      this._sharedContext = {};
    } else {
      for (const key of keys) {
        delete this._sharedContext[key];
      }
    }
    return this;
  }

  // ── Accessors ───────────────────────────────────────────────────────────

  getTransporters(): TransporterInterface[] {
    return this._transporters;
  }

  getConfig(): LoggerConfig {
    return this._config;
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private dispatch(level: LogLevel, message: string, context: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      context: { ...this._sharedContext, ...context },
      timestamp: new Date().toISOString(),
    };

    for (const transporter of this._transporters) {
      transporter.transport(entry);
    }
  }
}
