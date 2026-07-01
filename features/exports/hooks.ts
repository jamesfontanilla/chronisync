/**
 * =============================================================================
 * ChroniSync
 * Export Feature Hooks
 * =============================================================================
 */

"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  buildExportViewModel,
  getExportDeliveryLabel,
  getExportSectionLabel,
  getExportStatusLabel,
  listExportsByFilters,
  summarizeExports,
  type ExportFilters,
  type ExportDeliveryMethod,
  type ExportFormat,
  type ExportRecord,
  type ExportSection,
  type ExportStatus,
  type ExportSummary,
  type ExportViewModel,
} from "./service";

import {
  exportFormSchema,
  type ExportFormValues,
} from "./validation";
import { humanize } from "@/lib/utils";

type ExportFormInput = z.input<typeof exportFormSchema>;

const exportDefaultValues = {
  patientId: "",
  requestedBy: "",
  format: "pdf",
  sections: ["full_record"],
  status: "queued",
  deliveryMethod: "download",
  fileName: "",
  filePath: "",
  downloadUrl: "",
  checksum: "",
  consentScopes: [],
  notes: "",
  expiresAt: "",
  errorMessage: "",
};

export function useExportForm(
  defaultValues?: Partial<ExportFormValues>
) {
  const mergedDefaults: ExportFormInput = {
    ...exportDefaultValues,
    ...defaultValues,
  } as ExportFormInput;

  return useForm<ExportFormInput, object, ExportFormValues>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: mergedDefaults,
    mode: "onSubmit",
  });
}

export function useExportsQuery(
  patientId?: string,
  filters: Omit<ExportFilters, "patientId"> = {}
) {
  const queryFilters: ExportFilters = {
    ...(patientId ? { patientId } : {}),
    ...(filters.requestedBy ? { requestedBy: filters.requestedBy } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.format ? { format: filters.format } : {}),
    ...(filters.section ? { section: filters.section } : {}),
    ...(filters.query ? { query: filters.query } : {}),
    ...(filters.limit ? { limit: filters.limit } : {}),
    ...(filters.sort ? { sort: filters.sort } : {}),
  };

  return useQuery<ExportRecord[]>({
    queryKey: ["exports", queryFilters],
    queryFn: async () => {
      try {
        return await listExportsByFilters(queryFilters);
      } catch {
        return [];
      }
    },
    staleTime: 45_000,
    placeholderData: [],
  });
}

export function useReadyExportsQuery(patientId?: string) {
  return useQuery<ExportRecord[]>({
    queryKey: ["exports", patientId ?? "", "ready"],
    queryFn: async () => {
      if (!patientId) {
        return [];
      }

      try {
        return await listExportsByFilters({
          patientId,
          status: "ready",
        });
      } catch {
        return [];
      }
    },
    enabled: Boolean(patientId),
    staleTime: 45_000,
    placeholderData: [],
  });
}

export function useExportViewModelsQuery(
  patientId?: string,
  filters: Omit<ExportFilters, "patientId"> = {}
) {
  const query = useExportsQuery(patientId, filters);

  return useMemo(
    () => ({
      ...query,
      data: query.data ? query.data.map(buildExportViewModel) : [],
    }),
    [query]
  ) as typeof query & { data: ExportViewModel[] };
}

export function useExportSummaryQuery(
  patientId?: string,
  filters: Omit<ExportFilters, "patientId"> = {}
) {
  const query = useExportsQuery(patientId, filters);

  return useMemo(
    () => ({
      ...query,
      data: summarizeExports(query.data ?? []),
    }),
    [query]
  ) as typeof query & { data: ExportSummary };
}

export function useExportViewModel(
  exportRecord: ExportRecord
): ExportViewModel {
  return useMemo(
    () => buildExportViewModel(exportRecord),
    [exportRecord]
  );
}

export function useExportFormatLabel(format: ExportFormat): string {
  return useMemo(() => humanize(format), [format]);
}

export function useExportSectionLabel(
  section: ExportSection
): string {
  return useMemo(() => getExportSectionLabel(section), [section]);
}

export function useExportStatusLabel(status: ExportStatus): string {
  return useMemo(() => getExportStatusLabel(status), [status]);
}

export function useExportDeliveryLabel(
  deliveryMethod: ExportDeliveryMethod
): string {
  return useMemo(() => getExportDeliveryLabel(deliveryMethod), [deliveryMethod]);
}
