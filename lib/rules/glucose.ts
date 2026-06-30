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
  type ClinicalRuleFinding,
} from "./alerts";

const BLOOD_GLUCOSE_RULE_ID = "blood_glucose.high";

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
