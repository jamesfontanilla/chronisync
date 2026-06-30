"use client";

import Link from "next/link";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { PatientCard } from "@/components/dashboard/PatientCard";
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

export default function PhysicianPatientsPage() {
  const { data } = usePhysicianWorkspaceQuery();
  const workspace = data ?? buildPhysicianDemoWorkspaceSnapshot();

  const patientsWithAlerts = workspace.patientCards.filter(
    (card) => card.summary.activeAlertCount > 0
  ).length;

  const totalMedicationCount = workspace.patientCards.reduce(
    (total, card) => total + card.summary.activeMedicationCount,
    0
  );

  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Physician workspace"
        title="Patients"
        description="Review each assigned patient, their latest readings, and the number of active alerts at a glance."
        meta={<span>Updated {formatDateTime(workspace.generatedAt)}</span>}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={ROUTES.PHYSICIAN.DASHBOARD}>Dashboard</Link>
            </Button>
            <Button asChild variant="glass">
              <Link href={ROUTES.PHYSICIAN.ALERTS}>Alerts</Link>
            </Button>
          </>
        }
        level={1}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">
              {workspace.patientCards.length}
            </CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">
              assigned patients
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">{patientsWithAlerts}</CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">
              patients with active alerts
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">{totalMedicationCount}</CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">
              active medications
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">{workspace.documents.length}</CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">
              documents queued for review
            </p>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4">
        {workspace.patientCards.length > 0 ? (
          workspace.patientCards.map(({ patient, summary }) => (
            <PatientCard key={patient.id} patient={patient} summary={summary} />
          ))
        ) : (
          <EmptyState
            title="No assigned patients yet."
            description="The panel will appear here once patients are linked to the physician workspace."
          />
        )}
      </section>

      <Card>
        <CardHeader className="gap-2">
          <CardTitle>Panel notes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {workspace.patientCards.length} total patients
            </Badge>
            <Badge variant="secondary">
              {patientsWithAlerts} need follow-up
            </Badge>
          </div>
          <p>
            Patients with the highest number of alerts should be reviewed first.
          </p>
          <p>
            Live queries automatically fall back to the seeded demo workspace if
            the backend is unavailable.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
