/**
 * =============================================================================
 * ChroniSync
 * Provenance Feature Service
 * =============================================================================
 */

import {
  createDocument as createFirestoreDocument,
  deleteDocument as deleteFirestoreDocument,
  getDocument as getFirestoreDocument,
  queryDocuments,
  updateDocument as updateFirestoreDocument,
  whereEquals,
} from "@/lib/firebase/firestore";
import type { QueryConstraint } from "firebase/firestore";
import { formatDateTime, humanize } from "@/lib/utils";
import {
  buildProvenanceRecord as buildPrivacyProvenanceRecord,
  describeProvenanceRecord,
  formatProvenanceReference,
  summarizeProvenanceRecords as summarizePrivacyProvenanceRecords,
} from "@/lib/privacy/provenance";

import type {
  ProvenanceCreateInput,
  ProvenanceFilters,
  ProvenanceRecord,
  ProvenanceSortOrder,
  ProvenanceSummary,
  ProvenanceUpdateInput,
  ProvenanceViewModel,
} from "./types";

const COLLECTION = "provenance";

export type {
  ProvenanceActionState,
  ProvenanceCreateInput,
  ProvenanceFilters,
  ProvenanceRecord,
  ProvenanceSourceKind,
  ProvenanceSubjectType,
  ProvenanceSortOrder,
  ProvenanceSummary,
  ProvenanceUpdateInput,
  ProvenanceViewModel,
} from "./types";

function createTimestamp(): Date {
  return new Date();
}

function normalizeDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }

  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  return createTimestamp();
}

function normalizeRecord(record: ProvenanceRecord): ProvenanceRecord {
  return {
    ...record,
    createdAt: normalizeDate(record.createdAt),
    updatedAt: normalizeDate(record.updatedAt),
    ...(record.reviewedAt
      ? { reviewedAt: normalizeDate(record.reviewedAt) }
      : {}),
  };
}

function matchesQuery(record: ProvenanceRecord, query: string): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  const haystack = [
    record.subjectType,
    record.subjectId,
    record.sourceKind,
    record.sourceId,
    record.sourceLabel,
    record.inputFingerprint,
    record.outputFingerprint,
    record.model,
    record.reviewedBy,
    record.redacted ? "redacted" : "",
    record.metadata ? JSON.stringify(record.metadata) : "",
    formatProvenanceReference(record),
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

function sortProvenanceRecords(
  records: ProvenanceRecord[],
  sort: ProvenanceSortOrder = "newest"
): ProvenanceRecord[] {
  const copy = [...records];

  switch (sort) {
    case "oldest":
      return copy.sort(
        (left, right) => left.updatedAt.getTime() - right.updatedAt.getTime()
      );
    case "source":
      return copy.sort((left, right) =>
        (left.sourceLabel ?? humanize(left.sourceKind)).localeCompare(
          right.sourceLabel ?? humanize(right.sourceKind)
        )
      );
    case "subject":
      return copy.sort((left, right) =>
        humanize(left.subjectType).localeCompare(humanize(right.subjectType))
      );
    case "confidence":
      return copy.sort((left, right) => {
        const leftConfidence = left.confidence ?? -1;
        const rightConfidence = right.confidence ?? -1;

        if (rightConfidence !== leftConfidence) {
          return rightConfidence - leftConfidence;
        }

        return right.updatedAt.getTime() - left.updatedAt.getTime();
      });
    case "newest":
    default:
      return copy.sort(
        (left, right) => right.updatedAt.getTime() - left.updatedAt.getTime()
      );
  }
}

function buildQueryConstraints(filters: ProvenanceFilters) {
  const constraints: QueryConstraint[] = [];

  if (filters.subjectType) {
    constraints.push(whereEquals("subjectType", filters.subjectType));
  }

  if (filters.subjectId) {
    constraints.push(whereEquals("subjectId", filters.subjectId));
  }

  if (filters.sourceKind) {
    constraints.push(whereEquals("sourceKind", filters.sourceKind));
  }

  if (filters.sourceId) {
    constraints.push(whereEquals("sourceId", filters.sourceId));
  }

  if (filters.redacted !== undefined) {
    constraints.push(whereEquals("redacted", filters.redacted));
  }

  return constraints;
}

export function buildProvenanceRecord(
  data: ProvenanceCreateInput
): ProvenanceRecord {
  const record = buildPrivacyProvenanceRecord(data);

  return normalizeRecord({
    ...record,
    updatedAt: record.createdAt,
  });
}

export function buildProvenanceViewModel(
  provenance: ProvenanceRecord
): ProvenanceViewModel {
  const sourceLabel = provenance.sourceLabel ?? humanize(provenance.sourceKind);

  return {
    provenance,
    subjectLabel: humanize(provenance.subjectType),
    sourceLabel,
    confidenceLabel:
      provenance.confidence !== undefined
        ? `${Math.round(provenance.confidence * 100)}% confidence`
        : "No confidence score",
    timeLabel: formatDateTime(provenance.updatedAt),
    summary: `${describeProvenanceRecord(provenance)} - ${formatProvenanceReference(
      provenance
    )}`,
    isRedacted: provenance.redacted,
  };
}

export function summarizeProvenanceSnapshot(
  records: ProvenanceRecord[]
): ProvenanceSummary {
  return summarizePrivacyProvenanceRecords(records);
}

export function summarizeProvenanceRecords(
  records: ProvenanceRecord[]
): ProvenanceSummary {
  return summarizeProvenanceSnapshot(records);
}

export function getProvenanceSubjectLabel(
  subjectType: ProvenanceRecord["subjectType"]
): string {
  return humanize(subjectType);
}

export function getProvenanceSourceLabel(
  sourceKind: ProvenanceRecord["sourceKind"]
): string {
  return humanize(sourceKind);
}

export async function createProvenanceRecord(
  data: ProvenanceCreateInput
): Promise<ProvenanceRecord> {
  const record = buildProvenanceRecord(data);

  await createFirestoreDocument<ProvenanceRecord>(
    COLLECTION,
    record.id,
    record
  );

  return record;
}

export async function getProvenanceRecordById(
  provenanceId: string
): Promise<ProvenanceRecord | null> {
  const record = await getFirestoreDocument<ProvenanceRecord>(
    COLLECTION,
    provenanceId
  );

  return record ? normalizeRecord(record) : null;
}

export async function listProvenanceRecordsBySubject(
  subjectType: ProvenanceRecord["subjectType"],
  subjectId: string
): Promise<ProvenanceRecord[]> {
  return listProvenanceRecordsByFilters({ subjectType, subjectId });
}

export async function listProvenanceRecordsBySourceKind(
  sourceKind: ProvenanceRecord["sourceKind"]
): Promise<ProvenanceRecord[]> {
  return listProvenanceRecordsByFilters({ sourceKind });
}

export async function listProvenanceRecordsByFilters(
  filters: ProvenanceFilters = {}
): Promise<ProvenanceRecord[]> {
  const queryConstraints = buildQueryConstraints(filters);
  const baseRecords = queryConstraints.length
    ? await queryDocuments<ProvenanceRecord>(
        COLLECTION,
        ...queryConstraints
      )
    : await queryDocuments<ProvenanceRecord>(COLLECTION);

  const filtered = baseRecords
    .map(normalizeRecord)
    .filter((record) => {
      if (filters.query && !matchesQuery(record, filters.query)) {
        return false;
      }

      return true;
    });

  const sorted = sortProvenanceRecords(filtered, filters.sort);
  return sorted.slice(0, filters.limit ?? 20);
}

export async function listProvenanceViewModelsByFilters(
  filters: ProvenanceFilters = {}
): Promise<ProvenanceViewModel[]> {
  const records = await listProvenanceRecordsByFilters(filters);
  return records.map(buildProvenanceViewModel);
}

export async function updateProvenanceRecord(
  provenanceId: string,
  updates: ProvenanceUpdateInput
): Promise<ProvenanceRecord> {
  const current = await getProvenanceRecordById(provenanceId);

  if (!current) {
    throw new Error(`Provenance record ${provenanceId} was not found.`);
  }

  const next: ProvenanceRecord = normalizeRecord({
    ...current,
    ...updates,
    ...(updates.metadata
      ? {
          metadata: {
            ...(current.metadata ?? {}),
            ...updates.metadata,
          },
        }
      : {}),
    updatedAt: createTimestamp(),
  });

  await updateFirestoreDocument<ProvenanceRecord>(
    COLLECTION,
    provenanceId,
    next
  );

  return next;
}

export async function deleteProvenanceRecord(
  provenanceId: string
): Promise<void> {
  await deleteFirestoreDocument(COLLECTION, provenanceId);
}
