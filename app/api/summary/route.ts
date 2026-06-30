import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { COLLECTIONS } from "@/config/firebase";
import { logger } from "@/lib/logger";
import { queryDocuments, whereEquals } from "@/lib/firebase/firestore";
import {
  approveSummary,
  createSummary,
  deleteSummary,
  listPendingSummariesByPhysician,
  listSummariesByPatient,
  publishSummary,
  rejectSummary,
  updateSummary,
} from "@/services/summary.service";
import type { SummaryCreateInput, SummaryUpdateInput } from "@/services/summary.service";
import type { Summary } from "@/types/summary";

const summarySourceSchema = z.enum(["ai", "manual"]);
const summaryStatusSchema = z.enum([
  "draft",
  "pending_review",
  "approved",
  "rejected",
  "published",
]);
const summaryTypeSchema = z.enum([
  "visit",
  "document",
  "care_plan",
  "discharge",
  "other",
]);

const summaryCreateBodySchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID is required."),
  physicianId: z.string().trim().optional(),
  encounterId: z.string().trim().optional(),
  title: z.string().trim().min(1, "Title is required."),
  type: summaryTypeSchema.default("visit"),
  source: summarySourceSchema.default("manual"),
  status: summaryStatusSchema.default("draft"),
  content: z.string().trim().min(1, "Content is required."),
  highlights: z.array(z.string().trim().min(1)).default([]),
  recommendations: z.array(z.string().trim().min(1)).default([]),
  generatedBy: z.string().trim().optional(),
  model: z.string().trim().optional(),
  reviewedBy: z.string().trim().optional(),
  reviewedAt: z.coerce.date().optional(),
  publishedAt: z.coerce.date().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

const summaryMutationSchema = summaryCreateBodySchema
  .partial()
  .extend({
    summaryId: z.string().trim().min(1, "Summary ID is required."),
    action: z
      .enum(["update", "publish", "approve", "reject", "delete"])
      .default("update"),
  });

function optionalString(value: string | null): string | undefined {
  if (value === null) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readBoolean(value: string | null): boolean {
  if (value === null) {
    return false;
  }

  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function buildSummaryQuery(searchParams: URLSearchParams) {
  const patientId = optionalString(searchParams.get("patientId"));
  const physicianId = optionalString(searchParams.get("physicianId"));

  if (patientId) {
    return {
      kind: "patient" as const,
      patientId,
    };
  }

  if (physicianId) {
    return {
      kind: "physician" as const,
      physicianId,
      pending: readBoolean(searchParams.get("pending")),
    };
  }

  return null;
}

export async function GET(request: NextRequest) {
  const query = buildSummaryQuery(request.nextUrl.searchParams);

  if (!query) {
    return NextResponse.json(
      { error: "A patientId or physicianId query parameter is required." },
      { status: 400 }
    );
  }

  if (query.kind === "patient") {
    const items = await listSummariesByPatient(query.patientId);

    return NextResponse.json({
      items,
      count: items.length,
    });
  }

  if (query.pending) {
    const items = await listPendingSummariesByPhysician(query.physicianId);

    return NextResponse.json({
      items,
      count: items.length,
      pending: true,
    });
  }

  const items = await queryDocuments<Summary>(
    COLLECTIONS.SUMMARIES,
    whereEquals("physicianId", query.physicianId)
  );

  return NextResponse.json({
    items,
    count: items.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = summaryCreateBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Valid summary payload is required." },
        { status: 400 }
      );
    }

    const payload: SummaryCreateInput = {
      patientId: parsed.data.patientId,
      title: parsed.data.title,
      type: parsed.data.type,
      source: parsed.data.source,
      status: parsed.data.status,
      content: parsed.data.content,
      highlights: parsed.data.highlights,
      recommendations: parsed.data.recommendations,
      metadata: parsed.data.metadata,
      ...(parsed.data.physicianId
        ? { physicianId: parsed.data.physicianId }
        : {}),
      ...(parsed.data.encounterId
        ? { encounterId: parsed.data.encounterId }
        : {}),
      ...(parsed.data.generatedBy
        ? { generatedBy: parsed.data.generatedBy }
        : {}),
      ...(parsed.data.model ? { model: parsed.data.model } : {}),
      ...(parsed.data.reviewedBy
        ? { reviewedBy: parsed.data.reviewedBy }
        : {}),
      ...(parsed.data.reviewedAt ? { reviewedAt: parsed.data.reviewedAt } : {}),
      ...(parsed.data.publishedAt
        ? { publishedAt: parsed.data.publishedAt }
        : {}),
    };

    const summary = await createSummary(payload);

    logger.info("Created a summary through the API", {
      summaryId: summary.id,
      patientId: summary.patientId,
    });

    return NextResponse.json({ summary }, { status: 201 });
  } catch (error) {
    logger.error("Summary POST route failed", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The summary could not be created.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = summaryMutationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Valid summary mutation payload is required." },
        { status: 400 }
      );
    }

    switch (parsed.data.action) {
      case "publish": {
        const summary = await publishSummary(parsed.data.summaryId);
        return NextResponse.json({ summary });
      }
      case "approve": {
        const summary = await approveSummary(
          parsed.data.summaryId,
          parsed.data.reviewedBy
        );
        return NextResponse.json({ summary });
      }
      case "reject": {
        const summary = await rejectSummary(
          parsed.data.summaryId,
          parsed.data.reviewedBy
        );
        return NextResponse.json({ summary });
      }
      case "delete": {
        await deleteSummary(parsed.data.summaryId);
        return NextResponse.json({ deleted: true });
      }
      case "update":
      default: {
        const updates: SummaryUpdateInput = {
          ...(parsed.data.title ? { title: parsed.data.title } : {}),
          ...(parsed.data.type ? { type: parsed.data.type } : {}),
          ...(parsed.data.source ? { source: parsed.data.source } : {}),
          ...(parsed.data.status ? { status: parsed.data.status } : {}),
          ...(parsed.data.content ? { content: parsed.data.content } : {}),
          ...(parsed.data.highlights ? { highlights: parsed.data.highlights } : {}),
          ...(parsed.data.recommendations
            ? { recommendations: parsed.data.recommendations }
            : {}),
          ...(parsed.data.physicianId
            ? { physicianId: parsed.data.physicianId }
            : {}),
          ...(parsed.data.encounterId
            ? { encounterId: parsed.data.encounterId }
            : {}),
          ...(parsed.data.generatedBy
            ? { generatedBy: parsed.data.generatedBy }
            : {}),
          ...(parsed.data.model ? { model: parsed.data.model } : {}),
          ...(parsed.data.reviewedBy
            ? { reviewedBy: parsed.data.reviewedBy }
            : {}),
          ...(parsed.data.reviewedAt
            ? { reviewedAt: parsed.data.reviewedAt }
            : {}),
          ...(parsed.data.publishedAt
            ? { publishedAt: parsed.data.publishedAt }
            : {}),
          ...(parsed.data.metadata ? { metadata: parsed.data.metadata } : {}),
        };

        const summary = await updateSummary(parsed.data.summaryId, updates);
        return NextResponse.json({ summary });
      }
    }
  } catch (error) {
    logger.error("Summary PATCH route failed", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The summary could not be updated.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = z
      .object({
        summaryId: z.string().trim().min(1, "Summary ID is required."),
      })
      .safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "A summary ID is required for deletion." },
        { status: 400 }
      );
    }

    await deleteSummary(parsed.data.summaryId);

    return NextResponse.json({ deleted: true });
  } catch (error) {
    logger.error("Summary DELETE route failed", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The summary could not be deleted.",
      },
      { status: 500 }
    );
  }
}

