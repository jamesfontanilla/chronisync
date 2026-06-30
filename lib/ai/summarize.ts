/**
 * =============================================================================
 * ChroniSync
 * AI Visit Summary Schemas
 * =============================================================================
 */

import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                               Input Schema                                 */
/* -------------------------------------------------------------------------- */

export const visitSummaryInputSchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID is required."),
  physicianId: z.string().trim().optional(),
  encounterId: z.string().trim().optional(),
  patientName: z.string().trim().optional(),
  physicianName: z.string().trim().optional(),
  visitDate: z.string().trim().optional(),
  sourceNotes: z.string().trim().min(1, "Source notes are required."),
  patientComplaints: z.array(z.string().trim().min(1)).default([]),
  physicianNotes: z.array(z.string().trim().min(1)).default([]),
  medicationChanges: z.array(z.string().trim().min(1)).default([]),
  followUpSchedule: z.array(z.string().trim().min(1)).default([]),
  vitalHighlights: z.array(z.string().trim().min(1)).default([]),
  documentHighlights: z.array(z.string().trim().min(1)).default([]),
});

export type VisitSummaryInput = z.infer<typeof visitSummaryInputSchema>;

/* -------------------------------------------------------------------------- */
/*                       Gemini Response Schema + Types                       */
/* -------------------------------------------------------------------------- */

export const visitSummaryResponseSchema = z
  .object({
    title: z.string().trim().min(1, "A title is required."),
    content: z.string().trim().min(1, "A summary content body is required."),
    highlights: z.array(z.string().trim().min(1)).default([]),
    recommendations: z.array(z.string().trim().min(1)).default([]),
    patientComplaints: z.array(z.string().trim().min(1)).default([]),
    physicianNotes: z.array(z.string().trim().min(1)).default([]),
    medicationChanges: z.array(z.string().trim().min(1)).default([]),
    followUpSchedule: z.array(z.string().trim().min(1)).default([]),
    confidence: z.number().min(0).max(1).default(0.5),
    needsReview: z.boolean().default(true),
  })
  .passthrough();

export type VisitSummaryResponse = z.infer<
  typeof visitSummaryResponseSchema
>;

export const VISIT_SUMMARY_RESPONSE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  propertyOrdering: [
    "title",
    "content",
    "highlights",
    "recommendations",
    "patientComplaints",
    "physicianNotes",
    "medicationChanges",
    "followUpSchedule",
    "confidence",
    "needsReview",
  ],
  required: [
    "title",
    "content",
    "highlights",
    "recommendations",
    "patientComplaints",
    "physicianNotes",
    "medicationChanges",
    "followUpSchedule",
    "confidence",
    "needsReview",
  ],
  properties: {
    title: {
      type: "string",
      description: "Display title for the visit summary.",
    },
    content: {
      type: "string",
      description: "Full narrative summary of the visit.",
    },
    highlights: {
      type: "array",
      items: { type: "string" },
      description: "Short bullet-point highlights.",
    },
    recommendations: {
      type: "array",
      items: { type: "string" },
      description: "Follow-up actions or review items.",
    },
    patientComplaints: {
      type: "array",
      items: { type: "string" },
      description: "Patient-reported complaints.",
    },
    physicianNotes: {
      type: "array",
      items: { type: "string" },
      description: "Physician note highlights.",
    },
    medicationChanges: {
      type: "array",
      items: { type: "string" },
      description: "Medication changes mentioned in the encounter.",
    },
    followUpSchedule: {
      type: "array",
      items: { type: "string" },
      description: "Follow-up plan or schedule details.",
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
      description: "Confidence score from 0 to 1.",
    },
    needsReview: {
      type: "boolean",
      description: "True when the summary should be reviewed by a physician.",
    },
  },
} as const;

/* -------------------------------------------------------------------------- */
/*                          Review Draft (App Ready)                          */
/* -------------------------------------------------------------------------- */

export const visitSummaryDraftSchema = visitSummaryResponseSchema.extend({
  patientId: z.string().trim().min(1, "Patient ID is required."),
  physicianId: z.string().trim().optional(),
  encounterId: z.string().trim().optional(),
  patientName: z.string().trim().optional(),
  physicianName: z.string().trim().optional(),
  visitDate: z.string().trim().optional(),
  type: z.literal("visit").default("visit"),
  source: z.literal("ai").default("ai"),
  status: z.literal("draft").default("draft"),
  generatedBy: z.string().trim().default("chronisync-ai"),
  model: z.string().trim().optional(),
  sourceNotesLength: z.number().int().nonnegative(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type VisitSummaryDraft = z.infer<
  typeof visitSummaryDraftSchema
>;
