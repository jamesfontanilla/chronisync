import { z } from "zod";

import {
  vitalSourceSchema,
} from "@/schemas/vital";

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

const optionalSource = z.preprocess(
  emptyToUndefined,
  vitalSourceSchema.optional()
);

const requiredNumberText = z
  .string()
  .trim()
  .regex(/^-?\d+(?:\.\d+)?$/, "Please enter a valid number.");

const requiredDateText = z
  .string()
  .trim()
  .min(1, "Recorded date is required.");

const patientIdSchema = z
  .string()
  .trim()
  .min(1, "Patient ID is required.");

const bloodPressureFormSchema = z.object({
  patientId: patientIdSchema,
  type: z.literal("blood_pressure"),
  systolic: requiredNumberText,
  diastolic: requiredNumberText,
  recordedAt: requiredDateText,
  source: optionalSource,
  notes: optionalText,
});

const numericVitalTypeSchema = z.enum([
  "heart_rate",
  "blood_glucose",
  "weight",
  "temperature",
  "oxygen_saturation",
]);

const numericVitalFormSchema = z.object({
  patientId: patientIdSchema,
  type: numericVitalTypeSchema,
  value: requiredNumberText,
  recordedAt: requiredDateText,
  source: optionalSource,
  notes: optionalText,
});

export const vitalFormSchema = z.union([
  bloodPressureFormSchema,
  numericVitalFormSchema,
]);

export type VitalFormValues = z.infer<typeof vitalFormSchema>;
