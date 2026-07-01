import Link from "next/link";
import {
  Camera,
  CircleDashed,
  HandCoins,
  MessageSquareText,
  PencilRuler,
  PlusCircle,
} from "lucide-react";

import { BottomNav } from "@/components/patient-mobile/BottomNav";
import { QuickLogTiles } from "@/components/patient-mobile/QuickLogTiles";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  buildFoodPhotoDemoRecord,
  buildFoodPhotoViewModel,
} from "@/features/food-photo/service";
import { formatDateTime, humanize } from "@/lib/utils";

const captureModes = [
  {
    title: "Photo first",
    description: "Capture the meal photo, then confirm the estimate before it saves.",
    icon: Camera,
  },
  {
    title: "Voice first",
    description: "Say what happened, then refine it later if the app needs detail.",
    icon: MessageSquareText,
  },
  {
    title: "Manual fallback",
    description: "Switch to a simple text form if the camera result is unclear.",
    icon: PencilRuler,
  },
  {
    title: "Queued sync",
    description: "Keep logging even when the connection is unavailable.",
    icon: CircleDashed,
  },
];

export default function PatientAddPage() {
  const demoFoodPhoto = buildFoodPhotoDemoRecord();
  const demoFoodPhotoView = buildFoodPhotoViewModel(demoFoodPhoto);

  return (
    <main className="grid gap-6 p-4 pb-28 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Patient workspace"
        title="Add"
        description="This quick-capture hub stays focused on the shortest path into the diary."
        meta={<span>Photo drafts, voice notes, and quick logs</span>}
        actions={
          <Button asChild variant="glass">
            <Link href="/patient/diary">Open diary</Link>
          </Button>
        }
        level={1}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {captureModes.map((mode) => {
          const Icon = mode.icon;

          return (
            <Card key={mode.title}>
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">{mode.title}</CardTitle>
                  <span className="inline-grid h-11 w-11 place-items-center rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]">
                    <Icon size={18} />
                  </span>
                </div>
                <div className="text-sm leading-6 text-[color:var(--ui-muted)]">
                  {mode.description}
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      <QuickLogTiles />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Card>
          <CardHeader className="gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-2xl">Meal photo preview</CardTitle>
              <Badge variant="glass">
                {humanize(demoFoodPhoto.status)}
              </Badge>
            </div>
            <p className="m-0 text-sm leading-7 text-[color:var(--ui-muted)]">
              The add flow shows the draft before it is confirmed, because the
              correction step is part of the design.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
                  Meal
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {demoFoodPhoto.mealLabel}
                </div>
                <div className="mt-1 text-sm text-[color:var(--ui-muted)]">
                  {humanize(demoFoodPhoto.mealType)}
                  {demoFoodPhoto.portionLabel
                    ? ` - ${demoFoodPhoto.portionLabel}`
                    : ""}
                </div>
              </div>
              <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
                  Confidence
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {demoFoodPhotoView.confidenceLabel}
                </div>
                <div className="mt-1 text-sm text-[color:var(--ui-muted)]">
                  Captured {formatDateTime(demoFoodPhoto.capturedAt)}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
                  Calories
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {demoFoodPhoto.estimatedCalories} kcal
                </div>
              </div>
              <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
                  Carbs
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {demoFoodPhoto.estimatedCarbsG} g
                </div>
              </div>
              <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
                  Protein
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {demoFoodPhoto.estimatedProteinG} g
                </div>
              </div>
            </div>

            <div className="grid gap-2 rounded-[1.35rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
                Suggested edits
              </div>
              <ul className="m-0 grid gap-2 pl-5 text-sm leading-6 text-[color:var(--ui-muted)]">
                {demoFoodPhoto.suggestedEdits?.map((edit) => (
                  <li key={edit}>{edit}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">What happens next</CardTitle>
              <PlusCircle className="text-[color:var(--ui-accent)]" size={18} />
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
            <div className="flex items-start gap-3">
              <HandCoins className="mt-1 text-[color:var(--ui-accent)]" size={18} />
              <p className="m-0">
                Quick logs are stored first, then the app fills in richer
                context when the user has time to confirm details.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Camera className="mt-1 text-[color:var(--ui-accent)]" size={18} />
              <p className="m-0">
                Meal photos stay draft-first so the correction step can happen
                before the record becomes part of the trend history.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CircleDashed className="mt-1 text-[color:var(--ui-accent)]" size={18} />
              <p className="m-0">
                Sync state stays visible to make offline use honest instead of
                hiding the network layer behind a spinner.
              </p>
            </div>
            <Button asChild variant="secondary" className="w-fit">
              <Link href="/patient/diary">Review diary</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <BottomNav />
    </main>
  );
}
