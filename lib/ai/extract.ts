/**
 * =============================================================================
 * ChroniSync
 * AI Document Extraction Schemas
 * =============================================================================
 */

import { z } from "zod";

import { documentCategorySchema } from "@/schemas/document";

/* -------------------------------------------------------------------------- */
/*                               Input Schema                                 */
/* -------------------------------------------------------------------------- */

export const documentExtractionInputSchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID is required."),
  documentId: z.string().trim().min(1).optional(),
  documentTitle: z.string().trim().optional(),
  fileName: z.string().trim().optional(),
  fileType: z.string().trim().optional(),
  categoryHint: documentCategorySchema.optional(),
  physicianName: z.string().trim().optional(),
  sourceUrl: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  sourceText: z.string().trim().min(1, "Source text is required."),
});

export type DocumentExtractionInput = z.infer<
  typeof documentExtractionInputSchema
>;

/* -------------------------------------------------------------------------- */
/*                           Shared Extraction Types                          */
/* -------------------------------------------------------------------------- */

export const labValueSchema = z
  .object({
    name: z.string().trim().min(1, "Lab name is required."),
    value: z.string().trim().min(1, "Lab value is required."),
    unit: z.string().trim().optional(),
    referenceRange: z.string().trim().optional(),
    interpretation: z.string().trim().optional(),
  })
  .passthrough();

export const medicationMentionSchema = z
  .object({
    name: z.string().trim().min(1, "Medication name is required."),
    dosage: z.string().trim().optional(),
    frequency: z.string().trim().optional(),
    route: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  })
  .passthrough();

export const dateMentionSchema = z
  .object({
    label: z.string().trim().min(1, "Date label is required."),
    value: z.string().trim().min(1, "Date value is required."),
  })
  .passthrough();

/* -------------------------------------------------------------------------- */
/*                       Gemini Response Schema + Types                       */
/* -------------------------------------------------------------------------- */

export const documentExtractionResponseSchema = z
  .object({
    title: z.string().trim().min(1, "A title is required."),
    category: documentCategorySchema,
    summary: z.string().trim().min(1, "A summary is required."),
    highlights: z.array(z.string().trim().min(1)).default([]),
    labValues: z.array(labValueSchema).default([]),
    medications: z.array(medicationMentionSchema).default([]),
    diagnosisLabels: z.array(z.string().trim().min(1)).default([]),
    physicianNames: z.array(z.string().trim().min(1)).default([]),
    dates: z.array(dateMentionSchema).default([]),
    confidence: z.number().min(0).max(1).default(0.5),
    needsReview: z.boolean().default(true),
  })
  .passthrough();

export type DocumentExtractionResponse = z.infer<
  typeof documentExtractionResponseSchema
>;

export const DOCUMENT_EXTRACTION_RESPONSE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  propertyOrdering: [
    "title",
    "category",
    "summary",
    "highlights",
    "labValues",
    "medications",
    "diagnosisLabels",
    "physicianNames",
    "dates",
    "confidence",
    "needsReview",
  ],
  required: [
    "title",
    "category",
    "summary",
    "highlights",
    "labValues",
    "medications",
    "diagnosisLabels",
    "physicianNames",
    "dates",
    "confidence",
    "needsReview",
  ],
  properties: {
    title: {
      type: "string",
      description: "Display title for the extracted document.",
    },
    category: {
      type: "string",
      enum: [
        "lab_result",
        "prescription",
        "imaging",
        "referral",
        "discharge_summary",
        "consultation_note",
        "other",
      ],
      description: "Best matching document category.",
    },
    summary: {
      type: "string",
      description: "Short factual summary of the document.",
    },
    highlights: {
      type: "array",
      items: { type: "string" },
      description: "Bullet-point highlights from the document.",
    },
    labValues: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "value"],
        properties: {
          name: { type: "string" },
          value: { type: "string" },
          unit: { type: "string" },
          referenceRange: { type: "string" },
          interpretation: { type: "string" },
        },
      },
      description: "Detected laboratory values.",
    },
    medications: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name"],
        properties: {
          name: { type: "string" },
          dosage: { type: "string" },
          frequency: { type: "string" },
          route: { type: "string" },
          notes: { type: "string" },
        },
      },
      description: "Detected medication mentions.",
    },
    diagnosisLabels: {
      type: "array",
      items: { type: "string" },
      description: "Diagnosis labels mentioned in the document.",
    },
    physicianNames: {
      type: "array",
      items: { type: "string" },
      description: "Physician names mentioned in the document.",
    },
    dates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "value"],
        properties: {
          label: { type: "string" },
          value: { type: "string" },
        },
      },
      description: "Important dates found in the document.",
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
      description: "Confidence score from 0 to 1.",
    },
    needsReview: {
      type: "boolean",
      description: "True when the extracted data should be reviewed by a physician.",
    },
  },
} as const;

/* -------------------------------------------------------------------------- */
/*                          Review Draft (App Ready)                          */
/* -------------------------------------------------------------------------- */

export const documentExtractionDraftSchema = documentExtractionResponseSchema
  .extend({
    patientId: z.string().trim().min(1, "Patient ID is required."),
    documentId: z.string().trim().optional(),
    documentTitle: z.string().trim().optional(),
    fileName: z.string().trim().optional(),
    fileType: z.string().trim().optional(),
    categoryHint: documentCategorySchema.optional(),
    physicianName: z.string().trim().optional(),
    sourceUrl: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    sourceTextLength: z.number().int().nonnegative(),
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .passthrough();

export type DocumentExtractionDraft = z.infer<
  typeof documentExtractionDraftSchema
>;
