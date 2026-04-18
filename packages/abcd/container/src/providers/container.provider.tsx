/**
 * ContainerProvider Component
 *
 * Wrap your application (or a subtree) with `<ContainerProvider>` to make
 * the DI container available to all child components via `useInject()`.
 *
 * ## Usage (with global application - recommended):
 *
 * ```tsx
 * // main.ts
 * await Application.create(AppModule);
 *
 * // App.tsx
 * ReactDOM.createRoot(root).render(
 *   <ContainerProvider>
 *     <App />
 *   </ContainerProvider>
 * );
 * ```
 *
 * ## Usage (with explicit context - legacy):
 *
 * ```tsx
 * const app = await Application.create(AppModule);
 *
 * ReactDOM.createRoot(root).render(
 *   <ContainerProvider context={app}>
 *     <App />
 *   </ContainerProvider>
 * );
 * ```
 *
 * @module react/providers/container
 */

import { ContainerContext } from '@/contexts/container.context';
import type { ContainerProviderProps } from '@/interfaces/container-provider-props.interface';
import { getGlobalApplication } from '@/application/global-application';

/**
 * Provides the DI container to the React component tree.
 *
 * If no `context` prop is provided, automatically uses the global application
 * instance created by `Application.create()`.
 *
 * @param props - The provider props (context is optional)
 * @returns A React element wrapping children with the container context
 *
 * @example
 * ```tsx
 * // Option 1: Global application (recommended)
 * await Application.create(AppModule);
 * <ContainerProvider>
 *   <App />
 * </ContainerProvider>
 *
 * // Option 2: Explicit context (legacy)
 * const app = await Application.create(AppModule);
 * <ContainerProvider context={app}>
 *   <App />
 * </ContainerProvider>
 * ```
 */
export function ContainerProvider({ context, children }: ContainerProviderProps) {
  // Use explicit context if provided, otherwise use global application
  const resolvedContext = context ?? getGlobalApplication();

  if (!resolvedContext) {
    throw new Error(
      'ContainerProvider: No container context found. ' +
        'Either pass a context prop or call Application.create() before rendering. ' +
        '\n\nExample:\n' +
        '  await Application.create(AppModule);\n' +
        '  <ContainerProvider><App /></ContainerProvider>'
    );
  }

  return <ContainerContext.Provider value={resolvedContext}>{children}</ContainerContext.Provider>;
}
