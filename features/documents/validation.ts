import { z } from "zod";

import {
  documentCategorySchema,
  documentSourceSchema,
  documentStatusSchema,
} from "@/schemas/document";

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
  documentSourceSchema.optional()
);

const positiveNumberText = z
  .string()
  .trim()
  .regex(/^\d+$/, "Please enter a valid whole number.");

export const documentFormSchema = z.object({
  patientId: z
    .string()
    .trim()
    .min(1, "Patient ID is required."),
  title: z
    .string()
    .trim()
    .min(1, "Document title is required."),
  fileName: z
    .string()
    .trim()
    .min(1, "File name is required."),
  filePath: z
    .string()
    .trim()
    .min(1, "File path is required."),
  contentType: z
    .string()
    .trim()
    .min(1, "Content type is required."),
  sizeBytes: positiveNumberText,
  category: documentCategorySchema,
  status: documentStatusSchema,
  source: optionalSource,
  summary: optionalText,
});

export type DocumentFormValues = z.infer<typeof documentFormSchema>;
