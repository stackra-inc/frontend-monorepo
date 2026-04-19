/**
 * Customizer Registry
 *
 * |--------------------------------------------------------------------------
 * | Registry for theme customizer panels.
 * |--------------------------------------------------------------------------
 * |
 * | Modules register customizer panels via ThemeModule.registerCustomizer().
 * | The ThemeCustomizer component renders all registered panels.
 * |
 * @module @stackra-inc/react-theming
 * @category Registries
 */

import { Injectable } from '@stackra-inc/ts-container';
import { BaseRegistry } from '@stackra-inc/ts-support';
import type { CustomizerPanel } from '@/interfaces/customizer-panel.interface';

/*
|--------------------------------------------------------------------------
| CustomizerRegistry
|--------------------------------------------------------------------------
*/

@Injectable()
export class CustomizerRegistry extends BaseRegistry<CustomizerPanel> {
  /*
  |--------------------------------------------------------------------------
  | register
  |--------------------------------------------------------------------------
  */
  register(id: string, panel: CustomizerPanel): void {
    super.register(id, panel);
  }

  /*
  |--------------------------------------------------------------------------
  | getPanels
  |--------------------------------------------------------------------------
  |
  | Returns all panels sorted by order ascending.
  |
  */
  getPanels(): CustomizerPanel[] {
    return this.getAll().sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }
}

/** Global singleton CustomizerRegistry. */
export const customizerRegistry = new CustomizerRegistry();
