/**
 * =============================================================================
 * ChroniSync
 * Provenance Feature Hooks
 * =============================================================================
 */

"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { humanize } from "@/lib/utils";

import {
  buildProvenanceViewModel,
  getProvenanceSourceLabel,
  getProvenanceSubjectLabel,
  listProvenanceRecordsByFilters,
  summarizeProvenanceRecords,
  type ProvenanceFilters,
  type ProvenanceRecord,
  type ProvenanceSourceKind,
  type ProvenanceSortOrder,
  type ProvenanceSubjectType,
  type ProvenanceSummary,
  type ProvenanceViewModel,
} from "./service";

export function useProvenanceRecordsQuery(
  filters: ProvenanceFilters = {}
) {
  const queryFilters: ProvenanceFilters = {
    ...(filters.subjectType ? { subjectType: filters.subjectType } : {}),
    ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
    ...(filters.sourceKind ? { sourceKind: filters.sourceKind } : {}),
    ...(filters.sourceId ? { sourceId: filters.sourceId } : {}),
    ...(filters.redacted !== undefined
      ? { redacted: filters.redacted }
      : {}),
    ...(filters.query ? { query: filters.query } : {}),
    ...(filters.sort ? { sort: filters.sort } : {}),
    ...(filters.limit ? { limit: filters.limit } : {}),
  };

  return useQuery<ProvenanceRecord[]>({
    queryKey: ["provenance", queryFilters],
    queryFn: async () => {
      try {
        return await listProvenanceRecordsByFilters(queryFilters);
      } catch {
        return [];
      }
    },
    staleTime: 45_000,
    placeholderData: [],
  });
}

export function useProvenanceViewModelsQuery(
  filters: ProvenanceFilters = {}
) {
  const query = useProvenanceRecordsQuery(filters);

  return useMemo(
    () => ({
      ...query,
      data: query.data ? query.data.map(buildProvenanceViewModel) : [],
    }),
    [query]
  ) as typeof query & { data: ProvenanceViewModel[] };
}

export function useProvenanceSummaryQuery(
  filters: ProvenanceFilters = {}
) {
  const query = useProvenanceRecordsQuery(filters);

  return useMemo(
    () => ({
      ...query,
      data: summarizeProvenanceRecords(query.data ?? []),
    }),
    [query]
  ) as typeof query & { data: ProvenanceSummary };
}

export function useProvenanceViewModel(
  provenance: ProvenanceRecord
): ProvenanceViewModel {
  return useMemo(
    () => buildProvenanceViewModel(provenance),
    [provenance]
  );
}

export function useProvenanceSubjectLabel(
  subjectType: ProvenanceSubjectType
): string {
  return useMemo(() => getProvenanceSubjectLabel(subjectType), [subjectType]);
}

export function useProvenanceSourceLabel(
  sourceKind: ProvenanceSourceKind
): string {
  return useMemo(() => getProvenanceSourceLabel(sourceKind), [sourceKind]);
}

export function useProvenanceSortLabel(
  sort: ProvenanceSortOrder
): string {
  return useMemo(() => humanize(sort), [sort]);
}
