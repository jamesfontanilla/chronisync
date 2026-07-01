"use client";

import Link from "next/link";
import {
  ArrowRight,
  HeartPulse,
  KeyRound,
  LogIn,
  Sparkles,
  Stethoscope,
  UserPlus,
  ShieldCheck,
  Workflow,
  Activity,
} from "lucide-react";

import { APP_CONFIG } from "@/config/app";
import { ROUTES } from "@/config/route";
import { AUTH_ROLE_OPTIONS } from "@/lib/auth/roles";
import { Footer } from "@/components/common/Footer";
import { Navbar } from "@/components/common/Navbar";
import { PageHeader } from "@/components/common/PageHeader";
import { Sidebar } from "@/components/common/Sidebar";
import { EmptyState } from "@/components/common/EmptyState";

const heroStats = [
  {
    value: "2",
    label: "Role entry points",
    description: "Patient and physician portals share the same visual language.",
    icon: UserPlus,
  },
  {
    value: "1",
    label: "Shared record",
    description: "All routes point back to one care history.",
    icon: HeartPulse,
  },
  {
    value: "0",
    label: "Black-box clinical AI",
    description: "The shell stays clear about what AI can and cannot do.",
    icon: ShieldCheck,
  },
] as const;

const portalSections = [
  {
    title: "Start here",
    items: [
      {
        label: "Sign in",
        href: ROUTES.AUTH.LOGIN,
        description: "Return to your saved role and continue.",
        icon: LogIn,
      },
      {
        label: "Create account",
        href: ROUTES.AUTH.REGISTER,
        description: "Set up a patient or physician profile.",
        icon: UserPlus,
      },
      {
        label: "Reset password",
        href: ROUTES.AUTH.FORGOT_PASSWORD,
        description: "Recover access without leaving the flow.",
        icon: KeyRound,
      },
    ],
  },
  {
    title: "Care model",
    items: AUTH_ROLE_OPTIONS.map((option) => ({
      label: option.label,
      href: ROUTES.AUTH.REGISTER,
      description: option.description,
      icon: option.value === "patient" ? HeartPulse : Stethoscope,
    })),
  },
] as const;

const featureCards = [
  {
    title: "Glassmorphism with restraint",
    description:
      "Soft translucency, layered gradients, and strong contrast keep the interface premium without burying the content.",
    icon: Sparkles,
  },
  {
    title: "Workflow-first navigation",
    description:
      "The shell keeps the public routes obvious so people can move into the right role without hunting for it.",
    icon: Workflow,
  },
  {
    title: "Readable on every screen",
    description:
      "The layout collapses cleanly on narrow widths while preserving the same visual hierarchy.",
    icon: Activity,
  },
] as const;

export default function HomePage() {
  return (
    <main className="home-page">
      <Navbar />

      <div className="home-page__content">
        <section className="home-hero" id="overview">
          <div className="home-hero__panel">
            <PageHeader
              eyebrow="Global UI: Glassmorphism"
              title="A softer shell for shared chronic care."
              description={
                <>
                  {APP_CONFIG.description} The app shell stays calm, readable,
                  and role-aware so patients and physicians can move with less
                  friction.
                </>
              }
              meta={<span>ChroniSync v{APP_CONFIG.version}</span>}
              actions={
                <div className="home-hero__actions">
                  <Link href={ROUTES.AUTH.LOGIN} className="home-button home-button--primary">
                    Sign in
                    <ArrowRight size={16} />
                  </Link>
                  <Link href={ROUTES.AUTH.REGISTER} className="home-button home-button--secondary">
                    Create account
                  </Link>
                </div>
              }
              level={1}
            />

            <div className="home-stats" aria-label="Platform highlights">
              {heroStats.map((stat) => {
                const StatIcon = stat.icon;

                return (
                  <article key={stat.label} className="home-stat">
                    <div className="home-stat__top">
                      <span className="home-stat__icon">
                        <StatIcon size={18} />
                      </span>
                      <strong>{stat.value}</strong>
                    </div>
                    <h2>{stat.label}</h2>
                    <p>{stat.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="home-grid" id="portal-map">
          <Sidebar
            title="Portal map"
            description="Public entry points for the first visit, the return visit, and account recovery."
            sections={portalSections}
            footer={
              <p>
                Need help? Reach{" "}
                <a href={`mailto:${APP_CONFIG.supportEmail}`}>
                  {APP_CONFIG.supportEmail}
                </a>
                .
              </p>
            }
          />

          <div className="home-main">
            <div className="home-main__panel">
              <PageHeader
                eyebrow="Role preview"
                title="Two roles, one visual language."
                description="Patient and physician entry points share the same premium shell, but each portal keeps its own intent and tone."
                level={2}
              />

              <div className="role-grid" id="roles">
                {AUTH_ROLE_OPTIONS.map((option) => (
                  <article key={option.value} className="role-card">
                    <div className="role-card__eyebrow">Role entry point</div>
                    <h3>{option.label}</h3>
                    <p>{option.description}</p>
                    <div className="role-card__actions">
                      <Link
                        href={ROUTES.AUTH.LOGIN}
                        className="home-button home-button--secondary home-button--compact"
                      >
                        Sign in
                      </Link>
                      <Link
                        href={ROUTES.AUTH.REGISTER}
                        className="home-button home-button--primary home-button--compact"
                      >
                        Register
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="home-main__preview" id="preview">
              <EmptyState
                icon={<ShieldCheck size={24} />}
                eyebrow="Workspace preview"
                title="No clinical workspace is open yet."
                description="Sign in or create an account to continue into the portal that matches your role. The glass shell stays light while the data loads behind it."
                primaryAction={
                  <Link href={ROUTES.AUTH.LOGIN} className="home-button home-button--primary">
                    Sign in
                    <ArrowRight size={16} />
                  </Link>
                }
                secondaryAction={
                  <Link href={ROUTES.AUTH.REGISTER} className="home-button home-button--secondary">
                    Create account
                  </Link>
                }
              />
            </div>
          </div>
        </section>

        <section className="home-features" id="security">
          <PageHeader
            eyebrow="Shell notes"
            title="The global UI keeps the important things clear."
            description="These cards are meant to demonstrate the visual language that will carry through the rest of the product."
            level={2}
          />

          <div className="feature-grid">
            {featureCards.map((feature) => {
              const FeatureIcon = feature.icon;

              return (
                <article key={feature.title} className="feature-card">
                  <span className="feature-card__icon">
                    <FeatureIcon size={18} />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <Footer />
      </div>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
          padding-bottom: 1.5rem;
        }

        .home-page__content {
          width: min(1240px, calc(100% - 2rem));
          margin: 1rem auto 0;
          display: grid;
          gap: 1.5rem;
        }

        .home-hero__panel,
        .home-main__panel,
        .home-main__preview,
        .home-features {
          border: 1px solid var(--ui-border);
          border-radius: var(--ui-radius-xl);
          background: var(--ui-surface);
          box-shadow: var(--ui-shadow);
          backdrop-filter: blur(20px);
        }

        .home-hero__panel,
        .home-main__panel,
        .home-main__preview,
        .home-features {
          padding: clamp(1.25rem, 3vw, 2rem);
        }

        .home-hero__panel {
          display: grid;
          gap: 1.5rem;
        }

        .home-hero__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .home-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 3rem;
          padding: 0 1rem;
          border-radius: 999px;
          font-weight: 700;
          transition:
            transform 180ms ease,
            background-color 180ms ease,
            border-color 180ms ease;
        }

        .home-button:hover {
          transform: translateY(-1px);
        }

        .home-button--primary {
          color: #f8f7f1;
          background: linear-gradient(135deg, var(--ui-accent), var(--ui-accent-strong));
          box-shadow: 0 16px 30px rgba(11, 76, 89, 0.2);
        }

        .home-button--secondary {
          color: var(--ui-accent);
          border: 1px solid var(--ui-border);
          background: rgba(255, 255, 255, 0.08);
        }

        .home-button--compact {
          min-height: 2.75rem;
        }

        .home-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }

        .home-stat {
          border-radius: var(--ui-radius-lg);
          border: 1px solid var(--ui-border);
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
        }

        .home-stat__top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .home-stat__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.4rem;
          height: 2.4rem;
          border-radius: 999px;
          background: var(--ui-accent-soft);
          color: var(--ui-accent);
        }

        .home-stat strong {
          font-size: 2rem;
          line-height: 1;
          letter-spacing: -0.05em;
          font-family: var(--font-display);
        }

        .home-stat h2 {
          margin: 1rem 0 0;
          font-size: 1rem;
          line-height: 1.3;
        }

        .home-stat p {
          margin: 0.45rem 0 0;
          color: var(--ui-muted);
          line-height: 1.6;
        }

        .home-grid {
          display: grid;
          grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
          gap: 1.25rem;
          align-items: start;
        }

        .home-main {
          display: grid;
          gap: 1.25rem;
        }

        .home-main__preview {
          padding: clamp(0.5rem, 1vw, 1rem);
        }

        .role-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .role-card {
          border-radius: var(--ui-radius-lg);
          border: 1px solid var(--ui-border);
          background: rgba(255, 255, 255, 0.08);
          padding: 1rem;
        }

        .role-card__eyebrow {
          font-size: 0.78rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--ui-accent);
        }

        .role-card h3 {
          margin: 0.75rem 0 0;
          font-size: 1.25rem;
          letter-spacing: -0.03em;
          font-family: var(--font-display);
        }

        .role-card p {
          margin: 0.6rem 0 0;
          color: var(--ui-muted);
          line-height: 1.7;
        }

        .role-card__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-top: 1rem;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
          margin-top: 1.25rem;
        }

        .feature-card {
          border-radius: var(--ui-radius-lg);
          border: 1px solid var(--ui-border);
          background: rgba(255, 255, 255, 0.08);
          padding: 1rem;
        }

        .feature-card__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 999px;
          background: var(--ui-accent-soft);
          color: var(--ui-accent);
        }

        .feature-card h3 {
          margin: 1rem 0 0;
          font-size: 1.05rem;
          font-family: var(--font-display);
        }

        .feature-card p {
          margin: 0.55rem 0 0;
          color: var(--ui-muted);
          line-height: 1.7;
        }

        @media (max-width: 1120px) {
          .home-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .home-stats,
          .feature-grid {
            grid-template-columns: 1fr;
          }

          .role-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .home-page__content {
            width: min(1240px, calc(100% - 1rem));
          }

          .home-hero__panel,
          .home-main__panel,
          .home-main__preview,
          .home-features {
            padding: 1rem;
          }
        }
      `}</style>
    </main>
  );
}
