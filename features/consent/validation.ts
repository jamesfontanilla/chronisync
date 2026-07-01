/**
 * =============================================================================
 * ChroniSync
 * Consent Feature Validation
 * =============================================================================
 */

import { z } from "zod";

import {
  consentChannelSchema,
  consentStatusSchema,
} from "@/lib/privacy/consent";
import { privacyScopeSchema } from "@/lib/privacy/policy";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const optionalText = z.preprocess(
  emptyToUndefined,
  z.string().trim().optional()
);

export const consentTargetTypeSchema = z.enum([
  "caregiver",
  "physician",
  "service",
  "organization",
  "ai",
]);

export const consentSortOrderSchema = z.enum([
  "newest",
  "oldest",
  "status",
  "scope",
]);

export const consentFormSchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID is required."),
  scope: privacyScopeSchema,
  status: consentStatusSchema.default("granted"),
  targetType: consentTargetTypeSchema.default("caregiver"),
  targetId: optionalText,
  targetLabel: optionalText,
  purpose: optionalText,
  channel: consentChannelSchema.default("app"),
  grantedBy: optionalText,
  effectiveAt: optionalText,
  expiresAt: optionalText,
  evidence: optionalText,
  notes: optionalText,
});

export type ConsentFormValues = z.infer<typeof consentFormSchema>;

export const consentFiltersSchema = z.object({
  patientId: z.string().trim().optional(),
  scope: privacyScopeSchema.optional(),
  status: consentStatusSchema.optional(),
  targetType: consentTargetTypeSchema.optional(),
  query: z.string().trim().optional(),
  sort: consentSortOrderSchema.default("newest"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ConsentFiltersData = z.infer<typeof consentFiltersSchema>;

export const consentActionSchema = z.object({
  consentId: z.string().trim().min(1, "Consent ID is required."),
  reason: optionalText,
});

export type ConsentActionData = z.infer<typeof consentActionSchema>;
