import type { Alert } from "@/types/alert";
import type { Document as PatientDocument } from "@/types/document";
import type { Vital } from "@/types/vital";

export type TrendDirection = "up" | "down" | "steady";

export interface DashboardMetric {
  label: string;
  value: string;
  detail?: string;
  change?: string;
  direction?: TrendDirection;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface DashboardTrendSeries {
  title: string;
  description?: string;
  points: TrendPoint[];
  color?: string;
}

export interface DashboardSnapshot {
  metrics: DashboardMetric[];
  trends: DashboardTrendSeries[];
  generatedAt: Date;
}

export interface DashboardSnapshotInput {
  metrics?: DashboardMetric[];
  trends?: DashboardTrendSeries[];
  generatedAt?: Date | string;
}

export interface PatientDashboardSnapshotInput {
  alerts?: Alert[];
  documents?: PatientDocument[];
  vitals?: Vital[];
}

export function buildDashboardSnapshot(
  input: DashboardSnapshotInput = {}
): DashboardSnapshot {
  return {
    metrics: input.metrics ?? [],
    trends: input.trends ?? [],
    generatedAt:
      input.generatedAt instanceof Date
        ? input.generatedAt
        : input.generatedAt
          ? new Date(input.generatedAt)
          : new Date(),
  };
}

function isVitalStable(vital: Vital): boolean {
  switch (vital.type) {
    case "blood_pressure":
      return vital.systolic <= 140 && vital.diastolic <= 90;
    case "blood_glucose":
      return vital.value <= 180;
    case "heart_rate":
      return vital.value <= 100;
    case "oxygen_saturation":
      return vital.value >= 95;
    case "temperature":
      return vital.value >= 97 && vital.value <= 99;
    case "weight":
      return vital.value > 0;
    default:
      return true;
  }
}

export function buildPatientDashboardSnapshot(
  input: PatientDashboardSnapshotInput = {}
): DashboardSnapshot {
  const alerts = input.alerts ?? [];
  const documents = input.documents ?? [];
  const vitals = input.vitals ?? [];

  const openAlerts = alerts.filter(
    (alert) => alert.status === "open" || alert.status === "acknowledged"
  ).length;
  const pendingUploads = documents.filter((document) =>
    ["pending", "processing", "review_required"].includes(document.status)
  ).length;
  const stableVitals = vitals.filter(isVitalStable).length;

  return buildDashboardSnapshot({
    metrics: [
      {
        label: "Open records",
        value: String(openAlerts + pendingUploads),
        detail: "Active items that need attention",
        direction: openAlerts + pendingUploads > 0 ? "up" : "steady",
      },
      {
        label: "Unread alerts",
        value: String(openAlerts),
        detail: "Alerts still waiting for review",
        direction: openAlerts > 0 ? "down" : "steady",
      },
      {
        label: "Stable vitals",
        value: String(stableVitals),
        detail: "Recent vitals in a healthy range",
        direction: stableVitals > 0 ? "up" : "steady",
      },
      {
        label: "Pending uploads",
        value: String(pendingUploads),
        detail: "Documents waiting for review",
        direction: pendingUploads > 0 ? "steady" : "up",
      },
    ],
    trends: [],
    generatedAt: new Date(),
  });
}

export const defaultDashboardSnapshot: DashboardSnapshot = buildPatientDashboardSnapshot();
