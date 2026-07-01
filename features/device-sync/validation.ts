/**
 * =============================================================================
 * ChroniSync
 * Device Sync Feature Validation
 * =============================================================================
 */

import { z } from "zod";

import { vitalTypeSchema } from "@/schemas/vital";

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

const optionalDate = z.preprocess(
  emptyToUndefined,
  z.coerce.date().optional()
);

export const deviceSyncProviderSchema = z.enum([
  "bluetooth",
  "usb",
  "vendor_import",
  "csv",
  "apple_health",
  "google_fit",
  "manual",
]);

export const deviceConnectionStatusSchema = z.enum([
  "connected",
  "connecting",
  "syncing",
  "paused",
  "disconnected",
  "error",
]);

export const deviceImportStatusSchema = z.enum([
  "queued",
  "syncing",
  "synced",
  "failed",
  "conflict",
]);

export const deviceConnectionFiltersSchema = z.object({
  patientId: z.string().trim().optional(),
  provider: deviceSyncProviderSchema.optional(),
  status: deviceConnectionStatusSchema.optional(),
  query: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type DeviceConnectionFiltersData = z.infer<
  typeof deviceConnectionFiltersSchema
>;

export const deviceImportFiltersSchema = z.object({
  patientId: z.string().trim().optional(),
  connectionId: z.string().trim().optional(),
  provider: deviceSyncProviderSchema.optional(),
  status: deviceImportStatusSchema.optional(),
  primaryMetric: vitalTypeSchema.optional(),
  query: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type DeviceImportFiltersData = z.infer<
  typeof deviceImportFiltersSchema
>;

export const deviceConnectionActionSchema = z
  .object({
    patientId: z.string().trim().min(1, "Patient ID is required."),
    provider: deviceSyncProviderSchema,
    deviceName: z.string().trim().min(1, "Device name is required."),
    externalId: optionalText,
    status: deviceConnectionStatusSchema.default("connected"),
    autoSyncEnabled: z.coerce.boolean().default(true),
    syncIntervalMinutes: z.coerce.number().int().min(5).max(1440).default(60),
    supportedMetrics: z.array(vitalTypeSchema).default([]),
    lastSyncedAt: optionalDate,
    lastSeenAt: optionalDate,
    notes: optionalText,
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.supportedMetrics.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["supportedMetrics"],
        message: "Select at least one supported metric.",
      });
    }
  });

export type DeviceConnectionActionData = z.infer<
  typeof deviceConnectionActionSchema
>;

export const deviceConnectionUpdateSchema = z.object({
  connectionId: z.string().trim().min(1, "Connection ID is required."),
  provider: deviceSyncProviderSchema.optional(),
  deviceName: z.string().trim().optional(),
  externalId: optionalText,
  status: deviceConnectionStatusSchema.optional(),
  autoSyncEnabled: z.coerce.boolean().optional(),
  syncIntervalMinutes: z.coerce.number().int().min(5).max(1440).optional(),
  supportedMetrics: z.array(vitalTypeSchema).optional(),
  lastSyncedAt: optionalDate,
  lastSeenAt: optionalDate,
  notes: optionalText,
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type DeviceConnectionUpdateData = z.infer<
  typeof deviceConnectionUpdateSchema
>;

export const deviceImportActionSchema = z
  .object({
    patientId: z.string().trim().min(1, "Patient ID is required."),
    provider: deviceSyncProviderSchema,
    connectionId: z.string().trim().optional(),
    sourceName: z.string().trim().min(1, "Source name is required."),
    fileName: optionalText,
    primaryMetric: vitalTypeSchema.optional(),
    status: deviceImportStatusSchema.default("queued"),
    recordCount: z.coerce.number().int().min(0).default(0),
    acceptedCount: z.coerce.number().int().min(0).default(0),
    rejectedCount: z.coerce.number().int().min(0).default(0),
    lastSyncedAt: optionalDate,
    capturedAt: optionalDate,
    notes: optionalText,
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.acceptedCount + values.rejectedCount > values.recordCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recordCount"],
        message:
          "Record count must be at least the number of accepted and rejected items.",
      });
    }
  });

export type DeviceImportActionData = z.infer<typeof deviceImportActionSchema>;

export const deviceImportUpdateSchema = z.object({
  importId: z.string().trim().min(1, "Import ID is required."),
  provider: deviceSyncProviderSchema.optional(),
  connectionId: z.string().trim().optional(),
  sourceName: z.string().trim().optional(),
  fileName: optionalText,
  primaryMetric: vitalTypeSchema.optional(),
  status: deviceImportStatusSchema.optional(),
  recordCount: z.coerce.number().int().min(0).optional(),
  acceptedCount: z.coerce.number().int().min(0).optional(),
  rejectedCount: z.coerce.number().int().min(0).optional(),
  lastSyncedAt: optionalDate,
  capturedAt: optionalDate,
  notes: optionalText,
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type DeviceImportUpdateData = z.infer<typeof deviceImportUpdateSchema>;
