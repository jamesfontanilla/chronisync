/**
 * =============================================================================
 * ChroniSync
 * Allergy Service
 * =============================================================================
 */

import { COLLECTIONS } from "@/config/firebase";
import {
  createDocument as createFirestoreDocument,
  deleteDocument as deleteFirestoreDocument,
  getDocument as getFirestoreDocument,
  queryDocuments,
  updateDocument as updateFirestoreDocument,
  whereEquals,
} from "@/lib/firebase/firestore";
import type { Allergy } from "@/types/allergy";

const COLLECTION = COLLECTIONS.ALLERGIES;

export type AllergyRecord = Allergy;
export type AllergyCreateInput = Omit<
  AllergyRecord,
  "id" | "createdAt" | "updatedAt"
>;
export type AllergyUpdateInput = Partial<
  Omit<
    AllergyRecord,
    "id" | "patientId" | "createdAt" | "updatedAt"
  >
>;

function createRecordId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `all_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createTimestamp(): Date {
  return new Date();
}

export function buildAllergyRecord(
  data: AllergyCreateInput
): AllergyRecord {
  const timestamp = createTimestamp();

  return {
    ...data,
    id: createRecordId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function createAllergy(
  data: AllergyCreateInput
): Promise<AllergyRecord> {
  const record = buildAllergyRecord(data);
  await createFirestoreDocument<AllergyRecord>(
    COLLECTION,
    record.id,
    record
  );
  return record;
}

export async function getAllergyById(
  allergyId: string
): Promise<AllergyRecord | null> {
  return getFirestoreDocument<AllergyRecord>(COLLECTION, allergyId);
}

export async function listAllergiesByPatient(
  patientId: string
): Promise<AllergyRecord[]> {
  return queryDocuments<AllergyRecord>(
    COLLECTION,
    whereEquals("patientId", patientId)
  );
}

export async function listActiveAllergiesByPatient(
  patientId: string
): Promise<AllergyRecord[]> {
  const records = await listAllergiesByPatient(patientId);
  return records.filter((record) => record.status === "active");
}

export async function updateAllergy(
  allergyId: string,
  updates: AllergyUpdateInput
): Promise<AllergyRecord> {
  const current = await getAllergyById(allergyId);

  if (!current) {
    throw new Error(`Allergy ${allergyId} was not found.`);
  }

  const next: AllergyRecord = {
    ...current,
    ...updates,
    updatedAt: createTimestamp(),
  };

  await updateFirestoreDocument<AllergyRecord>(
    COLLECTION,
    allergyId,
    next
  );

  return next;
}

export async function deleteAllergy(
  allergyId: string
): Promise<void> {
  await deleteFirestoreDocument(COLLECTION, allergyId);
}
