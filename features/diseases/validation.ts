import { z } from "zod";

import {
  diseaseSeveritySchema,
  diseaseStatusSchema,
} from "@/schemas/disease";

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

const optionalSeverity = z.preprocess(
  emptyToUndefined,
  diseaseSeveritySchema.optional()
);

export const diseaseFormSchema = z.object({
  patientId: z
    .string()
    .trim()
    .min(1, "Patient ID is required."),
  name: z
    .string()
    .trim()
    .min(1, "Disease name is required."),
  icd10Code: optionalText,
  severity: optionalSeverity,
  status: diseaseStatusSchema,
  isChronic: z.boolean().optional(),
  notes: optionalText,
});

export type DiseaseFormValues = z.infer<typeof diseaseFormSchema>;
