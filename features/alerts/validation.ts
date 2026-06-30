/**
 * =============================================================================
 * ChroniSync
 * Alert Feature Validation
 * =============================================================================
 */

import { z } from "zod";

export const alertLevelSchema = z.enum([
  "info",
  "warning",
  "critical",
]);

export const alertStatusSchema = z.enum([
  "open",
  "acknowledged",
  "resolved",
  "dismissed",
]);

export const alertSortOrderSchema = z.enum([
  "newest",
  "oldest",
  "severity",
  "status",
]);

export const alertFiltersSchema = z.object({
  patientId: z.string().trim().optional(),
  physicianId: z.string().trim().optional(),
  status: alertStatusSchema.optional(),
  level: alertLevelSchema.optional(),
  query: z.string().trim().optional(),
  sort: alertSortOrderSchema.default("newest"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type AlertFiltersData = z.infer<typeof alertFiltersSchema>;

export const alertActionSchema = z.object({
  alertId: z.string().trim().min(1, "Alert ID is required."),
  notes: z.string().trim().optional(),
});

export type AlertActionData = z.infer<typeof alertActionSchema>;
