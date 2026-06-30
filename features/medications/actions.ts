import {
  createMedication,
  deleteMedication,
  getMedicationById,
  listActiveMedicationsByPatient,
  listMedicationsByPatient,
} from "./service";
import { buildMedicationCreateInput } from "./service";
import type { MedicationFormValues } from "./validation";

export async function createMedicationRecord(
  values: MedicationFormValues
) {
  return createMedication(buildMedicationCreateInput(values));
}

export async function deleteMedicationRecord(
  medicationId: string
) {
  return deleteMedication(medicationId);
}

export async function getMedicationRecord(
  medicationId: string
) {
  return getMedicationById(medicationId);
}

export async function listMedicationRecordsByPatient(
  patientId: string
) {
  return listMedicationsByPatient(patientId);
}

export async function listActiveMedicationRecordsByPatient(
  patientId: string
) {
  return listActiveMedicationsByPatient(patientId);
}
