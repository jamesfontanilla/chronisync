/**
 * =============================================================================
 * ChroniSync
 * AI Prompt Helpers
 * =============================================================================
 */

import { AI } from "@/config/constants";

/* -------------------------------------------------------------------------- */
/*                               Shared Helpers                               */
/* -------------------------------------------------------------------------- */

function joinSections(
  sections: Array<string | null | undefined>
): string {
  return sections
    .map((section) => section?.trim())
    .filter((section): section is string => Boolean(section))
    .join("\n\n");
}

function formatBulletList(
  items: readonly string[],
  emptyMessage: string
): string {
  const cleaned = items.map((item) => item.trim()).filter(Boolean);

  if (cleaned.length === 0) {
    return emptyMessage;
  }

  return cleaned.map((item) => `- ${item}`).join("\n");
}

/* -------------------------------------------------------------------------- */
/*                             Document Extraction                            */
/* -------------------------------------------------------------------------- */

export interface DocumentExtractionPromptInput {
  patientId: string;
  documentTitle?: string;
  fileName?: string;
  fileType?: string;
  categoryHint?: string;
  physicianName?: string;
  sourceUrl?: string;
  notes?: string;
  sourceText: string;
}

export const DOCUMENT_EXTRACTION_SYSTEM_PROMPT = [
  "You extract structured data from clinical documents.",
  "Return JSON only and follow the schema exactly.",
  "Preserve exact values, units, dates, and medication names when present.",
  "Do not diagnose, recommend treatment, or invent facts that are not in the source.",
  "If a field is unclear, leave it empty or mark the result for manual review.",
].join(" ");

export function buildDocumentExtractionPrompt(
  input: DocumentExtractionPromptInput
): string {
  return joinSections([
    "Analyze the clinical document below and extract factual information for physician review.",
    `Patient ID: ${input.patientId}`,
    input.documentTitle ? `Document title: ${input.documentTitle}` : undefined,
    input.fileName ? `File name: ${input.fileName}` : undefined,
    input.fileType ? `File type: ${input.fileType}` : undefined,
    input.categoryHint ? `Category hint: ${input.categoryHint}` : undefined,
    input.physicianName ? `Known physician name: ${input.physicianName}` : undefined,
    input.sourceUrl ? `Source URL: ${input.sourceUrl}` : undefined,
    input.notes ? `Notes: ${input.notes}` : undefined,
    [
      "Extract:",
      "- laboratory values",
      "- medication names",
      "- diagnosis labels",
      "- physician names",
      "- important dates",
      "- concise highlights",
    ].join("\n"),
    `Keep the summary concise and under ${AI.MAX_SUMMARY_LENGTH} characters when practical.`,
    `Source text:\n\`\`\`\n${input.sourceText.trim()}\n\`\`\``,
  ]);
}

/* -------------------------------------------------------------------------- */
/*                              Visit Summaries                               */
/* -------------------------------------------------------------------------- */

export interface VisitSummaryPromptInput {
  patientId: string;
  patientName?: string;
  physicianId?: string;
  physicianName?: string;
  encounterId?: string;
  visitDate?: string;
  sourceNotes: string;
  patientComplaints?: string[];
  physicianNotes?: string[];
  medicationChanges?: string[];
  followUpSchedule?: string[];
  vitalHighlights?: string[];
  documentHighlights?: string[];
}

export const VISIT_SUMMARY_SYSTEM_PROMPT = [
  "You write concise visit summaries for physician review.",
  "Return JSON only and follow the schema exactly.",
  "Focus on what was reported, observed, changed, and planned.",
  "Do not diagnose, prescribe, or recommend treatment changes.",
  "Keep the tone factual, brief, and suitable for a chart review draft.",
].join(" ");

export function buildVisitSummaryPrompt(
  input: VisitSummaryPromptInput
): string {
  return joinSections([
    "Draft a visit summary from the notes below.",
    `Patient ID: ${input.patientId}`,
    input.patientName ? `Patient name: ${input.patientName}` : undefined,
    input.physicianId ? `Physician ID: ${input.physicianId}` : undefined,
    input.physicianName ? `Physician name: ${input.physicianName}` : undefined,
    input.encounterId ? `Encounter ID: ${input.encounterId}` : undefined,
    input.visitDate ? `Visit date: ${input.visitDate}` : undefined,
    [
      "Capture these sections when possible:",
      "- patient complaints",
      "- physician notes",
      "- medication changes",
      "- follow-up schedule",
      "- brief highlights",
    ].join("\n"),
    input.patientComplaints && input.patientComplaints.length > 0
      ? `Known patient complaints:\n${formatBulletList(
          input.patientComplaints,
          "- None provided"
        )}`
      : undefined,
    input.physicianNotes && input.physicianNotes.length > 0
      ? `Known physician notes:\n${formatBulletList(
          input.physicianNotes,
          "- None provided"
        )}`
      : undefined,
    input.medicationChanges && input.medicationChanges.length > 0
      ? `Known medication changes:\n${formatBulletList(
          input.medicationChanges,
          "- None provided"
        )}`
      : undefined,
    input.followUpSchedule && input.followUpSchedule.length > 0
      ? `Known follow-up schedule:\n${formatBulletList(
          input.followUpSchedule,
          "- None provided"
        )}`
      : undefined,
    input.vitalHighlights && input.vitalHighlights.length > 0
      ? `Known vital highlights:\n${formatBulletList(
          input.vitalHighlights,
          "- None provided"
        )}`
      : undefined,
    input.documentHighlights && input.documentHighlights.length > 0
      ? `Known document highlights:\n${formatBulletList(
          input.documentHighlights,
          "- None provided"
        )}`
      : undefined,
    `Keep the content under ${AI.MAX_SUMMARY_LENGTH} characters when practical.`,
    `Source notes:\n\`\`\`\n${input.sourceNotes.trim()}\n\`\`\``,
  ]);
}
