/**
 * =============================================================================
 * ChroniSync
 * Diary Feature Hooks
 * =============================================================================
 */

"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  buildDiaryDemoEntries,
  buildDiaryViewModel,
  listDiaryEntriesByPatient,
  summarizeDiaryEntries,
  type DiaryEntry,
  type DiaryFilters,
  type DiarySummary,
  type DiaryViewModel,
} from "./service";

export function useDiaryEntriesQuery(
  patientId?: string,
  filters: Omit<DiaryFilters, "patientId"> = {}
) {
  const queryFilters: DiaryFilters = {
    ...(patientId ? { patientId } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.syncState ? { syncState: filters.syncState } : {}),
    ...(filters.query ? { query: filters.query } : {}),
    ...(filters.limit ? { limit: filters.limit } : {}),
  };

  return useQuery<DiaryEntry[]>({
    queryKey: ["diary-entries", queryFilters],
    queryFn: async () => {
      try {
        return await listDiaryEntriesByPatient(
          patientId ?? "demo-patient",
          filters
        );
      } catch {
        return buildDiaryDemoEntries(patientId ?? "demo-patient");
      }
    },
    staleTime: 45_000,
    placeholderData: buildDiaryDemoEntries(patientId ?? "demo-patient"),
  });
}

export function useDiaryViewModelsQuery(
  patientId?: string,
  filters: Omit<DiaryFilters, "patientId"> = {}
) {
  const query = useDiaryEntriesQuery(patientId, filters);

  return useMemo(
    () => ({
      ...query,
      data: query.data ? query.data.map(buildDiaryViewModel) : [],
    }),
    [query]
  ) as typeof query & { data: DiaryViewModel[] };
}

export function useDiarySummaryQuery(
  patientId?: string,
  filters: Omit<DiaryFilters, "patientId"> = {}
) {
  const query = useDiaryEntriesQuery(patientId, filters);

  return useMemo(
    () => ({
      ...query,
      data: summarizeDiaryEntries(query.data ?? []),
    }),
    [query]
  ) as typeof query & { data: DiarySummary };
}

export function useDiaryEntryViewModel(
  entry: DiaryEntry
): DiaryViewModel {
  return useMemo(
    () => buildDiaryViewModel(entry),
    [entry]
  );
}
