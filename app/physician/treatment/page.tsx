"use client";

import Link from "next/link";
import { ClipboardCheck, Pill, ShieldCheck, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/config/route";
import { summarizeAlerts } from "@/features/alerts/service";
import { usePhysicianWorkspaceQuery } from "@/features/physician/hooks";
import { buildPhysicianDemoWorkspaceSnapshot } from "@/features/physician/service";
import { formatDateTime, humanize } from "@/lib/utils";

const planIcons = [ClipboardCheck, Pill, ShieldCheck, Sparkles] as const;

export default function PhysicianTreatmentPage() {
  const { data } = usePhysicianWorkspaceQuery();
  const workspace = data ?? buildPhysicianDemoWorkspaceSnapshot();
  const alertSummary = summarizeAlerts(workspace.alerts);
  const openAlerts = workspace.alerts.filter(
    (alert) => alert.status === "open" || alert.status === "acknowledged"
  );
  const priorityPatients = workspace.patientCards.slice(0, 2);

  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Physician workspace"
        title="Treatment"
        description="Convert active alerts, medication totals, and summary drafts into the next care plan."
        meta={<span>Updated {formatDateTime(workspace.generatedAt)}</span>}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={ROUTES.PHYSICIAN.DASHBOARD}>Dashboard</Link>
            </Button>
            <Button asChild variant="glass">
              <Link href={ROUTES.PHYSICIAN.SUMMARIES}>Summaries</Link>
            </Button>
          </>
        }
        level={1}
      />

      <section className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: "Open alerts",
            value: String(openAlerts.length),
            detail: "Clinical items waiting for review",
          },
          {
            label: "Priority patients",
            value: String(priorityPatients.length),
            detail: "Patients surfaced at the top of the plan",
          },
          {
            label: "Active medications",
            value: String(
              workspace.patientCards.reduce(
                (total, card) => total + card.summary.activeMedicationCount,
                0
              )
            ),
            detail: "Current medication load across the panel",
          },
          {
            label: "Published summaries",
            value: String(
              workspace.summaries.filter((summary) => summary.status === "published").length
            ),
            detail: "Completed summaries ready for the record",
          },
        ].map((item, index) => {
          const Icon = planIcons[index % planIcons.length]!;

          return (
            <Card key={item.label}>
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">{item.label}</CardTitle>
                  <span className="inline-grid h-11 w-11 place-items-center rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]">
                    <Icon size={18} />
                  </span>
                </div>
                <div className="text-3xl font-semibold">{item.value}</div>
              </CardHeader>
              <CardContent className="pt-0 text-sm leading-6 text-[color:var(--ui-muted)]">
                {item.detail}
              </CardContent>
          </Card>
        );
      })}
      </section>

      <Card>
        <CardHeader className="gap-2">
          <CardTitle>Alert families</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {alertSummary.guideline} guideline alerts
          </Badge>
          <Badge variant="destructive">
            {alertSummary.interaction} interaction flags
          </Badge>
          <Badge variant="outline">
            {alertSummary.manual} manual alerts
          </Badge>
          <Badge variant="outline">
            {alertSummary.system} system alerts
          </Badge>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <Card>
          <CardHeader className="gap-2">
            <CardTitle>Treatment priorities</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {priorityPatients.length > 0 ? (
              priorityPatients.map(({ patient, summary }) => (
                <div
                  key={patient.id}
                  className="grid gap-3 rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{patient.fullName}</Badge>
                    <Badge variant="glass">
                      {summary.activeAlertCount} active alerts
                    </Badge>
                    <Badge variant="outline">
                      {summary.activeMedicationCount} medications
                    </Badge>
                  </div>
                  <p className="m-0 text-sm leading-7 text-[color:var(--ui-muted)]">
                    {patient.fullName} is currently anchored by a latest reading
                    of {summary.latestBloodPressure ?? "N/A"} and a glucose
                    trend of {summary.latestBloodGlucose ?? "N/A"}.
                  </p>
                  <div className="text-sm leading-7 text-[color:var(--ui-muted)]">
                    Next action: review the blood pressure trend, confirm dosing,
                    and update the care note.
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No patients to prioritize."
                description="As patients are linked to the physician workspace, their treatment items will appear here."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-2">
            <CardTitle>Open alert focus</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {openAlerts.length > 0 ? (
              openAlerts.slice(0, 2).map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))
            ) : (
              <EmptyState
                title="No open alerts."
                description="Once clinical signals appear, the treatment page will turn them into action items."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="gap-2">
          <CardTitle>Workflow notes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
          <p>
            The treatment workspace is designed to keep the next action clear
            without hiding the underlying clinical context.
          </p>
          <p>
            Summary status values such as {humanize("pending_review")} and
            {humanize("draft")} should be resolved before publishing updates.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
