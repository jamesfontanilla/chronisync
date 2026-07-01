/**
 * =============================================================================
 * ChroniSync
 * Caregiver Feature Hooks
 * =============================================================================
 */

"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  buildCaregiverViewModel,
  listCaregiversByFilters,
  summarizeCaregivers,
  type CaregiverFilters,
  type CaregiverRecord,
  type CaregiverSummary,
  type CaregiverViewModel,
} from "./service";

import {
  caregiverFormSchema,
  type CaregiverFormValues,
} from "./validation";

import { getPrivacyScopeLabel } from "@/lib/privacy/policy";
import { humanize } from "@/lib/utils";
import type { CaregiverPermission } from "./types";

type CaregiverFormInput = z.input<typeof caregiverFormSchema>;

const caregiverDefaultValues = {
  patientId: "",
  fullName: "",
  relationship: "other",
  email: "",
  phoneNumber: "",
  permissions: ["view_profile"],
  status: "invited",
  isPrimary: false,
  notes: "",
  invitedBy: "",
};

export function useCaregiverForm(
  defaultValues?: Partial<CaregiverFormValues>
) {
  const mergedDefaults: CaregiverFormInput = {
    ...caregiverDefaultValues,
    ...defaultValues,
  } as CaregiverFormInput;

  return useForm<CaregiverFormInput, object, CaregiverFormValues>({
    resolver: zodResolver(caregiverFormSchema),
    defaultValues: mergedDefaults,
    mode: "onSubmit",
  });
}

export function useCaregiverRecordsQuery(
  patientId?: string,
  filters: Omit<CaregiverFilters, "patientId"> = {}
) {
  const queryFilters: CaregiverFilters = {
    ...(patientId ? { patientId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.relationship ? { relationship: filters.relationship } : {}),
    ...(filters.permission ? { permission: filters.permission } : {}),
    ...(filters.query ? { query: filters.query } : {}),
    ...(filters.limit ? { limit: filters.limit } : {}),
    ...(filters.sort ? { sort: filters.sort } : {}),
  };

  return useQuery<CaregiverRecord[]>({
    queryKey: ["caregivers", queryFilters],
    queryFn: async () => {
      try {
        return await listCaregiversByFilters(queryFilters);
      } catch {
        return [];
      }
    },
    staleTime: 45_000,
    placeholderData: [],
  });
}

export function useActiveCaregiverRecordsQuery(patientId?: string) {
  return useQuery<CaregiverRecord[]>({
    queryKey: ["caregivers", patientId ?? "", "active"],
    queryFn: async () => {
      if (!patientId) {
        return [];
      }

      try {
        return await listCaregiversByFilters({
          patientId,
          status: "active",
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

export function useCaregiverViewModelsQuery(
  patientId?: string,
  filters: Omit<CaregiverFilters, "patientId"> = {}
) {
  const query = useCaregiverRecordsQuery(patientId, filters);

  return useMemo(
    () => ({
      ...query,
      data: query.data ? query.data.map(buildCaregiverViewModel) : [],
    }),
    [query]
  ) as typeof query & { data: CaregiverViewModel[] };
}

export function useCaregiverSummaryQuery(
  patientId?: string,
  filters: Omit<CaregiverFilters, "patientId"> = {}
) {
  const query = useCaregiverRecordsQuery(patientId, filters);

  return useMemo(
    () => ({
      ...query,
      data: summarizeCaregivers(query.data ?? []),
    }),
    [query]
  ) as typeof query & { data: CaregiverSummary };
}

export function useCaregiverViewModel(
  caregiver: CaregiverRecord
): CaregiverViewModel {
  return useMemo(
    () => buildCaregiverViewModel(caregiver),
    [caregiver]
  );
}

export function useCaregiverRelationshipLabel(
  relationship: string
): string {
  return useMemo(() => humanize(relationship), [relationship]);
}

export function useCaregiverStatusLabel(status: string): string {
  return useMemo(() => humanize(status), [status]);
}

export function useCaregiverPermissionLabel(
  permission: CaregiverPermission
): string {
  return useMemo(() => getPrivacyScopeLabel(permission), [permission]);
}
