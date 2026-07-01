/**
 * =============================================================================
 * ChroniSync
 * Medication Adherence Rules
 * =============================================================================
 */

import type {
  Medication,
  MedicationFrequency,
} from "@/types/medication";

import {
  formatClinicalNumber,
  formatClinicalPercentage,
  type ClinicalRuleFinding,
} from "./alerts";

const ADHERENCE_RULE_IDS = {
  MISSING_LOGGING: "medication_adherence.logging.missing",
  LOW: "medication_adherence.low",
  CRITICAL: "medication_adherence.critical",
  OVERDUE: "medication_adherence.overdue",
} as const;

const ADHERENCE_METRIC = "medication_adherence" as const;

const ADHERENCE_TARGETS = {
  WARNING: 0.9,
  CRITICAL: 0.75,
} as const;

export interface MedicationAdherenceObservation {
  medicationId?: string;
  expectedDoses?: number;
  takenDoses?: number;
  missedDoses?: number;
  lastTakenAt?: Date;
  lastLoggedAt?: Date;
}

export interface MedicationAdherenceEvaluationOptions {
  medications: Medication[];
  observations?: MedicationAdherenceObservation[];
  physicianId?: string;
  evaluatedAt?: Date;
}

export interface MedicationAdherenceSummary {
  medicationCount: number;
  trackedMedicationCount: number;
  observedMedicationCount: number;
  expectedDoses: number;
  takenDoses: number;
  missedDoses: number;
  adherenceRate: number | null;
  latestTakenAt?: Date;
  latestLoggedAt?: Date;
}

function isTrackedMedication(
  medication: Medication,
  evaluatedAt: Date
): boolean {
  if (medication.status !== "active") {
    return false;
  }

  if (medication.isAsNeeded || medication.frequency === "as_needed") {
    return false;
  }

  if (medication.startDate > evaluatedAt) {
    return false;
  }

  if (medication.endDate && medication.endDate < evaluatedAt) {
    return false;
  }

  return true;
}

function getExpectedIntervalHours(
  frequency: MedicationFrequency
): number | null {
  switch (frequency) {
    case "once_daily":
      return 24;
    case "twice_daily":
      return 12;
    case "three_times_daily":
      return 8;
    case "every_other_day":
      return 48;
    case "weekly":
      return 168;
    default:
      return null;
  }
}

function getObservationForMedication(
  medication: Medication,
  observations: MedicationAdherenceObservation[]
): MedicationAdherenceObservation | undefined {
  const exactMatch = observations.find(
    (observation) => observation.medicationId === medication.id
  );

  if (exactMatch) {
    return exactMatch;
  }

  return observations.find(
    (observation) => observation.medicationId === undefined
  );
}

function buildAdherenceMetadata(
  medication: Medication,
  observation: MedicationAdherenceObservation | undefined,
  evaluatedAt: Date,
  mode: "missing" | "counts" | "recency"
): Record<string, unknown> {
  const metadata: Record<string, unknown> = {
    medicationId: medication.id,
    medicationName: medication.name,
    medicationStatus: medication.status,
    frequency: medication.frequency,
    mode,
    evaluatedAt,
  };

  if (medication.customFrequency) {
    metadata["customFrequency"] = medication.customFrequency;
  }

  if (medication.isAsNeeded !== undefined) {
    metadata["isAsNeeded"] = medication.isAsNeeded;
  }

  if (observation?.expectedDoses !== undefined) {
    metadata["expectedDoses"] = observation.expectedDoses;
  }

  if (observation?.takenDoses !== undefined) {
    metadata["takenDoses"] = observation.takenDoses;
  }

  if (observation?.missedDoses !== undefined) {
    metadata["missedDoses"] = observation.missedDoses;
  }

  if (observation?.lastTakenAt) {
    metadata["lastTakenAt"] = observation.lastTakenAt;
  }

  if (observation?.lastLoggedAt) {
    metadata["lastLoggedAt"] = observation.lastLoggedAt;
  }

  return metadata;
}

export function summarizeMedicationAdherence(
  options: MedicationAdherenceEvaluationOptions
): MedicationAdherenceSummary {
  const evaluatedAt = options.evaluatedAt ?? new Date();
  const observations = options.observations ?? [];
  const trackedMedications = options.medications.filter((medication) =>
    isTrackedMedication(medication, evaluatedAt)
  );
  const observedMedicationIds = new Set<string>();

  let expectedDoses = 0;
  let takenDoses = 0;
  let missedDoses = 0;
  let latestTakenAt: Date | undefined;
  let latestLoggedAt: Date | undefined;

  for (const medication of trackedMedications) {
    const observation = getObservationForMedication(medication, observations);

    if (!observation) {
      continue;
    }

    observedMedicationIds.add(medication.id);

    const resolvedExpectedDoses =
      observation.expectedDoses ??
      (observation.takenDoses !== undefined &&
      observation.missedDoses !== undefined
        ? observation.takenDoses + observation.missedDoses
        : undefined);

    if (resolvedExpectedDoses !== undefined) {
      expectedDoses += resolvedExpectedDoses;
    }

    if (observation.takenDoses !== undefined) {
      takenDoses += observation.takenDoses;
    }

    if (observation.missedDoses !== undefined) {
      missedDoses += observation.missedDoses;
    }

    if (
      observation.lastTakenAt &&
      (!latestTakenAt || observation.lastTakenAt > latestTakenAt)
    ) {
      latestTakenAt = observation.lastTakenAt;
    }

    if (
      observation.lastLoggedAt &&
      (!latestLoggedAt || observation.lastLoggedAt > latestLoggedAt)
    ) {
      latestLoggedAt = observation.lastLoggedAt;
    }
  }

  const adherenceRate =
    expectedDoses > 0 ? takenDoses / Math.max(expectedDoses, 1) : null;

  return {
    medicationCount: options.medications.length,
    trackedMedicationCount: trackedMedications.length,
    observedMedicationCount: observedMedicationIds.size,
    expectedDoses,
    takenDoses,
    missedDoses,
    adherenceRate,
    ...(latestTakenAt ? { latestTakenAt } : {}),
    ...(latestLoggedAt ? { latestLoggedAt } : {}),
  };
}

function createMissingLoggingFinding(
  medication: Medication,
  physicianId: string | undefined,
  evaluatedAt: Date
): ClinicalRuleFinding {
  const resolvedPhysicianId = physicianId ?? medication.prescribedBy;

  return {
    patientId: medication.patientId,
    ...(resolvedPhysicianId ? { physicianId: resolvedPhysicianId } : {}),
    family: "guideline",
    ruleId: ADHERENCE_RULE_IDS.MISSING_LOGGING,
    title: "Medication Adherence Alert",
    message: `No adherence log data is available for ${medication.name}.`,
    level: "warning",
    metric: ADHERENCE_METRIC,
    threshold: "At least one adherence log entry",
    actualValue: "No adherence logs recorded",
    recommendation: `Prompt the patient to record doses for ${medication.name} and review adherence at the next visit.`,
    recordedAt: evaluatedAt,
    metadata: buildAdherenceMetadata(medication, undefined, evaluatedAt, "missing"),
  };
}

function createCountBasedFinding(
  medication: Medication,
  observation: MedicationAdherenceObservation,
  physicianId: string | undefined,
  evaluatedAt: Date
): ClinicalRuleFinding | null {
  const expectedDoses =
    observation.expectedDoses ??
    (observation.takenDoses !== undefined &&
    observation.missedDoses !== undefined
      ? observation.takenDoses + observation.missedDoses
      : undefined);

  if (expectedDoses === undefined || expectedDoses <= 0) {
    return null;
  }

  const takenDoses =
    observation.takenDoses ??
    (observation.missedDoses !== undefined
      ? Math.max(expectedDoses - observation.missedDoses, 0)
      : undefined);

  if (takenDoses === undefined) {
    return null;
  }

  const safeTakenDoses = Math.min(Math.max(takenDoses, 0), expectedDoses);
  const missedDoses =
    observation.missedDoses ??
    Math.max(expectedDoses - safeTakenDoses, 0);
  const adherencePercent = safeTakenDoses / expectedDoses;
  const resolvedPhysicianId = physicianId ?? medication.prescribedBy;

  const isCritical =
    missedDoses >= 3 ||
    adherencePercent <= ADHERENCE_TARGETS.CRITICAL;
  const isLow =
    missedDoses > 0 ||
    adherencePercent < ADHERENCE_TARGETS.WARNING;

  if (!isCritical && !isLow) {
    return null;
  }

  const threshold = isCritical
    ? ">= 75% adherence"
    : ">= 90% adherence";

  return {
    patientId: medication.patientId,
    ...(resolvedPhysicianId ? { physicianId: resolvedPhysicianId } : {}),
    family: "guideline",
    ruleId: isCritical
      ? ADHERENCE_RULE_IDS.CRITICAL
      : ADHERENCE_RULE_IDS.LOW,
    title: "Medication Adherence Alert",
    message: isCritical
      ? `Adherence is severely below target for ${medication.name}.`
      : `Adherence is below target for ${medication.name}.`,
    level: isCritical ? "critical" : "warning",
    metric: ADHERENCE_METRIC,
    threshold,
    actualValue: `${formatClinicalPercentage(
      adherencePercent
    )} adherence (${formatClinicalNumber(
      safeTakenDoses,
      0
    )}/${formatClinicalNumber(expectedDoses, 0)} doses taken)`,
    recommendation: isCritical
      ? `Contact the patient and physician to address missed doses for ${medication.name}.`
      : `Review barriers to adherence and reinforce the dosing schedule for ${medication.name}.`,
    recordedAt: observation.lastLoggedAt ?? observation.lastTakenAt ?? evaluatedAt,
    metadata: buildAdherenceMetadata(medication, observation, evaluatedAt, "counts"),
  };
}

function createRecencyFinding(
  medication: Medication,
  observation: MedicationAdherenceObservation,
  physicianId: string | undefined,
  evaluatedAt: Date
): ClinicalRuleFinding | null {
  const intervalHours = getExpectedIntervalHours(medication.frequency);

  if (intervalHours === null || !observation.lastTakenAt) {
    return null;
  }

  const hoursSinceLastDose = Math.max(
    (evaluatedAt.getTime() - observation.lastTakenAt.getTime()) /
      (60 * 60 * 1000),
    0
  );

  if (hoursSinceLastDose <= intervalHours) {
    return null;
  }

  const isCritical = hoursSinceLastDose > intervalHours * 2;
  const thresholdHours = isCritical ? intervalHours * 2 : intervalHours;
  const resolvedPhysicianId = physicianId ?? medication.prescribedBy;

  return {
    patientId: medication.patientId,
    ...(resolvedPhysicianId ? { physicianId: resolvedPhysicianId } : {}),
    family: "guideline",
    ruleId: isCritical
      ? ADHERENCE_RULE_IDS.CRITICAL
      : ADHERENCE_RULE_IDS.OVERDUE,
    title: "Medication Adherence Alert",
    message: isCritical
      ? `The last documented dose for ${medication.name} is significantly overdue.`
      : `The last documented dose for ${medication.name} is overdue.`,
    level: isCritical ? "critical" : "warning",
    metric: ADHERENCE_METRIC,
    threshold: `Within ${formatClinicalNumber(thresholdHours)} hours`,
    actualValue: `${formatClinicalNumber(hoursSinceLastDose)} hours since last dose`,
    recommendation: isCritical
      ? `Contact the patient promptly to confirm dosing and assess for symptoms.`
      : `Confirm whether the dose was taken and review the schedule with the patient.`,
    recordedAt: observation.lastTakenAt,
    metadata: buildAdherenceMetadata(medication, observation, evaluatedAt, "recency"),
  };
}

export function evaluateMedicationAdherenceRules(
  options: MedicationAdherenceEvaluationOptions
): ClinicalRuleFinding[] {
  const evaluatedAt = options.evaluatedAt ?? new Date();
  const observations = options.observations ?? [];
  const findings: ClinicalRuleFinding[] = [];

  for (const medication of options.medications) {
    if (!isTrackedMedication(medication, evaluatedAt)) {
      continue;
    }

    const observation = getObservationForMedication(
      medication,
      observations
    );

    if (!observation) {
      findings.push(
        createMissingLoggingFinding(
          medication,
          options.physicianId,
          evaluatedAt
        )
      );
      continue;
    }

    const countFinding = createCountBasedFinding(
      medication,
      observation,
      options.physicianId,
      evaluatedAt
    );

    if (countFinding) {
      findings.push(countFinding);
      continue;
    }

    const recencyFinding = createRecencyFinding(
      medication,
      observation,
      options.physicianId,
      evaluatedAt
    );

    if (recencyFinding) {
      findings.push(recencyFinding);
      continue;
    }

    findings.push(
      createMissingLoggingFinding(medication, options.physicianId, evaluatedAt)
    );
  }

  return findings;
}
