/**
 * =============================================================================
 * ChroniSync
 * Offline Sync Feature Validation
 * =============================================================================
 */

import { z } from "zod";

export const offlineSyncKindSchema = z.enum([
  "diary",
  "food_photo",
  "device_sync",
  "summary",
]);

export const offlineSyncStatusSchema = z.enum([
  "queued",
  "syncing",
  "synced",
  "failed",
  "conflict",
]);

const optionalText = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  },
  z.string().trim().optional()
);

const payloadSchema = z.record(z.string(), z.unknown());

export const offlineSyncQueueFiltersSchema = z.object({
  kind: offlineSyncKindSchema.optional(),
  status: offlineSyncStatusSchema.optional(),
  patientId: z.string().trim().optional(),
  query: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type OfflineSyncQueueFiltersData = z.infer<
  typeof offlineSyncQueueFiltersSchema
>;

export const offlineDiaryCreatePayloadSchema = z.object({
  kind: z.literal("diary"),
  action: z.literal("create"),
  patientId: z.string().trim().min(1, "Patient ID is required."),
  source: optionalText,
  optimisticId: optionalText,
  input: payloadSchema,
});

export const offlineDiaryUpdatePayloadSchema = z.object({
  kind: z.literal("diary"),
  action: z.literal("update"),
  patientId: z.string().trim().min(1, "Patient ID is required."),
  source: optionalText,
  optimisticId: optionalText,
  entryId: z.string().trim().min(1, "Diary entry ID is required."),
  updates: payloadSchema,
});

export const offlineDiaryDeletePayloadSchema = z.object({
  kind: z.literal("diary"),
  action: z.literal("delete"),
  patientId: z.string().trim().min(1, "Patient ID is required."),
  source: optionalText,
  optimisticId: optionalText,
  entryId: z.string().trim().min(1, "Diary entry ID is required."),
});

export const offlineFoodPhotoCreatePayloadSchema = z.object({
  kind: z.literal("food_photo"),
  action: z.literal("create"),
  patientId: z.string().trim().min(1, "Patient ID is required."),
  source: optionalText,
  optimisticId: optionalText,
  input: payloadSchema,
});

export const offlineFoodPhotoUpdatePayloadSchema = z.object({
  kind: z.literal("food_photo"),
  action: z.literal("update"),
  patientId: z.string().trim().min(1, "Patient ID is required."),
  source: optionalText,
  optimisticId: optionalText,
  recordId: z.string().trim().min(1, "Food photo record ID is required."),
  updates: payloadSchema,
});

export const offlineFoodPhotoDeletePayloadSchema = z.object({
  kind: z.literal("food_photo"),
  action: z.literal("delete"),
  patientId: z.string().trim().min(1, "Patient ID is required."),
  source: optionalText,
  optimisticId: optionalText,
  recordId: z.string().trim().min(1, "Food photo record ID is required."),
});

export const offlineDeviceConnectionCreatePayloadSchema = z.object({
  kind: z.literal("device_sync"),
  action: z.literal("connect"),
  patientId: z.string().trim().min(1, "Patient ID is required."),
  source: optionalText,
  optimisticId: optionalText,
  input: payloadSchema,
});

export const offlineDeviceConnectionUpdatePayloadSchema = z.object({
  kind: z.literal("device_sync"),
  action: z.literal("update"),
  patientId: z.string().trim().min(1, "Patient ID is required."),
  source: optionalText,
  optimisticId: optionalText,
  connectionId: z
    .string()
    .trim()
    .min(1, "Device connection ID is required."),
  updates: payloadSchema,
});

export const offlineDeviceConnectionDeletePayloadSchema = z.object({
  kind: z.literal("device_sync"),
  action: z.literal("delete"),
  patientId: z.string().trim().min(1, "Patient ID is required."),
  source: optionalText,
  optimisticId: optionalText,
  connectionId: z
    .string()
    .trim()
    .min(1, "Device connection ID is required."),
});

export const offlineDeviceImportPayloadSchema = z.object({
  kind: z.literal("device_sync"),
  action: z.literal("import"),
  patientId: z.string().trim().min(1, "Patient ID is required."),
  source: optionalText,
  optimisticId: optionalText,
  input: payloadSchema,
});

export const offlineSummaryCreatePayloadSchema = z.object({
  kind: z.literal("summary"),
  action: z.literal("create"),
  patientId: z.string().trim().min(1, "Patient ID is required."),
  source: optionalText,
  optimisticId: optionalText,
  input: payloadSchema,
});

export const offlineSummaryUpdatePayloadSchema = z.object({
  kind: z.literal("summary"),
  action: z.literal("update"),
  patientId: z.string().trim().min(1, "Patient ID is required."),
  source: optionalText,
  optimisticId: optionalText,
  summaryId: z.string().trim().min(1, "Summary ID is required."),
  updates: payloadSchema,
});

export const offlineSummaryPublishPayloadSchema = z.object({
  kind: z.literal("summary"),
  action: z.literal("publish"),
  patientId: z.string().trim().min(1, "Patient ID is required."),
  source: optionalText,
  optimisticId: optionalText,
  summaryId: z.string().trim().min(1, "Summary ID is required."),
});

export const offlineSummaryDeletePayloadSchema = z.object({
  kind: z.literal("summary"),
  action: z.literal("delete"),
  patientId: z.string().trim().min(1, "Patient ID is required."),
  source: optionalText,
  optimisticId: optionalText,
  summaryId: z.string().trim().min(1, "Summary ID is required."),
});

export const offlineSyncMutationSchema = z.union([
  offlineDiaryCreatePayloadSchema,
  offlineDiaryUpdatePayloadSchema,
  offlineDiaryDeletePayloadSchema,
  offlineFoodPhotoCreatePayloadSchema,
  offlineFoodPhotoUpdatePayloadSchema,
  offlineFoodPhotoDeletePayloadSchema,
  offlineDeviceConnectionCreatePayloadSchema,
  offlineDeviceConnectionUpdatePayloadSchema,
  offlineDeviceConnectionDeletePayloadSchema,
  offlineDeviceImportPayloadSchema,
  offlineSummaryCreatePayloadSchema,
  offlineSummaryUpdatePayloadSchema,
  offlineSummaryPublishPayloadSchema,
  offlineSummaryDeletePayloadSchema,
]);

export type OfflineSyncMutationData = z.infer<
  typeof offlineSyncMutationSchema
>;

export const offlineDiaryMutationSchema = z.union([
  offlineDiaryCreatePayloadSchema,
  offlineDiaryUpdatePayloadSchema,
  offlineDiaryDeletePayloadSchema,
]);

export const offlineFoodPhotoMutationSchema = z.union([
  offlineFoodPhotoCreatePayloadSchema,
  offlineFoodPhotoUpdatePayloadSchema,
  offlineFoodPhotoDeletePayloadSchema,
]);

export const offlineDeviceSyncMutationSchema = z.union([
  offlineDeviceConnectionCreatePayloadSchema,
  offlineDeviceConnectionUpdatePayloadSchema,
  offlineDeviceConnectionDeletePayloadSchema,
  offlineDeviceImportPayloadSchema,
]);

export const offlineSummaryMutationSchema = z.union([
  offlineSummaryCreatePayloadSchema,
  offlineSummaryUpdatePayloadSchema,
  offlineSummaryPublishPayloadSchema,
  offlineSummaryDeletePayloadSchema,
]);
