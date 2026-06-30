/**
 * =============================================================================
 * ChroniSync
 * Medication Service
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
import type { Medication } from "@/types/medication";

const COLLECTION = COLLECTIONS.MEDICATIONS;

export type MedicationRecord = Medication;
export type MedicationCreateInput = Omit<
  MedicationRecord,
  "id" | "createdAt" | "updatedAt"
>;
export type MedicationUpdateInput = Partial<
  Omit<
    MedicationRecord,
    "id" | "patientId" | "createdAt" | "updatedAt"
  >
>;

function createRecordId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `med_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createTimestamp(): Date {
  return new Date();
}

export function buildMedicationRecord(
  data: MedicationCreateInput
): MedicationRecord {
  const timestamp = createTimestamp();

  return {
    ...data,
    id: createRecordId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function createMedication(
  data: MedicationCreateInput
): Promise<MedicationRecord> {
  const record = buildMedicationRecord(data);
  await createFirestoreDocument<MedicationRecord>(
    COLLECTION,
    record.id,
    record
  );
  return record;
}

export async function getMedicationById(
  medicationId: string
): Promise<MedicationRecord | null> {
  return getFirestoreDocument<MedicationRecord>(
    COLLECTION,
    medicationId
  );
}

export async function listMedicationsByPatient(
  patientId: string
): Promise<MedicationRecord[]> {
  return queryDocuments<MedicationRecord>(
    COLLECTION,
    whereEquals("patientId", patientId)
  );
}

export async function listActiveMedicationsByPatient(
  patientId: string
): Promise<MedicationRecord[]> {
  const records = await listMedicationsByPatient(patientId);
  return records.filter((record) => record.status === "active");
}

export async function updateMedication(
  medicationId: string,
  updates: MedicationUpdateInput
): Promise<MedicationRecord> {
  const current = await getMedicationById(medicationId);

  if (!current) {
    throw new Error(`Medication ${medicationId} was not found.`);
  }

  const next: MedicationRecord = {
    ...current,
    ...updates,
    updatedAt: createTimestamp(),
  };

  await updateFirestoreDocument<MedicationRecord>(
    COLLECTION,
    medicationId,
    next
  );

  return next;
}

export async function deleteMedication(
  medicationId: string
): Promise<void> {
  await deleteFirestoreDocument(COLLECTION, medicationId);
}
