/**
 * =============================================================================
 * ChroniSync
 * Summary Service
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
import type { Summary } from "@/types/summary";

const COLLECTION = COLLECTIONS.SUMMARIES;

export type SummaryRecord = Summary;
export type SummaryCreateInput = Omit<
  SummaryRecord,
  "id" | "createdAt" | "updatedAt"
>;
export type SummaryUpdateInput = Partial<
  Omit<
    SummaryRecord,
    "id" | "patientId" | "createdAt" | "updatedAt"
  >
>;

function createRecordId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `sum_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createTimestamp(): Date {
  return new Date();
}

export function buildSummaryRecord(
  data: SummaryCreateInput
): SummaryRecord {
  const timestamp = createTimestamp();

  return {
    ...data,
    id: createRecordId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function createSummary(
  data: SummaryCreateInput
): Promise<SummaryRecord> {
  const record = buildSummaryRecord(data);
  await createFirestoreDocument<SummaryRecord>(
    COLLECTION,
    record.id,
    record
  );
  return record;
}

export async function getSummaryById(
  summaryId: string
): Promise<SummaryRecord | null> {
  return getFirestoreDocument<SummaryRecord>(COLLECTION, summaryId);
}

export async function listSummariesByPatient(
  patientId: string
): Promise<SummaryRecord[]> {
  return queryDocuments<SummaryRecord>(
    COLLECTION,
    whereEquals("patientId", patientId)
  );
}

export async function listPendingSummariesByPhysician(
  physicianId: string
): Promise<SummaryRecord[]> {
  return queryDocuments<SummaryRecord>(
    COLLECTION,
    whereEquals("physicianId", physicianId),
    whereEquals("status", "pending_review")
  );
}

export async function updateSummary(
  summaryId: string,
  updates: SummaryUpdateInput
): Promise<SummaryRecord> {
  const current = await getSummaryById(summaryId);

  if (!current) {
    throw new Error(`Summary ${summaryId} was not found.`);
  }

  const next: SummaryRecord = {
    ...current,
    ...updates,
    updatedAt: createTimestamp(),
  };

  await updateFirestoreDocument<SummaryRecord>(
    COLLECTION,
    summaryId,
    next
  );

  return next;
}

export async function submitSummaryForReview(
  summaryId: string
): Promise<SummaryRecord> {
  return updateSummary(summaryId, {
    status: "pending_review",
  });
}

export async function approveSummary(
  summaryId: string,
  reviewedBy?: string
): Promise<SummaryRecord> {
  return updateSummary(summaryId, {
    status: "approved",
    reviewedAt: createTimestamp(),
    ...(reviewedBy ? { reviewedBy } : {}),
  });
}

export async function rejectSummary(
  summaryId: string,
  reviewedBy?: string
): Promise<SummaryRecord> {
  return updateSummary(summaryId, {
    status: "rejected",
    reviewedAt: createTimestamp(),
    ...(reviewedBy ? { reviewedBy } : {}),
  });
}

export async function publishSummary(
  summaryId: string
): Promise<SummaryRecord> {
  return updateSummary(summaryId, {
    status: "published",
    publishedAt: createTimestamp(),
  });
}

export async function deleteSummary(
  summaryId: string
): Promise<void> {
  await deleteFirestoreDocument(COLLECTION, summaryId);
}
