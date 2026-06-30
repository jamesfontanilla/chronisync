/**
 * =============================================================================
 * ChroniSync
 * Vital Schemas
 * =============================================================================
 */

import { z } from "zod";

export const vitalTypeSchema = z.enum([
  "blood_pressure",
  "heart_rate",
  "blood_glucose",
  "weight",
  "temperature",
  "oxygen_saturation",
]);

export const vitalSourceSchema = z.enum([
  "manual",
  "device",
  "imported",
]);

export const bloodPressureVitalSchema = z.object({
  id: z.string().min(1, "Vital ID is required."),
  patientId: z.string().min(1, "Patient ID is required."),
  type: z.literal("blood_pressure"),
  systolic: z.number().positive(),
  diastolic: z.number().positive(),
  unit: z.literal("mmHg").optional(),
  recordedAt: z.coerce.date(),
  recordedBy: z.string().min(1).optional(),
  source: vitalSourceSchema.optional(),
  notes: z.string().trim().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const numericVitalTypeSchema = z.enum([
  "heart_rate",
  "blood_glucose",
  "weight",
  "temperature",
  "oxygen_saturation",
]);

export const numericVitalSchema = z.object({
  id: z.string().min(1, "Vital ID is required."),
  patientId: z.string().min(1, "Patient ID is required."),
  type: numericVitalTypeSchema,
  value: z.number(),
  unit: z.enum(["bpm", "mg/dL", "kg", "C", "F", "%"]).optional(),
  recordedAt: z.coerce.date(),
  recordedBy: z.string().min(1).optional(),
  source: vitalSourceSchema.optional(),
  notes: z.string().trim().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const vitalSchema = z.union([
  bloodPressureVitalSchema,
  numericVitalSchema,
]);

export type VitalData = z.infer<typeof vitalSchema>;
