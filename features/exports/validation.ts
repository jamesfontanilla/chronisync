/**
 * =============================================================================
 * ChroniSync
 * Export Feature Validation
 * =============================================================================
 */

import { z } from "zod";

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

export const exportSectionSchema = z.enum([
  "full_record",
  "profile",
  "caregivers",
  "consents",
  "medications",
  "vitals",
  "symptoms",
  "diseases",
  "documents",
  "summaries",
  "alerts",
  "appointments",
  "treatment_plan",
  "ai_outputs",
  "provenance",
  "audit_trail",
]);

export const exportFormatSchema = z.enum([
  "json",
  "csv",
  "pdf",
]);

export const exportStatusSchema = z.enum([
  "queued",
  "processing",
  "ready",
  "failed",
  "cancelled",
]);

export const exportDeliveryMethodSchema = z.enum([
  "download",
  "email",
  "storage",
]);

export const exportSortOrderSchema = z.enum([
  "newest",
  "oldest",
  "status",
  "format",
]);

export const exportFormSchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID is required."),
  requestedBy: z.string().trim().min(1, "Requester ID is required."),
  format: exportFormatSchema.default("pdf"),
  sections: z.array(exportSectionSchema).min(1).default(["full_record"]),
  status: exportStatusSchema.default("queued"),
  deliveryMethod: exportDeliveryMethodSchema.default("download"),
  fileName: optionalText,
  filePath: optionalText,
  downloadUrl: optionalText,
  checksum: optionalText,
  consentScopes: z.array(privacyScopeSchema).default([]),
  notes: optionalText,
  expiresAt: optionalText,
  errorMessage: optionalText,
});

export type ExportFormValues = z.infer<typeof exportFormSchema>;

export const exportFiltersSchema = z.object({
  patientId: z.string().trim().optional(),
  requestedBy: z.string().trim().optional(),
  status: exportStatusSchema.optional(),
  format: exportFormatSchema.optional(),
  section: exportSectionSchema.optional(),
  query: z.string().trim().optional(),
  sort: exportSortOrderSchema.default("newest"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ExportFiltersData = z.infer<typeof exportFiltersSchema>;

export const exportActionSchema = z.object({
  exportId: z.string().trim().min(1, "Export ID is required."),
  reason: optionalText,
});

export type ExportActionData = z.infer<typeof exportActionSchema>;
