/**
 * @OnIpc Decorator
 *
 * Marks a method as an IPC handler in the main process.
 *
 * All metadata reads and writes go through `@vivtel/metadata` for a consistent,
 * typed API instead of raw `Reflect.*` calls.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class PrintHandler {
 *   @OnIpc('print-receipt')
 *   async handlePrint(html: string) {
 *     // Print the receipt
 *   }
 * }
 * ```
 */

import { updateMetadata } from '@vivtel/metadata';
import { ON_IPC_METADATA } from '@/constants';

export interface OnIpcMetadata {
  channel: string;
  method: string;
}

export function OnIpc(channel: string): MethodDecorator {
  return (target: object, propertyKey: string | symbol) => {
    updateMetadata(
      ON_IPC_METADATA,
      [] as OnIpcMetadata[],
      (existing) => [...existing, { channel, method: String(propertyKey) }],
      target.constructor as object
    );
  };
}
