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
  return createVital(buildVitalCreateInput(values));
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
