/**
 * =============================================================================
 * ChroniSync
 * AI Feature Validation
 * =============================================================================
 */

import { AI } from "@/config/constants";
import {
  foodPhotoAnalysisDraftSchema,
  foodPhotoAnalysisInputSchema,
  foodPhotoAnalysisResponseSchema,
  type FoodPhotoAnalysisDraft,
  type FoodPhotoAnalysisInput,
  type FoodPhotoAnalysisResponse,
} from "@/lib/ai/food-photo";
import {
  documentExtractionDraftSchema,
  documentExtractionInputSchema,
  documentExtractionResponseSchema,
  type DocumentExtractionDraft,
  type DocumentExtractionInput,
  type DocumentExtractionResponse,
} from "@/lib/ai/extract";
import {
  visitSummaryDraftSchema,
  visitSummaryInputSchema,
  visitSummaryResponseSchema,
  type VisitSummaryDraft,
  type VisitSummaryInput,
  type VisitSummaryResponse,
} from "@/lib/ai/summarize";
import { z } from "zod";

export {
  foodPhotoAnalysisDraftSchema,
  foodPhotoAnalysisInputSchema,
  foodPhotoAnalysisResponseSchema,
  documentExtractionDraftSchema,
  documentExtractionInputSchema,
  documentExtractionResponseSchema,
  visitSummaryDraftSchema,
  visitSummaryInputSchema,
  visitSummaryResponseSchema,
};

export type {
  FoodPhotoAnalysisDraft,
  FoodPhotoAnalysisInput,
  FoodPhotoAnalysisResponse,
  DocumentExtractionDraft,
  DocumentExtractionInput,
  DocumentExtractionResponse,
  VisitSummaryDraft,
  VisitSummaryInput,
  VisitSummaryResponse,
};

export const aiWorkflowSchema = z.enum([
  "food_photo_analysis",
  "document_extraction",
  "visit_summary",
]);

export type AiWorkflow = z.infer<typeof aiWorkflowSchema>;

export const aiJobStatusSchema = z.enum([
  "idle",
  "pending",
  "success",
  "error",
]);

export type AiJobStatus = z.infer<typeof aiJobStatusSchema>;

export const aiConfidenceSchema = z.number().min(0).max(1);

export type AiConfidence = z.infer<typeof aiConfidenceSchema>;

export const aiConfidenceLevelSchema = z.enum(["low", "medium", "high"]);

export type AiConfidenceLevel = z.infer<typeof aiConfidenceLevelSchema>;

export function getAiConfidenceLevel(confidence: number): AiConfidenceLevel {
  if (confidence >= AI.MIN_CONFIDENCE_SCORE) {
    return "high";
  }

  if (confidence >= 0.6) {
    return "medium";
  }

  return "low";
}

export function formatAiConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}
