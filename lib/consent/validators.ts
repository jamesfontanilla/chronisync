/**
 * =============================================================================
 * ChroniSync
 * Consent Validator Helpers
 * =============================================================================
 */

import { z } from "zod";

import {
  consentChannelSchema,
  consentStatusSchema,
} from "@/lib/privacy/consent";

import {
  CONSENT_SCOPE_GROUP_VALUES,
  consentScopeSchema,
  normalizeConsentScopes,
} from "./scopes";

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

export const consentScopeGroupSchema = z.enum(CONSENT_SCOPE_GROUP_VALUES);

export const consentScopeListSchema = z
  .array(consentScopeSchema)
  .transform((scopes) => normalizeConsentScopes(scopes));

export const consentScopeSelectionSchema = z
  .array(consentScopeSchema)
  .min(1, "Select at least one consent scope.")
  .transform((scopes) => normalizeConsentScopes(scopes));

export const consentScopeToggleSchema = z.object({
  scope: consentScopeSchema,
  enabled: z.boolean().default(true),
  channel: consentChannelSchema.default("app"),
  notes: optionalText,
});

export const consentScopeBatchSchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID is required."),
  scopes: consentScopeSelectionSchema,
  channel: consentChannelSchema.default("app"),
  notes: optionalText,
  requestedBy: optionalText,
});

export const consentScopeFilterSchema = z.object({
  scope: consentScopeSchema.optional(),
  group: consentScopeGroupSchema.optional(),
  status: consentStatusSchema.optional(),
  query: z.string().trim().optional(),
});

export type ConsentScopeBatchValues = z.infer<
  typeof consentScopeBatchSchema
>;

export type ConsentScopeFilterValues = z.infer<
  typeof consentScopeFilterSchema
>;

export type ConsentScopeToggleValues = z.infer<
  typeof consentScopeToggleSchema
>;
