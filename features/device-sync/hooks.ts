"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  buildDeviceConnectionViewModel,
  buildDeviceImportViewModel,
  buildDeviceSyncDemoSummary,
  listDeviceConnectionViewModelRecordsByPatient,
  listDeviceConnectionRecordsByPatient,
  listDeviceImportRecordsByPatient,
  listDeviceImportViewModelRecordsByPatient,
  summarizeDeviceConnectionsByPatient,
  type DeviceConnection,
  type DeviceConnectionFilters,
  type DeviceConnectionViewModel,
  type DeviceImportFilters,
  type DeviceImportRecord,
  type DeviceImportViewModel,
  type DeviceSyncSummary,
} from "./actions";
import {
  deviceConnectionFiltersSchema,
  deviceImportFiltersSchema,
} from "./validation";

export function useDeviceConnectionsQuery(
  patientId?: string,
  filters: Omit<DeviceConnectionFilters, "patientId"> = {}
) {
  const parsedFilters = deviceConnectionFiltersSchema.parse(filters);
  const queryFilters: DeviceConnectionFilters = {
    ...(patientId ? { patientId } : {}),
    ...(parsedFilters.provider ? { provider: parsedFilters.provider } : {}),
    ...(parsedFilters.status ? { status: parsedFilters.status } : {}),
    ...(parsedFilters.query ? { query: parsedFilters.query } : {}),
    limit: parsedFilters.limit,
  };

  return useQuery<DeviceConnection[]>({
    queryKey: ["device-connections", queryFilters],
    queryFn: async () => {
      try {
        return await listDeviceConnectionRecordsByPatient(
          patientId ?? "demo-patient",
          filters
        );
      } catch {
        return [];
      }
    },
    staleTime: 45_000,
    placeholderData: [],
  });
}

export function useDeviceConnectionViewModelsQuery(
  patientId?: string,
  filters: Omit<DeviceConnectionFilters, "patientId"> = {}
) {
  const query = useQuery<DeviceConnectionViewModel[]>({
    queryKey: [
      "device-connection-view-models",
      patientId ?? "demo-patient",
      filters,
    ],
    queryFn: async () => {
      try {
        return await listDeviceConnectionViewModelRecordsByPatient(
          patientId ?? "demo-patient",
          filters
        );
      } catch {
        const records = await listDeviceConnectionRecordsByPatient(
          patientId ?? "demo-patient",
          filters
        );
        return records.map(buildDeviceConnectionViewModel);
      }
    },
    staleTime: 45_000,
    placeholderData: [],
  });

  return useMemo(
    () => ({
      ...query,
      data: query.data ?? [],
    }),
    [query]
  ) as typeof query & { data: DeviceConnectionViewModel[] };
}

export function useDeviceImportsQuery(
  patientId?: string,
  filters: Omit<DeviceImportFilters, "patientId"> = {}
) {
  const parsedFilters = deviceImportFiltersSchema.parse(filters);
  const queryFilters: DeviceImportFilters = {
    ...(patientId ? { patientId } : {}),
    ...(parsedFilters.connectionId
      ? { connectionId: parsedFilters.connectionId }
      : {}),
    ...(parsedFilters.provider ? { provider: parsedFilters.provider } : {}),
    ...(parsedFilters.status ? { status: parsedFilters.status } : {}),
    ...(parsedFilters.primaryMetric
      ? { primaryMetric: parsedFilters.primaryMetric }
      : {}),
    ...(parsedFilters.query ? { query: parsedFilters.query } : {}),
    limit: parsedFilters.limit,
  };

  return useQuery<DeviceImportRecord[]>({
    queryKey: ["device-imports", queryFilters],
    queryFn: async () => {
      try {
        return await listDeviceImportRecordsByPatient(
          patientId ?? "demo-patient",
          filters
        );
      } catch {
        return [];
      }
    },
    staleTime: 45_000,
    placeholderData: [],
  });
}

export function useDeviceImportViewModelsQuery(
  patientId?: string,
  filters: Omit<DeviceImportFilters, "patientId"> = {}
) {
  const query = useQuery<DeviceImportViewModel[]>({
    queryKey: ["device-import-view-models", patientId ?? "demo-patient", filters],
    queryFn: async () => {
      try {
        return await listDeviceImportViewModelRecordsByPatient(
          patientId ?? "demo-patient",
          filters
        );
      } catch {
        const records = await listDeviceImportRecordsByPatient(
          patientId ?? "demo-patient",
          filters
        );
        return records.map(buildDeviceImportViewModel);
      }
    },
    staleTime: 45_000,
    placeholderData: [],
  });

  return useMemo(
    () => ({
      ...query,
      data: query.data ?? [],
    }),
    [query]
  ) as typeof query & { data: DeviceImportViewModel[] };
}

export function useDeviceSyncSummaryQuery(
  patientId?: string,
  connectionFilters: Omit<DeviceConnectionFilters, "patientId"> = {},
  importFilters: Omit<DeviceImportFilters, "patientId"> = {}
) {
  return useQuery<DeviceSyncSummary>({
    queryKey: [
      "device-sync-summary",
      patientId ?? "demo-patient",
      connectionFilters,
      importFilters,
    ],
    queryFn: async () => {
      try {
        return await summarizeDeviceConnectionsByPatient(
          patientId ?? "demo-patient",
          connectionFilters,
          importFilters
        );
      } catch {
        return buildDeviceSyncDemoSummary(patientId ?? "demo-patient");
      }
    },
    staleTime: 45_000,
    placeholderData: buildDeviceSyncDemoSummary(patientId ?? "demo-patient"),
  });
}

export function useDeviceConnectionLabel(provider: string): string {
  return useMemo(() => provider.replace(/_/g, " "), [provider]);
}

export function useDeviceConnectionStatusLabel(status: string): string {
  return useMemo(() => status.replace(/_/g, " "), [status]);
}

export function useDeviceImportStatusLabel(status: string): string {
  return useMemo(() => status.replace(/_/g, " "), [status]);
}
