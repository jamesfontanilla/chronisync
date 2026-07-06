/**
 * =============================================================================
 * ChroniSync
 * Vital Service
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
import type {
  BloodPressureVital,
  NumericVital,
  Vital,
} from "@/types/vital";

const COLLECTION = COLLECTIONS.VITALS;

export type VitalRecord = Vital;
export type VitalCreateInput =
  | Omit<BloodPressureVital, "id" | "createdAt" | "updatedAt">
  | Omit<NumericVital, "id" | "createdAt" | "updatedAt">;
export type VitalUpdateInput =
  | Partial<
      Omit<
        BloodPressureVital,
        "id" | "patientId" | "type" | "createdAt" | "updatedAt"
      >
    >
  | Partial<
      Omit<
        NumericVital,
        "id" | "patientId" | "type" | "createdAt" | "updatedAt"
      >
    >;

function createRecordId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `vit_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createTimestamp(): Date {
  return new Date();
}

export function buildVitalRecord(
  data: VitalCreateInput
): VitalRecord {
  const timestamp = createTimestamp();

  return {
    ...data,
    recordedByRole: data.recordedByRole ?? "patient",
    id: createRecordId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  } as VitalRecord;
}

export async function createVital(
  data: VitalCreateInput
): Promise<VitalRecord> {
  const record = buildVitalRecord(data);
  await createFirestoreDocument<VitalRecord>(
    COLLECTION,
    record.id,
    record
  );
  return record;
}

export async function getVitalById(
  vitalId: string
): Promise<VitalRecord | null> {
  return getFirestoreDocument<VitalRecord>(COLLECTION, vitalId);
}

export async function listVitalsByPatient(
  patientId: string
): Promise<VitalRecord[]> {
  return queryDocuments<VitalRecord>(
    COLLECTION,
    whereEquals("patientId", patientId)
  );
}

export async function listVitalsByType(
  patientId: string,
  type: VitalRecord["type"]
): Promise<VitalRecord[]> {
  return queryDocuments<VitalRecord>(
    COLLECTION,
    whereEquals("patientId", patientId),
    whereEquals("type", type)
  );
}

export async function updateVital(
  vitalId: string,
  updates: VitalUpdateInput
): Promise<VitalRecord> {
  const current = await getVitalById(vitalId);

  if (!current) {
    throw new Error(`Vital ${vitalId} was not found.`);
  }

  const next: VitalRecord = {
    ...current,
    ...updates,
    updatedAt: createTimestamp(),
  } as VitalRecord;

  await updateFirestoreDocument<VitalRecord>(
    COLLECTION,
    vitalId,
    next
  );

  return next;
}

export async function deleteVital(
  vitalId: string
): Promise<void> {
  await deleteFirestoreDocument(COLLECTION, vitalId);
}
