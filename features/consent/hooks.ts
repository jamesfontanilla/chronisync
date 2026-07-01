/**
 * =============================================================================
 * ChroniSync
 * Consent Feature Hooks
 * =============================================================================
 */

"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  buildConsentViewModel,
  hasConsentForScope,
  listActiveConsentsByPatient,
  listConsentsByFilters,
  summarizeConsents,
  type ConsentFilters,
  type ConsentRecord,
  type ConsentSummary,
  type ConsentViewModel,
} from "./service";

import {
  consentFormSchema,
  type ConsentFormValues,
} from "./validation";

import {
  getConsentChannelLabel,
  getConsentStatusLabel,
  describeConsentScope,
  type ConsentChannel,
  type ConsentStatus,
} from "@/lib/privacy/consent";
import type { ConsentScope } from "./types";

type ConsentFormInput = z.input<typeof consentFormSchema>;

const consentDefaultValues = {
  patientId: "",
  scope: "view_profile",
  status: "granted",
  targetType: "caregiver",
  targetId: "",
  targetLabel: "",
  purpose: "",
  channel: "app",
  grantedBy: "",
  effectiveAt: "",
  expiresAt: "",
  evidence: "",
  notes: "",
};

export function useConsentForm(
  defaultValues?: Partial<ConsentFormValues>
) {
  const mergedDefaults: ConsentFormInput = {
    ...consentDefaultValues,
    ...defaultValues,
  } as ConsentFormInput;

  return useForm<ConsentFormInput, object, ConsentFormValues>({
    resolver: zodResolver(consentFormSchema),
    defaultValues: mergedDefaults,
    mode: "onSubmit",
  });
}

export function useConsentsQuery(
  patientId?: string,
  filters: Omit<ConsentFilters, "patientId"> = {}
) {
  const queryFilters: ConsentFilters = {
    ...(patientId ? { patientId } : {}),
    ...(filters.scope ? { scope: filters.scope } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.targetType ? { targetType: filters.targetType } : {}),
    ...(filters.query ? { query: filters.query } : {}),
    ...(filters.limit ? { limit: filters.limit } : {}),
    ...(filters.sort ? { sort: filters.sort } : {}),
  };

  return useQuery<ConsentRecord[]>({
    queryKey: ["consents", queryFilters],
    queryFn: async () => {
      try {
        return await listConsentsByFilters(queryFilters);
      } catch {
        return [];
      }
    },
    staleTime: 45_000,
    placeholderData: [],
  });
}

export function useActiveConsentsQuery(patientId?: string) {
  return useQuery<ConsentRecord[]>({
    queryKey: ["consents", patientId ?? "", "active"],
    queryFn: async () => {
      if (!patientId) {
        return [];
      }

      try {
        return await listActiveConsentsByPatient(patientId);
      } catch {
        return [];
      }
    },
    enabled: Boolean(patientId),
    staleTime: 45_000,
    placeholderData: [],
  });
}

export function useConsentViewModelsQuery(
  patientId?: string,
  filters: Omit<ConsentFilters, "patientId"> = {}
) {
  const query = useConsentsQuery(patientId, filters);

  return useMemo(
    () => ({
      ...query,
      data: query.data ? query.data.map(buildConsentViewModel) : [],
    }),
    [query]
  ) as typeof query & { data: ConsentViewModel[] };
}

export function useConsentSummaryQuery(
  patientId?: string,
  filters: Omit<ConsentFilters, "patientId"> = {}
) {
  const query = useConsentsQuery(patientId, filters);

  return useMemo(
    () => ({
      ...query,
      data: summarizeConsents(query.data ?? []),
    }),
    [query]
  ) as typeof query & { data: ConsentSummary };
}

export function useConsentViewModel(
  consent: ConsentRecord
): ConsentViewModel {
  return useMemo(
    () => buildConsentViewModel(consent),
    [consent]
  );
}

export function useConsentScopeLabel(scope: ConsentScope): string {
  return useMemo(() => describeConsentScope(scope), [scope]);
}

export function useConsentStatusLabel(status: ConsentStatus): string {
  return useMemo(() => getConsentStatusLabel(status), [status]);
}

export function useConsentChannelLabel(channel: ConsentChannel): string {
  return useMemo(() => getConsentChannelLabel(channel), [channel]);
}

export function useHasConsentForScope(
  consents: readonly ConsentRecord[],
  scope: ConsentScope
): boolean {
  return useMemo(
    () => hasConsentForScope(consents, scope),
    [consents, scope]
  );
}
