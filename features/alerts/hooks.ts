/**
 * =============================================================================
 * ChroniSync
 * Alert Feature Hooks
 * =============================================================================
 */

"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { AlertFilters, AlertViewModel } from "./types";
import {
  buildAlertViewModel,
  listAlertViewModelsByFilters,
  listAlertsByFilters,
  type AlertRecord,
} from "./service";
import { alertFiltersSchema, alertStatusSchema } from "./validation";

export function useAlertsQuery(filters: AlertFilters = {}) {
  const parsedFilters = alertFiltersSchema.parse(filters);
  const queryFilters: AlertFilters = {
    sort: parsedFilters.sort,
    limit: parsedFilters.limit,
    ...(parsedFilters.patientId
      ? { patientId: parsedFilters.patientId }
      : {}),
    ...(parsedFilters.physicianId
      ? { physicianId: parsedFilters.physicianId }
      : {}),
    ...(parsedFilters.status ? { status: parsedFilters.status } : {}),
    ...(parsedFilters.level ? { level: parsedFilters.level } : {}),
    ...(parsedFilters.query ? { query: parsedFilters.query } : {}),
  };

  return useQuery<AlertRecord[]>({
    queryKey: ["alerts", queryFilters],
    queryFn: async () => {
      try {
        return await listAlertsByFilters(queryFilters);
      } catch {
        return [];
      }
    },
    staleTime: 45_000,
    placeholderData: [],
  });
}

export function useAlertViewModelsQuery(filters: AlertFilters = {}) {
  const query = useAlertsQuery(filters);

  return useMemo(
    () => ({
      ...query,
      data: query.data ? query.data.map(buildAlertViewModel) : [],
    }),
    [query]
  );
}

export function useAlertLevelLabel(level: string): string {
  return level.replace(/_/g, " ");
}

export function useAlertStatusLabel(status: string): string {
  const parsed = alertStatusSchema.safeParse(status);

  if (!parsed.success) {
    return status;
  }

  return parsed.data.replace(/_/g, " ");
}

export function useOpenAlertsQuery(physicianId?: string) {
  return useQuery<AlertViewModel[]>({
    queryKey: ["open-alerts", physicianId ?? "all"],
    queryFn: async () => {
      try {
        return await listAlertViewModelsByFilters({
          ...(physicianId ? { physicianId } : {}),
          status: "open",
          sort: "newest",
          limit: 12,
        });
      } catch {
        return [];
      }
    },
    staleTime: 45_000,
    placeholderData: [],
  });
}
