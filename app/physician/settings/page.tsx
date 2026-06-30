"use client";

import Link from "next/link";
import { Settings2, ShieldCheck, BellRing, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/config/route";
import { usePhysicianWorkspaceQuery } from "@/features/physician/hooks";
import { buildPhysicianDemoWorkspaceSnapshot } from "@/features/physician/service";
import { formatDateTime } from "@/lib/utils";

const settingIcons = [Settings2, BellRing, ShieldCheck, Sparkles] as const;

export default function PhysicianSettingsPage() {
  const { data } = usePhysicianWorkspaceQuery();
  const workspace = data ?? buildPhysicianDemoWorkspaceSnapshot();

  const activePatients = workspace.patientCards.length;
  const openAlerts = workspace.alerts.filter(
    (alert) => alert.status === "open" || alert.status === "acknowledged"
  ).length;

  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Physician workspace"
        title="Settings"
        description="Keep the physician portal aligned with the current panel, notification style, and review workflow."
        meta={<span>Updated {formatDateTime(workspace.generatedAt)}</span>}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={ROUTES.PHYSICIAN.DASHBOARD}>Dashboard</Link>
            </Button>
            <Button asChild variant="glass">
              <Link href={ROUTES.PHYSICIAN.PATIENTS}>Patients</Link>
            </Button>
          </>
        }
        level={1}
      />

      <section className="grid gap-4 md:grid-cols-4">
        {[
          {
            title: "Review cadence",
            detail: "Manual approval before publishing summaries.",
          },
          {
            title: "Notification routing",
            detail: `${openAlerts} active alerts are routed to the dashboard first.`,
          },
          {
            title: "Panel size",
            detail: `${activePatients} assigned patients in the current workspace.`,
          },
          {
            title: "AI support",
            detail: "Draft only - no automatic publishing.",
          },
        ].map((item, index) => {
          const Icon = settingIcons[index % settingIcons.length]!;

          return (
            <Card key={item.title}>
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <span className="inline-grid h-11 w-11 place-items-center rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]">
                    <Icon size={18} />
                  </span>
                </div>
                <div className="text-sm leading-6 text-[color:var(--ui-muted)]">
                  {item.detail}
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="gap-2">
            <CardTitle>Workspace preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">English</Badge>
              <Badge variant="glass">Asia/Manila</Badge>
              <Badge variant="outline">Glassmorphism UI</Badge>
            </div>
            <p>
              These defaults keep the physician view aligned with the same
              premium shell used across the rest of the app.
            </p>
            <p>
              In a connected deployment, this is where notification channels,
              report preferences, and review thresholds would be edited.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-2">
            <CardTitle>Governance notes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
            <p>
              Alerts and summaries should remain physician-reviewed before
              anything reaches a patient-facing route.
            </p>
            <p>
              The dashboard and patient panels are intentionally read-friendly so
              the next action stays obvious.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
