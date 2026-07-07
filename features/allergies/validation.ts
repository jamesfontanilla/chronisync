import { z } from "zod";

import {
  allergySeveritySchema,
  allergyStatusSchema,
  allergyTypeSchema,
} from "@/schemas/allergy";
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

const recordedByRoleSchema = z.enum(RECORD_ORIGIN_ROLES).default("patient");

export const allergyFormSchema = z.object({
  patientId: z
    .string()
    .trim()
    .min(1, "Patient ID is required."),
  allergen: z
    .string()
    .trim()
    .min(1, "Allergen is required."),
  recordedByRole: recordedByRoleSchema,
  type: allergyTypeSchema,
  severity: allergySeveritySchema,
  status: allergyStatusSchema,
  reaction: optionalText,
  notes: optionalText,
});

export type AllergyFormValues = z.infer<typeof allergyFormSchema>;
