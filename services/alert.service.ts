/**
 * =============================================================================
 * ChroniSync
 * Alert Service
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
import type { Alert } from "@/types/alert";

const COLLECTION = COLLECTIONS.ALERTS;

export type AlertRecord = Alert;
export type AlertCreateInput = Omit<
  AlertRecord,
  "id" | "createdAt" | "updatedAt"
>;
export type AlertUpdateInput = Partial<
  Omit<
    AlertRecord,
    "id" | "patientId" | "createdAt" | "updatedAt"
  >
>;

function createRecordId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `alt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createTimestamp(): Date {
  return new Date();
}

export function buildAlertRecord(
  data: AlertCreateInput
): AlertRecord {
  const timestamp = createTimestamp();

  return {
    ...data,
    id: createRecordId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function createAlert(
  data: AlertCreateInput
): Promise<AlertRecord> {
  const record = buildAlertRecord(data);
  await createFirestoreDocument<AlertRecord>(
    COLLECTION,
    record.id,
    record
  );
  return record;
}

export async function getAlertById(
  alertId: string
): Promise<AlertRecord | null> {
  return getFirestoreDocument<AlertRecord>(COLLECTION, alertId);
}

export async function listAlertsByPatient(
  patientId: string
): Promise<AlertRecord[]> {
  return queryDocuments<AlertRecord>(
    COLLECTION,
    whereEquals("patientId", patientId)
  );
}

export async function listOpenAlertsByPatient(
  patientId: string
): Promise<AlertRecord[]> {
  const records = await listAlertsByPatient(patientId);
  return records.filter(
    (record) =>
      record.status !== "resolved" &&
      record.status !== "dismissed"
  );
}

export async function updateAlert(
  alertId: string,
  updates: AlertUpdateInput
): Promise<AlertRecord> {
  const current = await getAlertById(alertId);

  if (!current) {
    throw new Error(`Alert ${alertId} was not found.`);
  }

  const next: AlertRecord = {
    ...current,
    ...updates,
    updatedAt: createTimestamp(),
  };

  await updateFirestoreDocument<AlertRecord>(
    COLLECTION,
    alertId,
    next
  );

  return next;
}

export async function acknowledgeAlert(
  alertId: string,
  acknowledgedBy?: string
): Promise<AlertRecord> {
  return updateAlert(alertId, {
    status: "acknowledged",
    acknowledgedAt: createTimestamp(),
    ...(acknowledgedBy
      ? { acknowledgedBy }
      : {}),
  });
}

export async function resolveAlert(
  alertId: string,
  notes?: string
): Promise<AlertRecord> {
  return updateAlert(alertId, {
    status: "resolved",
    resolvedAt: createTimestamp(),
    ...(notes ? { notes } : {}),
  });
}

export async function dismissAlert(
  alertId: string,
  notes?: string
): Promise<AlertRecord> {
  return updateAlert(alertId, {
    status: "dismissed",
    resolvedAt: createTimestamp(),
    ...(notes ? { notes } : {}),
  });
}

export async function deleteAlert(
  alertId: string
): Promise<void> {
  await deleteFirestoreDocument(COLLECTION, alertId);
}
