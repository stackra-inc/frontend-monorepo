/**
 * React Hooks Barrel Export
 *
 * - {@link useContainer} — Access the raw `ContainerResolver` from context
 * - {@link useInject} — Resolve a provider (throws if not found)
 * - {@link useOptionalInject} — Resolve a provider (returns `undefined` if not found)
 *
 * @module hooks
 */

export { useContainer } from './use-container';
export { useInject } from './use-inject';
export { useOptionalInject } from './use-optional-inject';
