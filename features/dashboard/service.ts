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
    trends: [
      {
        title: "Blood pressure",
        description: "Recent home and clinic readings",
        color: "#0b6574",
        points: [
          { label: "Mon", value: 148 },
          { label: "Tue", value: 142 },
          { label: "Wed", value: 138 },
          { label: "Thu", value: 140 },
          { label: "Fri", value: 136 },
          { label: "Sat", value: 134 },
          { label: "Sun", value: 132 },
        ],
      },
      {
        title: "Glucose",
        description: "Fasting trend snapshot",
        color: "#19a39a",
        points: [
          { label: "Mon", value: 158 },
          { label: "Tue", value: 150 },
          { label: "Wed", value: 144 },
          { label: "Thu", value: 139 },
          { label: "Fri", value: 136 },
          { label: "Sat", value: 132 },
          { label: "Sun", value: 128 },
        ],
      },
    ],
    generatedAt: new Date(),
  });
}

export const defaultDashboardSnapshot: DashboardSnapshot = buildPatientDashboardSnapshot({
  alerts: [
    {
      id: "alert-1",
      patientId: "patient-1",
      physicianId: "physician-1",
      title: "High Blood Pressure",
      message: "Blood pressure is elevated.",
      level: "warning",
      status: "open",
      source: "demo",
      ruleId: "bp.high",
      metric: "blood_pressure",
      threshold: "140/90",
      actualValue: "148/92",
      metadata: { alertFamily: "guideline", isDemo: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],
  vitals: [
    {
      id: "vital-1",
      patientId: "patient-1",
      type: "blood_pressure",
      systolic: 130,
      diastolic: 80,
      unit: "mmHg",
      recordedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      source: "manual"
    },
    {
      id: "vital-2",
      patientId: "patient-1",
      type: "blood_pressure",
      systolic: 135,
      diastolic: 85,
      unit: "mmHg",
      recordedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      source: "manual"
    }
  ],
  documents: [
    {
      id: "doc-1",
      patientId: "patient-1",
      title: "Lab Results",
      fileName: "labs.pdf",
      filePath: "labs.pdf",
      contentType: "application/pdf",
      sizeBytes: 1024,
      category: "lab_result",
      status: "review_required",
      source: "patient_upload",
      uploadedBy: "patient-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]
});
