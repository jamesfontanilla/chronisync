import { logger } from "@/lib/logger";
import { evaluateAndPersistAlertsForPatient } from "@/lib/rules/pipeline";

import {
  buildVitalCreateInput,
  createVital,
  deleteVital,
  getVitalById,
  listVitalsByPatient,
  listVitalsByType,
} from "./service";
import type { VitalFormValues } from "./validation";

export async function createVitalRecord(values: VitalFormValues) {
  // 1. Persist the vital record to Firestore.
  const vital = await createVital(buildVitalCreateInput(values));

  // 2. Fire the clinical alert pipeline. This is intentionally fire-and-forget:
  //    a failure here must never roll back the vital save.
  //    The pipeline fetches the patient's full vital history, runs
  //    evaluateClinicalRules() (CUSUM, EWMA, Mann-Kendall, OLS slope), and
  //    persists any net-new findings as Alert records via createAlert().
  evaluateAndPersistAlertsForPatient(vital.patientId).catch((error) => {
    logger.error("Alert pipeline failed after vital save", {
      vitalId: vital.id,
      patientId: vital.patientId,
      error: error instanceof Error ? error.message : String(error),
    });
  });

  return vital;
}

export async function deleteVitalRecord(vitalId: string) {
  return deleteVital(vitalId);
}

export async function getVitalRecord(vitalId: string) {
  return getVitalById(vitalId);
}

export async function listVitalRecordsByPatient(patientId: string) {
  return listVitalsByPatient(patientId);
}

export async function listVitalRecordsByType(
  patientId: string,
  type: VitalFormValues["type"]
) {
  return listVitalsByType(patientId, type);
}
