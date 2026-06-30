/**
 * =============================================================================
 * ChroniSync
 * Patient Schemas
 * =============================================================================
 */

import { z } from "zod";

const accountStatusSchema = z.enum([
  "active",
  "inactive",
  "pending",
  "suspended",
]);

export const biologicalSexSchema = z.enum(["male", "female"]);

export const bloodTypeSchema = z.enum([
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
]);

export const emergencyContactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Emergency contact name is required."),
  relationship: z
    .string()
    .trim()
    .min(1, "Relationship is required."),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Phone number is required."),
});

export type EmergencyContactData = z.infer<
  typeof emergencyContactSchema
>;

export const chronicConditionSchema = z.object({
  id: z.string().min(1, "Condition ID is required."),
  name: z
    .string()
    .trim()
    .min(1, "Condition name is required."),
  diagnosedAt: z.coerce.date().optional(),
  notes: z.string().trim().optional(),
});

export type ChronicConditionData = z.infer<
  typeof chronicConditionSchema
>;

const baseUserSchema = z.object({
  id: z.string().min(1, "User ID is required."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address.")
    .toLowerCase(),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters."),
  role: z.literal("patient"),
  status: accountStatusSchema,
  photoURL: z.string().url().optional(),
  emailVerified: z.boolean(),
  phoneNumber: z.string().trim().optional(),
  timezone: z.string().trim().optional(),
  language: z.string().trim().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastLoginAt: z.coerce.date().optional(),
});

export const patientSchema = baseUserSchema.extend({
  dateOfBirth: z.coerce.date(),
  biologicalSex: biologicalSexSchema,
  bloodType: bloodTypeSchema.optional(),
  heightCm: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  chronicConditions: z.array(chronicConditionSchema),
  emergencyContact: emergencyContactSchema,
  physicianId: z.string().min(1).optional(),
});

export type PatientData = z.infer<typeof patientSchema>;

export const patientSummarySchema = z.object({
  patientId: z.string().min(1, "Patient ID is required."),
  latestBloodPressure: z.string().optional(),
  latestHeartRate: z.number().optional(),
  latestBloodGlucose: z.number().optional(),
  latestWeightKg: z.number().optional(),
  activeMedicationCount: z.number().int().nonnegative(),
  activeAlertCount: z.number().int().nonnegative(),
  lastUpdated: z.coerce.date(),
});

export type PatientSummaryData = z.infer<
  typeof patientSummarySchema
>;
