"use client";

import type { ReactNode } from "react";
import { CameraOff, Sparkles } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buildFoodPhotoViewModel } from "@/features/food-photo/service";
import type { FoodPhotoRecord } from "@/features/food-photo/types";
import { formatDateTime, humanize } from "@/lib/utils";

export interface PhotoPreviewProps {
  record: FoodPhotoRecord;
  actions?: ReactNode;
  className?: string;
}

function getStatusVariant(status: FoodPhotoRecord["status"]) {
  switch (status) {
    case "confirmed":
      return "default" as const;
    case "needs_review":
      return "glass" as const;
    case "rejected":
      return "destructive" as const;
    case "draft":
    default:
      return "secondary" as const;
  }
}

function statValue(value: number | undefined, suffix = ""): string {
  if (value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  return `${value}${suffix}`;
}

export function PhotoPreview({
  record,
  actions,
  className,
}: PhotoPreviewProps) {
  const viewModel = buildFoodPhotoViewModel(record);

  return (
    <Card className={className}>
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[color:var(--ui-border)] bg-[linear-gradient(135deg,rgba(25,163,154,0.18),rgba(11,101,116,0.08))] text-[color:var(--ui-accent)]">
            <Sparkles size={18} />
          </div>

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl">{record.mealLabel}</CardTitle>
              <Badge variant={getStatusVariant(record.status)}>
                {viewModel.statusLabel}
              </Badge>
              <Badge variant="outline">{viewModel.confidenceLabel}</Badge>
            </div>
            <CardDescription>
              {viewModel.mealTypeLabel}
              {record.portionLabel ? ` - ${record.portionLabel}` : ""}
            </CardDescription>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">
              Captured {formatDateTime(record.capturedAt)}
            </p>
          </div>
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </CardHeader>

      <CardContent className="grid gap-5">
        <div className="overflow-hidden rounded-[1.75rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)]">
          {record.imageUrl ? (
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={record.imageUrl}
                alt={record.mealLabel}
                fill
                sizes="100vw"
                unoptimized
                className="object-cover"
              />
            </div>
          ) : (
            <div className="grid aspect-[4/3] place-items-center bg-[linear-gradient(135deg,rgba(25,163,154,0.1),rgba(11,101,116,0.04))] text-[color:var(--ui-muted)]">
              <div className="grid place-items-center gap-3 text-center">
                <CameraOff className="h-8 w-8" />
                <p className="m-0 text-sm">
                  No image preview is available for this capture.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
              Calories
            </div>
            <div className="mt-2 text-lg font-semibold">
              {statValue(record.estimatedCalories, " kcal")}
            </div>
          </div>
          <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
              Carbs
            </div>
            <div className="mt-2 text-lg font-semibold">
              {statValue(record.estimatedCarbsG, " g")}
            </div>
          </div>
          <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
              Protein
            </div>
            <div className="mt-2 text-lg font-semibold">
              {statValue(record.estimatedProteinG, " g")}
            </div>
          </div>
          <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
              Fat
            </div>
            <div className="mt-2 text-lg font-semibold">
              {statValue(record.estimatedFatG, " g")}
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
              Source
            </div>
            <div className="mt-2 text-sm font-medium">
              {viewModel.preview}
            </div>
            <div className="mt-1 text-sm text-[color:var(--ui-muted)]">
              {record.source === "ai" ? "AI" : humanize(record.source)}
            </div>
          </div>
          <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
              Notes
            </div>
            <div className="mt-2 text-sm leading-6 text-[color:var(--ui-muted)]">
              {record.notes ?? "No notes were added to this capture."}
            </div>
          </div>
        </div>

        {record.suggestedEdits?.length ? (
          <>
            <Separator />
            <div className="grid gap-2">
              <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
                Suggested edits
              </div>
              <ul className="m-0 grid list-disc gap-2 pl-5 text-sm leading-6 text-[color:var(--ui-muted)]">
                {record.suggestedEdits.map((edit) => (
                  <li key={edit}>{edit}</li>
                ))}
              </ul>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
