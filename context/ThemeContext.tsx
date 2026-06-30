"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useTheme } from "next-themes";

export type ThemeMode = "light" | "dark" | "system";
export type ThemeResolvedMode = "light" | "dark" | null;

export interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ThemeResolvedMode;
  isMounted: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme:
        theme === "light" || theme === "dark" ? theme : "system",
      resolvedTheme:
        resolvedTheme === "light" || resolvedTheme === "dark"
          ? resolvedTheme
          : null,
      isMounted,
      setTheme: (nextTheme) => setTheme(nextTheme),
      toggleTheme: () =>
        setTheme(resolvedTheme === "dark" ? "light" : "dark"),
    }),
    [isMounted, resolvedTheme, setTheme, theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeContextProvider.");
  }

  return context;
}
