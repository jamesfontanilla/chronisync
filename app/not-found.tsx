import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { ROUTES } from "@/config/route";

export default function NotFound() {
  return (
    <main style={shellStyle}>
      <section style={cardStyle}>
        <div style={iconStyle} aria-hidden="true">
          <TriangleAlert size={24} />
        </div>

        <div style={contentStyle}>
          <span style={eyebrowStyle}>404</span>
          <h1 style={titleStyle}>We could not find that page.</h1>
          <p style={descriptionStyle}>
            The route may have moved, been mistyped, or is not part of the
            current shell yet. Head back home or sign in to continue.
          </p>
        </div>

        <div style={actionsStyle}>
          <Link href={ROUTES.HOME} style={primaryLinkStyle}>
            Return home
          </Link>
          <Link href={ROUTES.AUTH.LOGIN} style={secondaryLinkStyle}>
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}

const shellStyle = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "1.25rem",
} as const;

const cardStyle = {
  width: "min(720px, 100%)",
  display: "grid",
  justifyItems: "center",
  gap: "1rem",
  padding: "clamp(1.4rem, 3vw, 2rem)",
  borderRadius: "var(--ui-radius-xl)",
  border: "1px dashed var(--ui-border)",
  background:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04)), var(--ui-surface-strong)",
  boxShadow: "var(--ui-shadow)",
  textAlign: "center" as const,
} as const;

const iconStyle = {
  display: "inline-grid",
  placeItems: "center",
  width: "4rem",
  height: "4rem",
  borderRadius: "999px",
  color: "var(--ui-accent)",
  background: "var(--ui-accent-soft)",
  border: "1px solid var(--ui-border)",
} as const;

const contentStyle = {
  display: "grid",
  gap: "0.65rem",
} as const;

const eyebrowStyle = {
  fontSize: "0.78rem",
  letterSpacing: "0.24em",
  textTransform: "uppercase" as const,
  color: "var(--ui-accent)",
} as const;

const titleStyle = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
  lineHeight: 1.05,
  letterSpacing: "-0.05em",
} as const;

const descriptionStyle = {
  margin: "0 auto",
  maxWidth: "48ch",
  color: "var(--ui-muted)",
  lineHeight: 1.7,
} as const;

const actionsStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  justifyContent: "center",
  gap: "0.75rem",
} as const;

const linkBaseStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "3rem",
  padding: "0 1.15rem",
  borderRadius: "999px",
  fontWeight: 700,
  transition:
    "transform 180ms ease, background-color 180ms ease, border-color 180ms ease",
} as const;

const primaryLinkStyle = {
  ...linkBaseStyle,
  color: "#1a1a1a",
  background: "linear-gradient(135deg, var(--ui-accent-fill), var(--ui-accent-fill-strong))",
  boxShadow: "0 16px 30px rgba(0, 0, 0, 0.18)",
} as const;

const secondaryLinkStyle = {
  ...linkBaseStyle,
  color: "var(--ui-accent)",
  border: "1px solid var(--ui-border)",
  background: "rgba(255, 255, 255, 0.1)",
} as const;
