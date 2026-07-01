/**
 * =============================================================================
 * ChroniSync
 * Offline Sync Controller
 * =============================================================================
 */

import {
  enqueueOfflineQueueRecord,
  filterOfflineQueueRecords,
  listOfflineQueueRecords,
  markOfflineQueueRecordConflict,
  markOfflineQueueRecordFailed,
  markOfflineQueueRecordQueued,
  markOfflineQueueRecordSynced,
  markOfflineQueueRecordSyncing,
  summarizeOfflineQueueRecords,
  type OfflineQueueKind,
  type OfflineQueueRecord,
  type OfflineQueueSummary,
} from "./queue";

export interface OfflineSyncHandlerResult {
  status?: "synced" | "failed" | "conflict";
  message?: string;
}

export type OfflineSyncHandler<TPayload extends Record<string, unknown> = Record<string, unknown>> = (
  record: OfflineQueueRecord<TPayload>
) => Promise<void | OfflineSyncHandlerResult> | void | OfflineSyncHandlerResult;

export type OfflineSyncHandlerMap = Partial<
  Record<OfflineQueueKind, OfflineSyncHandler>
>;

export interface OfflineSyncState {
  items: OfflineQueueRecord[];
  summary: OfflineQueueSummary;
  isOnline: boolean;
  isFlushing: boolean;
  lastFlushedAt: string | null;
  lastError: string | null;
}

export interface OfflineSyncControllerOptions {
  autoFlush?: boolean;
  autoStart?: boolean;
}

export interface OfflineSyncController {
  getState(): OfflineSyncState;
  subscribe(listener: () => void): () => void;
  start(): void;
  stop(): void;
  enqueue<TPayload extends Record<string, unknown>>(
    record: OfflineQueueRecord<TPayload> | Omit<OfflineQueueRecord<TPayload>, "id" | "createdAt" | "updatedAt" | "attempts">
  ): OfflineQueueRecord<TPayload>;
  flush(): Promise<OfflineSyncState>;
  retry(recordId: string): Promise<OfflineSyncState>;
  clear(): void;
}

function createTimestamp(): string {
  return new Date().toISOString();
}

function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined";
}

function isOnline(): boolean {
  if (!isBrowserEnvironment()) {
    return true;
  }

  return window.navigator.onLine;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function createOfflineSyncController(
  handlers: OfflineSyncHandlerMap = {},
  options: OfflineSyncControllerOptions = {}
): OfflineSyncController {
  const listeners = new Set<() => void>();
  let started = false;
  let flushing = false;
  let online = isOnline();
  let lastFlushedAt: string | null = null;
  let lastError: string | null = null;

  const autoFlush = options.autoFlush ?? true;

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const getState = (): OfflineSyncState => ({
    items: listOfflineQueueRecords(),
    summary: summarizeOfflineQueueRecords(),
    isOnline: online,
    isFlushing: flushing,
    lastFlushedAt,
    lastError,
  });

  const scheduleFlush = () => {
    if (!autoFlush || !online || flushing) {
      return;
    }

    const runner = () => {
      void flush();
    };

    if (typeof queueMicrotask === "function") {
      queueMicrotask(runner);
      return;
    }

    setTimeout(runner, 0);
  };

  const handleOnline = () => {
    online = true;
    notify();
    scheduleFlush();
  };

  const handleOffline = () => {
    online = false;
    notify();
  };

  const handleStorage = () => {
    notify();
  };

  function start(): void {
    if (started || !isBrowserEnvironment()) {
      started = true;
      return;
    }

    started = true;
    online = window.navigator.onLine;
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("storage", handleStorage);
  }

  function stop(): void {
    if (!started || !isBrowserEnvironment()) {
      started = false;
      return;
    }

    started = false;
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
    window.removeEventListener("storage", handleStorage);
  }

  function enqueue<TPayload extends Record<string, unknown>>(
    record:
      | OfflineQueueRecord<TPayload>
      | Omit<
          OfflineQueueRecord<TPayload>,
          "id" | "createdAt" | "updatedAt" | "attempts"
        >
  ): OfflineQueueRecord<TPayload> {
    const queuedRecord =
      "id" in record && "createdAt" in record && "updatedAt" in record
        ? record
        : enqueueOfflineQueueRecord<TPayload>({
            kind: record.kind,
            payload: record.payload,
            status: record.status,
            ...(record.source ? { source: record.source } : {}),
            ...(record.patientId ? { patientId: record.patientId } : {}),
            ...(record.entityId ? { entityId: record.entityId } : {}),
            ...(record.optimisticId ? { optimisticId: record.optimisticId } : {}),
            ...(record.lastError ? { lastError: record.lastError } : {}),
            ...(record.lastSyncedAt ? { lastSyncedAt: record.lastSyncedAt } : {}),
            attempts: 0,
          });

    notify();
    scheduleFlush();

    return queuedRecord;
  }

  async function flush(): Promise<OfflineSyncState> {
    if (flushing) {
      return getState();
    }

    if (!online) {
      return getState();
    }

    flushing = true;
    lastError = null;
    notify();

    try {
      const pendingItems = filterOfflineQueueRecords(listOfflineQueueRecords(), {
        query: "",
      }).filter((record) => record.status === "queued" || record.status === "failed");

      for (const item of pendingItems) {
        markOfflineQueueRecordSyncing(item.id);
        notify();

        const handler = handlers[item.kind];

        if (!handler) {
          const message = `No handler registered for ${item.kind}.`;
          markOfflineQueueRecordFailed(item.id, message);
          lastError = message;
          continue;
        }

        try {
          const result = await handler(item);

          if (result?.status === "conflict") {
            markOfflineQueueRecordConflict(item.id, result.message);
            lastError = result.message ?? "The queued record conflicted during sync.";
            continue;
          }

          if (result?.status === "failed") {
            const message = result.message ?? "The queued record failed to sync.";
            markOfflineQueueRecordFailed(item.id, message);
            lastError = message;
            continue;
          }

          markOfflineQueueRecordSynced(item.id);
          lastFlushedAt = createTimestamp();
        } catch (error) {
          const message = getErrorMessage(error);
          markOfflineQueueRecordFailed(item.id, message);
          lastError = message;
        }
      }
    } finally {
      flushing = false;
      notify();
    }

    return getState();
  }

  async function retry(recordId: string): Promise<OfflineSyncState> {
    markOfflineQueueRecordQueued(recordId);
    notify();
    return flush();
  }

  function clear(): void {
    const records = listOfflineQueueRecords();
    for (const record of records) {
      if (record.status !== "synced") {
        continue;
      }
      // preserve successful history but keep the latest state readable
      markOfflineQueueRecordSynced(record.id);
    }
    notify();
  }

  if (options.autoStart !== false) {
    start();
  }

  return {
    getState,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    start,
    stop,
    enqueue,
    flush,
    retry,
    clear,
  };
}
