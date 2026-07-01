"use client";

import type { ReactNode } from "react";

import { APP_CONFIG } from "@/config/app";
import { AuthProvider } from "@/providers/AuthProvider";
import { AUTH_ROLE_OPTIONS } from "@/lib/auth/roles";

const shellStyle = {
  minHeight: "100dvh",
  display: "grid",
  gridTemplateColumns: "var(--auth-shell-columns)",
  gap: "var(--auth-shell-gap)",
  background:
    "radial-gradient(circle at top left, rgba(15, 118, 110, 0.32), transparent 36%), radial-gradient(circle at bottom right, rgba(234, 179, 8, 0.18), transparent 32%), linear-gradient(135deg, #051419 0%, #0a2230 52%, #f5efe5 52%, #f8f4ec 100%)",
  color: "#e6f6f7",
} as const;

const heroStyle = {
  position: "relative",
  overflow: "hidden",
  padding: "var(--auth-hero-padding)",
  display: "flex",
  alignItems: "stretch",
} as const;

const heroCardStyle = {
  position: "relative",
  zIndex: 1,
  width: "100%",
  borderRadius: "32px",
  padding: "clamp(1.5rem, 4vw, 3rem)",
  background: "rgba(4, 15, 20, 0.62)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: "0 30px 80px rgba(2, 9, 13, 0.35)",
  backdropFilter: "blur(16px)",
} as const;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.28em",
  fontSize: "0.72rem",
  color: "#78d6d0",
} as const;

const titleStyle = {
  margin: "0.75rem 0 0",
  fontSize: "clamp(1.95rem, 5vw, 4.8rem)",
  lineHeight: 0.95,
  letterSpacing: "-0.05em",
  color: "#f6fbfb",
} as const;

const bodyStyle = {
  margin: "1.25rem 0 0",
  maxWidth: "42rem",
  fontSize: "1.02rem",
  lineHeight: 1.7,
  color: "rgba(230, 246, 247, 0.82)",
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
  background:
    "linear-gradient(180deg, rgba(248, 244, 236, 0.92), rgba(245, 239, 229, 0.98))",
  color: "#08232b",
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
  color: "rgba(230, 246, 247, 0.82)",
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
                  background: "#7ce7db",
                  boxShadow: "0 0 0 6px rgba(124, 231, 219, 0.14)",
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
                      color: "rgba(230, 246, 247, 0.58)",
                    }}
                  >
                    {option.label}
                  </div>
                  <p
                    style={{
                      margin: "0.55rem 0 0",
                      fontSize: "0.94rem",
                      lineHeight: 1.55,
                      color: "rgba(246, 251, 251, 0.88)",
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
          .auth-shell {
            background:
              radial-gradient(
                circle at top left,
                rgba(15, 118, 110, 0.26),
                transparent 42%
              ),
              linear-gradient(180deg, #051419 0%, #0a2230 42%, #f8f4ec 42%, #f8f4ec 100%);
          }

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
