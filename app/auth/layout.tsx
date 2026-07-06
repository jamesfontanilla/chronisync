"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { APP_CONFIG } from "@/config/app";
import { ROUTES } from "@/config/route";
import { AuthProvider } from "@/providers/AuthProvider";
import { AUTH_ROLE_OPTIONS } from "@/lib/auth/roles";

const shellStyle = {
  minHeight: "100dvh",
  display: "grid",
  gridTemplateColumns: "var(--auth-shell-columns)",
  gap: "var(--auth-shell-gap)",
  background: "#0a0a0a",
  color: "#f5f5f5",
} as const;

const heroStyle = {
  position: "relative",
  overflow: "hidden",
  padding: "var(--auth-hero-padding)",
  display: "flex",
  alignItems: "stretch",
  background: "#0a0a0a",
} as const;

const heroCardStyle = {
  position: "relative",
  zIndex: 1,
  width: "100%",
  borderRadius: "32px",
  padding: "clamp(1.5rem, 4vw, 3rem)",
  background: "#1c1c1e",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: "0 30px 80px rgba(0, 0, 0, 0.35)",
} as const;

const backLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  marginBottom: "1.5rem",
  fontSize: "0.86rem",
  fontWeight: 600,
  color: "rgba(245, 245, 245, 0.7)",
  textDecoration: "none",
} as const;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.28em",
  fontSize: "0.72rem",
  color: "#4ade80",
} as const;

const titleStyle = {
  margin: "0.75rem 0 0",
  fontSize: "clamp(1.95rem, 5vw, 4.8rem)",
  lineHeight: 0.95,
  letterSpacing: "-0.05em",
  color: "#f5f5f5",
} as const;

const bodyStyle = {
  margin: "1.25rem 0 0",
  maxWidth: "42rem",
  fontSize: "1.02rem",
  lineHeight: 1.7,
  color: "rgba(245, 245, 245, 0.82)",
} as const;

const metricsStyle = {
  display: "var(--auth-metrics-display)",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "0.9rem",
  marginTop: "2rem",
} as const;

const metricCardStyle = {
  borderRadius: "20px",
  padding: "1rem",
  background: "rgba(255, 255, 255, 0.07)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
} as const;

const formColumnStyle = {
  display: "flex",
  alignItems: "stretch",
  justifyContent: "center",
  padding: "var(--auth-form-padding)",
  background: "#f7f7f8",
  color: "#1a1a1a",
} as const;

const formFrameStyle = {
  width: "100%",
  maxWidth: "560px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
} as const;

const rolePillStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.45rem",
  marginTop: "1.25rem",
  padding: "0.55rem 0.8rem",
  borderRadius: "999px",
  background: "rgba(255, 255, 255, 0.08)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  fontSize: "0.88rem",
  color: "rgba(245, 245, 245, 0.82)",
} as const;

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <main className="auth-shell" style={shellStyle}>
        <aside className="auth-hero" style={heroStyle}>
          <div style={heroCardStyle}>
            <Link href={ROUTES.HOME} style={backLinkStyle}>
              <ArrowLeft size={16} aria-hidden="true" />
              <span>{APP_CONFIG.shortName}</span>
            </Link>

            <p style={eyebrowStyle}>ChroniSync Auth</p>
            <h1 style={titleStyle}>
              Shared chronic care, without losing the human in the loop.
            </h1>
            <p style={bodyStyle}>
              {APP_CONFIG.description} Patients stay in control of their
              records, physicians keep clinical oversight, and AI stays
              limited to low-risk administrative support.
            </p>

            <div style={rolePillStyle}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: "#4ade80",
                  boxShadow: "0 0 0 6px rgba(74, 222, 128, 0.14)",
                }}
              />
              Patient and physician entry points
            </div>

            <div className="auth-metrics" style={metricsStyle}>
              {AUTH_ROLE_OPTIONS.map((option) => (
                <div key={option.value} style={metricCardStyle}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "rgba(245, 245, 245, 0.58)",
                    }}
                  >
                    {option.label}
                  </div>
                  <p
                    style={{
                      margin: "0.55rem 0 0",
                      fontSize: "0.94rem",
                      lineHeight: 1.55,
                      color: "rgba(245, 245, 245, 0.88)",
                    }}
                  >
                    {option.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="auth-form-column" style={formColumnStyle}>
          <div style={formFrameStyle}>{children}</div>
        </section>
      </main>
      <style jsx>{`
        @media (max-width: 960px) {
          .auth-shell {
            grid-template-columns: 1fr !important;
          }

          .auth-hero {
            min-height: auto;
          }
        }

        @media (max-width: 720px) {
          .auth-hero {
            padding-bottom: 0 !important;
          }

          .auth-form-column {
            padding-top: 0 !important;
          }

          .auth-metrics {
            margin-top: 1.5rem;
          }
        }

        @media (max-width: 560px) {
          .auth-hero {
            padding: 1rem 1rem 0.5rem !important;
          }

          .auth-metrics {
            display: none !important;
          }

          .auth-form-column {
            padding: 0 1rem 1rem !important;
          }

          :global(.auth-actions) {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </AuthProvider>
  );
}
