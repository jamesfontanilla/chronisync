/**
 * =============================================================================
 * ChroniSync
 * AI Food Photo Schemas, Prompts, and Analysis Client
 * =============================================================================
 */

import { z } from "zod";

import { AI } from "@/config/constants";


export const foodPhotoMealTypeSchema = z.enum([
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "drink",
  "other",
]);

export const foodPhotoAnalysisInputSchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID is required."),
  fileName: z.string().trim().optional(),
  mimeType: z.string().trim().optional(),
  imageUrl: z.string().trim().url("Image URL is required."),
  mealTypeHint: foodPhotoMealTypeSchema.optional(),
  mealLabelHint: z.string().trim().optional(),
  portionHint: z.string().trim().optional(),
  notesHint: z.string().trim().optional(),
});

export type FoodPhotoAnalysisInput = z.infer<typeof foodPhotoAnalysisInputSchema>;

export const foodPhotoAnalysisResponseSchema = z
  .object({
    mealType: foodPhotoMealTypeSchema,
    mealLabel: z.string().trim().min(1, "A meal label is required."),
    portionLabel: z.string().trim().optional(),
    estimatedCalories: z.number().int().min(0),
    estimatedCarbsG: z.number().min(0),
    estimatedProteinG: z.number().min(0),
    estimatedFatG: z.number().min(0),
    confidence: z.number().min(0).max(1),
    suggestedEdits: z.array(z.string().trim().min(1)).default([]),
    notes: z.string().trim().optional(),
    needsReview: z.boolean().default(true),
  })
  .passthrough();

export type FoodPhotoAnalysisResponse = z.infer<typeof foodPhotoAnalysisResponseSchema>;

export const FOOD_PHOTO_ANALYSIS_RESPONSE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  propertyOrdering: [
    "mealType",
    "mealLabel",
    "portionLabel",
    "estimatedCalories",
    "estimatedCarbsG",
    "estimatedProteinG",
    "estimatedFatG",
    "confidence",
    "suggestedEdits",
    "notes",
    "needsReview",
  ],
  required: [
    "mealType",
    "mealLabel",
    "estimatedCalories",
    "estimatedCarbsG",
    "estimatedProteinG",
    "estimatedFatG",
    "confidence",
    "suggestedEdits",
    "needsReview",
  ],
  properties: {
    mealType: {
      type: "string",
      enum: ["breakfast", "lunch", "dinner", "snack", "drink", "other"],
      description: "Best matching meal type.",
    },
    mealLabel: {
      type: "string",
      description: "Short label describing the main foods in the image.",
    },
    portionLabel: {
      type: "string",
      description: "Estimated portion label such as '1 plate' or '1 bowl'.",
    },
    estimatedCalories: {
      type: "integer",
      minimum: 0,
      description: "Estimated calories for the visible meal.",
    },
    estimatedCarbsG: {
      type: "number",
      minimum: 0,
      description: "Estimated carbohydrates in grams.",
    },
    estimatedProteinG: {
      type: "number",
      minimum: 0,
      description: "Estimated protein in grams.",
    },
    estimatedFatG: {
      type: "number",
      minimum: 0,
      description: "Estimated fat in grams.",
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
      description: "Confidence score from 0 to 1.",
    },
    suggestedEdits: {
      type: "array",
      items: { type: "string" },
      description: "Short review notes or caveats for the user.",
    },
    notes: {
      type: "string",
      description: "A short note about uncertainty or context.",
    },
    needsReview: {
      type: "boolean",
      description: "True when the meal should be reviewed before save.",
    },
  },
} as const;


export const foodPhotoAnalysisDraftSchema =
  foodPhotoAnalysisResponseSchema.extend({
    patientId: z.string().trim().min(1, "Patient ID is required."),
    fileName: z.string().trim().optional(),
    mimeType: z.string().trim().optional(),
    source: z.literal("ai").default("ai"),
    status: z.literal("draft").default("draft"),
    generatedBy: z.string().trim().default("chronisync-ai"),
    model: z.string().trim().optional(),
    metadata: z.record(z.string(), z.unknown()).default({}),
  });

export type FoodPhotoAnalysisDraft = z.infer<typeof foodPhotoAnalysisDraftSchema>;

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

export const FOOD_PHOTO_ANALYSIS_SYSTEM_PROMPT = [
  "You analyze meal photos for a chronic disease management app.",
  "Return JSON only and follow the schema exactly.",
  "Identify the visible meal, estimate the portion, and provide rough nutrition values.",
  "Use conservative estimates when the image is unclear.",
  "Do not identify people, diagnose disease, or give medical advice.",
  "If the image is blurry or ambiguous, lower confidence and add review notes.",
].join(" ");

export interface FoodPhotoAnalysisPromptInput {
  patientId: string;
  fileName?: string;
  mimeType?: string;
  imageUrl?: string;
  mealTypeHint?: string;
  mealLabelHint?: string;
  portionHint?: string;
  notesHint?: string;
}

export function buildFoodPhotoAnalysisPrompt(
  input: FoodPhotoAnalysisPromptInput,
): string {
  return [
    "Analyze the meal photo and return structured nutrition guidance for review.",
    `Patient ID: ${input.patientId}`,
    input.fileName ? `File name: ${input.fileName}` : undefined,
    input.mimeType ? `MIME type: ${input.mimeType}` : undefined,
    input.imageUrl ? `Image URL: ${input.imageUrl}` : undefined,
    input.mealTypeHint ? `Meal type hint: ${input.mealTypeHint}` : undefined,
    input.mealLabelHint ? `Meal label hint: ${input.mealLabelHint}` : undefined,
    input.portionHint ? `Portion hint: ${input.portionHint}` : undefined,
    input.notesHint ? `Notes hint: ${input.notesHint}` : undefined,
    `Keep the response short and practical for a patient review card. If unsure, say so in notes and prefer conservative estimates.`,
    `The app should remind the user: ${AI.MIN_CONFIDENCE_SCORE >= 0.8 ? "high confidence only" : "review the source image before saving"}.`,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n\n");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const parts = result.split(",");
      const base64 = parts[1];
      if (!base64) {
        reject(new Error("Failed to extract base64 data from file."));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file as data URL."));
  });
}

export async function analyzeMealPhoto(
  file: File,
  input: FoodPhotoAnalysisPromptInput,
): Promise<FoodPhotoAnalysisResponse> {
  const base64Data = await fileToBase64(file);

  const promptText = buildFoodPhotoAnalysisPrompt(input);

  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: FOOD_PHOTO_ANALYSIS_RESPONSE_JSON_SCHEMA,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini API returned an empty or unexpected response.");
  }

  const parsed = JSON.parse(text);
  return foodPhotoAnalysisResponseSchema.parse(parsed);
}