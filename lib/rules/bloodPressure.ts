/**
 * =============================================================================
 * ChroniSync
 * Blood Pressure Rules
 * =============================================================================
 */

import { CLINICAL } from "@/config/constants";
import { VITAL_TYPES } from "@/lib/constants";
import type { BloodPressureVital } from "@/types/vital";

import {
  formatBloodPressureReading,
  formatClinicalNumber,
  type ClinicalRuleFinding,
} from "./alerts";
import {
  analyzeNumericTrend,
  buildTrendAnalysisMetadata,
  describeTrendDirection,
  type TrendAnalysis,
} from "./trendEngine";

const BLOOD_PRESSURE_RULE_IDS = {
  HIGH: "blood_pressure.high",
  SEVERE: "blood_pressure.severe",
  TREND_SHORT: "blood_pressure.trend.7d",
  TREND_LONG: "blood_pressure.trend.30d",
} as const;

const SEVERE_BLOOD_PRESSURE = {
  SYSTOLIC: 180,
  DIASTOLIC: 120,
} as const;

const BLOOD_PRESSURE_DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_SHORT_WINDOW_DAYS = 7;
const DEFAULT_LONG_WINDOW_DAYS = 30;

export interface BloodPressureTrendOptions {
  evaluatedAt?: Date;
  shortWindowDays?: number;
  longWindowDays?: number;
}

interface BloodPressureWindowSummary {
  windowDays: number;
  windowStart: Date;
  windowEnd: Date;
  readings: BloodPressureVital[];
  totalReadings: number;
  highReadings: number;
  severeReadings: number;
  averageSystolic: number;
  averageDiastolic: number;
}

function filterBloodPressureWindow(
  readings: BloodPressureVital[],
  evaluatedAt: Date,
  windowDays: number
): BloodPressureVital[] {
  const windowStart = new Date(
    evaluatedAt.getTime() - windowDays * BLOOD_PRESSURE_DAY_MS
  );

  return readings.filter((reading) => {
    const recordedAt = reading.recordedAt.getTime();
    return recordedAt >= windowStart.getTime() && recordedAt <= evaluatedAt.getTime();
  });
}

function summarizeBloodPressureWindow(
  readings: BloodPressureVital[],
  evaluatedAt: Date,
  windowDays: number
): BloodPressureWindowSummary | null {
  const windowReadings = filterBloodPressureWindow(readings, evaluatedAt, windowDays);

  if (windowReadings.length === 0) {
    return null;
  }

  const ordered = [...windowReadings].sort(
    (left, right) => left.recordedAt.getTime() - right.recordedAt.getTime()
  );
  const totalReadings = ordered.length;
  const averageSystolic =
    ordered.reduce((sum, reading) => sum + reading.systolic, 0) /
    Math.max(totalReadings, 1);
  const averageDiastolic =
    ordered.reduce((sum, reading) => sum + reading.diastolic, 0) /
    Math.max(totalReadings, 1);
  const highReadings = ordered.filter(
    (reading) =>
      reading.systolic >= CLINICAL.SYSTOLIC_BP_HIGH ||
      reading.diastolic >= CLINICAL.DIASTOLIC_BP_HIGH
  ).length;
  const severeReadings = ordered.filter(
    (reading) =>
      reading.systolic >= SEVERE_BLOOD_PRESSURE.SYSTOLIC ||
      reading.diastolic >= SEVERE_BLOOD_PRESSURE.DIASTOLIC
  ).length;

  return {
    windowDays,
    windowStart: new Date(
      evaluatedAt.getTime() - windowDays * BLOOD_PRESSURE_DAY_MS
    ),
    windowEnd: evaluatedAt,
    readings: ordered,
    totalReadings,
    highReadings,
    severeReadings,
    averageSystolic,
    averageDiastolic,
  };
}

function buildBloodPressureTrendFinding(
  summary: BloodPressureWindowSummary,
  physicianId: string | undefined,
  trendAnalysis?: TrendAnalysis | null
): ClinicalRuleFinding | null {
  if (summary.highReadings === 0 && summary.severeReadings === 0) {
    return null;
  }

  const isCritical =
    summary.severeReadings > 0 ||
    summary.averageSystolic >= 160 ||
    summary.averageDiastolic >= 100;
  const trendDirectionLabel = trendAnalysis
    ? describeTrendDirection(trendAnalysis.direction)
    : undefined;

  return {
    patientId: summary.readings[0]?.patientId ?? "",
    ...(physicianId ? { physicianId } : {}),
    family: "guideline",
    ruleId:
      summary.windowDays <= DEFAULT_SHORT_WINDOW_DAYS
        ? BLOOD_PRESSURE_RULE_IDS.TREND_SHORT
        : BLOOD_PRESSURE_RULE_IDS.TREND_LONG,
    title:
      summary.windowDays <= DEFAULT_SHORT_WINDOW_DAYS
        ? "Sustained High Blood Pressure Alert"
        : "Persistently High Blood Pressure Alert",
    message:
      trendAnalysis && trendAnalysis.direction !== "steady"
        ? `The blood pressure window is staying elevated with a ${trendDirectionLabel} trend across repeated readings.`
        : "The blood pressure window is staying elevated across repeated readings.",
    level: isCritical ? "critical" : "warning",
    metric: VITAL_TYPES.BLOOD_PRESSURE,
    threshold: `Rolling average below ${formatClinicalNumber(
      CLINICAL.SYSTOLIC_BP_HIGH,
      0
    )}/${formatClinicalNumber(CLINICAL.DIASTOLIC_BP_HIGH, 0)} mmHg`,
    actualValue: `Average ${formatClinicalNumber(
      summary.averageSystolic,
      0
    )}/${formatClinicalNumber(summary.averageDiastolic, 0)} mmHg across ${formatClinicalNumber(
      summary.totalReadings,
      0
    )} readings`,
    recommendation:
      "Review the home blood pressure log, medication adherence, sodium intake, and follow-up timing with the physician.",
    recordedAt: summary.windowEnd,
    windowDays: summary.windowDays,
    windowLabel: `${summary.windowDays}-day blood pressure window`,
    metadata: {
      windowDays: summary.windowDays,
      totalReadings: summary.totalReadings,
      highReadings: summary.highReadings,
      severeReadings: summary.severeReadings,
      averageSystolic: summary.averageSystolic,
      averageDiastolic: summary.averageDiastolic,
      ...(trendAnalysis
        ? {
            trendAnalysis: buildTrendAnalysisMetadata(trendAnalysis),
          }
        : {}),
    },
  };
}

export function evaluateBloodPressureRule(
  vital: BloodPressureVital,
  physicianId?: string
): ClinicalRuleFinding[] {
  const actualValue = formatBloodPressureReading(
    vital.systolic,
    vital.diastolic
  );

  const commonFinding = {
    patientId: vital.patientId,
    family: "guideline" as const,
    metric: VITAL_TYPES.BLOOD_PRESSURE,
    actualValue,
    recordedAt: vital.recordedAt,
    metadata: {
      vitalId: vital.id,
      vitalType: vital.type,
      systolic: vital.systolic,
      diastolic: vital.diastolic,
      unit: vital.unit ?? "mmHg",
    },
  };

  if (
    vital.systolic >= SEVERE_BLOOD_PRESSURE.SYSTOLIC ||
    vital.diastolic >= SEVERE_BLOOD_PRESSURE.DIASTOLIC
  ) {
    return [
      {
        ...commonFinding,
        ...(physicianId ? { physicianId } : {}),
        ruleId: BLOOD_PRESSURE_RULE_IDS.SEVERE,
        title: "Severely High Blood Pressure Alert",
        message: "Blood pressure is in the severe range.",
        level: "critical",
        threshold: `${formatClinicalNumber(
          SEVERE_BLOOD_PRESSURE.SYSTOLIC,
          0
        )}/${formatClinicalNumber(SEVERE_BLOOD_PRESSURE.DIASTOLIC, 0)} mmHg`,
        recommendation:
          "Escalate for same-day physician review and assess for urgent symptoms.",
        metadata: {
          ...commonFinding.metadata,
          severity: "severe",
          thresholdSystolic: SEVERE_BLOOD_PRESSURE.SYSTOLIC,
          thresholdDiastolic: SEVERE_BLOOD_PRESSURE.DIASTOLIC,
        },
      },
    ];
  }

  if (
    vital.systolic >= CLINICAL.SYSTOLIC_BP_HIGH ||
    vital.diastolic >= CLINICAL.DIASTOLIC_BP_HIGH
  ) {
    return [
      {
        ...commonFinding,
        ...(physicianId ? { physicianId } : {}),
        ruleId: BLOOD_PRESSURE_RULE_IDS.HIGH,
        title: "High Blood Pressure Alert",
        message: "Blood pressure exceeds the configured threshold.",
        level: "warning",
        threshold: `${formatClinicalNumber(CLINICAL.SYSTOLIC_BP_HIGH, 0)}/${formatClinicalNumber(
          CLINICAL.DIASTOLIC_BP_HIGH,
          0
        )} mmHg`,
        recommendation:
          "Review the patient's blood pressure trend and follow up with the physician.",
        metadata: {
          ...commonFinding.metadata,
          severity: "elevated",
          thresholdSystolic: CLINICAL.SYSTOLIC_BP_HIGH,
          thresholdDiastolic: CLINICAL.DIASTOLIC_BP_HIGH,
        },
      },
    ];
  }

  return [];
}

export function evaluateBloodPressureTrendRules(
  readings: BloodPressureVital[],
  physicianId?: string,
  options: BloodPressureTrendOptions = {}
): ClinicalRuleFinding[] {
  const evaluatedAt = options.evaluatedAt ?? new Date();
  const shortWindowDays = options.shortWindowDays ?? DEFAULT_SHORT_WINDOW_DAYS;
  const longWindowDays = options.longWindowDays ?? DEFAULT_LONG_WINDOW_DAYS;
  const bloodPressureReadings = readings.filter(
    (reading): reading is BloodPressureVital =>
      reading.type === "blood_pressure" &&
      Number.isFinite(reading.systolic) &&
      Number.isFinite(reading.diastolic)
  );

  if (bloodPressureReadings.length === 0) {
    return [];
  }

  const windows = Array.from(
    new Set([shortWindowDays, longWindowDays].filter((value) => value > 0))
  );
  const findings: ClinicalRuleFinding[] = [];

  for (const windowDays of windows) {
    const summary = summarizeBloodPressureWindow(
      bloodPressureReadings,
      evaluatedAt,
      windowDays
    );

    if (!summary) {
      continue;
    }

    const trendAnalysis = analyzeNumericTrend(
      summary.readings.map((reading) => ({
        recordedAt: reading.recordedAt,
        value: reading.systolic,
      }))
    );

    const finding = buildBloodPressureTrendFinding(
      summary,
      physicianId,
      trendAnalysis
    );

    if (finding) {
      findings.push(finding);
    }
  }

  return findings;
}
