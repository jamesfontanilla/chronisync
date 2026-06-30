"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps as NextThemesProviderProps,
} from "next-themes";
import type { ReactNode } from "react";

import { STORAGE_KEYS } from "@/config/constants";

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: NextThemesProviderProps["defaultTheme"];
  enableSystem?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange
      storageKey={STORAGE_KEYS.THEME}
    >
      {children}
    </NextThemesProvider>
  );
}
