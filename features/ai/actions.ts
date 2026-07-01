/**
 * =============================================================================
 * ChroniSync
 * AI Server Actions
 * =============================================================================
 */

"use server";

import type { DocumentExtractionInput } from "@/lib/ai/extract";
import type { FoodPhotoAnalysisInput } from "@/lib/ai/food-photo";
import type { VisitSummaryInput } from "@/lib/ai/summarize";

import {
  analyzeFoodPhoto,
  extractClinicalDocument,
  generateVisitSummary,
} from "./service";

export async function analyzeFoodPhotoAction(input: FoodPhotoAnalysisInput) {
  return analyzeFoodPhoto(input);
}

export async function extractClinicalDocumentAction(
  input: DocumentExtractionInput,
) {
  return extractClinicalDocument(input);
}

export async function generateVisitSummaryAction(input: VisitSummaryInput) {
  return generateVisitSummary(input);
}
