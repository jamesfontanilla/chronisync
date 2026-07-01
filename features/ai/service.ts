/**
 * =============================================================================
 * ChroniSync
 * AI Service
 * =============================================================================
 */

import {
  GoogleGenAI,
  createPartFromText,
  createPartFromUri,
  createUserContent,
  type ContentListUnion,
} from "@google/genai";
import { AI_MODELS } from "@/lib/constants";

import {
  buildDocumentExtractionPrompt,
  buildVisitSummaryPrompt,
  DOCUMENT_EXTRACTION_SYSTEM_PROMPT,
  VISIT_SUMMARY_SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import {
  buildFoodPhotoAnalysisPrompt,
  FOOD_PHOTO_ANALYSIS_SYSTEM_PROMPT,
  FOOD_PHOTO_ANALYSIS_RESPONSE_JSON_SCHEMA,
  foodPhotoAnalysisDraftSchema,
  foodPhotoAnalysisInputSchema,
  foodPhotoAnalysisResponseSchema,
  type FoodPhotoAnalysisDraft,
  type FoodPhotoAnalysisInput,
} from "@/lib/ai/food-photo";
import {
  documentExtractionDraftSchema,
  documentExtractionInputSchema,
  documentExtractionResponseSchema,
  type DocumentExtractionDraft,
  type DocumentExtractionInput,
  DOCUMENT_EXTRACTION_RESPONSE_JSON_SCHEMA,
} from "@/lib/ai/extract";
import {
  visitSummaryDraftSchema,
  visitSummaryInputSchema,
  visitSummaryResponseSchema,
  type VisitSummaryDraft,
  type VisitSummaryInput,
  VISIT_SUMMARY_RESPONSE_JSON_SCHEMA,
} from "@/lib/ai/summarize";
import { logger } from "@/lib/logger";
import { AI_DRAFT_DISCLAIMER, compactAiMetadata } from "@/lib/ai/metadata";

import { z, type ZodTypeAny } from "zod";

/* -------------------------------------------------------------------------- */
/*                               Environment                                  */
/* -------------------------------------------------------------------------- */

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function readBooleanEnv(name: string, fallback = true): boolean {
  const value = readEnv(name);

  if (value === undefined) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function getGeminiModel(): string {
  return readEnv("GEMINI_MODEL") ?? AI_MODELS.DEFAULT;
}

/* -------------------------------------------------------------------------- */
/*                                  Client                                    */
/* -------------------------------------------------------------------------- */

let cachedClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = readEnv("GEMINI_API_KEY");

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Add it to your environment before using the AI service.",
    );
  }

  cachedClient = new GoogleGenAI({ apiKey });
  return cachedClient;
}

/* -------------------------------------------------------------------------- */
/*                                 Utilities                                  */
/* -------------------------------------------------------------------------- */

function stripJsonCodeFence(value: string): string {
  const trimmed = value.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function parseJsonResponse(text: string): unknown {
  return JSON.parse(stripJsonCodeFence(text));
}

function createImageContent(
  prompt: string,
  imageUrl: string,
  mimeType: string,
): ContentListUnion {
  return createUserContent([
    createPartFromText(prompt),
    createPartFromUri(imageUrl, mimeType),
  ]);
}

async function generateStructuredJson<TSchema extends ZodTypeAny>(params: {
  model: string;
  systemInstruction: string;
  contents: ContentListUnion;
  responseJsonSchema: Record<string, unknown>;
  validator: TSchema;
  temperature: number;
  maxOutputTokens: number;
}): Promise<z.infer<TSchema>> {
  const response = await getGeminiClient().models.generateContent({
    model: params.model,
    contents: params.contents,
    config: {
      systemInstruction: params.systemInstruction,
      temperature: params.temperature,
      maxOutputTokens: params.maxOutputTokens,
      responseMimeType: "application/json",
      responseJsonSchema: params.responseJsonSchema,
    },
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  const parsed = params.validator.parse(parseJsonResponse(text));
  return parsed;
}

function normalizeSourceText(sourceText: string, maxLength = 16_000): string {
  const normalized = sourceText.replace(/\r\n/g, "\n").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength)}\n\n[Truncated for length]`;
}

/* -------------------------------------------------------------------------- */
/*                              Food Photos                                   */
/* -------------------------------------------------------------------------- */

export async function analyzeFoodPhoto(
  input: FoodPhotoAnalysisInput,
): Promise<FoodPhotoAnalysisDraft> {
  if (!readBooleanEnv("ENABLE_AI_FOOD_PHOTO", true)) {
    throw new Error(
      "AI food photo analysis is disabled. Set ENABLE_AI_FOOD_PHOTO=true to enable it.",
    );
  }

  const validatedInput = foodPhotoAnalysisInputSchema.parse(input);
  const model = getGeminiModel();
  const prompt = buildFoodPhotoAnalysisPrompt({
    patientId: validatedInput.patientId,
    ...(validatedInput.fileName ? { fileName: validatedInput.fileName } : {}),
    ...(validatedInput.mimeType ? { mimeType: validatedInput.mimeType } : {}),
    ...(validatedInput.imageUrl ? { imageUrl: validatedInput.imageUrl } : {}),
    ...(validatedInput.mealTypeHint
      ? { mealTypeHint: validatedInput.mealTypeHint }
      : {}),
    ...(validatedInput.mealLabelHint
      ? { mealLabelHint: validatedInput.mealLabelHint }
      : {}),
    ...(validatedInput.portionHint
      ? { portionHint: validatedInput.portionHint }
      : {}),
    ...(validatedInput.notesHint
      ? { notesHint: validatedInput.notesHint }
      : {}),
  });

  const response = await getGeminiClient().models.generateContent({
    model,
    contents: createImageContent(
      prompt,
      validatedInput.imageUrl,
      validatedInput.mimeType ?? "image/jpeg",
    ),
    config: {
      systemInstruction: FOOD_PHOTO_ANALYSIS_SYSTEM_PROMPT,
      temperature: 0.2,
      maxOutputTokens: 1200,
      responseMimeType: "application/json",
      responseJsonSchema: FOOD_PHOTO_ANALYSIS_RESPONSE_JSON_SCHEMA as Record<
        string,
        unknown
      >,
    },
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty food photo response.");
  }

  const parsed = foodPhotoAnalysisResponseSchema.parse(parseJsonResponse(text));

  const draft = foodPhotoAnalysisDraftSchema.parse({
    ...parsed,
    patientId: validatedInput.patientId,
    ...(validatedInput.fileName ? { fileName: validatedInput.fileName } : {}),
    ...(validatedInput.mimeType ? { mimeType: validatedInput.mimeType } : {}),
    model,
    metadata: compactAiMetadata({
      aiDisclaimer: AI_DRAFT_DISCLAIMER,
      patientId: validatedInput.patientId,
      fileName: validatedInput.fileName,
      mimeType: validatedInput.mimeType,
      imageUrl: validatedInput.imageUrl,
      mealTypeHint: validatedInput.mealTypeHint,
      mealLabelHint: validatedInput.mealLabelHint,
      portionHint: validatedInput.portionHint,
      notesHint: validatedInput.notesHint,
      confidence: parsed.confidence,
      traceability: {
        kind: "food_photo_analysis",
        fileName: validatedInput.fileName,
        mimeType: validatedInput.mimeType,
        imageUrl: validatedInput.imageUrl,
        mealTypeHint: validatedInput.mealTypeHint,
        mealLabelHint: validatedInput.mealLabelHint,
        portionHint: validatedInput.portionHint,
        notesHint: validatedInput.notesHint,
      },
    }),
  });

  logger.info("Generated AI food photo analysis draft", {
    patientId: validatedInput.patientId,
    fileName: validatedInput.fileName,
    confidence: draft.confidence,
  });

  return draft;
}

/* -------------------------------------------------------------------------- */
/*                            Document Extraction                              */
/* -------------------------------------------------------------------------- */

export async function extractClinicalDocument(
  input: DocumentExtractionInput,
): Promise<DocumentExtractionDraft> {
  if (!readBooleanEnv("ENABLE_AI_EXTRACTION", true)) {
    throw new Error(
      "AI document extraction is disabled. Set ENABLE_AI_EXTRACTION=true to enable it.",
    );
  }

  const validatedInput = documentExtractionInputSchema.parse(input);
  const model = getGeminiModel();
  const promptInput = {
    patientId: validatedInput.patientId,
    sourceText: normalizeSourceText(validatedInput.sourceText),
    ...(validatedInput.documentId
      ? { documentId: validatedInput.documentId }
      : {}),
    ...(validatedInput.documentTitle
      ? { documentTitle: validatedInput.documentTitle }
      : {}),
    ...(validatedInput.fileName ? { fileName: validatedInput.fileName } : {}),
    ...(validatedInput.fileType ? { fileType: validatedInput.fileType } : {}),
    ...(validatedInput.categoryHint
      ? { categoryHint: validatedInput.categoryHint }
      : {}),
    ...(validatedInput.physicianName
      ? { physicianName: validatedInput.physicianName }
      : {}),
    ...(validatedInput.sourceUrl
      ? { sourceUrl: validatedInput.sourceUrl }
      : {}),
    ...(validatedInput.notes ? { notes: validatedInput.notes } : {}),
  };

  const prompt = buildDocumentExtractionPrompt(promptInput);

  const response = await generateStructuredJson({
    model,
    systemInstruction: DOCUMENT_EXTRACTION_SYSTEM_PROMPT,
    contents: prompt,
    responseJsonSchema: DOCUMENT_EXTRACTION_RESPONSE_JSON_SCHEMA as Record<
      string,
      unknown
    >,
    validator: documentExtractionResponseSchema,
    temperature: 0.1,
    maxOutputTokens: 1_800,
  });

  const draft = documentExtractionDraftSchema.parse({
    ...response,
    patientId: validatedInput.patientId,
    ...(validatedInput.documentId
      ? { documentId: validatedInput.documentId }
      : {}),
    ...(validatedInput.documentTitle
      ? { documentTitle: validatedInput.documentTitle }
      : {}),
    ...(validatedInput.fileName ? { fileName: validatedInput.fileName } : {}),
    ...(validatedInput.fileType ? { fileType: validatedInput.fileType } : {}),
    ...(validatedInput.categoryHint
      ? { categoryHint: validatedInput.categoryHint }
      : {}),
    ...(validatedInput.physicianName
      ? { physicianName: validatedInput.physicianName }
      : {}),
    ...(validatedInput.sourceUrl
      ? { sourceUrl: validatedInput.sourceUrl }
      : {}),
    ...(validatedInput.notes ? { notes: validatedInput.notes } : {}),
    sourceTextLength: validatedInput.sourceText.length,
    metadata: compactAiMetadata({
      aiDisclaimer: AI_DRAFT_DISCLAIMER,
      patientId: validatedInput.patientId,
      documentId: validatedInput.documentId,
      documentTitle: validatedInput.documentTitle,
      fileName: validatedInput.fileName,
      fileType: validatedInput.fileType,
      categoryHint: validatedInput.categoryHint,
      physicianName: validatedInput.physicianName,
      sourceUrl: validatedInput.sourceUrl,
      sourceTextLength: validatedInput.sourceText.length,
      confidence: response.confidence,
      traceability: {
        kind: "document_extraction",
        sourceTextLength: validatedInput.sourceText.length,
        confidence: response.confidence,
        context: {
          patientId: validatedInput.patientId,
          documentId: validatedInput.documentId,
          documentTitle: validatedInput.documentTitle,
          fileName: validatedInput.fileName,
          fileType: validatedInput.fileType,
          categoryHint: validatedInput.categoryHint,
          physicianName: validatedInput.physicianName,
          sourceUrl: validatedInput.sourceUrl,
        },
      },
    }),
  });

  logger.info("Generated AI document extraction draft", {
    patientId: validatedInput.patientId,
    documentId: validatedInput.documentId,
    confidence: draft.confidence,
  });

  return draft;
}

/* -------------------------------------------------------------------------- */
/*                               Visit Summary                                */
/* -------------------------------------------------------------------------- */

export async function generateVisitSummary(
  input: VisitSummaryInput,
): Promise<VisitSummaryDraft> {
  if (!readBooleanEnv("ENABLE_AI_SUMMARIZATION", true)) {
    throw new Error(
      "AI visit summarization is disabled. Set ENABLE_AI_SUMMARIZATION=true to enable it.",
    );
  }

  const validatedInput = visitSummaryInputSchema.parse(input);
  const model = getGeminiModel();
  const promptInput = {
    patientId: validatedInput.patientId,
    sourceNotes: validatedInput.sourceNotes,
    patientComplaints: validatedInput.patientComplaints,
    physicianNotes: validatedInput.physicianNotes,
    medicationChanges: validatedInput.medicationChanges,
    followUpSchedule: validatedInput.followUpSchedule,
    vitalHighlights: validatedInput.vitalHighlights,
    documentHighlights: validatedInput.documentHighlights,
    ...(validatedInput.physicianId
      ? { physicianId: validatedInput.physicianId }
      : {}),
    ...(validatedInput.encounterId
      ? { encounterId: validatedInput.encounterId }
      : {}),
    ...(validatedInput.patientName
      ? { patientName: validatedInput.patientName }
      : {}),
    ...(validatedInput.physicianName
      ? { physicianName: validatedInput.physicianName }
      : {}),
    ...(validatedInput.visitDate
      ? { visitDate: validatedInput.visitDate }
      : {}),
  };

  const prompt = buildVisitSummaryPrompt(promptInput);

  const response = await generateStructuredJson({
    model,
    systemInstruction: VISIT_SUMMARY_SYSTEM_PROMPT,
    contents: prompt,
    responseJsonSchema: VISIT_SUMMARY_RESPONSE_JSON_SCHEMA as Record<
      string,
      unknown
    >,
    validator: visitSummaryResponseSchema,
    temperature: 0.2,
    maxOutputTokens: 1_600,
  });

  const draft = visitSummaryDraftSchema.parse({
    ...response,
    patientId: validatedInput.patientId,
    ...(validatedInput.physicianId
      ? { physicianId: validatedInput.physicianId }
      : {}),
    ...(validatedInput.encounterId
      ? { encounterId: validatedInput.encounterId }
      : {}),
    ...(validatedInput.patientName
      ? { patientName: validatedInput.patientName }
      : {}),
    ...(validatedInput.physicianName
      ? { physicianName: validatedInput.physicianName }
      : {}),
    ...(validatedInput.visitDate
      ? { visitDate: validatedInput.visitDate }
      : {}),
    model,
    sourceNotesLength: validatedInput.sourceNotes.length,
    metadata: compactAiMetadata({
      aiDisclaimer: AI_DRAFT_DISCLAIMER,
      patientId: validatedInput.patientId,
      physicianId: validatedInput.physicianId,
      encounterId: validatedInput.encounterId,
      patientName: validatedInput.patientName,
      physicianName: validatedInput.physicianName,
      visitDate: validatedInput.visitDate,
      sourceNotesLength: validatedInput.sourceNotes.length,
      confidence: response.confidence,
      traceability: {
        kind: "visit_summary",
        sourceNotesLength: validatedInput.sourceNotes.length,
        sourceCounts: {
          patientComplaints: validatedInput.patientComplaints.length,
          physicianNotes: validatedInput.physicianNotes.length,
          medicationChanges: validatedInput.medicationChanges.length,
          followUpSchedule: validatedInput.followUpSchedule.length,
          vitalHighlights: validatedInput.vitalHighlights.length,
          documentHighlights: validatedInput.documentHighlights.length,
        },
        context: {
          patientId: validatedInput.patientId,
          physicianId: validatedInput.physicianId,
          encounterId: validatedInput.encounterId,
          patientName: validatedInput.patientName,
          physicianName: validatedInput.physicianName,
          visitDate: validatedInput.visitDate,
        },
      },
    }),
  });

  logger.info("Generated AI visit summary draft", {
    patientId: validatedInput.patientId,
    physicianId: validatedInput.physicianId,
    encounterId: validatedInput.encounterId,
    confidence: draft.confidence,
  });

  return draft;
}
