/**
 * =============================================================================
 * ChroniSync
 * Provenance Feature Validation
 * =============================================================================
 */

import { z } from "zod";

import {
  provenanceSourceKindSchema,
  provenanceSubjectTypeSchema,
} from "@/lib/privacy/provenance";

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

export const provenanceSortOrderSchema = z.enum([
  "newest",
  "oldest",
  "source",
  "subject",
  "confidence",
]);

export const provenanceReferenceSchema = z.object({
  subjectType: provenanceSubjectTypeSchema,
  subjectId: z.string().trim().min(1, "Subject ID is required."),
  sourceKind: provenanceSourceKindSchema.optional(),
  sourceId: optionalText,
});

export const provenanceFiltersSchema = z.object({
  subjectType: provenanceSubjectTypeSchema.optional(),
  subjectId: z.string().trim().optional(),
  sourceKind: provenanceSourceKindSchema.optional(),
  sourceId: z.string().trim().optional(),
  redacted: z.boolean().optional(),
  query: z.string().trim().optional(),
  sort: provenanceSortOrderSchema.default("newest"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const provenanceActionSchema = z.object({
  provenanceId: z.string().trim().min(1, "Provenance ID is required."),
  reason: optionalText,
});

export type ProvenanceReferenceValues = z.infer<
  typeof provenanceReferenceSchema
>;

export type ProvenanceFiltersData = z.infer<
  typeof provenanceFiltersSchema
>;

export type ProvenanceActionData = z.infer<typeof provenanceActionSchema>;
