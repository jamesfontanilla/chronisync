/**
 * =============================================================================
 * ChroniSync
 * Symptom Service
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
import type { Symptom } from "@/types/symptom";

const COLLECTION = COLLECTIONS.SYMPTOMS;

export type SymptomRecord = Symptom;
export type SymptomCreateInput = Omit<
  SymptomRecord,
  "id" | "createdAt" | "updatedAt"
>;
export type SymptomUpdateInput = Partial<
  Omit<
    SymptomRecord,
    "id" | "patientId" | "createdAt" | "updatedAt"
  >
>;

function createRecordId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `sym_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createTimestamp(): Date {
  return new Date();
}

export function buildSymptomRecord(
  data: SymptomCreateInput
): SymptomRecord {
  const timestamp = createTimestamp();

  return {
    ...data,
    id: createRecordId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function createSymptom(
  data: SymptomCreateInput
): Promise<SymptomRecord> {
  const record = buildSymptomRecord(data);
  await createFirestoreDocument<SymptomRecord>(
    COLLECTION,
    record.id,
    record
  );
  return record;
}

export async function getSymptomById(
  symptomId: string
): Promise<SymptomRecord | null> {
  return getFirestoreDocument<SymptomRecord>(COLLECTION, symptomId);
}

export async function listSymptomsByPatient(
  patientId: string
): Promise<SymptomRecord[]> {
  return queryDocuments<SymptomRecord>(
    COLLECTION,
    whereEquals("patientId", patientId)
  );
}

export async function listActiveSymptomsByPatient(
  patientId: string
): Promise<SymptomRecord[]> {
  const records = await listSymptomsByPatient(patientId);
  return records.filter((record) => record.status !== "resolved");
}

export async function updateSymptom(
  symptomId: string,
  updates: SymptomUpdateInput
): Promise<SymptomRecord> {
  const current = await getSymptomById(symptomId);

  if (!current) {
    throw new Error(`Symptom ${symptomId} was not found.`);
  }

  const next: SymptomRecord = {
    ...current,
    ...updates,
    updatedAt: createTimestamp(),
  };

  await updateFirestoreDocument<SymptomRecord>(
    COLLECTION,
    symptomId,
    next
  );

  return next;
}

export async function deleteSymptom(
  symptomId: string
): Promise<void> {
  await deleteFirestoreDocument(COLLECTION, symptomId);
}
