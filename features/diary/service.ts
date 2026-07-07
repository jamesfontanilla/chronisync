/**
 * =============================================================================
 * ChroniSync
 * Diary Feature Service
 * =============================================================================
 */

import { logger } from "@/lib/logger";
import {
  createDocument,
  deleteDocument,
  getDocument,
  queryDocuments,
  updateDocument,
  whereEquals,
} from "@/lib/firebase/firestore";
import { formatDateTime, humanize } from "@/lib/utils";

import type {
  DiaryCreateInput,
  DiaryEntry,
  DiaryFilters,
  DiarySummary,
  DiaryUpdateInput,
  DiaryViewModel,
} from "./types";

export type {
  DiaryCreateInput,
  DiaryEntry,
  DiaryEntrySource,
  DiaryEntryType,
  DiaryFilters,
  DiarySummary,
  DiarySyncState,
  DiaryUpdateInput,
  DiaryViewModel,
} from "./types";

const COLLECTION = "diaryEntries";
const DEMO_PATIENT_ID = "demo-patient";
const DEMO_REFERENCE_TIMESTAMP = Date.parse("2026-07-01T00:08:00.000Z");

function createRecordId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `diary_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createTimestamp(minutesAgo = 0): Date {
  return new Date(DEMO_REFERENCE_TIMESTAMP - minutesAgo * 60_000);
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

function normalizeEntry(entry: DiaryEntry): DiaryEntry {
  return {
    ...entry,
    recordedByRole: entry.recordedByRole ?? "patient",
    recordedAt: normalizeDate(entry.recordedAt),
    createdAt: normalizeDate(entry.createdAt),
    updatedAt: normalizeDate(entry.updatedAt),
  };
}

function matchesQuery(entry: DiaryEntry, query: string): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  const haystack = [
    entry.title,
    entry.content,
    entry.valueLabel,
    entry.source,
    entry.recordedByRole,
    entry.syncState,
    ...(entry.tags ?? []),
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

function createDemoEntries(
  patientId: string = DEMO_PATIENT_ID
): DiaryEntry[] {
  return [
    {
      id: "diary-glucose-1",
      patientId,
      recordedByRole: "patient",
      type: "glucose",
      title: "Morning glucose check",
      content: "Fasting reading taken before breakfast. No symptoms reported.",
      valueLabel: "118 mg/dL",
      source: "device",
      syncState: "synced",
      recordedAt: createTimestamp(20),
      tags: ["fasting", "before breakfast"],
      createdAt: createTimestamp(19),
      updatedAt: createTimestamp(19),
    },
    {
      id: "diary-pressure-1",
      patientId,
      recordedByRole: "patient",
      type: "pressure",
      title: "Blood pressure log",
      content: "Measured after a short rest before leaving the house.",
      valueLabel: "132/84 mmHg",
      source: "manual",
      syncState: "synced",
      recordedAt: createTimestamp(60),
      tags: ["resting", "morning"],
      createdAt: createTimestamp(59),
      updatedAt: createTimestamp(59),
    },
    {
      id: "diary-weight-1",
      patientId,
      recordedByRole: "patient",
      type: "weight",
      title: "Daily weight",
      content: "Recorded after waking up and using the restroom.",
      valueLabel: "68.2 kg",
      source: "manual",
      syncState: "queued",
      recordedAt: createTimestamp(120),
      tags: ["morning"],
      createdAt: createTimestamp(119),
      updatedAt: createTimestamp(118),
    },
    {
      id: "diary-medication-1",
      patientId,
      recordedByRole: "patient",
      type: "medication",
      title: "Medication reminder",
      content: "Metformin and amlodipine marked as taken after breakfast.",
      valueLabel: "2 medications logged",
      source: "manual",
      syncState: "synced",
      recordedAt: createTimestamp(190),
      tags: ["adherence"],
      createdAt: createTimestamp(189),
      updatedAt: createTimestamp(189),
    },
    {
      id: "diary-diet-1",
      patientId,
      recordedByRole: "patient",
      type: "diet",
      title: "Lunch meal photo",
      content: "Chicken adobo with rice, confirmed after a quick edit.",
      valueLabel: "Photo draft",
      source: "photo",
      syncState: "synced",
      recordedAt: createTimestamp(240),
      tags: ["meal", "photo"],
      createdAt: createTimestamp(239),
      updatedAt: createTimestamp(238),
    },
    {
      id: "diary-exercise-1",
      patientId,
      recordedByRole: "patient",
      type: "exercise",
      title: "Evening walk",
      content: "A 20-minute walk after dinner to keep the routine steady.",
      valueLabel: "20 minutes",
      source: "manual",
      syncState: "synced",
      recordedAt: createTimestamp(320),
      tags: ["activity"],
      createdAt: createTimestamp(319),
      updatedAt: createTimestamp(319),
    },
    {
      id: "diary-voice-1",
      patientId,
      recordedByRole: "patient",
      type: "voice_note",
      title: "Voice note",
      content: "Feeling less tired after lunch, but still need to restock strips.",
      source: "voice",
      syncState: "syncing",
      recordedAt: createTimestamp(390),
      tags: ["voice", "follow-up"],
      createdAt: createTimestamp(389),
      updatedAt: createTimestamp(388),
    },
    {
      id: "diary-note-1",
      patientId,
      recordedByRole: "caregiver",
      type: "note",
      title: "Caregiver update",
      content: "Caregiver confirmed the refill pickup and tomorrow's follow-up.",
      source: "imported",
      syncState: "conflict",
      recordedAt: createTimestamp(460),
      tags: ["caregiver", "refill"],
      createdAt: createTimestamp(459),
      updatedAt: createTimestamp(458),
    },
  ];
}

function sortEntries(entries: DiaryEntry[]): DiaryEntry[] {
  return [...entries].sort(
    (left, right) => right.recordedAt.getTime() - left.recordedAt.getTime()
  );
}

function getQuickLogCount(entries: DiaryEntry[]): number {
  return entries.filter((entry) =>
    ["glucose", "pressure", "weight", "medication"].includes(entry.type)
  ).length;
}

function filterEntries(
  entries: DiaryEntry[],
  filters: Omit<DiaryFilters, "patientId"> = {}
): DiaryEntry[] {
  return entries.filter((entry) => {
    if (filters.type && entry.type !== filters.type) {
      return false;
    }

    if (filters.syncState && entry.syncState !== filters.syncState) {
      return false;
    }

    if (filters.query && !matchesQuery(entry, filters.query)) {
      return false;
    }

    return true;
  });
}

export function buildDiaryRecord(
  data: DiaryCreateInput
): DiaryEntry {
  const timestamp = data.recordedAt ?? createTimestamp();
  const tags = data.tags
    ?.map((tag) => tag.trim())
    .filter((tag): tag is string => Boolean(tag));

  const record: DiaryEntry = {
    id: createRecordId(),
    patientId: data.patientId.trim(),
    recordedByRole: data.recordedByRole ?? "patient",
    type: data.type,
    title: data.title.trim(),
    content: data.content.trim(),
    source: data.source ?? "manual",
    syncState: data.syncState ?? "queued",
    recordedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...(data.valueLabel?.trim()
      ? { valueLabel: data.valueLabel.trim() }
      : {}),
    ...(tags?.length ? { tags } : {}),
  };

  return normalizeEntry(record);
}

export function buildDiaryViewModel(
  entry: DiaryEntry
): DiaryViewModel {
  return {
    entry,
    typeLabel: humanize(entry.type),
    syncStateLabel: humanize(entry.syncState),
    timeLabel: formatDateTime(entry.recordedAt),
    preview: entry.valueLabel
      ? `${entry.valueLabel} - ${entry.content}`
      : entry.content,
  };
}

export function summarizeDiaryEntries(
  entries: DiaryEntry[]
): DiarySummary {
  const normalized = sortEntries(entries.map(normalizeEntry));
  const lastUpdated =
    normalized[0]?.updatedAt ?? createTimestamp();

  return {
    total: normalized.length,
    quickLogs: getQuickLogCount(normalized),
    photos: normalized.filter((entry) => entry.source === "photo").length,
    voiceEntries: normalized.filter(
      (entry) => entry.type === "voice_note" || entry.source === "voice"
    ).length,
    notes: normalized.filter((entry) => entry.type === "note").length,
    queued: normalized.filter((entry) => entry.syncState === "queued").length,
    syncing: normalized.filter((entry) => entry.syncState === "syncing").length,
    synced: normalized.filter((entry) => entry.syncState === "synced").length,
    conflict: normalized.filter((entry) => entry.syncState === "conflict").length,
    lastUpdated,
  };
}

export async function createDiaryEntry(
  data: DiaryCreateInput
): Promise<DiaryEntry> {
  const record = buildDiaryRecord(data);

  try {
    await createDocument<DiaryEntry>(COLLECTION, record.id, record);
  } catch (error) {
    logger.warn("Falling back to a local diary record.", {
      patientId: record.patientId,
      diaryId: record.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return record;
}

export async function getDiaryEntryById(
  diaryId: string
): Promise<DiaryEntry | null> {
  try {
    const record = await getDocument<DiaryEntry>(COLLECTION, diaryId);

    if (record) {
      return normalizeEntry(record);
    }
  } catch {
    // Fall back to demo data below.
  }

  const demoEntry = createDemoEntries().find((entry) => entry.id === diaryId);
  return demoEntry ? normalizeEntry(demoEntry) : null;
}

export async function listDiaryEntriesByPatient(
  patientId: string,
  filters: Omit<DiaryFilters, "patientId"> = {}
): Promise<DiaryEntry[]> {
  try {
    const records = await queryDocuments<DiaryEntry>(
      COLLECTION,
      whereEquals("patientId", patientId)
    );

    const normalized = sortEntries(
      filterEntries(records.map(normalizeEntry), filters)
    );

    if (normalized.length > 0) {
      return normalized.slice(0, filters.limit ?? 50);
    }
  } catch (error) {
    logger.warn("Falling back to demo diary entries.", {
      patientId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return sortEntries(filterEntries(createDemoEntries(patientId), filters)).slice(
    0,
    filters.limit ?? 50
  );
}

export async function listDiaryViewModelsByPatient(
  patientId: string
): Promise<DiaryViewModel[]> {
  const entries = await listDiaryEntriesByPatient(patientId);
  return entries.map(buildDiaryViewModel);
}

export async function updateDiaryEntry(
  diaryId: string,
  updates: DiaryUpdateInput
): Promise<DiaryEntry> {
  const existing = (await getDiaryEntryById(diaryId)) ?? buildDiaryRecord({
    patientId: DEMO_PATIENT_ID,
    type: "note",
    title: "Diary entry",
    content: "Auto-generated placeholder entry.",
  });

  const record: DiaryEntry = normalizeEntry({
    ...existing,
    ...updates,
    ...(updates.valueLabel !== undefined
      ? { valueLabel: updates.valueLabel }
      : existing.valueLabel
        ? { valueLabel: existing.valueLabel }
        : {}),
    ...(updates.tags !== undefined
      ? { tags: updates.tags }
      : existing.tags
        ? { tags: existing.tags }
        : {}),
    recordedAt: updates.recordedAt ?? existing.recordedAt,
    updatedAt: createTimestamp(),
  });

  try {
    await updateDocument<DiaryEntry>(COLLECTION, diaryId, record);
  } catch (error) {
    logger.warn("Could not persist the diary update.", {
      diaryId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return record;
}

export async function deleteDiaryEntry(
  diaryId: string
): Promise<void> {
  try {
    await deleteDocument(COLLECTION, diaryId);
  } catch (error) {
    logger.warn("Could not delete the diary entry.", {
      diaryId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export function buildDiaryDemoEntries(
  patientId: string = DEMO_PATIENT_ID
): DiaryEntry[] {
  return sortEntries(createDemoEntries(patientId));
}

export function describeDiarySnapshot(
  entries: DiaryEntry[]
): string {
  const summary = summarizeDiaryEntries(entries);

  return `${summary.total} entries, ${summary.quickLogs} quick logs, ${summary.queued} queued`;
}
