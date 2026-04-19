/**
 * useDesktop Hook
 *
 * Resolves the DesktopManager from DI and returns the platform bridge.
 *
 * @example
 * ```typescript
 * function PrintButton() {
 *   const desktop = useDesktop();
 *
 *   return (
 *     <button onClick={() => desktop.print(receiptHtml)}>
 *       {desktop.isDesktop ? 'Print Receipt' : 'Print (Browser)'}
 *     </button>
 *   );
 * }
 * ```
 */

import { useInject } from '@stackra-inc/ts-container';
import { DesktopManager } from '@/services/desktop-manager.service';
import type { DesktopBridge } from '@/interfaces';

export function useDesktop(): DesktopBridge {
  const manager = useInject(DesktopManager);
  return manager.bridge;
}
