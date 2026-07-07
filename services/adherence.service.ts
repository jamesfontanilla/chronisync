/**
 * =============================================================================
 * ChroniSync
 * Adherence Service
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
import type { AdherenceLog } from "@/types/adherence";

const COLLECTION = COLLECTIONS.ADHERENCE;

export type AdherenceLogRecord = AdherenceLog;
export type AdherenceLogCreateInput = Omit<
  AdherenceLogRecord,
  "id" | "createdAt" | "updatedAt"
>;
export type AdherenceLogUpdateInput = Partial<
  Omit<
    AdherenceLogRecord,
    "id" | "patientId" | "createdAt" | "updatedAt"
  >
>;

function createRecordId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `adh_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createTimestamp(): Date {
  return new Date();
}

export function buildAdherenceLogRecord(
  data: AdherenceLogCreateInput
): AdherenceLogRecord {
  const timestamp = createTimestamp();

  return {
    ...data,
    recordedByRole: data.recordedByRole ?? "patient",
    id: createRecordId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function createAdherenceLog(
  data: AdherenceLogCreateInput
): Promise<AdherenceLogRecord> {
  const record = buildAdherenceLogRecord(data);
  await createFirestoreDocument<AdherenceLogRecord>(
    COLLECTION,
    record.id,
    record
  );
  return record;
}

export async function getAdherenceLogById(
  logId: string
): Promise<AdherenceLogRecord | null> {
  return getFirestoreDocument<AdherenceLogRecord>(COLLECTION, logId);
}

export async function listAdherenceLogsByPatient(
  patientId: string
): Promise<AdherenceLogRecord[]> {
  return queryDocuments<AdherenceLogRecord>(
    COLLECTION,
    whereEquals("patientId", patientId)
  );
}

export async function updateAdherenceLog(
  logId: string,
  updates: AdherenceLogUpdateInput
): Promise<AdherenceLogRecord> {
  const current = await getAdherenceLogById(logId);

  if (!current) {
    throw new Error(`Adherence log ${logId} was not found.`);
  }

  const next: AdherenceLogRecord = {
    ...current,
    ...updates,
    updatedAt: createTimestamp(),
  };

  await updateFirestoreDocument<AdherenceLogRecord>(
    COLLECTION,
    logId,
    next
  );

  return next;
}

export async function deleteAdherenceLog(
  logId: string
): Promise<void> {
  await deleteFirestoreDocument(COLLECTION, logId);
}
