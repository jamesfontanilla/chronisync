import { z } from "zod";

import {
  medicationFrequencySchema,
  medicationRouteSchema,
  medicationStatusSchema,
} from "@/schemas/medication";
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

const optionalRoute = z.preprocess(
  emptyToUndefined,
  medicationRouteSchema.optional()
);

const recordedByRoleSchema = z.enum(RECORD_ORIGIN_ROLES).default("patient");

export const medicationFormSchema = z
  .object({
    patientId: z
      .string()
      .trim()
      .min(1, "Patient ID is required."),
    name: z
      .string()
      .trim()
      .min(1, "Medication name is required."),
    dosage: z.string().trim().min(1, "Dosage is required."),
    route: optionalRoute,
    frequency: medicationFrequencySchema,
    customFrequency: optionalText,
    status: medicationStatusSchema,
    recordedByRole: recordedByRoleSchema,
    startDate: z
      .string()
      .trim()
      .min(1, "Start date is required."),
    endDate: optionalText,
    instructions: optionalText,
    notes: optionalText,
  })
  .superRefine((values, ctx) => {
    if (values.frequency === "custom" && !values.customFrequency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customFrequency"],
        message: "Custom frequency is required when frequency is custom.",
      });
    }

    if (values.endDate && values.endDate < values.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date must be on or after the start date.",
      });
    }
  });

export type MedicationFormValues = z.infer<typeof medicationFormSchema>;
