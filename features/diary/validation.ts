import { z } from "zod";

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

export const diaryEntryTypeSchema = z.enum([
  "glucose",
  "pressure",
  "weight",
  "medication",
  "diet",
  "exercise",
  "voice_note",
  "note",
]);

export const diaryEntrySourceSchema = z.enum([
  "manual",
  "voice",
  "photo",
  "device",
  "imported",
]);

export const diarySyncStateSchema = z.enum([
  "queued",
  "syncing",
  "synced",
  "conflict",
]);

export const diaryEntryFormSchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID is required."),
  type: diaryEntryTypeSchema,
  title: z.string().trim().min(1, "Title is required."),
  content: z.string().trim().min(1, "Content is required."),
  valueLabel: optionalText,
  source: diaryEntrySourceSchema.default("manual"),
  syncState: diarySyncStateSchema.default("queued"),
  recordedAt: z.string().trim().min(1, "Recorded date is required."),
  tags: optionalText,
});

export type DiaryFormValues = z.infer<typeof diaryEntryFormSchema>;

export const diaryFiltersSchema = z.object({
  patientId: z.string().trim().optional(),
  type: diaryEntryTypeSchema.optional(),
  syncState: diarySyncStateSchema.optional(),
  query: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type DiaryFiltersData = z.infer<typeof diaryFiltersSchema>;
