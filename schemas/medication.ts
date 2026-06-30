/**
 * =============================================================================
 * ChroniSync
 * Medication Schemas
 * =============================================================================
 */

import { z } from "zod";

export const medicationRouteSchema = z.enum([
  "oral",
  "topical",
  "inhaled",
  "injection",
  "intravenous",
  "subcutaneous",
  "rectal",
  "other",
]);

export const medicationFrequencySchema = z.enum([
  "once_daily",
  "twice_daily",
  "three_times_daily",
  "every_other_day",
  "weekly",
  "as_needed",
  "custom",
]);

export const medicationStatusSchema = z.enum([
  "active",
  "paused",
  "completed",
  "discontinued",
]);

export const medicationSchema = z
  .object({
    id: z.string().min(1, "Medication ID is required."),
    patientId: z.string().min(1, "Patient ID is required."),
    prescribedBy: z.string().min(1).optional(),
    name: z.string().trim().min(1, "Medication name is required."),
    genericName: z.string().trim().optional(),
    dosage: z.string().trim().min(1, "Dosage is required."),
    strength: z.string().trim().optional(),
    route: medicationRouteSchema.optional(),
    frequency: medicationFrequencySchema,
    customFrequency: z.string().trim().optional(),
    instructions: z.string().trim().optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    status: medicationStatusSchema,
    refillRemaining: z.number().int().nonnegative().optional(),
    isAsNeeded: z.boolean().optional(),
    notes: z.string().trim().optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
  .superRefine((value, ctx) => {
    if (value.frequency === "custom" && !value.customFrequency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customFrequency"],
        message:
          "Custom frequency is required when frequency is set to custom.",
      });
    }

    if (value.endDate && value.endDate < value.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date must be on or after the start date.",
      });
    }
  });

export type MedicationData = z.infer<typeof medicationSchema>;
