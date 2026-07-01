/**
 * =============================================================================
 * ChroniSync
 * Offline Queue
 * =============================================================================
 */

import { readOfflineJson, removeOfflineItem, writeOfflineJson } from "./storage";

export type OfflineQueueKind =
  | "diary"
  | "food_photo"
  | "device_sync"
  | "summary";

export type OfflineQueueStatus =
  | "queued"
  | "syncing"
  | "synced"
  | "failed"
  | "conflict";

export interface OfflineQueueRecord<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  kind: OfflineQueueKind;
  payload: TPayload;
  status: OfflineQueueStatus;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  source?: string;
  patientId?: string;
  entityId?: string;
  optimisticId?: string;
  lastError?: string;
  lastSyncedAt?: string;
}

export interface OfflineQueueRecordInput<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  kind: OfflineQueueKind;
  payload: TPayload;
  status?: OfflineQueueStatus;
  source?: string;
  patientId?: string;
  entityId?: string;
  optimisticId?: string;
  attempts?: number;
  lastError?: string;
  createdAt?: string;
  updatedAt?: string;
  lastSyncedAt?: string;
}

export interface OfflineQueueSummary {
  total: number;
  queued: number;
  syncing: number;
  synced: number;
  failed: number;
  conflict: number;
  byKind: Record<OfflineQueueKind, number>;
  lastUpdatedAt: string | null;
  lastSyncedAt: string | null;
}

export interface OfflineQueueFilters {
  kind?: OfflineQueueKind;
  status?: OfflineQueueStatus;
  patientId?: string;
  query?: string;
}

export const OFFLINE_QUEUE_STORAGE_KEY = "chronisync.offline.queue";

function createTimestamp(): string {
  return new Date().toISOString();
}

function createRecordId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `offline_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function sortByCreatedAt<T extends { createdAt: string }>(records: T[]): T[] {
  return [...records].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  );
}

export function createOfflineQueueRecord<TPayload extends Record<string, unknown> = Record<string, unknown>>(
  input: OfflineQueueRecordInput<TPayload>
): OfflineQueueRecord<TPayload> {
  const timestamp = input.createdAt ?? createTimestamp();

  return {
    id: createRecordId(),
    kind: input.kind,
    payload: input.payload,
    status: input.status ?? "queued",
    createdAt: timestamp,
    updatedAt: input.updatedAt ?? timestamp,
    attempts: input.attempts ?? 0,
    ...(input.source ? { source: input.source } : {}),
    ...(input.patientId ? { patientId: input.patientId } : {}),
    ...(input.entityId ? { entityId: input.entityId } : {}),
    ...(input.optimisticId ? { optimisticId: input.optimisticId } : {}),
    ...(input.lastError ? { lastError: input.lastError } : {}),
    ...(input.lastSyncedAt ? { lastSyncedAt: input.lastSyncedAt } : {}),
  };
}

export function listOfflineQueueRecords<TPayload extends Record<string, unknown> = Record<string, unknown>>(): OfflineQueueRecord<TPayload>[] {
  const records = readOfflineJson<OfflineQueueRecord<TPayload>[]>(
    OFFLINE_QUEUE_STORAGE_KEY,
    []
  );

  return sortByCreatedAt(records);
}

export function writeOfflineQueueRecords<TPayload extends Record<string, unknown> = Record<string, unknown>>(
  records: OfflineQueueRecord<TPayload>[]
): void {
  writeOfflineJson(OFFLINE_QUEUE_STORAGE_KEY, sortByCreatedAt(records));
}

export function enqueueOfflineQueueRecord<TPayload extends Record<string, unknown> = Record<string, unknown>>(
  input: OfflineQueueRecordInput<TPayload>
): OfflineQueueRecord<TPayload> {
  const record = createOfflineQueueRecord(input);
  const records = listOfflineQueueRecords<TPayload>();

  writeOfflineQueueRecords([...records, record]);

  return record;
}

export function getOfflineQueueRecordById<TPayload extends Record<string, unknown> = Record<string, unknown>>(
  recordId: string
): OfflineQueueRecord<TPayload> | null {
  return (
    listOfflineQueueRecords<TPayload>().find((record) => record.id === recordId) ??
    null
  );
}

export function updateOfflineQueueRecord<TPayload extends Record<string, unknown> = Record<string, unknown>>(
  recordId: string,
  updater: (record: OfflineQueueRecord<TPayload>) => OfflineQueueRecord<TPayload>
): OfflineQueueRecord<TPayload> | null {
  const records = listOfflineQueueRecords<TPayload>();
  const index = records.findIndex((record) => record.id === recordId);

  if (index < 0) {
    return null;
  }

  const updated = updater(records[index]!);

  writeOfflineQueueRecords([
    ...records.slice(0, index),
    updated,
    ...records.slice(index + 1),
  ]);

  return updated;
}

export function removeOfflineQueueRecord(
  recordId: string
): boolean {
  const records = listOfflineQueueRecords();
  const next = records.filter((record) => record.id !== recordId);

  if (next.length === records.length) {
    return false;
  }

  writeOfflineQueueRecords(next);
  return true;
}

export function clearOfflineQueueRecords(): void {
  removeOfflineItem(OFFLINE_QUEUE_STORAGE_KEY);
}

export function filterOfflineQueueRecords<TPayload extends Record<string, unknown> = Record<string, unknown>>(
  records: OfflineQueueRecord<TPayload>[],
  filters: OfflineQueueFilters = {}
): OfflineQueueRecord<TPayload>[] {
  return records.filter((record) => {
    if (filters.kind && record.kind !== filters.kind) {
      return false;
    }

    if (filters.status && record.status !== filters.status) {
      return false;
    }

    if (filters.patientId && record.patientId !== filters.patientId) {
      return false;
    }

    if (filters.query) {
      const haystack = [
        record.kind,
        record.status,
        record.source,
        record.patientId,
        record.entityId,
        JSON.stringify(record.payload),
      ]
        .filter((value): value is string => Boolean(value))
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(filters.query.trim().toLowerCase())) {
        return false;
      }
    }

    return true;
  });
}

export function summarizeOfflineQueueRecords<TPayload extends Record<string, unknown> = Record<string, unknown>>(
  records: OfflineQueueRecord<TPayload>[] = listOfflineQueueRecords<TPayload>()
): OfflineQueueSummary {
  const sorted = sortByCreatedAt(records);

  return {
    total: sorted.length,
    queued: sorted.filter((record) => record.status === "queued").length,
    syncing: sorted.filter((record) => record.status === "syncing").length,
    synced: sorted.filter((record) => record.status === "synced").length,
    failed: sorted.filter((record) => record.status === "failed").length,
    conflict: sorted.filter((record) => record.status === "conflict").length,
    byKind: {
      diary: sorted.filter((record) => record.kind === "diary").length,
      food_photo: sorted.filter((record) => record.kind === "food_photo").length,
      device_sync: sorted.filter((record) => record.kind === "device_sync").length,
      summary: sorted.filter((record) => record.kind === "summary").length,
    },
    lastUpdatedAt: sorted[sorted.length - 1]?.updatedAt ?? null,
    lastSyncedAt:
      sorted
        .filter((record) => Boolean(record.lastSyncedAt))
        .at(-1)?.lastSyncedAt ?? null,
  };
}

export function markOfflineQueueRecordQueued<TPayload extends Record<string, unknown> = Record<string, unknown>>(
  recordId: string
): OfflineQueueRecord<TPayload> | null {
  return updateOfflineQueueRecord<TPayload>(recordId, (record) => ({
    ...record,
    status: "queued",
    updatedAt: createTimestamp(),
    attempts: record.attempts + 1,
    ...(record.lastError ? { lastError: record.lastError } : {}),
  }));
}

export function markOfflineQueueRecordSyncing<TPayload extends Record<string, unknown> = Record<string, unknown>>(
  recordId: string
): OfflineQueueRecord<TPayload> | null {
  return updateOfflineQueueRecord<TPayload>(recordId, (record) => ({
    ...record,
    status: "syncing",
    updatedAt: createTimestamp(),
    attempts: record.attempts + 1,
  }));
}

export function markOfflineQueueRecordSynced<TPayload extends Record<string, unknown> = Record<string, unknown>>(
  recordId: string
): OfflineQueueRecord<TPayload> | null {
  const timestamp = createTimestamp();

  return updateOfflineQueueRecord<TPayload>(recordId, (record) => ({
    ...record,
    status: "synced",
    updatedAt: timestamp,
    lastSyncedAt: timestamp,
    ...(record.lastError ? { lastError: record.lastError } : {}),
  }));
}

export function markOfflineQueueRecordFailed<TPayload extends Record<string, unknown> = Record<string, unknown>>(
  recordId: string,
  errorMessage: string
): OfflineQueueRecord<TPayload> | null {
  return updateOfflineQueueRecord<TPayload>(recordId, (record) => ({
    ...record,
    status: "failed",
    updatedAt: createTimestamp(),
    attempts: record.attempts + 1,
    lastError: errorMessage,
  }));
}

export function markOfflineQueueRecordConflict<TPayload extends Record<string, unknown> = Record<string, unknown>>(
  recordId: string,
  errorMessage?: string
): OfflineQueueRecord<TPayload> | null {
  return updateOfflineQueueRecord<TPayload>(recordId, (record) => ({
    ...record,
    status: "conflict",
    updatedAt: createTimestamp(),
    attempts: record.attempts + 1,
    ...(errorMessage ? { lastError: errorMessage } : {}),
  }));
}
