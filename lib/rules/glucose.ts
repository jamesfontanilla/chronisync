/**
 * =============================================================================
 * ChroniSync
 * Blood Glucose Rules
 * =============================================================================
 */

import { CLINICAL } from "@/config/constants";
import { VITAL_TYPES } from "@/lib/constants";
import type { NumericVital } from "@/types/vital";

import {
  formatClinicalNumber,
  formatClinicalPercentage,
  type ClinicalRuleFinding,
} from "./alerts";

const BLOOD_GLUCOSE_RULE_ID = "blood_glucose.high";
const GLUCOSE_WINDOW_RULE_IDS = {
  TIR: "blood_glucose.time_in_range",
  TBR: "blood_glucose.time_below_range",
  GMI: "blood_glucose.gmi",
  DELTA: "blood_glucose.meal_delta",
} as const;

const GLUCOSE_DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_GLUCOSE_WINDOW_DAYS = 14;
const DEFAULT_GMI_MINIMUM_DAYS = 14;
const DEFAULT_POST_MEAL_DELTA_THRESHOLD = 30;

export interface BloodGlucoseTrendOptions {
  evaluatedAt?: Date;
  windowDays?: number;
  tirTarget?: number;
  tbrTarget?: number;
  seriousTbrTarget?: number;
  gmiMinimumDays?: number;
  postMealDeltaThreshold?: number;
}

interface GlucoseWindowSummary {
  windowDays: number;
  windowStart: Date;
  windowEnd: Date;
  readings: NumericVital[];
  totalReadings: number;
  inRangeReadings: number;
  belowRangeReadings: number;
  seriousLowReadings: number;
  meanGlucose: number;
  coverageDays: number;
  gmi?: number;
}

function filterGlucoseWindow(
  readings: NumericVital[],
  evaluatedAt: Date,
  windowDays: number
): NumericVital[] {
  const windowStart = new Date(
    evaluatedAt.getTime() - windowDays * GLUCOSE_DAY_MS
  );

  return readings.filter((reading) => {
    const recordedAt = reading.recordedAt.getTime();
    return recordedAt >= windowStart.getTime() && recordedAt <= evaluatedAt.getTime();
  });
}

function summarizeGlucoseWindow(
  readings: NumericVital[],
  evaluatedAt: Date,
  windowDays: number,
  gmiMinimumDays: number
): GlucoseWindowSummary | null {
  const windowReadings = filterGlucoseWindow(readings, evaluatedAt, windowDays);

  if (windowReadings.length === 0) {
    return null;
  }

  const ordered = [...windowReadings].sort(
    (left, right) => left.recordedAt.getTime() - right.recordedAt.getTime()
  );
  const total = ordered.length;
  const values = ordered.map((reading) => reading.value);
  const meanGlucose =
    values.reduce((sum, value) => sum + value, 0) / Math.max(total, 1);
  const inRangeReadings = ordered.filter(
    (reading) => reading.value >= 70 && reading.value <= 180
  ).length;
  const belowRangeReadings = ordered.filter(
    (reading) => reading.value < 70
  ).length;
  const seriousLowReadings = ordered.filter(
    (reading) => reading.value < 54
  ).length;
  const firstRecordedAt = ordered[0]?.recordedAt;
  const lastRecordedAt = ordered[ordered.length - 1]?.recordedAt;
  const coverageDays =
    firstRecordedAt && lastRecordedAt
      ? Math.max(
          Math.ceil(
            (lastRecordedAt.getTime() - firstRecordedAt.getTime()) /
              GLUCOSE_DAY_MS
          ) + 1,
          1
        )
      : 1;

  return {
    windowDays,
    windowStart: new Date(
      evaluatedAt.getTime() - windowDays * GLUCOSE_DAY_MS
    ),
    windowEnd: evaluatedAt,
    readings: ordered,
    totalReadings: total,
    inRangeReadings,
    belowRangeReadings,
    seriousLowReadings,
    meanGlucose,
    coverageDays,
    ...(coverageDays >= gmiMinimumDays
      ? { gmi: 3.31 + 0.02392 * meanGlucose }
      : {}),
  };
}

function detectMealPhase(notes?: string): "before" | "after" | undefined {
  const normalized = notes?.trim().toLowerCase() ?? "";

  if (
    normalized.includes("pre meal") ||
    normalized.includes("pre-meal") ||
    normalized.includes("before meal") ||
    normalized.includes("fasting")
  ) {
    return "before";
  }

  if (
    normalized.includes("post meal") ||
    normalized.includes("post-meal") ||
    normalized.includes("after meal")
  ) {
    return "after";
  }

  return undefined;
}

function buildMealDeltaFinding(
  readings: NumericVital[],
  physicianId: string | undefined,
  evaluatedAt: Date,
  threshold: number
): ClinicalRuleFinding | null {
  const taggedReadings = readings
    .map((reading) => ({
      reading,
      phase: detectMealPhase(reading.notes),
    }))
    .filter((entry) => entry.phase !== undefined);

  if (taggedReadings.length === 0) {
    return null;
  }

  const buckets = new Map<string, typeof taggedReadings>();

  for (const entry of taggedReadings) {
    const key = entry.reading.recordedAt.toISOString().slice(0, 10);
    const bucket = buckets.get(key) ?? [];
    bucket.push(entry);
    buckets.set(key, bucket);
  }

  let worstPair:
    | {
        before: NumericVital;
        after: NumericVital;
        delta: number;
      }
    | undefined;

  for (const bucket of buckets.values()) {
    const ordered = [...bucket].sort(
      (left, right) =>
        left.reading.recordedAt.getTime() - right.reading.recordedAt.getTime()
    );

    for (let index = 0; index < ordered.length; index += 1) {
      const entry = ordered[index];
      if (!entry) {
        continue;
      }

      if (entry.phase !== "after") {
        continue;
      }

      let beforeCandidate: (typeof ordered)[number] | undefined;

      for (let backIndex = index - 1; backIndex >= 0; backIndex -= 1) {
        const candidate = ordered[backIndex];
        if (!candidate) {
          continue;
        }
        const gapMs =
          entry.reading.recordedAt.getTime() -
          candidate.reading.recordedAt.getTime();

        if (gapMs > 8 * 60 * 60 * 1000) {
          break;
        }

        if (candidate.phase === "before") {
          beforeCandidate = candidate;
          break;
        }
      }

      if (!beforeCandidate) {
        continue;
      }

      const delta = entry.reading.value - beforeCandidate.reading.value;
      if (!worstPair || delta > worstPair.delta) {
        worstPair = {
          before: beforeCandidate.reading,
          after: entry.reading,
          delta,
        };
      }
    }
  }

  if (!worstPair || worstPair.delta <= threshold) {
    return null;
  }

  const unit = worstPair.after.unit ?? "mg/dL";

  return {
    patientId: worstPair.after.patientId,
    ...(physicianId ? { physicianId } : {}),
    family: "guideline",
    ruleId: GLUCOSE_WINDOW_RULE_IDS.DELTA,
    title: "Post-meal Glucose Rise Alert",
    message:
      "The after-meal glucose reading rose above the coaching target from the paired before-meal check.",
    level: "warning",
    metric: VITAL_TYPES.BLOOD_GLUCOSE,
    threshold: `<= ${formatClinicalNumber(threshold, 0)} mg/dL rise`,
    actualValue: `${formatClinicalNumber(worstPair.delta, 0)} mg/dL rise (${formatClinicalNumber(
      worstPair.before.value,
      0
    )} -> ${formatClinicalNumber(worstPair.after.value, 0)} ${unit})`,
    recommendation:
      "Review meal composition, timing, and medication timing with the patient.",
    recordedAt: worstPair.after.recordedAt,
    windowDays: 1,
    windowLabel: "paired meal readings",
    metadata: {
      beforeReadingId: worstPair.before.id,
      afterReadingId: worstPair.after.id,
      beforeRecordedAt: worstPair.before.recordedAt,
      afterRecordedAt: worstPair.after.recordedAt,
      delta: worstPair.delta,
      threshold,
      unit,
    },
  };
}

function buildTirFinding(
  summary: GlucoseWindowSummary,
  physicianId: string | undefined,
  tirTarget: number,
  tbrTarget: number,
  seriousTbrTarget: number
): ClinicalRuleFinding | null {
  const timeInRange = summary.inRangeReadings / summary.totalReadings;
  const belowRange = summary.belowRangeReadings / summary.totalReadings;
  const seriousLow = summary.seriousLowReadings / summary.totalReadings;

  if (timeInRange >= tirTarget && belowRange <= tbrTarget) {
    return null;
  }

  const isCritical = seriousLow > seriousTbrTarget || timeInRange < 0.5;

  return {
    patientId: summary.readings[0]?.patientId ?? "",
    ...(physicianId ? { physicianId } : {}),
    family: "guideline",
    ruleId: GLUCOSE_WINDOW_RULE_IDS.TIR,
    title: "Glucose Time-in-Range Alert",
    message:
      "The glucose window is spending too much time outside the target range.",
    level: isCritical ? "critical" : "warning",
    metric: VITAL_TYPES.BLOOD_GLUCOSE,
    threshold: `>= ${formatClinicalPercentage(tirTarget, 0)} in range and <= ${formatClinicalPercentage(tbrTarget, 0)} below range`,
    actualValue: `${formatClinicalPercentage(timeInRange, 0)} in range, ${formatClinicalPercentage(
      belowRange,
      0
    )} below range, ${formatClinicalPercentage(seriousLow, 0)} below 54 mg/dL`,
    recommendation:
      "Review continuous glucose monitoring trends, meal timing, and therapy adjustments with the physician.",
    recordedAt: summary.windowEnd,
    windowDays: summary.windowDays,
    windowLabel: `${summary.windowDays}-day glucose window`,
    metadata: {
      windowDays: summary.windowDays,
      totalReadings: summary.totalReadings,
      inRangeReadings: summary.inRangeReadings,
      belowRangeReadings: summary.belowRangeReadings,
      seriousLowReadings: summary.seriousLowReadings,
      coverageDays: summary.coverageDays,
    },
  };
}

function buildTbrFinding(
  summary: GlucoseWindowSummary,
  physicianId: string | undefined,
  tbrTarget: number,
  seriousTbrTarget: number
): ClinicalRuleFinding | null {
  const belowRange = summary.belowRangeReadings / summary.totalReadings;
  const seriousLow = summary.seriousLowReadings / summary.totalReadings;

  if (belowRange <= tbrTarget && seriousLow <= seriousTbrTarget) {
    return null;
  }

  return {
    patientId: summary.readings[0]?.patientId ?? "",
    ...(physicianId ? { physicianId } : {}),
    family: "guideline",
    ruleId: GLUCOSE_WINDOW_RULE_IDS.TBR,
    title: "Low Glucose Exposure Alert",
    message:
      "The glucose window is spending too much time below the safe range.",
    level: seriousLow > seriousTbrTarget ? "critical" : "warning",
    metric: VITAL_TYPES.BLOOD_GLUCOSE,
    threshold: `<= ${formatClinicalPercentage(tbrTarget, 0)} below 70 mg/dL and <= ${formatClinicalPercentage(
      seriousTbrTarget,
      0
    )} below 54 mg/dL`,
    actualValue: `${formatClinicalPercentage(belowRange, 0)} below 70 mg/dL, ${formatClinicalPercentage(
      seriousLow,
      0
    )} below 54 mg/dL`,
    recommendation:
      "Review hypoglycemia patterns, food timing, and medication dosing with the physician.",
    recordedAt: summary.windowEnd,
    windowDays: summary.windowDays,
    windowLabel: `${summary.windowDays}-day glucose window`,
    metadata: {
      windowDays: summary.windowDays,
      totalReadings: summary.totalReadings,
      belowRangeReadings: summary.belowRangeReadings,
      seriousLowReadings: summary.seriousLowReadings,
      coverageDays: summary.coverageDays,
    },
  };
}

function buildGmiFinding(
  summary: GlucoseWindowSummary,
  physicianId: string | undefined
): ClinicalRuleFinding | null {
  if (summary.gmi === undefined) {
    return null;
  }

  return {
    patientId: summary.readings[0]?.patientId ?? "",
    ...(physicianId ? { physicianId } : {}),
    family: "guideline",
    ruleId: GLUCOSE_WINDOW_RULE_IDS.GMI,
    title: "Glucose Management Indicator",
    message:
      "A glucose management indicator is available for the current CGM window.",
    level: "info",
    metric: VITAL_TYPES.BLOOD_GLUCOSE,
    threshold: `At least ${DEFAULT_GMI_MINIMUM_DAYS} days of glucose data`,
    actualValue: `${formatClinicalNumber(summary.gmi, 1)}% estimated A1C from ${formatClinicalNumber(
      summary.meanGlucose,
      0
    )} mg/dL mean glucose`,
    recommendation:
      "Use the estimated A1C alongside lab data and the patient's recent glucose trend.",
    recordedAt: summary.windowEnd,
    windowDays: summary.windowDays,
    windowLabel: `${summary.windowDays}-day glucose window`,
    metadata: {
      windowDays: summary.windowDays,
      coverageDays: summary.coverageDays,
      meanGlucose: summary.meanGlucose,
      gmi: summary.gmi,
    },
  };
}

export function evaluateBloodGlucoseRule(
  vital: NumericVital,
  physicianId?: string
): ClinicalRuleFinding[] {
  if (vital.type !== "blood_glucose") {
    return [];
  }

  if (vital.value < CLINICAL.FASTING_GLUCOSE_HIGH) {
    return [];
  }

  const unit = vital.unit ?? "mg/dL";

  return [
    {
      patientId: vital.patientId,
      ...(physicianId ? { physicianId } : {}),
      family: "guideline",
      ruleId: BLOOD_GLUCOSE_RULE_ID,
      title: "High Blood Glucose Alert",
      message: "Blood glucose is above the configured fasting threshold.",
      level: "warning",
      metric: VITAL_TYPES.BLOOD_GLUCOSE,
      threshold: `>= ${formatClinicalNumber(
        CLINICAL.FASTING_GLUCOSE_HIGH,
        0
      )} mg/dL`,
      actualValue: `${formatClinicalNumber(vital.value)} ${unit}`,
      recommendation:
        "Review glucose trends, meal timing, and medication adherence with the physician.",
      recordedAt: vital.recordedAt,
      metadata: {
        vitalId: vital.id,
        vitalType: vital.type,
        value: vital.value,
        unit,
        threshold: CLINICAL.FASTING_GLUCOSE_HIGH,
      },
    },
  ];
}

export function evaluateBloodGlucoseTrendRules(
  readings: NumericVital[],
  physicianId?: string,
  options: BloodGlucoseTrendOptions = {}
): ClinicalRuleFinding[] {
  const evaluatedAt = options.evaluatedAt ?? new Date();
  const windowDays = options.windowDays ?? DEFAULT_GLUCOSE_WINDOW_DAYS;
  const tirTarget = options.tirTarget ?? 0.7;
  const tbrTarget = options.tbrTarget ?? 0.04;
  const seriousTbrTarget = options.seriousTbrTarget ?? 0.01;
  const gmiMinimumDays = options.gmiMinimumDays ?? DEFAULT_GMI_MINIMUM_DAYS;
  const postMealDeltaThreshold =
    options.postMealDeltaThreshold ?? DEFAULT_POST_MEAL_DELTA_THRESHOLD;
  const glucoseReadings = readings.filter(
    (reading): reading is NumericVital =>
      reading.type === "blood_glucose" && Number.isFinite(reading.value)
  );

  if (glucoseReadings.length === 0) {
    return [];
  }

  const summary = summarizeGlucoseWindow(
    glucoseReadings,
    evaluatedAt,
    windowDays,
    gmiMinimumDays
  );

  if (!summary) {
    return [];
  }

  const findings: ClinicalRuleFinding[] = [];

  const tirFinding = buildTirFinding(
    summary,
    physicianId,
    tirTarget,
    tbrTarget,
    seriousTbrTarget
  );

  if (tirFinding) {
    findings.push(tirFinding);
  }

  const tbrFinding = buildTbrFinding(
    summary,
    physicianId,
    tbrTarget,
    seriousTbrTarget
  );

  if (tbrFinding) {
    findings.push(tbrFinding);
  }

  const gmiFinding = buildGmiFinding(summary, physicianId);

  if (gmiFinding) {
    findings.push(gmiFinding);
  }

  const mealDeltaFinding = buildMealDeltaFinding(
    glucoseReadings,
    physicianId,
    evaluatedAt,
    postMealDeltaThreshold
  );

  if (mealDeltaFinding) {
    findings.push(mealDeltaFinding);
  }

  return findings;
}
