import {
  buildDiseaseCreateInput,
  createDisease,
  deleteDisease,
  getDiseaseById,
  listDiseasesByPatient,
} from "./service";
import type { DiseaseFormValues } from "./validation";

export async function createDiseaseRecord(values: DiseaseFormValues) {
  return createDisease(buildDiseaseCreateInput(values));
}

export async function deleteDiseaseRecord(diseaseId: string) {
  return deleteDisease(diseaseId);
}

export async function getDiseaseRecord(diseaseId: string) {
  return getDiseaseById(diseaseId);
}

export async function listDiseaseRecordsByPatient(patientId: string) {
  return listDiseasesByPatient(patientId);
}
