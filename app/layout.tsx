import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { APP_CONFIG } from "@/config/app";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(APP_CONFIG.website),
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
      </body>
    </html>
  );
}
