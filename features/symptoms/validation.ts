import { z } from "zod";

import {
  symptomFrequencySchema,
  symptomSeveritySchema,
  symptomStatusSchema,
} from "@/schemas/symptom";
import { RECORD_ORIGIN_ROLES } from "@/types/provenance";

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

const optionalFrequency = z.preprocess(
  emptyToUndefined,
  symptomFrequencySchema.optional()
);

const recordedByRoleSchema = z.enum(RECORD_ORIGIN_ROLES).default("patient");

export const symptomFormSchema = z.object({
  patientId: z
    .string()
    .trim()
    .min(1, "Patient ID is required."),
  recordedByRole: recordedByRoleSchema,
  name: z
    .string()
    .trim()
    .min(1, "Symptom name is required."),
  severity: symptomSeveritySchema,
  frequency: optionalFrequency,
  status: symptomStatusSchema,
  description: optionalText,
  notes: optionalText,
});

export type SymptomFormValues = z.infer<typeof symptomFormSchema>;
