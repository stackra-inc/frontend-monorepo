/**
 * @stackra/ts-container/react
 *
 * React bindings for the DI container.
 * Import from '@stackra/ts-container/react' to use React hooks
 * and providers. This entry point requires React as a peer dependency.
 *
 * @example
 * ```tsx
 * import { ContainerProvider, useInject } from '@stackra/ts-container/react';
 *
 * function App() {
 *   return (
 *     <ContainerProvider module={AppModule}>
 *       <MyComponent />
 *     </ContainerProvider>
 *   );
 * }
 *
 * function MyComponent() {
 *   const service = useInject(UserService);
 *   return <div>{service.getName()}</div>;
 * }
 * ```
 *
 * @module @stackra/ts-container/react
 */

export { useInject } from './hooks/use-inject';
export { useContainer } from './hooks/use-container';
export { ContainerContext } from './contexts/container.context';
export { useOptionalInject } from './hooks/use-optional-inject';
export { ContainerProvider } from './providers/container.provider';
export type { ContainerProviderProps } from './interfaces/container-provider-props.interface';
