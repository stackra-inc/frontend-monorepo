"use client";

/**
 * @file providers.tsx
 * @description Root provider tree for the Next.js application.
 *
 * Wraps the entire app with:
 *   1. ContainerProvider — bootstraps the DI container (AppModule)
 *   2. NextThemesProvider — dark/light theme switching
 *
 * All child components can use useInject(), useLogger(), etc.
 */

import type { ThemeProviderProps } from "next-themes";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ContainerProvider } from "@abdokouta/ts-container-react";

import { AppModule } from "@/lib/app.module";

/** Props accepted by the root Providers component. */
export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

/**
 * Providers — root provider tree.
 *
 * Order matters:
 *   ContainerProvider must wrap everything so DI services are available
 *   to all child components, including theme-aware ones.
 */
export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <ContainerProvider module={AppModule}>
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
    </ContainerProvider>
  );
}
