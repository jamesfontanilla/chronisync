/**
 * =============================================================================
 * ChroniSync
 * Clinical Alert Pipeline
 *
 * Bridges a newly written vital record to the full engine evaluation cycle:
 *   listVitalsByPatient → evaluateClinicalRules → dedup → createAlert
 *
 * Call evaluateAndPersistAlertsForPatient() immediately after any vital write.
 * The function is intentionally side-effect-only: callers should NOT block on
 * its result — fire-and-forget inside a try/catch so a failed alert pass never
 * rolls back a successful vital save.
 * =============================================================================
 */

import { COLLECTIONS } from "@/config/firebase";
import { getDocument } from "@/lib/firebase/firestore";
import { logger } from "@/lib/logger";
import { createAlert } from "@/services/alert.service";
import { listOpenAlertsByPatient } from "@/services/alert.service";
import { listVitalsByPatient } from "@/services/vital.service";
import { listActiveMedicationsByPatient } from "@/services/medication.service";
import { listAdherenceLogsByPatient } from "@/services/adherence.service";
import type { Vital } from "@/types/vital";
import type { Disease } from "@/types/disease";
import type { Patient } from "@/types/patient";
import type { Medication } from "@/types/medication";
import type { AdherenceLog } from "@/types/adherence";

import { buildAdherenceObservationsFromLogs } from "./adherence";

import {
  buildClinicalAlertInputs,
  evaluateClinicalRules,
} from "./engine";

/* -------------------------------------------------------------------------- */
/*                            Types                                           */
/* -------------------------------------------------------------------------- */

export interface AlertPipelineOptions {
  /**
   * Override the evaluation timestamp. Defaults to now.
   * Useful in tests.
   */
  evaluatedAt?: Date;
}

/* -------------------------------------------------------------------------- */
/*                          Internal helpers                                  */
/* -------------------------------------------------------------------------- */

/**
 * Fetches the patient record so we can read physicianId and chronicConditions.
 * Returns null on any error — the pipeline degrades gracefully.
 */
async function fetchPatient(patientId: string): Promise<Patient | null> {
  try {
    // Patient documents are stored with the UID as the document key.
    return await getDocument<Patient>(COLLECTIONS.PATIENTS, patientId);
  } catch (error) {
    logger.warn("Alert pipeline: could not fetch patient", {
      patientId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Maps chronicConditions from a Patient record to the Disease shape expected
 * by the rules engine. The engine only uses `name` and optionally `icd10Code`
 * for routing flags, both of which are present on ChronicCondition.
 */
function conditionsAsDiseases(patient: Patient): Disease[] {
  return patient.chronicConditions.map((condition) => ({
    id: condition.id,
    patientId: patient.id,
    name: condition.name,
    status: "active" as const,
    // Omit icd10Code and optional fields rather than assigning undefined
    // (exactOptionalPropertyTypes is enabled in this project).
    ...(condition.diagnosedAt ? { diagnosedAt: condition.diagnosedAt } : {}),
    ...(condition.notes ? { notes: condition.notes } : {}),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

/**
 * Returns true when an identical open alert (same patientId + ruleId) already
 * exists. Prevents duplicate open alerts from accumulating on every vital save.
 */
function isDuplicate(
  openAlerts: Awaited<ReturnType<typeof listOpenAlertsByPatient>>,
  patientId: string,
  ruleId: string | undefined
): boolean {
  if (!ruleId) {
    return false;
  }

  return openAlerts.some(
    (alert) =>
      alert.patientId === patientId &&
      alert.ruleId === ruleId &&
      alert.status !== "resolved" &&
      alert.status !== "dismissed"
  );
}

/* -------------------------------------------------------------------------- */
/*                       Public pipeline entry point                          */
/* -------------------------------------------------------------------------- */

/**
 * Runs the clinical rules engine for a patient and persists any new findings
 * that are not already tracked by an open alert.
 *
 * Usage after a vital save:
 * ```ts
 * // fire-and-forget — do NOT await at the call site
 * evaluateAndPersistAlertsForPatient(vital.patientId).catch((error) => {
 *   logger.error("Alert pipeline failed", error);
 * });
 * ```
 *
 * @returns The Alert records that were newly created (empty array if nothing
 *   fired or if the pipeline encountered a recoverable error).
 */
export async function evaluateAndPersistAlertsForPatient(
  patientId: string,
  options: AlertPipelineOptions = {}
): Promise<Awaited<ReturnType<typeof createAlert>>[]> {
  const evaluatedAt = options.evaluatedAt ?? new Date();

  /* -------- 1. Fetch vitals, medications, and adherence ------------------ */
  let vitals: Vital[] = [];
  let medications: Medication[] = [];
  let adherenceLogs: AdherenceLog[] = [];

  try {
    const [fetchedVitals, fetchedMedications, fetchedAdherence] = await Promise.all([
      listVitalsByPatient(patientId),
      listActiveMedicationsByPatient(patientId),
      listAdherenceLogsByPatient(patientId)
    ]);
    vitals = fetchedVitals;
    medications = fetchedMedications;
    adherenceLogs = fetchedAdherence;
  } catch (error) {
    logger.error("Alert pipeline: failed to fetch patient clinical data", {
      patientId,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }

  if (vitals.length === 0 && medications.length === 0) {
    return [];
  }

  const adherenceObservations = buildAdherenceObservationsFromLogs(adherenceLogs, evaluatedAt);

  /* -------- 2. Best-effort patient lookup (for routing + physicianId) ------ */
  const patient = await fetchPatient(patientId);
  const diseases: Disease[] = patient ? conditionsAsDiseases(patient) : [];
  const physicianId = patient?.physicianId;

  /* -------- 3. Run the deterministic rules engine -------------------------- */
  let findings;

  try {
    findings = evaluateClinicalRules({
      vitals,
      medications,
      adherenceObservations,
      // Always pass an array (possibly empty) — never undefined — because
      // exactOptionalPropertyTypes does not allow Disease[] | undefined.
      diseases,
      ...(physicianId ? { physicianId } : {}),
      evaluatedAt,
    });
  } catch (error) {
    logger.error("Alert pipeline: rules engine threw", {
      patientId,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }

  if (findings.length === 0) {
    return [];
  }

  /* -------- 4. Fetch open alerts for deduplication ------------------------- */
  let openAlerts: Awaited<ReturnType<typeof listOpenAlertsByPatient>> = [];

  try {
    openAlerts = await listOpenAlertsByPatient(patientId);
  } catch (error) {
    // Non-fatal: skip dedup and persist everything rather than silently dropping.
    logger.warn("Alert pipeline: could not fetch open alerts for dedup", {
      patientId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  /* -------- 5. Convert findings → AlertCreateInput records ----------------- */
  const inputs = buildClinicalAlertInputs(findings);

  /* -------- 6. Persist only net-new alerts --------------------------------- */
  const created: Awaited<ReturnType<typeof createAlert>>[] = [];

  for (const input of inputs) {
    if (isDuplicate(openAlerts, patientId, input.ruleId)) {
      logger.info("Alert pipeline: skipping duplicate open alert", {
        patientId,
        ruleId: input.ruleId,
      });
      continue;
    }

    try {
      const alert = await createAlert(input);
      created.push(alert);

      logger.info("Alert pipeline: persisted new alert", {
        alertId: alert.id,
        patientId,
        ruleId: alert.ruleId,
        level: alert.level,
      });
    } catch (error) {
      logger.error("Alert pipeline: failed to persist alert", {
        patientId,
        ruleId: input.ruleId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return created;
}
