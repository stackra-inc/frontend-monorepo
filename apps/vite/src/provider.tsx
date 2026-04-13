/**
 * @file provider.tsx
 * @description Root provider tree for the Vite application.
 *
 * Wraps the entire app with:
 *   1. ContainerProvider — bootstraps the DI container (AppModule)
 *   2. HeroUIProvider   — HeroUI theme + dark/light switching
 *
 * All child components can use useInject(), useLogger(), etc.
 */

import * as React from "react";
import { HeroUIProvider } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { ContainerProvider } from "@abdokouta/ts-container-react";

import { AppModule } from "@/lib/app.module";

export interface ProviderProps {
  children: React.ReactNode;
}

/**
 * Provider — root provider tree.
 *
 * Order matters:
 *   ContainerProvider must wrap everything so DI services are available
 *   to all child components, including theme-aware ones.
 */
export function Provider({ children }: ProviderProps) {
  const navigate = useNavigate();

  return (
    <ContainerProvider module={AppModule}>
      <HeroUIProvider navigate={navigate}>{children}</HeroUIProvider>
    </ContainerProvider>
  );
}
