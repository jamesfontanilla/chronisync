/**
 * =============================================================================
 * ChroniSync
 * Document Schemas
 * =============================================================================
 */

import { z } from "zod";

export const documentCategorySchema = z.enum([
  "lab_result",
  "prescription",
  "imaging",
  "referral",
  "discharge_summary",
  "consultation_note",
  "other",
]);

export const documentStatusSchema = z.enum([
  "pending",
  "processing",
  "review_required",
  "approved",
  "rejected",
]);

export const documentSourceSchema = z.enum([
  "patient_upload",
  "physician_upload",
  "system",
]);

export const documentSchema = z.object({
  id: z.string().min(1, "Document ID is required."),
  patientId: z.string().min(1, "Patient ID is required."),
  title: z.string().trim().min(1, "Document title is required."),
  fileName: z.string().trim().min(1, "File name is required."),
  filePath: z.string().trim().min(1, "File path is required."),
  contentType: z.string().trim().min(1, "Content type is required."),
  sizeBytes: z.number().int().nonnegative(),
  category: documentCategorySchema,
  status: documentStatusSchema,
  source: documentSourceSchema.optional(),
  downloadUrl: z.string().url().optional(),
  extractedText: z.string().trim().optional(),
  summary: z.string().trim().optional(),
  uploadedBy: z.string().min(1).optional(),
  reviewedBy: z.string().min(1).optional(),
  reviewedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type DocumentData = z.infer<typeof documentSchema>;
