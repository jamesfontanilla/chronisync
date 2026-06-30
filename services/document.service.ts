/**
 * =============================================================================
 * ChroniSync
 * Document Service
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
import { buildPatientDocumentPath } from "@/lib/firebase/storage";
import type { Document as ClinicalDocument } from "@/types/document";

const COLLECTION = COLLECTIONS.DOCUMENTS;

export type DocumentRecord = ClinicalDocument;
export type DocumentCreateInput = Omit<
  DocumentRecord,
  "id" | "createdAt" | "updatedAt"
>;
export type DocumentUpdateInput = Partial<
  Omit<
    DocumentRecord,
    "id" | "patientId" | "createdAt" | "updatedAt"
  >
>;

function createRecordId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `doc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createTimestamp(): Date {
  return new Date();
}

export function buildDocumentRecord(
  data: DocumentCreateInput
): DocumentRecord {
  const timestamp = createTimestamp();

  return {
    ...data,
    id: createRecordId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function buildDocumentPath(
  patientId: string,
  fileName: string
): string {
  return buildPatientDocumentPath(patientId, fileName);
}

export async function createDocumentRecord(
  data: DocumentCreateInput
): Promise<DocumentRecord> {
  const record = buildDocumentRecord(data);
  await createFirestoreDocument<DocumentRecord>(
    COLLECTION,
    record.id,
    record
  );
  return record;
}

export async function getDocumentById(
  documentId: string
): Promise<DocumentRecord | null> {
  return getFirestoreDocument<DocumentRecord>(COLLECTION, documentId);
}

export async function listDocumentsByPatient(
  patientId: string
): Promise<DocumentRecord[]> {
  return queryDocuments<DocumentRecord>(
    COLLECTION,
    whereEquals("patientId", patientId)
  );
}

export async function listDocumentsByStatus(
  status: DocumentRecord["status"]
): Promise<DocumentRecord[]> {
  return queryDocuments<DocumentRecord>(
    COLLECTION,
    whereEquals("status", status)
  );
}

export async function listPendingDocumentsByPatient(
  patientId: string
): Promise<DocumentRecord[]> {
  const records = await listDocumentsByPatient(patientId);
  return records.filter(
    (record) =>
      record.status === "pending" ||
      record.status === "processing" ||
      record.status === "review_required"
  );
}

export async function updateDocumentRecord(
  documentId: string,
  updates: DocumentUpdateInput
): Promise<DocumentRecord> {
  const current = await getDocumentById(documentId);

  if (!current) {
    throw new Error(`Document ${documentId} was not found.`);
  }

  const next: DocumentRecord = {
    ...current,
    ...updates,
    updatedAt: createTimestamp(),
  };

  await updateFirestoreDocument<DocumentRecord>(
    COLLECTION,
    documentId,
    next
  );

  return next;
}

export async function markDocumentProcessing(
  documentId: string
): Promise<DocumentRecord> {
  return updateDocumentRecord(documentId, {
    status: "processing",
  });
}

export async function submitDocumentForReview(
  documentId: string
): Promise<DocumentRecord> {
  return updateDocumentRecord(documentId, {
    status: "review_required",
  });
}

export async function approveDocument(
  documentId: string,
  reviewedBy?: string
): Promise<DocumentRecord> {
  return updateDocumentRecord(documentId, {
    status: "approved",
    reviewedAt: createTimestamp(),
    ...(reviewedBy ? { reviewedBy } : {}),
  });
}

export async function rejectDocument(
  documentId: string,
  reviewedBy?: string
): Promise<DocumentRecord> {
  return updateDocumentRecord(documentId, {
    status: "rejected",
    reviewedAt: createTimestamp(),
    ...(reviewedBy ? { reviewedBy } : {}),
  });
}

export async function deleteDocumentRecord(
  documentId: string
): Promise<void> {
  await deleteFirestoreDocument(COLLECTION, documentId);
}
