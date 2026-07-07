"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bean,
  Droplet,
  Eye,
  FileCheck,
  Gauge,
  Lock,
  ShieldCheck,
  Stethoscope,
  WifiOff,
  Wind,
} from "lucide-react";

import { APP_CONFIG } from "@/config/app";
import { ROUTES } from "@/config/route";
import { AUTH_ROLE_OPTIONS } from "@/lib/auth/roles";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/common/Footer";
import { Navbar } from "@/components/common/Navbar";
import { PageHeader } from "@/components/common/PageHeader";
import { Sidebar } from "@/components/common/Sidebar";

const heroStats = [
  {
    value: "4",
    label: "Conditions covered",
    description:
      "Type 2 diabetes, hypertension, CKD, and COPD, each mapped to its own clinical guideline.",
    icon: Stethoscope,
  },
  {
    value: "Grounded",
    label: "How AI answers are built",
    description:
      "Summaries and alerts are constrained to retrieved guideline sections and the patient's own recent history.",
    icon: ShieldCheck,
  },
  {
    value: "Offline-ready",
    label: "Built for real connectivity",
    description:
      "Structured logging, dashboards, and guideline-threshold alerts all work without a connection.",
    icon: WifiOff,
  },
] as const;

const conditions = [
  {
    label: "Type 2 diabetes",
    guideline: "ADA Standards of Care",
    focus:
      "Time in range, time below range, GMI, and before/after-meal trends.",
    icon: Droplet,
  },
  {
    label: "Hypertension",
    guideline: "AHA / ACC Blood Pressure Guideline",
    focus:
      "Rolling blood pressure averages, repeated elevated readings, and weight/lifestyle trends.",
    icon: Gauge,
  },
  {
    label: "Chronic kidney disease",
    guideline: "KDIGO",
    focus: "Blood pressure control, weight swings, and medication adherence.",
    icon: Bean,
  },
  {
    label: "COPD",
    guideline: "GOLD",
    focus:
      "Oxygen saturation, rescue medication adherence, and exertional symptom trends.",
    icon: Wind,
  },
] as const;

const pipelineSteps = [
  {
    step: "1",
    title: "Capture",
    description:
      "Patients log vitals, medications, symptoms, and journal entries as they happen.",
  },
  {
    step: "2",
    title: "Route",
    description:
      "Each entry is matched to the patient's diagnosed condition and its clinical knowledge pack.",
  },
  {
    step: "3",
    title: "Retrieve",
    description:
      "The relevant guideline sections and the patient's recent history are pulled together.",
  },
  {
    step: "4",
    title: "Generate",
    description:
      "The AI output is constrained to what was retrieved, not left to open-ended reasoning.",
  },
] as const;

const offlineCapable = [
  "Structured logging - glucose, blood pressure, weight, and medications",
  "Diary entries, including voice-to-text",
  "Dashboards and trend graphs built from local data",
  "Guideline-threshold alerts, checked on-device",
] as const;

const needsConnection = [
  "AI consultation summaries and plain-language trend explanations",
  "Food-photo meal analysis",
  "Doctor-dashboard sync",
] as const;

const trustHighlights = [
  {
    title: "Governed by RA 10173",
    description:
      "The Philippine Data Privacy Act of 2012, enforced by the National Privacy Commission - not HIPAA. Health data is Sensitive Personal Information, and processing requires explicit, purpose-specific consent.",
    icon: Lock,
  },
  {
    title: "Patient rights, by design",
    description:
      "Every patient can expect to be informed, to access their own data, to correct it, and to request its erasure.",
    icon: FileCheck,
  },
  {
    title: "Every AI summary says what it is",
    description:
      "AI-generated content carries a persistent label - review source data before clinical decisions - so it's never mistaken for a clinician's word.",
    icon: Eye,
  },
] as const;

const sidebarSections = [
  {
    title: "Explore",
    items: [
      {
        label: "Four conditions",
        href: "#conditions",
        description: "See how each condition maps to its own clinical guideline.",
        icon: Stethoscope,
      },
      {
        label: "How the AI stays grounded",
        href: "#how-it-works",
        description: "The retrieval pipeline behind every summary and alert.",
        icon: ShieldCheck,
      },
      {
        label: "Offline-first, honestly",
        href: "#offline",
        description: "What works without a connection, and what doesn't.",
        icon: WifiOff,
      },
      {
        label: "Trust & compliance",
        href: "#trust",
        description: "How patient data is governed and protected.",
        icon: Lock,
      },
    ],
  },
  {
    title: "What stays true",
    items: [
      {
        label: "A clinician stays in the loop",
        href: "#trust",
        description:
          "AI surfaces patterns for review - never a diagnosis or treatment recommendation.",
        icon: Stethoscope,
      },
      {
        label: "Every AI summary is labeled",
        href: "#how-it-works",
        description:
          "\"AI-generated summary - review source data before clinical decisions.\"",
        icon: Eye,
      },
      {
        label: "Governed by RA 10173",
        href: "#trust",
        description:
          "Health data is Sensitive Personal Information under the Philippine Data Privacy Act.",
        icon: Lock,
      },
    ],
  },
] as const;

const homeNavLinks = [
  { label: "Overview", href: "#overview" },
  { label: "Conditions", href: "#conditions" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Trust", href: "#trust" },
] as const;

const homeFooterLinks = [
  { label: "Home", href: ROUTES.HOME },
  { label: "Sign in", href: ROUTES.AUTH.LOGIN },
  { label: "Create account", href: ROUTES.AUTH.REGISTER },
] as const;

export default function HomePage() {
  return (
    <main className="home-page">
      <Navbar links={homeNavLinks} />

      <div className="home-page__content">
        <section className="home-hero" id="overview">
          <div className="home-hero__panel">
            <PageHeader
              eyebrow="Guideline-grounded chronic care"
              title="Chronic care data your care team can actually trust."
              description={
                <>
                  {APP_CONFIG.description} Every AI output is grounded in a
                  retrieved, disease-specific knowledge pack - not the
                  model&rsquo;s open-ended reasoning - so summaries, trends,
                  and alerts stay transparent and clinician-reviewable.
                </>
              }
              meta={<span>ChroniSync v{APP_CONFIG.version} · Built for SparkFest 2026</span>}
              actions={
                <div className="home-hero__actions">
                  <Link href={ROUTES.AUTH.REGISTER} className="home-button home-button--primary">
                    Create account
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="#roles" className="home-button home-button--secondary">
                    See patient &amp; physician portals
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
                    <p className="home-stat__label">{stat.label}</p>
                    <p className="home-stat__description">{stat.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="home-conditions" id="conditions">
          <PageHeader
            eyebrow="Four conditions, one shared record"
            title="One record, four disease-specific lenses."
            description="Each condition routes to its own clinical knowledge pack, so the same pipeline stays grounded in the guideline that actually applies."
            level={2}
          />

          <div className="tile-grid">
            {conditions.map((condition) => {
              const ConditionIcon = condition.icon;

              return (
                <article key={condition.label} className="tile-card">
                  <span className="tile-card__icon">
                    <ConditionIcon size={18} />
                  </span>
                  <h3>{condition.label}</h3>
                  <Badge variant="outline" className="tile-card__badge">
                    {condition.guideline}
                  </Badge>
                  <p>{condition.focus}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="home-grid">
          <Sidebar
            title="On this page"
            description="A quick map of what ChroniSync actually does, and what it deliberately won't do."
            sections={sidebarSections}
          />

          <div className="home-main">
            <div className="home-main__panel" id="how-it-works">
              <PageHeader
                eyebrow="How it works"
                title="Grounded outputs, not open-ended reasoning."
                level={2}
              />

              <div className="pipeline-steps">
                {pipelineSteps.map((step) => (
                  <article key={step.step} className="pipeline-step">
                    <span className="pipeline-step__index">{step.step}</span>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </article>
                ))}
              </div>

              <p className="home-main__note">
                That pipeline feeds four surfaces: a patient summary, a doctor
                consultation summary, a plain-language trend explanation, and
                a guideline-grounded alert - each one compared directly
                against the disease&rsquo;s knowledge pack, not left to the
                model&rsquo;s judgment.
              </p>

              <div className="ai-disclaimer">
                <span className="ai-disclaimer__icon" aria-hidden="true">
                  <Eye size={18} />
                </span>
                <div>
                  <strong>
                    &ldquo;AI-generated summary - review source data before
                    clinical decisions.&rdquo;
                  </strong>
                  <p>
                    ChroniSync surfaces patterns for review, not diagnoses or
                    treatment recommendations. A clinician stays in the loop
                    for every clinically meaningful decision.
                  </p>
                </div>
              </div>
            </div>

            <div className="home-main__panel" id="offline">
              <PageHeader
                eyebrow="Offline-first"
                title="Logging always works. AI generation says so when it can't."
                level={2}
              />

              <div className="connectivity-grid">
                <article className="connectivity-card connectivity-card--offline">
                  <h3>Works without a connection</h3>
                  <ul>
                    {offlineCapable.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>

                <article className="connectivity-card">
                  <h3>Needs a connection</h3>
                  <ul>
                    {needsConnection.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              </div>

              <p className="home-main__note">
                Food-photo capture and full offline device sync are still in
                progress - this describes the architecture, not a finished
                feature you can try today.
              </p>
            </div>

            <div className="home-main__panel" id="roles">
              <PageHeader
                eyebrow="Two portals, one record"
                title="Built for patients and the physicians who follow them."
                description="Each portal keeps the same underlying record but its own intent: patients log and read plain-language explanations, physicians review consultation summaries and alerts."
                level={2}
              />

              <div className="role-grid">
                {AUTH_ROLE_OPTIONS.map((option) => (
                  <article key={option.value} className="role-card">
                    <div className="role-card__eyebrow">Role entry point</div>
                    <h3>{option.label}</h3>
                    <p>{option.description}</p>
                    <div className="role-card__actions">
                      <Link
                        href={`${ROUTES.AUTH.REGISTER}?role=${option.value}`}
                        className="home-button home-button--primary home-button--compact"
                      >
                        Create {option.label.toLowerCase()} account
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <p className="home-main__signin">
                Already using ChroniSync?{" "}
                <Link href={ROUTES.AUTH.LOGIN}>Sign in</Link>
              </p>
            </div>
          </div>
        </section>

        <section className="home-trust" id="trust">
          <PageHeader
            eyebrow="Trust & compliance"
            title="Data handling is a compliance question, not a design one."
            level={2}
          />

          <div className="tile-grid">
            {trustHighlights.map((highlight) => {
              const HighlightIcon = highlight.icon;

              return (
                <article key={highlight.title} className="tile-card">
                  <span className="tile-card__icon">
                    <HighlightIcon size={18} />
                  </span>
                  <h3>{highlight.title}</h3>
                  <p>{highlight.description}</p>
                </article>
              );
            })}
          </div>

          <p className="home-main__note">
            Caregiver access, consent and provenance detail views, and native
            device or CGM sync are on the roadmap and not yet available in
            this build.
          </p>
        </section>

        <Footer links={homeFooterLinks} />
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
        .home-conditions,
        .home-trust {
          border: 1px solid var(--ui-border);
          border-radius: var(--ui-radius-xl);
          background: var(--ui-surface);
          box-shadow: var(--ui-shadow);
          backdrop-filter: blur(20px);
        }

        .home-hero__panel,
        .home-main__panel,
        .home-conditions,
        .home-trust {
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
          color: #1a1a1a;
          background: linear-gradient(135deg, var(--ui-accent-fill), var(--ui-accent-fill-strong));
          box-shadow: 0 16px 30px rgba(0, 0, 0, 0.18);
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

        .home-stat__label {
          margin: 1rem 0 0;
          font-size: 1rem;
          line-height: 1.3;
          font-weight: 700;
        }

        .home-stat__description {
          margin: 0.45rem 0 0;
          color: var(--ui-muted);
          line-height: 1.6;
        }

        .tile-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-top: 1.25rem;
        }

        .tile-card {
          display: grid;
          gap: 0.6rem;
          align-content: start;
          border-radius: var(--ui-radius-lg);
          border: 1px solid var(--ui-border);
          background: rgba(255, 255, 255, 0.08);
          padding: 1rem;
        }

        .tile-card :global(.tile-card__badge) {
          justify-self: start;
        }

        .tile-card__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 999px;
          background: var(--ui-accent-soft);
          color: var(--ui-accent);
        }

        .tile-card h3 {
          margin: 0;
          font-size: 1.05rem;
          font-family: var(--font-display);
        }

        .tile-card > p {
          margin: 0;
          color: var(--ui-muted);
          line-height: 1.7;
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

        .home-main__note {
          margin: 1.25rem 0 0;
          color: var(--ui-muted);
          line-height: 1.7;
        }

        .home-main__signin {
          margin: 1.25rem 0 0;
          color: var(--ui-muted);
        }

        .home-main__signin a {
          color: var(--ui-accent);
          font-weight: 700;
        }

        .pipeline-steps {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
          margin-top: 1.25rem;
        }

        .pipeline-step {
          display: grid;
          gap: 0.5rem;
          align-content: start;
          border-radius: var(--ui-radius-lg);
          border: 1px solid var(--ui-border);
          background: rgba(255, 255, 255, 0.08);
          padding: 1rem;
        }

        .pipeline-step__index {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 999px;
          background: var(--ui-accent-soft);
          color: var(--ui-accent);
          font-weight: 700;
        }

        .pipeline-step h3 {
          margin: 0;
          font-size: 1rem;
          font-family: var(--font-display);
        }

        .pipeline-step p {
          margin: 0;
          color: var(--ui-muted);
          line-height: 1.6;
        }

        .ai-disclaimer {
          display: flex;
          gap: 0.85rem;
          align-items: flex-start;
          margin-top: 1.25rem;
          border-radius: var(--ui-radius-lg);
          border: 1px solid var(--ui-warning);
          background: var(--ui-warning-soft);
          padding: 1rem 1.25rem;
        }

        .ai-disclaimer__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.4rem;
          height: 2.4rem;
          border-radius: 999px;
          background: var(--ui-surface-strong);
          color: var(--ui-warning);
          flex: none;
        }

        .ai-disclaimer strong {
          display: block;
          line-height: 1.5;
        }

        .ai-disclaimer p {
          margin: 0.4rem 0 0;
          color: var(--ui-muted);
          line-height: 1.6;
        }

        .connectivity-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
          margin-top: 1.25rem;
        }

        .connectivity-card {
          border-radius: var(--ui-radius-lg);
          border: 1px solid var(--ui-border);
          background: rgba(255, 255, 255, 0.08);
          padding: 1rem;
        }

        .connectivity-card--offline {
          border-color: rgba(21, 128, 61, 0.28);
          background: var(--ui-accent-soft);
        }

        .connectivity-card h3 {
          margin: 0;
          font-size: 1rem;
          font-family: var(--font-display);
        }

        .connectivity-card ul {
          margin: 0.75rem 0 0;
          padding-left: 1.1rem;
          color: var(--ui-muted);
          line-height: 1.7;
        }

        .role-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
          margin-top: 1.25rem;
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

        @media (max-width: 1120px) {
          .home-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .home-stats,
          .pipeline-steps,
          .connectivity-grid {
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
          .home-conditions,
          .home-trust {
            padding: 1rem;
          }
        }
      `}</style>
    </main>
  );
}
