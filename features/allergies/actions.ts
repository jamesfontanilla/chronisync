import {
  buildAllergyCreateInput,
  createAllergy,
  deleteAllergy,
  getAllergyById,
  listActiveAllergiesByPatient,
  listAllergiesByPatient,
} from "./service";
import type { AllergyFormValues } from "./validation";

export async function createAllergyRecord(values: AllergyFormValues) {
  return createAllergy(buildAllergyCreateInput(values));
}

export async function deleteAllergyRecord(allergyId: string) {
  return deleteAllergy(allergyId);
}

export async function getAllergyRecord(allergyId: string) {
  return getAllergyById(allergyId);
}

export async function listAllergyRecordsByPatient(patientId: string) {
  return listAllergiesByPatient(patientId);
}

export async function listActiveAllergyRecordsByPatient(patientId: string) {
  return listActiveAllergiesByPatient(patientId);
}
