/**
 * =============================================================================
 * ChroniSync
 * Physician Feature Validation
 * =============================================================================
 */

import { z } from "zod";

import { alertLevelSchema, alertStatusSchema } from "@/features/alerts/validation";

export const physicianPanelSchema = z.enum([
  "dashboard",
  "patients",
  "alerts",
  "documents",
  "summaries",
  "treatment",
  "settings",
]);

export type PhysicianPanel = z.infer<typeof physicianPanelSchema>;

export const physicianWorkspaceQuerySchema = z.object({
  physicianId: z.string().trim().optional(),
  panel: physicianPanelSchema.optional(),
  search: z.string().trim().optional(),
  alertLevel: alertLevelSchema.optional(),
  alertStatus: alertStatusSchema.optional(),
});

export type PhysicianWorkspaceQuery = z.infer<
  typeof physicianWorkspaceQuerySchema
>;

export const physicianPatientFiltersSchema = z.object({
  physicianId: z.string().trim().optional(),
  search: z.string().trim().optional(),
  panel: physicianPanelSchema.optional(),
});

export type PhysicianPatientFilters = z.infer<
  typeof physicianPatientFiltersSchema
>;
