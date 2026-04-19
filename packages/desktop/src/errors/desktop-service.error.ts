/**
 * Desktop Service Errors
 *
 * |--------------------------------------------------------------------------
 * | Error hierarchy for @stackra/ts-desktop services.
 * |--------------------------------------------------------------------------
 * |
 * | DesktopServiceError        — base error for all desktop services
 * | HardwareTimeoutError       — hardware operation exceeded timeout
 * | HardwareNotConfiguredError — hardware used before configure() called
 * |
 * @module @stackra/ts-desktop
 */

/*
|--------------------------------------------------------------------------
| DesktopServiceError
|--------------------------------------------------------------------------
|
| Base error class for all desktop service errors.
| Includes the service name for easy identification in logs.
|
*/
export class DesktopServiceError extends Error {
  /** The service that threw the error. */
  public readonly service: string;

  /** The underlying cause, if any. */
  public readonly cause?: Error;

  constructor(service: string, message: string, cause?: Error) {
    super(`[${service}] ${message}`);
    this.name = 'DesktopServiceError';
    this.service = service;
    this.cause = cause;
  }
}

/*
|--------------------------------------------------------------------------
| HardwareTimeoutError
|--------------------------------------------------------------------------
|
| Thrown when a hardware operation (print, scale read, drawer open)
| does not respond within the configured timeout.
|
*/
export class HardwareTimeoutError extends DesktopServiceError {
  constructor(service: string, operation: string, timeoutMs: number) {
    super(service, `${operation} timed out after ${timeoutMs}ms`);
    this.name = 'HardwareTimeoutError';
  }
}

/*
|--------------------------------------------------------------------------
| HardwareNotConfiguredError
|--------------------------------------------------------------------------
|
| Thrown when a hardware service method is called before
| the hardware has been configured via configure*().
|
*/
export class HardwareNotConfiguredError extends DesktopServiceError {
  constructor(service: string) {
    super(service, 'Hardware not configured. Call configure() first.');
    this.name = 'HardwareNotConfiguredError';
  }
}
