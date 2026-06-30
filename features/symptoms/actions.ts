import {
  buildSymptomCreateInput,
  createSymptom,
  deleteSymptom,
  getSymptomById,
  listActiveSymptomsByPatient,
  listSymptomsByPatient,
} from "./service";
import type { SymptomFormValues } from "./validation";

export async function createSymptomRecord(values: SymptomFormValues) {
  return createSymptom(buildSymptomCreateInput(values));
}

export async function deleteSymptomRecord(symptomId: string) {
  return deleteSymptom(symptomId);
}

export async function getSymptomRecord(symptomId: string) {
  return getSymptomById(symptomId);
}

export async function listSymptomRecordsByPatient(patientId: string) {
  return listSymptomsByPatient(patientId);
}

export async function listActiveSymptomRecordsByPatient(patientId: string) {
  return listActiveSymptomsByPatient(patientId);
}
