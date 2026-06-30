import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  buildAlertViewModel,
  createAlert,
  deleteAlert,
  dismissAlert,
  listAlertsByFilters,
  resolveAlert,
  summarizeAlerts,
  updateAlert,
  acknowledgeAlert,
} from "@/features/alerts/service";
import {
  alertFiltersSchema,
  alertLevelSchema,
  alertStatusSchema,
} from "@/features/alerts/validation";
import { logger } from "@/lib/logger";
import { type AlertCreateInput, type AlertUpdateInput } from "@/services/alert.service";

const alertSourceSchema = z.enum(["rules_engine", "manual", "system"]);

const alertCreateBodySchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID is required."),
  physicianId: z.string().trim().optional(),
  title: z.string().trim().min(1, "Title is required."),
  message: z.string().trim().min(1, "Message is required."),
  level: alertLevelSchema,
  status: alertStatusSchema.default("open"),
  source: alertSourceSchema.default("manual"),
  ruleId: z.string().trim().optional(),
  metric: z.string().trim().optional(),
  threshold: z.string().trim().optional(),
  actualValue: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  acknowledgedBy: z.string().trim().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

const alertMutationSchema = alertCreateBodySchema
  .partial()
  .extend({
    alertId: z.string().trim().min(1, "Alert ID is required."),
    action: z
      .enum(["update", "acknowledge", "resolve", "dismiss", "delete"])
      .default("update"),
  });

function optionalString(value: string | null): string | undefined {
  if (value === null) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildAlertFilters(searchParams: URLSearchParams) {
  const parsed = alertFiltersSchema.safeParse({
    patientId: optionalString(searchParams.get("patientId")),
    physicianId: optionalString(searchParams.get("physicianId")),
    status: optionalString(searchParams.get("status")),
    level: optionalString(searchParams.get("level")),
    query: optionalString(searchParams.get("query")),
    sort: optionalString(searchParams.get("sort")),
    limit: optionalString(searchParams.get("limit")),
  });

  if (!parsed.success) {
    return null;
  }

  return {
    sort: parsed.data.sort,
    limit: parsed.data.limit,
    ...(parsed.data.patientId ? { patientId: parsed.data.patientId } : {}),
    ...(parsed.data.physicianId ? { physicianId: parsed.data.physicianId } : {}),
    ...(parsed.data.status ? { status: parsed.data.status } : {}),
    ...(parsed.data.level ? { level: parsed.data.level } : {}),
    ...(parsed.data.query ? { query: parsed.data.query } : {}),
  };
}

export async function GET(request: NextRequest) {
  const filters = buildAlertFilters(request.nextUrl.searchParams);

  if (!filters) {
    return NextResponse.json(
      { error: "The supplied alert filters are invalid." },
      { status: 400 }
    );
  }

  const records = await listAlertsByFilters(filters);

  return NextResponse.json({
    items: records.map(buildAlertViewModel),
    summary: summarizeAlerts(records),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = alertCreateBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Valid alert payload is required." },
        { status: 400 }
      );
    }

    const payload: AlertCreateInput = {
      patientId: parsed.data.patientId,
      title: parsed.data.title,
      message: parsed.data.message,
      level: parsed.data.level,
      status: parsed.data.status,
      source: parsed.data.source,
      metadata: parsed.data.metadata,
      ...(parsed.data.physicianId
        ? { physicianId: parsed.data.physicianId }
        : {}),
      ...(parsed.data.ruleId ? { ruleId: parsed.data.ruleId } : {}),
      ...(parsed.data.metric ? { metric: parsed.data.metric } : {}),
      ...(parsed.data.threshold ? { threshold: parsed.data.threshold } : {}),
      ...(parsed.data.actualValue ? { actualValue: parsed.data.actualValue } : {}),
      ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
      ...(parsed.data.acknowledgedBy
        ? { acknowledgedBy: parsed.data.acknowledgedBy }
        : {}),
    };

    const alert = await createAlert(payload);

    logger.info("Created an alert through the API", {
      alertId: alert.id,
      patientId: alert.patientId,
    });

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    logger.error("Alert POST route failed", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The alert could not be created.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = alertMutationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Valid alert mutation payload is required." },
        { status: 400 }
      );
    }

    switch (parsed.data.action) {
      case "acknowledge": {
        const alert = await acknowledgeAlert(
          parsed.data.alertId,
          parsed.data.acknowledgedBy
        );

        return NextResponse.json({ alert });
      }
      case "resolve": {
        const alert = await resolveAlert(parsed.data.alertId, parsed.data.notes);

        return NextResponse.json({ alert });
      }
      case "dismiss": {
        const alert = await dismissAlert(parsed.data.alertId, parsed.data.notes);

        return NextResponse.json({ alert });
      }
      case "delete": {
        await deleteAlert(parsed.data.alertId);

        return NextResponse.json({ deleted: true });
      }
      case "update":
      default: {
        const updates: AlertUpdateInput = {
          ...(parsed.data.title ? { title: parsed.data.title } : {}),
          ...(parsed.data.message ? { message: parsed.data.message } : {}),
          ...(parsed.data.level ? { level: parsed.data.level } : {}),
          ...(parsed.data.status ? { status: parsed.data.status } : {}),
          ...(parsed.data.source ? { source: parsed.data.source } : {}),
          ...(parsed.data.ruleId ? { ruleId: parsed.data.ruleId } : {}),
          ...(parsed.data.metric ? { metric: parsed.data.metric } : {}),
          ...(parsed.data.threshold ? { threshold: parsed.data.threshold } : {}),
          ...(parsed.data.actualValue
            ? { actualValue: parsed.data.actualValue }
            : {}),
          ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
          ...(parsed.data.physicianId
            ? { physicianId: parsed.data.physicianId }
            : {}),
          ...(parsed.data.acknowledgedBy
            ? { acknowledgedBy: parsed.data.acknowledgedBy }
            : {}),
          ...(parsed.data.metadata ? { metadata: parsed.data.metadata } : {}),
        };

        const alert = await updateAlert(parsed.data.alertId, updates);

        return NextResponse.json({ alert });
      }
    }
  } catch (error) {
    logger.error("Alert PATCH route failed", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The alert could not be updated.",
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
        alertId: z.string().trim().min(1, "Alert ID is required."),
      })
      .safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "An alert ID is required for deletion." },
        { status: 400 }
      );
    }

    await deleteAlert(parsed.data.alertId);

    return NextResponse.json({ deleted: true });
  } catch (error) {
    logger.error("Alert DELETE route failed", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The alert could not be deleted.",
      },
      { status: 500 }
    );
  }
}
