/**
 * =============================================================================
 * ChroniSync
 * Clinical Rules Engine
 * =============================================================================
 */

import type { Medication } from "@/types/medication";
import type { Disease } from "@/types/disease";
import type { Vital } from "@/types/vital";

import {
  createClinicalAlertInput,
  createClinicalAlertRecord,
  type ClinicalAlertInput,
  type ClinicalRuleFinding,
} from "./alerts";
import { evaluateBloodPressureRule } from "./bloodPressure";
import { evaluateBloodPressureTrendRules } from "./bloodPressure";
import { evaluateBloodGlucoseRule } from "./glucose";
import { evaluateBloodGlucoseTrendRules } from "./glucose";
import {
  evaluateMedicationAdherenceRules,
  type MedicationAdherenceObservation,
} from "./adherence";

export interface ClinicalRulesInput {
  vitals?: Vital[];
  medications?: Medication[];
  adherenceObservations?: MedicationAdherenceObservation[];
  diseases?: Disease[];
  physicianId?: string;
  evaluatedAt?: Date;
}

const DIABETES_ALIASES = [
  "diabetes",
  "type 2 diabetes",
  "t2dm",
  "type 1 diabetes",
  "t1dm",
] as const;

const HYPERTENSION_ALIASES = [
  "hypertension",
  "high blood pressure",
] as const;

const CKD_ALIASES = [
  "chronic kidney disease",
  "ckd",
  "kidney disease",
  "renal disease",
] as const;

const COPD_ALIASES = [
  "copd",
  "chronic obstructive pulmonary disease",
] as const;

const DIABETES_ICD_PREFIXES = ["E10", "E11", "E13"];
const HYPERTENSION_ICD_PREFIXES = ["I10", "I11", "I12", "I13", "I15"];
const CKD_ICD_PREFIXES = ["N18", "N19"];
const COPD_ICD_PREFIXES = ["J44"];

function normalizeDiseaseKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function matchesDisease(
  disease: Pick<Disease, "name" | "icd10Code">,
  aliases: readonly string[],
  icdPrefixes: readonly string[]
): boolean {
  const normalizedName = normalizeDiseaseKey(disease.name);
  const normalizedIcd10 = disease.icd10Code?.trim().toUpperCase() ?? "";

  if (
    aliases.some((alias) =>
      normalizedName.includes(normalizeDiseaseKey(alias))
    )
  ) {
    return true;
  }

  return (
    normalizedIcd10.length > 0 &&
    icdPrefixes.some((prefix) => normalizedIcd10.startsWith(prefix))
  );
}

function getClinicalRoutingFlags(diseases?: Disease[]): {
  runGlucoseTrends: boolean;
  runBloodPressureTrends: boolean;
} {
  if (!diseases || diseases.length === 0) {
    return {
      runGlucoseTrends: true,
      runBloodPressureTrends: true,
    };
  }

  let runGlucoseTrends = false;
  let runBloodPressureTrends = false;

  for (const disease of diseases) {
    if (
      matchesDisease(disease, DIABETES_ALIASES, DIABETES_ICD_PREFIXES) ||
      matchesDisease(disease, CKD_ALIASES, CKD_ICD_PREFIXES)
    ) {
      runGlucoseTrends = true;
      runBloodPressureTrends = true;
      continue;
    }

    if (
      matchesDisease(disease, HYPERTENSION_ALIASES, HYPERTENSION_ICD_PREFIXES)
    ) {
      runBloodPressureTrends = true;
      continue;
    }

    if (matchesDisease(disease, COPD_ALIASES, COPD_ICD_PREFIXES)) {
      continue;
    }
  }

  return {
    runGlucoseTrends,
    runBloodPressureTrends,
  };
}

export function evaluateClinicalRules(
  input: ClinicalRulesInput
): ClinicalRuleFinding[] {
  const findings: ClinicalRuleFinding[] = [];
  const evaluatedAt = input.evaluatedAt ?? new Date();
  const routingFlags = getClinicalRoutingFlags(input.diseases);
  const bloodPressureReadings = (input.vitals ?? []).filter(
    (vital): vital is Extract<Vital, { type: "blood_pressure" }> =>
      vital.type === "blood_pressure"
  );
  const bloodGlucoseReadings = (input.vitals ?? []).filter(
    (vital): vital is Extract<Vital, { type: "blood_glucose" }> =>
      vital.type === "blood_glucose"
  );

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

  findings.push(
    ...(routingFlags.runBloodPressureTrends
      ? evaluateBloodPressureTrendRules(
          bloodPressureReadings,
          input.physicianId,
          {
            evaluatedAt,
            shortWindowDays: 7,
            longWindowDays: 30,
          }
        )
      : [])
  );
  findings.push(
    ...(routingFlags.runGlucoseTrends
      ? evaluateBloodGlucoseTrendRules(
          bloodGlucoseReadings,
          input.physicianId,
          {
            evaluatedAt,
            windowDays: 14,
          }
        )
      : [])
  );

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
