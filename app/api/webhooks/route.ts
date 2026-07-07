import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createAlert,
  type AlertCreateInput,
} from "@/services/alert.service";
import {
  createSummary,
  type SummaryCreateInput,
} from "@/services/summary.service";
import { logger } from "@/lib/logger";
import {
  alertLevelSchema,
  alertStatusSchema,
} from "@/features/alerts/validation";

const webhookEnvelopeSchema = z.object({
  source: z.string().trim().optional(),
  type: z.string().trim().min(1, "Webhook type is required."),
  action: z.string().trim().optional(),
  payload: z.unknown().optional(),
});

const alertPayloadSchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID is required."),
  physicianId: z.string().trim().optional(),
  title: z.string().trim().min(1, "Title is required."),
  message: z.string().trim().min(1, "Message is required."),
  level: alertLevelSchema,
  status: alertStatusSchema.default("open"),
  source: z.enum(["rules_engine", "manual", "system", "demo"]).default("system"),
  ruleId: z.string().trim().optional(),
  metric: z.string().trim().optional(),
  threshold: z.string().trim().optional(),
  actualValue: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  acknowledgedBy: z.string().trim().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

const summaryPayloadSchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID is required."),
  physicianId: z.string().trim().optional(),
  encounterId: z.string().trim().optional(),
  title: z.string().trim().min(1, "Title is required."),
  type: z
    .enum(["visit", "document", "care_plan", "discharge", "other"])
    .default("visit"),
  source: z.enum(["ai", "manual"]).default("manual"),
  status: z
    .enum(["draft", "pending_review", "approved", "rejected", "published"])
    .default("draft"),
  content: z.string().trim().min(1, "Content is required."),
  highlights: z.array(z.string().trim().min(1)).default([]),
  recommendations: z.array(z.string().trim().min(1)).default([]),
  generatedBy: z.string().trim().optional(),
  model: z.string().trim().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export async function GET() {
  return NextResponse.json({
    ok: true,
    supportedTypes: ["ping", "alert.created", "summary.created"],
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = webhookEnvelopeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "A webhook envelope is required." },
        { status: 400 }
      );
    }

    const type = parsed.data.type.toLowerCase();

    if (type === "ping") {
      return NextResponse.json({
        acknowledged: true,
        source: parsed.data.source ?? "unknown",
      });
    }

    if (type === "alert.created") {
      const payload = alertPayloadSchema.safeParse(parsed.data.payload);

      if (!payload.success) {
        return NextResponse.json(
          { error: "Valid alert payload is required." },
          { status: 400 }
        );
      }

      const alertPayload: AlertCreateInput = {
        patientId: payload.data.patientId,
        title: payload.data.title,
        message: payload.data.message,
        level: payload.data.level,
        status: payload.data.status,
        source: payload.data.source,
        metadata: payload.data.metadata,
        ...(payload.data.physicianId
          ? { physicianId: payload.data.physicianId }
          : {}),
        ...(payload.data.ruleId ? { ruleId: payload.data.ruleId } : {}),
        ...(payload.data.metric ? { metric: payload.data.metric } : {}),
        ...(payload.data.threshold ? { threshold: payload.data.threshold } : {}),
        ...(payload.data.actualValue ? { actualValue: payload.data.actualValue } : {}),
        ...(payload.data.notes ? { notes: payload.data.notes } : {}),
        ...(payload.data.acknowledgedBy
          ? { acknowledgedBy: payload.data.acknowledgedBy }
          : {}),
      };

      const alert = await createAlert(alertPayload);

      logger.info("Webhook created an alert", {
        webhookType: type,
        alertId: alert.id,
        patientId: alert.patientId,
      });

      return NextResponse.json({
        accepted: true,
        alert,
      });
    }

    if (type === "summary.created") {
      const payload = summaryPayloadSchema.safeParse(parsed.data.payload);

      if (!payload.success) {
        return NextResponse.json(
          { error: "Valid summary payload is required." },
          { status: 400 }
        );
      }

      const summaryPayload: SummaryCreateInput = {
        patientId: payload.data.patientId,
        title: payload.data.title,
        type: payload.data.type,
        source: payload.data.source,
        status: payload.data.status,
        content: payload.data.content,
        highlights: payload.data.highlights,
        recommendations: payload.data.recommendations,
        metadata: payload.data.metadata,
        ...(payload.data.physicianId
          ? { physicianId: payload.data.physicianId }
          : {}),
        ...(payload.data.encounterId
          ? { encounterId: payload.data.encounterId }
          : {}),
        ...(payload.data.generatedBy
          ? { generatedBy: payload.data.generatedBy }
          : {}),
        ...(payload.data.model ? { model: payload.data.model } : {}),
      };

      const summary = await createSummary(summaryPayload);

      logger.info("Webhook created a summary", {
        webhookType: type,
        summaryId: summary.id,
        patientId: summary.patientId,
      });

      return NextResponse.json({
        accepted: true,
        summary,
      });
    }

    logger.warn("Ignoring unsupported webhook type", {
      webhookType: type,
      source: parsed.data.source,
    });

    return NextResponse.json({
      accepted: true,
      type,
    });
  } catch (error) {
    logger.error("Webhook route failed", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The webhook could not be processed.",
      },
      { status: 500 }
    );
  }
}

