"use client";

import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";

import {
  extractClinicalDocumentAction,
  generateVisitSummaryAction,
} from "./actions";
import {
  formatAiConfidence,
  getAiConfidenceLevel,
  type AiConfidenceLevel,
  type AiWorkflow,
} from "./validation";
import type { DocumentExtractionInput } from "@/lib/ai/extract";
import type { VisitSummaryInput } from "@/lib/ai/summarize";

export function useExtractClinicalDocumentMutation() {
  return useMutation({
    mutationKey: ["ai", "document-extraction"],
    mutationFn: (input: DocumentExtractionInput) =>
      extractClinicalDocumentAction(input),
  });
}

export function useGenerateVisitSummaryMutation() {
  return useMutation({
    mutationKey: ["ai", "visit-summary"],
    mutationFn: (input: VisitSummaryInput) => generateVisitSummaryAction(input),
  });
}

export function useAiWorkflowOptions(): Array<{
  value: AiWorkflow;
  label: string;
  description: string;
}> {
  return useMemo(
    () => [
      {
        value: "document_extraction",
        label: "Document extraction",
        description: "Turn uploaded files into structured review data.",
      },
      {
        value: "visit_summary",
        label: "Visit summary",
        description: "Draft concise chart-ready notes for physician review.",
      },
    ],
    []
  );
}

export function useAiConfidenceLabel(confidence: number): {
  level: AiConfidenceLevel;
  label: string;
  percent: string;
} {
  return useMemo(() => {
    const level = getAiConfidenceLevel(confidence);

    return {
      level,
      label:
        level === "high"
          ? "High confidence"
          : level === "medium"
            ? "Moderate confidence"
            : "Low confidence",
      percent: formatAiConfidence(confidence),
    };
  }, [confidence]);
}

