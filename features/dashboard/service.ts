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

export const defaultDashboardSnapshot: DashboardSnapshot = buildDashboardSnapshot({
  metrics: [
    {
      label: "Open records",
      value: "18",
      detail: "Active medication, symptom, and vital logs",
      change: "+3 this week",
      direction: "up",
    },
    {
      label: "Unread alerts",
      value: "4",
      detail: "Needs physician review",
      change: "-2 from yesterday",
      direction: "down",
    },
    {
      label: "Stable vitals",
      value: "87%",
      detail: "Most recent trend window",
      change: "+6%",
      direction: "up",
    },
    {
      label: "Pending uploads",
      value: "2",
      detail: "Documents waiting for review",
      change: "No change",
      direction: "steady",
    },
  ],
  trends: [
    {
      title: "Blood pressure",
      description: "Last seven readings",
      color: "#0b6574",
      points: [
        { label: "Mon", value: 128 },
        { label: "Tue", value: 126 },
        { label: "Wed", value: 123 },
        { label: "Thu", value: 127 },
        { label: "Fri", value: 124 },
        { label: "Sat", value: 122 },
        { label: "Sun", value: 121 },
      ],
    },
    {
      title: "Glucose",
      description: "Fasting readings",
      color: "#19a39a",
      points: [
        { label: "Mon", value: 110 },
        { label: "Tue", value: 108 },
        { label: "Wed", value: 112 },
        { label: "Thu", value: 109 },
        { label: "Fri", value: 106 },
        { label: "Sat", value: 105 },
        { label: "Sun", value: 103 },
      ],
    },
  ],
});
