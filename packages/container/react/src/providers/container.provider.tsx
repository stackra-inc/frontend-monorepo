/**
 * @fileoverview ContainerProvider — React component that provides the DI container.
 *
 * Wrap your application (or a subtree) with `<ContainerProvider>` to make
 * the DI container available to all child components via `useInject()`.
 *
 * @module providers/provider
 */

import { ContainerContext } from '@/contexts/container.context';
import type { ContainerProviderProps } from '@/interfaces/container-provider-props.interface';

/**
 * Provides the DI container to the React component tree.
 *
 * @example
 * ```tsx
 * import { ContainerProvider } from '@abdokouta/ts-container-react';
 * import { ApplicationContext } from '@abdokouta/ts-application';
 * import { AppModule } from './app.module';
 *
 * const app = await ApplicationContext.create(AppModule);
 *
 * ReactDOM.createRoot(document.getElementById('root')!).render(
 *   <ContainerProvider context={app}>
 *     <App />
 *   </ContainerProvider>
 * );
 * ```
 */
export function ContainerProvider({ context, children }: ContainerProviderProps) {
  return <ContainerContext.Provider value={context}>{children}</ContainerContext.Provider>;
}
