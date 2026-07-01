"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useMutation } from "@tanstack/react-query";

import {
  buildOfflineSyncViewModel,
  describeOfflineSyncState,
  flushOfflineSyncQueue,
  getOfflineSyncState,
  queueOfflineSyncRecord,
  retryOfflineSyncRecord,
  subscribeOfflineSyncState,
} from "./actions";
import {
  offlineSyncQueueFiltersSchema,
  offlineSyncStatusSchema,
} from "./validation";
import {
  filterOfflineQueueRecords,
  summarizeOfflineQueueRecords,
} from "@/lib/offline/queue";
import type {
  OfflineSyncFilters,
  OfflineSyncRecord,
  OfflineSyncState,
  OfflineSyncViewModel,
} from "./types";

export function useOfflineSyncState(): OfflineSyncState {
  return useSyncExternalStore(
    subscribeOfflineSyncState,
    getOfflineSyncState,
    getOfflineSyncState
  );
}

export function useOfflineSyncRecordsQuery(
  filters: OfflineSyncFilters = {}
) {
  const state = useOfflineSyncState();
  const parsedFilters = offlineSyncQueueFiltersSchema.parse(filters);

  return useMemo(() => {
    const queryFilters = {
      ...(parsedFilters.kind ? { kind: parsedFilters.kind } : {}),
      ...(parsedFilters.status ? { status: parsedFilters.status } : {}),
      ...(parsedFilters.patientId
        ? { patientId: parsedFilters.patientId }
        : {}),
      ...(parsedFilters.query ? { query: parsedFilters.query } : {}),
    };

    const data = filterOfflineQueueRecords(
      state.items as unknown as import("@/lib/offline/queue").OfflineQueueRecord<Record<string, unknown>>[],
      queryFilters
    )
      .slice(0, parsedFilters.limit) as OfflineSyncRecord[];

    return {
      ...state,
      data,
      summary: summarizeOfflineQueueRecords(data),
    };
  }, [state, parsedFilters]);
}

export function useOfflineSyncViewModelsQuery(
  filters: OfflineSyncFilters = {}
) {
  const query = useOfflineSyncRecordsQuery(filters);

  return useMemo(
    () => ({
      ...query,
      data: query.data.map(buildOfflineSyncViewModel) as OfflineSyncViewModel[],
    }),
    [query]
  );
}

export function useEnqueueOfflineSyncMutation() {
  return useMutation({
    mutationKey: ["offline-sync", "enqueue"],
    mutationFn: queueOfflineSyncRecord,
  });
}

export function useFlushOfflineSyncMutation() {
  return useMutation({
    mutationKey: ["offline-sync", "flush"],
    mutationFn: flushOfflineSyncQueue,
  });
}

export function useRetryOfflineSyncMutation() {
  return useMutation({
    mutationKey: ["offline-sync", "retry"],
    mutationFn: retryOfflineSyncRecord,
  });
}

export function useOfflineSyncKindLabel(kind: string): string {
  return useMemo(() => kind.replace(/_/g, " "), [kind]);
}

export function useOfflineSyncStatusLabel(status: string): string {
  const parsed = offlineSyncStatusSchema.safeParse(status);

  if (!parsed.success) {
    return status;
  }

  return parsed.data.replace(/_/g, " ");
}

export function useOfflineSyncDescription(): string {
  const state = useOfflineSyncState();
  return useMemo(() => describeOfflineSyncState(state), [state]);
}
