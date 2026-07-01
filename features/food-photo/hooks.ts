/**
 * =============================================================================
 * ChroniSync
 * Food Photo Feature Hooks
 * =============================================================================
 */

"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  buildFoodPhotoDemoRecord,
  buildFoodPhotoViewModel,
  listFoodPhotoRecordsByPatient,
  summarizeFoodPhotoRecords,
  type FoodPhotoFilters,
  type FoodPhotoRecord,
  type FoodPhotoSummary,
  type FoodPhotoViewModel,
} from "./service";

export function useFoodPhotoRecordsQuery(
  patientId?: string,
  filters: Omit<FoodPhotoFilters, "patientId"> = {}
) {
  const queryFilters: FoodPhotoFilters = {
    ...(patientId ? { patientId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.mealType ? { mealType: filters.mealType } : {}),
    ...(filters.query ? { query: filters.query } : {}),
    ...(filters.limit ? { limit: filters.limit } : {}),
  };

  return useQuery<FoodPhotoRecord[]>({
    queryKey: ["food-photo-records", queryFilters],
    queryFn: async () => {
      try {
        return await listFoodPhotoRecordsByPatient(
          patientId ?? "demo-patient",
          filters
        );
      } catch {
        return [buildFoodPhotoDemoRecord(patientId ?? "demo-patient")];
      }
    },
    staleTime: 45_000,
    placeholderData: [buildFoodPhotoDemoRecord(patientId ?? "demo-patient")],
  });
}

export function useFoodPhotoViewModelsQuery(
  patientId?: string,
  filters: Omit<FoodPhotoFilters, "patientId"> = {}
) {
  const query = useFoodPhotoRecordsQuery(patientId, filters);

  return useMemo(
    () => ({
      ...query,
      data: query.data ? query.data.map(buildFoodPhotoViewModel) : [],
    }),
    [query]
  ) as typeof query & { data: FoodPhotoViewModel[] };
}

export function useFoodPhotoSummaryQuery(
  patientId?: string,
  filters: Omit<FoodPhotoFilters, "patientId"> = {}
) {
  const query = useFoodPhotoRecordsQuery(patientId, filters);

  return useMemo(
    () => ({
      ...query,
      data: summarizeFoodPhotoRecords(query.data ?? []),
    }),
    [query]
  ) as typeof query & { data: FoodPhotoSummary };
}

export function useFoodPhotoViewModel(
  record: FoodPhotoRecord
): FoodPhotoViewModel {
  return useMemo(
    () => buildFoodPhotoViewModel(record),
    [record]
  );
}
