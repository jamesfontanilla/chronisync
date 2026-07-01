/**
 * =============================================================================
 * ChroniSync
 * Caregiver Feature Validation
 * =============================================================================
 */

import { z } from "zod";

import {
  privacyScopeSchema,
} from "@/lib/privacy/policy";

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

const optionalEmail = z.preprocess(
  emptyToUndefined,
  z.string().trim().email("Enter a valid email address.").optional()
);

export const caregiverRelationshipSchema = z.enum([
  "spouse",
  "partner",
  "parent",
  "child",
  "sibling",
  "relative",
  "friend",
  "guardian",
  "professional",
  "other",
]);

export const caregiverStatusSchema = z.enum([
  "invited",
  "active",
  "paused",
  "revoked",
]);

export const caregiverSortOrderSchema = z.enum([
  "newest",
  "oldest",
  "relationship",
  "status",
]);

export const caregiverFormSchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID is required."),
  fullName: z.string().trim().min(1, "Caregiver name is required."),
  relationship: caregiverRelationshipSchema.default("other"),
  email: optionalEmail,
  phoneNumber: optionalText,
  permissions: z.array(privacyScopeSchema).min(1).default([
    "view_profile",
  ]),
  status: caregiverStatusSchema.default("invited"),
  isPrimary: z.boolean().default(false),
  notes: optionalText,
  invitedBy: optionalText,
});

export type CaregiverFormValues = z.infer<typeof caregiverFormSchema>;

export const caregiverFiltersSchema = z.object({
  patientId: z.string().trim().optional(),
  status: caregiverStatusSchema.optional(),
  relationship: caregiverRelationshipSchema.optional(),
  permission: privacyScopeSchema.optional(),
  query: z.string().trim().optional(),
  sort: caregiverSortOrderSchema.default("newest"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CaregiverFiltersData = z.infer<
  typeof caregiverFiltersSchema
>;

export const caregiverActionSchema = z.object({
  caregiverId: z.string().trim().min(1, "Caregiver ID is required."),
  reason: optionalText,
});

export type CaregiverActionData = z.infer<typeof caregiverActionSchema>;
