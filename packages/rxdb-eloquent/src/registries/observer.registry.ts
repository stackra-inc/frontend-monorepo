/**
 * @file observer.registry.ts
 * @description Registry for Observer classes. Extends BaseRegistry to store
 * Observer-to-Model bindings. Wires observers into MetadataStorage so
 * the HasEvents concern picks them up at runtime.
 *
 * @category Registries
 *
 * @example
 * ```ts
 * const registry = new ObserverRegistry();
 * registry.bind(User, UserObserver);
 * registry.bind(User, AuditObserver);
 * // Observers are now registered in MetadataStorage for User
 * ```
 */

import { Injectable } from '@stackra/ts-container';
import { BaseRegistry } from '@stackra/ts-support';
import { MetadataStorage } from '@/metadata/metadata.storage';
import type { Observer } from '@/model/observer';

/** An Observer class constructor. */
type ObserverClass = new (...args: any[]) => Observer;

/** A binding of observer class to model class. */
type ObserverBinding = {
  modelClass: Function;
  observerClass: ObserverClass;
};

// ---------------------------------------------------------------------------
// ObserverRegistry
// ---------------------------------------------------------------------------

/**
 * Stores Observer-to-Model bindings.
 * Wires each binding into MetadataStorage so HasEvents picks them up.
 */
@Injectable()
export class ObserverRegistry extends BaseRegistry<ObserverBinding> {
  /**
   * Bind an Observer class to a Model class.
   * Registers the observer in MetadataStorage immediately.
   *
   * @param modelClass - The Model class to observe.
   * @param observerClass - The Observer class to register.
   */
  bind(modelClass: Function, observerClass: ObserverClass): void {
    const key = `${modelClass.name}:${observerClass.name}`;
    const binding: ObserverBinding = { modelClass, observerClass };

    this.register(key, binding);

    // Wire into MetadataStorage so HasEvents concern picks it up
    const storage = MetadataStorage.getInstance();
    const existing = storage.getClassMetadata(modelClass);
    const observers = [...existing.observers, observerClass];
    storage.registerClassMetadata(modelClass, 'observers', observers);
  }

  /**
   * Bind multiple observers at once.
   *
   * @param bindings - Array of { model, observer } pairs.
   */
  bindMany(bindings: Array<{ model: Function; observer: ObserverClass }>): void {
    for (const { model, observer } of bindings) {
      this.bind(model, observer);
    }
  }

  /**
   * Get all observer classes bound to a specific Model.
   */
  getForModel(modelClass: Function): ObserverClass[] {
    return this.filter((binding) => binding.modelClass === modelClass).map(
      (binding) => binding.observerClass
    );
  }
}

/** Global singleton ObserverRegistry. */
export const observerRegistry = new ObserverRegistry();
