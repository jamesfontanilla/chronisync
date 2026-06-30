import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDateTime, getInitials, humanize } from "@/lib/utils";
import type { Patient, PatientSummary } from "@/types/patient";

export interface PatientCardProps {
  patient: Patient;
  summary?: PatientSummary;
  actions?: ReactNode;
  className?: string;
}

function statValue(value: string | number | undefined, fallback = "N/A"): string {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value);
}

export function PatientCard({
  patient,
  summary,
  actions,
  className,
}: PatientCardProps) {
  const latestUpdated = summary?.lastUpdated ?? patient.updatedAt;

  return (
    <Card className={className}>
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={patient.photoURL} alt={patient.fullName} />
            <AvatarFallback>{getInitials(patient.fullName)}</AvatarFallback>
          </Avatar>

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl">{patient.fullName}</CardTitle>
              <Badge variant="secondary">{humanize(patient.status)}</Badge>
              {patient.emailVerified ? (
                <Badge variant="glass">Verified</Badge>
              ) : (
                <Badge variant="outline">Unverified</Badge>
              )}
            </div>
            <CardDescription>{patient.email}</CardDescription>
            {patient.physicianId ? (
              <p className="m-0 text-sm text-[color:var(--ui-muted)]">
                Assigned physician: {patient.physicianId}
              </p>
            ) : null}
          </div>
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
              Blood pressure
            </div>
            <div className="mt-2 text-lg font-semibold">
              {statValue(summary?.latestBloodPressure)}
            </div>
          </div>
          <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
              Heart rate
            </div>
            <div className="mt-2 text-lg font-semibold">
              {statValue(summary?.latestHeartRate)}
            </div>
          </div>
          <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
              Glucose
            </div>
            <div className="mt-2 text-lg font-semibold">
              {statValue(summary?.latestBloodGlucose)}
            </div>
          </div>
          <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
              Active alerts
            </div>
            <div className="mt-2 text-lg font-semibold">
              {statValue(summary?.activeAlertCount, "0")}
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
              Active medications
            </div>
            <div className="mt-2 text-lg font-semibold">
              {statValue(summary?.activeMedicationCount, "0")}
            </div>
          </div>
          <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
              Last updated
            </div>
            <div className="mt-2 text-sm font-medium">
              {formatDateTime(latestUpdated)}
            </div>
          </div>
          <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
              Conditions
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {patient.chronicConditions.length > 0 ? (
                patient.chronicConditions.slice(0, 2).map((condition) => (
                  <Badge key={condition.id} variant="outline">
                    {condition.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-[color:var(--ui-muted)]">
                  None listed
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
