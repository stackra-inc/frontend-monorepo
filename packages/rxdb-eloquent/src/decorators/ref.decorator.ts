/**
 * @file ref.decorator.ts
 * @description Property decorator that registers an RxDB `ref` for population on a Model property.
 *
 * The `@Ref` decorator sets the `ref` value on the column metadata
 * in MetadataStorage. The SchemaResolver uses this to add the `ref` field
 * to the generated `RxJsonSchema` property, enabling RxDB's `populate()`.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers an RxDB ref collection name for population on a Model property.
 *
 * @param collectionName - The name of the referenced RxDB collection.
 * @returns A property decorator function.
 *
 * @example
 * ```ts
 * @Ref('profiles')
 * @Column({ type: 'string', maxLength: 100 })
 * declare profile_id: string;
 * ```
 */
export function Ref(collectionName: string) {
  return function (target: Object, propertyKey: string | symbol) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerColumnFlag(
      target.constructor,
      key,
      'ref',
      collectionName
    );
  };
}
