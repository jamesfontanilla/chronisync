/**
 * =============================================================================
 * ChroniSync
 * Symptom Schemas
 * =============================================================================
 */

import { z } from "zod";

export const symptomSeveritySchema = z.enum([
  "mild",
  "moderate",
  "severe",
]);

export const symptomFrequencySchema = z.enum([
  "once",
  "intermittent",
  "daily",
  "constant",
]);

export const symptomStatusSchema = z.enum([
  "active",
  "improving",
  "resolved",
  "worsening",
]);

export const symptomSchema = z.object({
  id: z.string().min(1, "Symptom ID is required."),
  patientId: z.string().min(1, "Patient ID is required."),
  diseaseId: z.string().min(1).optional(),
  name: z.string().trim().min(1, "Symptom name is required."),
  description: z.string().trim().optional(),
  severity: symptomSeveritySchema,
  frequency: symptomFrequencySchema.optional(),
  onsetAt: z.coerce.date().optional(),
  resolvedAt: z.coerce.date().optional(),
  status: symptomStatusSchema,
  triggers: z.array(z.string().trim().min(1)).optional(),
  notes: z.string().trim().optional(),
  recordedBy: z.string().min(1).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type SymptomData = z.infer<typeof symptomSchema>;
