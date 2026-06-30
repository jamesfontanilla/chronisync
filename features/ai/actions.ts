/**
 * =============================================================================
 * ChroniSync
 * AI Server Actions
 * =============================================================================
 */

"use server";

import type { DocumentExtractionInput } from "@/lib/ai/extract";
import type { VisitSummaryInput } from "@/lib/ai/summarize";

import {
  extractClinicalDocument,
  generateVisitSummary,
} from "./service";

export async function extractClinicalDocumentAction(
  input: DocumentExtractionInput
) {
  return extractClinicalDocument(input);
}

export async function generateVisitSummaryAction(
  input: VisitSummaryInput
) {
  return generateVisitSummary(input);
}
