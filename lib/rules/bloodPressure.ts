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

const BLOOD_PRESSURE_RULE_IDS = {
  HIGH: "blood_pressure.high",
  SEVERE: "blood_pressure.severe",
} as const;

const SEVERE_BLOOD_PRESSURE = {
  SYSTOLIC: 180,
  DIASTOLIC: 120,
} as const;

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
