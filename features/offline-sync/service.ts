/**
 * =============================================================================
 * ChroniSync
 * Offline Sync Feature Service
 * =============================================================================
 */

import {
  createOfflineQueueRecord,
  filterOfflineQueueRecords,
  summarizeOfflineQueueRecords,
  type OfflineQueueRecord,
} from "@/lib/offline/queue";
import {
  createOfflineSyncController,
  type OfflineSyncHandlerResult,
  type OfflineSyncState as OfflineControllerState,
} from "@/lib/offline/sync";
import {
  createDocument,
  deleteDocument,
  getDocument,
  updateDocument,
} from "@/lib/firebase/firestore";
import { humanize, formatDateTime } from "@/lib/utils";

import {
  buildDiaryRecord,
  type DiaryEntry,
} from "@/features/diary/service";
import {
  buildFoodPhotoRecord,
  type FoodPhotoRecord,
} from "@/features/food-photo/service";
import {
  buildDeviceConnectionRecord,
  buildDeviceImportRecord,
  type DeviceConnection,
  type DeviceImportRecord,
} from "@/features/device-sync/service";
import {
  createSummary,
  deleteSummary,
  getSummaryById,
  publishSummary,
  updateSummary,
} from "@/services/summary.service";

import {
  offlineDiaryMutationSchema,
  offlineDeviceSyncMutationSchema,
  offlineFoodPhotoMutationSchema,
  offlineSummaryMutationSchema,
  offlineSyncMutationSchema,
  offlineSyncQueueFiltersSchema,
} from "./validation";

import {
  type OfflineDiaryPayload,
  type OfflineDeviceSyncPayload,
  type OfflineFoodPhotoPayload,
  type OfflineSyncFilters,
  type OfflineSyncPayload,
  type OfflineSyncRecord,
  type OfflineSyncQueueSummary,
  type OfflineSyncState,
  type OfflineSyncViewModel,
  type OfflineSummaryPayload,
} from "./types";

import type {
  DiaryCreateInput,
  DiaryUpdateInput,
} from "@/features/diary/types";
import type {
  FoodPhotoCreateInput,
  FoodPhotoUpdateInput,
} from "@/features/food-photo/types";
import type {
  DeviceConnectionCreateInput,
  DeviceConnectionUpdateInput,
  DeviceImportCreateInput,
} from "@/features/device-sync/types";
import type {
  SummaryCreateInput,
  SummaryUpdateInput,
} from "@/services/summary.service";

const DIARY_COLLECTION = "diaryEntries";
const FOOD_PHOTO_COLLECTION = "foodPhotoLogs";
const DEVICE_CONNECTIONS_COLLECTION = "deviceConnections";
const DEVICE_IMPORTS_COLLECTION = "deviceImports";

const offlineSyncController = createOfflineSyncController(
  {
    diary: handleDiarySyncRecord,
    food_photo: handleFoodPhotoSyncRecord,
    device_sync: handleDeviceSyncRecord,
    summary: handleSummarySyncRecord,
  },
  {
    autoFlush: true,
    autoStart: true,
  }
);

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

  return new Date();
}

function getEntityId(payload: OfflineSyncPayload): string | undefined {
  switch (payload.kind) {
    case "diary":
      switch (payload.action) {
        case "update":
        case "delete":
          return (payload as {
            entryId: string;
          }).entryId;
        default:
          return undefined;
      }
    case "food_photo":
      switch (payload.action) {
        case "update":
        case "delete":
          return (payload as {
            recordId: string;
          }).recordId;
        default:
          return undefined;
      }
    case "device_sync":
      switch (payload.action) {
        case "update":
        case "delete":
          return (payload as {
            connectionId: string;
          }).connectionId;
        case "import":
          return (payload as {
            input: { connectionId?: string };
          }).input.connectionId;
        case "connect":
        default:
          return undefined;
      }
    case "summary":
      switch (payload.action) {
        case "update":
        case "publish":
        case "delete":
          return (payload as {
            summaryId: string;
          }).summaryId;
        default:
          return undefined;
      }
    default:
      return undefined;
  }
}

function describeDiaryPayload(payload: OfflineDiaryPayload): string {
  switch (payload.action) {
    case "create":
      return `Diary entry queued: ${payload.input.title}`;
    case "update":
      return `Diary update queued for ${payload.entryId}`;
    case "delete":
      return `Diary delete queued for ${payload.entryId}`;
    default:
      return "Diary mutation queued";
  }
}

function describeFoodPhotoPayload(
  payload: OfflineFoodPhotoPayload
): string {
  switch (payload.action) {
    case "create":
      return `Food photo queued: ${payload.input.mealLabel}`;
    case "update":
      return `Food photo update queued for ${payload.recordId}`;
    case "delete":
      return `Food photo delete queued for ${payload.recordId}`;
    default:
      return "Food photo mutation queued";
  }
}

function describeDeviceSyncPayload(
  payload: OfflineDeviceSyncPayload
): string {
  switch (payload.action) {
    case "connect":
      return `Device connection queued: ${payload.input.deviceName}`;
    case "update":
      return `Device connection update queued for ${payload.connectionId}`;
    case "delete":
      return `Device connection delete queued for ${payload.connectionId}`;
    case "import":
      return `Device import queued: ${payload.input.sourceName}`;
    default:
      return "Device sync mutation queued";
  }
}

function describeSummaryPayload(payload: OfflineSummaryPayload): string {
  switch (payload.action) {
    case "create":
      return `Summary queued: ${payload.input.title}`;
    case "update":
      return `Summary update queued for ${payload.summaryId}`;
    case "publish":
      return `Summary publish queued for ${payload.summaryId}`;
    case "delete":
      return `Summary delete queued for ${payload.summaryId}`;
    default:
      return "Summary mutation queued";
  }
}

function describeOfflineSyncPayload(payload: OfflineSyncPayload): string {
  switch (payload.kind) {
    case "diary":
      return describeDiaryPayload(payload);
    case "food_photo":
      return describeFoodPhotoPayload(payload);
    case "device_sync":
      return describeDeviceSyncPayload(payload);
    case "summary":
      return describeSummaryPayload(payload);
    default:
      return "Queued sync mutation";
  }
}

function getOfflineSyncPayloadAction(payload: OfflineSyncPayload): string {
  return humanize(payload.action);
}

function getOfflineSyncPayloadTimestamp(
  record: OfflineSyncRecord
): Date {
  return normalizeDate(record.updatedAt);
}

function createOfflineSyncViewModel(
  record: OfflineSyncRecord
): OfflineSyncViewModel {
  return {
    record,
    kindLabel: humanize(record.kind),
    actionLabel: getOfflineSyncPayloadAction(record.payload),
    statusLabel: humanize(record.status),
    timeLabel: formatDateTime(getOfflineSyncPayloadTimestamp(record)),
    summary: describeOfflineSyncPayload(record.payload),
    isPending: record.status === "queued" || record.status === "syncing",
    isFailed: record.status === "failed",
    isConflicted: record.status === "conflict",
  };
}

async function handleDiarySyncRecord(
  record: OfflineQueueRecord<Record<string, unknown>>
): Promise<OfflineSyncHandlerResult | void> {
  const payload = offlineDiaryMutationSchema.parse(record.payload);

  switch (payload.action) {
    case "create": {
      const diaryRecord = buildDiaryRecord(
        payload.input as unknown as DiaryCreateInput
      );

      await createDocument<DiaryEntry>(
        DIARY_COLLECTION,
        diaryRecord.id,
        diaryRecord
      );
      return;
    }
    case "update": {
      const existing = await getDocument<DiaryEntry>(
        DIARY_COLLECTION,
        payload.entryId
      );

      if (!existing) {
        return {
          status: "conflict",
          message: "The diary entry could not be found on the server.",
        };
      }

      const updates = payload.updates as unknown as DiaryUpdateInput;
      const next: DiaryEntry = {
        ...existing,
        ...updates,
        recordedAt: updates.recordedAt ?? existing.recordedAt,
        updatedAt: new Date(),
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
      };

      await updateDocument<DiaryEntry>(
        DIARY_COLLECTION,
        payload.entryId,
        next
      );
      return;
    }
    case "delete": {
      const existing = await getDocument<DiaryEntry>(
        DIARY_COLLECTION,
        payload.entryId
      );

      if (!existing) {
        return {
          status: "conflict",
          message: "The diary entry could not be found on the server.",
        };
      }

      await deleteDocument(DIARY_COLLECTION, payload.entryId);
      return;
    }
  }
}

async function handleFoodPhotoSyncRecord(
  record: OfflineQueueRecord<Record<string, unknown>>
): Promise<OfflineSyncHandlerResult | void> {
  const payload = offlineFoodPhotoMutationSchema.parse(record.payload);

  switch (payload.action) {
    case "create": {
      const foodPhotoRecord = buildFoodPhotoRecord(
        payload.input as unknown as FoodPhotoCreateInput
      );

      await createDocument<FoodPhotoRecord>(
        FOOD_PHOTO_COLLECTION,
        foodPhotoRecord.id,
        foodPhotoRecord
      );
      return;
    }
    case "update": {
      const existing = await getDocument<FoodPhotoRecord>(
        FOOD_PHOTO_COLLECTION,
        payload.recordId
      );

      if (!existing) {
        return {
          status: "conflict",
          message: "The food photo record could not be found on the server.",
        };
      }

      const updates = payload.updates as unknown as FoodPhotoUpdateInput;
      const next: FoodPhotoRecord = {
        ...existing,
        ...updates,
        imageName: updates.imageName ?? existing.imageName,
        source: updates.source ?? existing.source,
        status: updates.status ?? existing.status,
        confidence: updates.confidence ?? existing.confidence,
        estimatedCalories:
          updates.estimatedCalories ?? existing.estimatedCalories,
        estimatedCarbsG: updates.estimatedCarbsG ?? existing.estimatedCarbsG,
        estimatedProteinG:
          updates.estimatedProteinG ?? existing.estimatedProteinG,
        estimatedFatG: updates.estimatedFatG ?? existing.estimatedFatG,
        capturedAt: updates.capturedAt ?? existing.capturedAt,
        updatedAt: new Date(),
        ...(updates.portionLabel !== undefined
          ? { portionLabel: updates.portionLabel }
          : existing.portionLabel
            ? { portionLabel: existing.portionLabel }
            : {}),
        ...(updates.imageUrl !== undefined
          ? { imageUrl: updates.imageUrl }
          : existing.imageUrl
            ? { imageUrl: existing.imageUrl }
            : {}),
        ...(updates.notes !== undefined
          ? { notes: updates.notes }
          : existing.notes
            ? { notes: existing.notes }
            : {}),
        ...(updates.suggestedEdits !== undefined
          ? { suggestedEdits: updates.suggestedEdits }
          : existing.suggestedEdits
            ? { suggestedEdits: existing.suggestedEdits }
            : {}),
      };

      await updateDocument<FoodPhotoRecord>(
        FOOD_PHOTO_COLLECTION,
        payload.recordId,
        next
      );
      return;
    }
    case "delete": {
      const existing = await getDocument<FoodPhotoRecord>(
        FOOD_PHOTO_COLLECTION,
        payload.recordId
      );

      if (!existing) {
        return {
          status: "conflict",
          message: "The food photo record could not be found on the server.",
        };
      }

      await deleteDocument(FOOD_PHOTO_COLLECTION, payload.recordId);
      return;
    }
  }
}

async function handleDeviceSyncRecord(
  record: OfflineQueueRecord<Record<string, unknown>>
): Promise<OfflineSyncHandlerResult | void> {
  const payload = offlineDeviceSyncMutationSchema.parse(record.payload);

  switch (payload.action) {
    case "connect": {
      const connection = buildDeviceConnectionRecord(
        payload.input as unknown as DeviceConnectionCreateInput
      );

      await createDocument<DeviceConnection>(
        DEVICE_CONNECTIONS_COLLECTION,
        connection.id,
        connection
      );
      return;
    }
    case "update": {
      const existing = await getDocument<DeviceConnection>(
        DEVICE_CONNECTIONS_COLLECTION,
        payload.connectionId
      );

      if (!existing) {
        return {
          status: "conflict",
          message:
            "The device connection could not be found on the server.",
        };
      }

      const updates = payload.updates as unknown as DeviceConnectionUpdateInput;
      const next: DeviceConnection = {
        ...existing,
        ...updates,
        supportedMetrics: updates.supportedMetrics
          ? [...updates.supportedMetrics]
          : existing.supportedMetrics
            ? [...existing.supportedMetrics]
            : [],
        updatedAt: new Date(),
        ...(updates.externalId !== undefined
          ? { externalId: updates.externalId }
          : existing.externalId
            ? { externalId: existing.externalId }
            : {}),
        ...(updates.lastSyncedAt !== undefined
          ? { lastSyncedAt: updates.lastSyncedAt }
          : existing.lastSyncedAt
            ? { lastSyncedAt: existing.lastSyncedAt }
            : {}),
        ...(updates.lastSeenAt !== undefined
          ? { lastSeenAt: updates.lastSeenAt }
          : existing.lastSeenAt
            ? { lastSeenAt: existing.lastSeenAt }
            : {}),
        ...(updates.notes !== undefined
          ? { notes: updates.notes }
          : existing.notes
            ? { notes: existing.notes }
            : {}),
        ...(updates.metadata !== undefined
          ? { metadata: updates.metadata }
          : existing.metadata
            ? { metadata: existing.metadata }
            : {}),
      };

      await updateDocument<DeviceConnection>(
        DEVICE_CONNECTIONS_COLLECTION,
        payload.connectionId,
        next
      );
      return;
    }
    case "delete": {
      const existing = await getDocument<DeviceConnection>(
        DEVICE_CONNECTIONS_COLLECTION,
        payload.connectionId
      );

      if (!existing) {
        return {
          status: "conflict",
          message:
            "The device connection could not be found on the server.",
        };
      }

      await deleteDocument(DEVICE_CONNECTIONS_COLLECTION, payload.connectionId);
      return;
    }
    case "import": {
      const deviceImport = buildDeviceImportRecord(
        payload.input as unknown as DeviceImportCreateInput
      );

      await createDocument<DeviceImportRecord>(
        DEVICE_IMPORTS_COLLECTION,
        deviceImport.id,
        deviceImport
      );
      return;
    }
  }
}

async function handleSummarySyncRecord(
  record: OfflineQueueRecord<Record<string, unknown>>
): Promise<OfflineSyncHandlerResult | void> {
  const payload = offlineSummaryMutationSchema.parse(record.payload);

  switch (payload.action) {
    case "create":
      await createSummary(payload.input as unknown as SummaryCreateInput);
      return;
    case "update": {
      const existing = await getSummaryById(payload.summaryId);

      if (!existing) {
        return {
          status: "conflict",
          message: "The summary could not be found on the server.",
        };
      }

      await updateSummary(
        payload.summaryId,
        payload.updates as unknown as SummaryUpdateInput
      );
      return;
    }
    case "publish": {
      const existing = await getSummaryById(payload.summaryId);

      if (!existing) {
        return {
          status: "conflict",
          message: "The summary could not be found on the server.",
        };
      }

      await publishSummary(payload.summaryId);
      return;
    }
    case "delete": {
      const existing = await getSummaryById(payload.summaryId);

      if (!existing) {
        return {
          status: "conflict",
          message: "The summary could not be found on the server.",
        };
      }

      await deleteSummary(payload.summaryId);
      return;
    }
  }
}

function getControllerState(): OfflineControllerState {
  return offlineSyncController.getState();
}

function subscribeToController(listener: () => void): () => void {
  return offlineSyncController.subscribe(listener);
}

function enqueueOfflinePayload(
  payload: OfflineSyncPayload
): OfflineSyncRecord {
  const entityId = getEntityId(payload);

  const record = offlineSyncController.enqueue({
    kind: payload.kind,
    payload,
    status: "queued",
    patientId: payload.patientId,
    ...(entityId ? { entityId } : {}),
    ...(payload.source ? { source: payload.source } : {}),
    ...(payload.optimisticId ? { optimisticId: payload.optimisticId } : {}),
  });

  return record as OfflineSyncRecord;
}

export function enqueueDiaryOfflineMutation(
  payload: OfflineDiaryPayload
): OfflineSyncRecord {
  const parsed = offlineDiaryMutationSchema.parse(payload);
  return enqueueOfflinePayload(parsed as unknown as OfflineDiaryPayload);
}

export function enqueueFoodPhotoOfflineMutation(
  payload: OfflineFoodPhotoPayload
): OfflineSyncRecord {
  const parsed = offlineFoodPhotoMutationSchema.parse(payload);
  return enqueueOfflinePayload(parsed as unknown as OfflineFoodPhotoPayload);
}

export function enqueueDeviceSyncOfflineMutation(
  payload: OfflineDeviceSyncPayload
): OfflineSyncRecord {
  const parsed = offlineDeviceSyncMutationSchema.parse(payload);
  return enqueueOfflinePayload(
    parsed as unknown as OfflineDeviceSyncPayload
  );
}

export function enqueueSummaryOfflineMutation(
  payload: OfflineSummaryPayload
): OfflineSyncRecord {
  const parsed = offlineSummaryMutationSchema.parse(payload);
  return enqueueOfflinePayload(parsed as unknown as OfflineSummaryPayload);
}

export function enqueueOfflineSyncMutation(
  payload: OfflineSyncPayload
): OfflineSyncRecord {
  const parsed = offlineSyncMutationSchema.parse(payload);
  return enqueueOfflinePayload(parsed as unknown as OfflineSyncPayload);
}

export function listOfflineSyncRecords(
  filters: OfflineSyncFilters = {}
): OfflineSyncRecord[] {
  const normalizedFilters = offlineSyncQueueFiltersSchema.parse(filters);
  const state = getControllerState();
  const queryFilters = {
    ...(normalizedFilters.kind ? { kind: normalizedFilters.kind } : {}),
    ...(normalizedFilters.status
      ? { status: normalizedFilters.status }
      : {}),
    ...(normalizedFilters.patientId
      ? { patientId: normalizedFilters.patientId }
      : {}),
    ...(normalizedFilters.query ? { query: normalizedFilters.query } : {}),
  };
  const filtered = filterOfflineQueueRecords(
    state.items as unknown as import("@/lib/offline/queue").OfflineQueueRecord<Record<string, unknown>>[],
    queryFilters
  ).slice(0, normalizedFilters.limit);

  return filtered as OfflineSyncRecord[];
}

export function summarizeOfflineSyncRecords(
  filters: OfflineSyncFilters = {}
): OfflineSyncQueueSummary {
  return summarizeOfflineQueueRecords(listOfflineSyncRecords(filters));
}

export function buildOfflineSyncViewModel(
  record: OfflineSyncRecord
): OfflineSyncViewModel {
  return createOfflineSyncViewModel(record);
}

export function listOfflineSyncViewModels(
  filters: OfflineSyncFilters = {}
): OfflineSyncViewModel[] {
  return listOfflineSyncRecords(filters).map(buildOfflineSyncViewModel);
}

export function getOfflineSyncState(): OfflineSyncState {
  return getControllerState();
}

export function subscribeOfflineSyncState(
  listener: () => void
): () => void {
  return subscribeToController(listener);
}

export async function flushOfflineSyncQueue(): Promise<OfflineSyncState> {
  const state = await offlineSyncController.flush();
  return state as OfflineSyncState;
}

export async function retryOfflineSyncRecord(
  recordId: string
): Promise<OfflineSyncState> {
  const state = await offlineSyncController.retry(recordId);
  return state as OfflineSyncState;
}

export function getOfflineSyncQueueSummary(
  filters: OfflineSyncFilters = {}
): OfflineSyncQueueSummary {
  return summarizeOfflineSyncRecords(filters);
}

export function buildOfflineSyncDemoState(): OfflineSyncState {
  const demoRecords = [
    createOfflineQueueRecord<OfflineSyncPayload>({
      kind: "diary",
      payload: {
        kind: "diary",
        action: "create",
        patientId: "demo-patient",
        input: {
          patientId: "demo-patient",
          type: "note",
          title: "Queued diary note",
          content: "This entry is waiting for a reconnect.",
          source: "manual",
          syncState: "queued",
          recordedAt: new Date("2026-07-01T00:00:00.000Z"),
        },
      },
      patientId: "demo-patient",
      entityId: "demo-diary-note",
      source: "browser",
      status: "queued",
    }),
    createOfflineQueueRecord<OfflineSyncPayload>({
      kind: "food_photo",
      payload: {
        kind: "food_photo",
        action: "update",
        patientId: "demo-patient",
        recordId: "food-photo-1",
        updates: {
          status: "needs_review",
          notes: "Image still needs a manual confirmation.",
        },
      },
      patientId: "demo-patient",
      entityId: "food-photo-1",
      source: "browser",
      status: "syncing",
    }),
    createOfflineQueueRecord<OfflineSyncPayload>({
      kind: "device_sync",
      payload: {
        kind: "device_sync",
        action: "import",
        patientId: "demo-patient",
        input: {
          patientId: "demo-patient",
          provider: "csv",
          sourceName: "Clinic export",
          status: "queued",
          recordCount: 12,
          acceptedCount: 12,
          rejectedCount: 0,
          capturedAt: new Date("2026-06-30T12:00:00.000Z"),
        },
      },
      patientId: "demo-patient",
      entityId: "device-import-1",
      source: "browser",
      status: "failed",
      lastError: "The device import needs a reconnect before it can sync.",
    }),
  ];

  const summary = summarizeOfflineQueueRecords(demoRecords);

  return {
    items: demoRecords,
    summary,
    isOnline: true,
    isFlushing: false,
    lastFlushedAt: null,
    lastError: null,
  };
}

export function describeOfflineSyncState(
  state: OfflineSyncState = getOfflineSyncState()
): string {
  return `${state.summary.total} queued sync items, ${state.summary.failed} failed`;
}
