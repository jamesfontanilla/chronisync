import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { AI_MODELS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import {
  analyzeFoodPhoto,
  extractClinicalDocument,
  generateVisitSummary,
} from "@/features/ai/service";
import {
  aiWorkflowSchema,
  foodPhotoAnalysisInputSchema,
  documentExtractionInputSchema,
  visitSummaryInputSchema,
} from "@/features/ai/validation";

const geminiRequestSchema = z.object({
  workflow: aiWorkflowSchema,
  input: z.unknown(),
});

export async function GET() {
  return NextResponse.json({
    ok: true,
    model: AI_MODELS.DEFAULT,
    workflows: aiWorkflowSchema.options,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = geminiRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "A workflow and input payload are required." },
        { status: 400 },
      );
    }

    switch (parsed.data.workflow) {
      case "food_photo_analysis": {
        const input = foodPhotoAnalysisInputSchema.parse(parsed.data.input);
        const draft = await analyzeFoodPhoto(input);

        return NextResponse.json({
          workflow: parsed.data.workflow,
          draft,
        });
      }
      case "document_extraction": {
        const input = documentExtractionInputSchema.parse(parsed.data.input);
        const draft = await extractClinicalDocument(input);

        return NextResponse.json({
          workflow: parsed.data.workflow,
          draft,
        });
      }
      case "visit_summary": {
        const input = visitSummaryInputSchema.parse(parsed.data.input);
        const draft = await generateVisitSummary(input);

        return NextResponse.json({
          workflow: parsed.data.workflow,
          draft,
        });
      }
    }
  } catch (error) {
    logger.error("Gemini API route failed", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The Gemini request could not be completed.",
      },
      { status: 500 },
    );
  }
}
