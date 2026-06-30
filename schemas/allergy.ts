/**
 * =============================================================================
 * ChroniSync
 * Allergy Schemas
 * =============================================================================
 */

import { z } from "zod";

export const allergyTypeSchema = z.enum([
  "drug",
  "food",
  "environmental",
  "latex",
  "other",
]);

export const allergySeveritySchema = z.enum([
  "mild",
  "moderate",
  "severe",
  "anaphylaxis",
]);

export const allergyStatusSchema = z.enum([
  "active",
  "resolved",
]);

export const allergySchema = z.object({
  id: z.string().min(1, "Allergy ID is required."),
  patientId: z.string().min(1, "Patient ID is required."),
  allergen: z.string().trim().min(1, "Allergen is required."),
  type: allergyTypeSchema,
  reaction: z.string().trim().optional(),
  severity: allergySeveritySchema,
  firstObservedAt: z.coerce.date().optional(),
  lastReactionAt: z.coerce.date().optional(),
  status: allergyStatusSchema,
  recordedBy: z.string().min(1).optional(),
  notes: z.string().trim().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type AllergyData = z.infer<typeof allergySchema>;
