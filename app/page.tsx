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
    </main>
  );
}
