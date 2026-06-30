import type { Metadata } from "next";
import type { ReactNode } from "react";

import { APP_CONFIG } from "@/config/app";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.name,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
  applicationName: APP_CONFIG.name,
  authors: [{ name: APP_CONFIG.author }],
  creator: APP_CONFIG.author,
  publisher: APP_CONFIG.name,
  keywords: [
    "ChroniSync",
    "chronic care",
    "patient portal",
    "physician portal",
    "glassmorphism",
    "Next.js",
    "Firebase",
  ],
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <div className="app-shell">{children}</div>
          </QueryProvider>
        </ThemeProvider>

        <style jsx global>{`
          :root {
            color-scheme: light;
            --ui-bg: #f7f2ea;
            --ui-bg-alt: #eef7f5;
            --ui-surface: rgba(255, 255, 255, 0.72);
            --ui-surface-strong: rgba(255, 255, 255, 0.88);
            --ui-border: rgba(8, 35, 43, 0.12);
            --ui-text: #08232b;
            --ui-muted: #58727b;
            --ui-accent: #0b6574;
            --ui-accent-strong: #19a39a;
            --ui-accent-soft: rgba(25, 163, 154, 0.14);
            --ui-warning: #9b1c1c;
            --ui-warning-soft: rgba(180, 35, 35, 0.08);
            --ui-shadow: 0 30px 90px rgba(9, 30, 36, 0.14);
            --ui-radius-xl: 32px;
            --ui-radius-lg: 24px;
            --ui-radius-md: 18px;
            --font-body: "Aptos", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
            --font-display: "Iowan Old Style", "Palatino Linotype", "Book Antiqua",
              Georgia, serif;
          }

          .dark {
            color-scheme: dark;
            --ui-bg: #041118;
            --ui-bg-alt: #0a2230;
            --ui-surface: rgba(7, 18, 24, 0.72);
            --ui-surface-strong: rgba(5, 15, 20, 0.88);
            --ui-border: rgba(255, 255, 255, 0.12);
            --ui-text: #e6f6f7;
            --ui-muted: #98b9bf;
            --ui-accent: #78d6d0;
            --ui-accent-strong: #a1f5e8;
            --ui-accent-soft: rgba(120, 214, 208, 0.14);
            --ui-warning: #fda4af;
            --ui-warning-soft: rgba(251, 113, 133, 0.12);
            --ui-shadow: 0 34px 100px rgba(0, 0, 0, 0.32);
          }

          html {
            min-height: 100%;
            scroll-behavior: smooth;
            background: transparent;
          }

          body {
            margin: 0;
            min-height: 100vh;
            overflow-x: hidden;
            color: var(--ui-text);
            font-family: var(--font-body);
            background:
              radial-gradient(
                circle at top left,
                rgba(25, 163, 154, 0.18),
                transparent 28%
              ),
              radial-gradient(
                circle at top right,
                rgba(234, 179, 8, 0.14),
                transparent 24%
              ),
              radial-gradient(
                circle at bottom right,
                rgba(11, 101, 116, 0.12),
                transparent 22%
              ),
              linear-gradient(180deg, var(--ui-bg) 0%, var(--ui-bg-alt) 100%);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
          }

          * {
            box-sizing: border-box;
          }

          a {
            color: inherit;
            text-decoration: none;
          }

          button,
          input,
          textarea,
          select {
            font: inherit;
          }

          ::selection {
            background: rgba(25, 163, 154, 0.28);
            color: var(--ui-text);
          }

          .app-shell {
            position: relative;
            min-height: 100vh;
            isolation: isolate;
          }
        `}</style>
      </body>
    </html>
  );
}
