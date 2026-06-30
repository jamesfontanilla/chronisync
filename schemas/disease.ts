/**
 * =============================================================================
 * ChroniSync
 * Disease Schemas
 * =============================================================================
 */

import { z } from "zod";

export const diseaseStatusSchema = z.enum([
  "suspected",
  "active",
  "remission",
  "resolved",
]);

export const diseaseSeveritySchema = z.enum([
  "mild",
  "moderate",
  "severe",
]);

export const diseaseSchema = z.object({
  id: z.string().min(1, "Disease ID is required."),
  patientId: z.string().min(1, "Patient ID is required."),
  name: z.string().trim().min(1, "Disease name is required."),
  icd10Code: z.string().trim().optional(),
  diagnosedAt: z.coerce.date().optional(),
  severity: diseaseSeveritySchema.optional(),
  status: diseaseStatusSchema,
  managedByPhysicianId: z.string().min(1).optional(),
  isChronic: z.boolean().optional(),
  notes: z.string().trim().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type DiseaseData = z.infer<typeof diseaseSchema>;
