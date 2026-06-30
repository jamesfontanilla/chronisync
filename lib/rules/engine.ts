/**
 * =============================================================================
 * ChroniSync
 * Clinical Rules Engine
 * =============================================================================
 */

import type { Medication } from "@/types/medication";
import type { Vital } from "@/types/vital";

import {
  createClinicalAlertInput,
  createClinicalAlertRecord,
  type ClinicalAlertInput,
  type ClinicalRuleFinding,
} from "./alerts";
import { evaluateBloodPressureRule } from "./bloodPressure";
import { evaluateBloodGlucoseRule } from "./glucose";
import {
  evaluateMedicationAdherenceRules,
  type MedicationAdherenceObservation,
} from "./adherence";

export interface ClinicalRulesInput {
  vitals?: Vital[];
  medications?: Medication[];
  adherenceObservations?: MedicationAdherenceObservation[];
  physicianId?: string;
  evaluatedAt?: Date;
}

export function evaluateClinicalRules(
  input: ClinicalRulesInput
): ClinicalRuleFinding[] {
  const findings: ClinicalRuleFinding[] = [];
  const evaluatedAt = input.evaluatedAt ?? new Date();

  for (const vital of input.vitals ?? []) {
    switch (vital.type) {
      case "blood_pressure":
        findings.push(
          ...evaluateBloodPressureRule(vital, input.physicianId)
        );
        break;
      case "blood_glucose":
        findings.push(
          ...evaluateBloodGlucoseRule(vital, input.physicianId)
        );
        break;
      default:
        break;
    }
  }

  if ((input.medications ?? []).length > 0) {
    const adherenceOptions: Parameters<
      typeof evaluateMedicationAdherenceRules
    >[0] = {
      medications: input.medications ?? [],
      evaluatedAt,
      ...(input.adherenceObservations
        ? { observations: input.adherenceObservations }
        : {}),
      ...(input.physicianId ? { physicianId: input.physicianId } : {}),
    };

    findings.push(...evaluateMedicationAdherenceRules(adherenceOptions));
  }

  return findings;
}

export function buildClinicalAlertInputs(
  findings: ClinicalRuleFinding[]
): ClinicalAlertInput[] {
  return findings.map((finding) => createClinicalAlertInput(finding));
}

export function buildClinicalAlertRecords(
  findings: ClinicalRuleFinding[],
  createdAt = new Date()
) {
  return findings.map((finding) =>
    createClinicalAlertRecord(finding, createdAt)
  );
}
