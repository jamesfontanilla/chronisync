"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Clock3,
  RefreshCw,
  Sparkles,
  SquareCheckBig,
} from "lucide-react";

import { AddWrittenEntryDialog } from "@/components/patient-mobile/AddWrittenEntryDialog";
import { DiaryFilters, type DiaryFilterValue } from "@/components/patient-mobile/DiaryFilters";
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
import { ROUTES } from "@/config/route";
import { useDiaryEntriesQuery, useDiarySummaryQuery } from "@/features/diary/hooks";
import { formatDateTime, humanize } from "@/lib/utils";
import type { DiaryEntry } from "@/features/diary/service";

function matchesDiaryFilter(
  entry: DiaryEntry,
  filter: DiaryFilterValue
): boolean {
  switch (filter) {
    case "vitals":
      return ["glucose", "pressure", "weight"].includes(entry.type);
    case "medication":
      return entry.type === "medication";
    case "lifestyle":
      return ["diet", "exercise"].includes(entry.type) || entry.source === "photo";
    case "notes":
      return entry.type === "note" || entry.type === "voice_note";
    case "queued":
      return entry.syncState !== "synced";
    case "all":
    default:
      return true;
  }
}

function syncBadgeVariant(syncState: DiaryEntry["syncState"]) {
  switch (syncState) {
    case "queued":
      return "glass" as const;
    case "syncing":
      return "secondary" as const;
    case "conflict":
      return "destructive" as const;
    case "synced":
    default:
      return "outline" as const;
  }
}

function DiaryEntryCard({ entry }: { entry: DiaryEntry }) {
  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl">{entry.title}</CardTitle>
              <Badge variant="secondary">{humanize(entry.type)}</Badge>
              <Badge variant={syncBadgeVariant(entry.syncState)}>
                {humanize(entry.syncState)}
              </Badge>
            </div>
            <p className="m-0 text-sm leading-6 text-[color:var(--ui-muted)]">
              {entry.valueLabel ?? "No quick value logged"}
            </p>
          </div>
          <div className="text-sm text-[color:var(--ui-muted)]">
            {formatDateTime(entry.recordedAt)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="m-0 text-sm leading-7 text-[color:var(--ui-text)]">
          {entry.content}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{humanize(entry.source)}</Badge>
          <Badge variant="secondary">
            Logged by {humanize(entry.recordedByRole ?? "patient")}
          </Badge>
          {entry.tags?.map((tag) => (
            <Badge key={tag} variant="glass">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PatientDiaryPage() {
  const [filter, setFilter] = useState<DiaryFilterValue>("all");
  const { data: entries = [] } = useDiaryEntriesQuery();
  const { data: summary } = useDiarySummaryQuery();

  const filteredEntries = useMemo(
    () => entries.filter((entry) => matchesDiaryFilter(entry, filter)),
    [entries, filter]
  );

  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Patient workspace"
        title="Diary"
        description="Keep quick logs, voice notes, and meal photos in one calm timeline."
        meta={
          <span>
            {summary?.total ?? entries.length} entries, updated{" "}
            {formatDateTime(summary?.lastUpdated ?? new Date())}
          </span>
        }
        actions={<AddWrittenEntryDialog />}
        level={1}
      />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          {
            label: "Quick logs",
            value: String(summary?.quickLogs ?? 0),
            detail: "Glucose, pressure, weight, and medication taps",
            icon: SquareCheckBig,
          },
          {
            label: "Photo entries",
            value: String(summary?.photos ?? 0),
            detail: "Meal photo drafts waiting for review",
            icon: Sparkles,
          },
          {
            label: "Queued",
            value: String(summary?.queued ?? 0),
            detail: "Items waiting for sync",
            icon: RefreshCw,
          },
          {
            label: "Voice notes",
            value: String(summary?.voiceEntries ?? 0),
            detail: "Entries captured by speaking",
            icon: Clock3,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className="flex h-full flex-col">
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div className="grid gap-2">
                  <p className="m-0 min-h-10 text-sm text-[color:var(--ui-muted)]">
                    {item.label}
                  </p>
                  <CardTitle className="text-3xl">{item.value}</CardTitle>
                </div>
                <span className="inline-grid h-11 w-11 place-items-center rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]">
                  <Icon size={18} />
                </span>
              </CardHeader>
              <CardContent className="pt-0 text-sm leading-6 text-[color:var(--ui-muted)]">
                {item.detail}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <QuickLogTiles showQuickCapture={false} />

      <DiaryFilters value={filter} onValueChange={setFilter} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="grid gap-4">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => (
              <DiaryEntryCard key={entry.id} entry={entry} />
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No diary entries match this filter.</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
                <p>
                  Try another filter or capture a fresh reading from the quick
                  add screen.
                </p>
                <Button asChild variant="secondary" className="w-fit">
                  <Link href="/patient/add">Capture now</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader className="gap-2">
            <CardTitle>Diary snapshot</CardTitle>
            <p className="m-0 text-sm leading-6 text-[color:var(--ui-muted)]">
              The diary is intentionally honest about sync state, because the
              app needs to work well when the network does not.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {summary?.synced ?? 0} synced
              </Badge>
              <Badge variant="glass">
                {summary?.syncing ?? 0} syncing
              </Badge>
              <Badge variant="outline">
                {summary?.conflict ?? 0} conflicts
              </Badge>
            </div>
            <p>
              Quick logs are the shortest path, while photo drafts and voice
              notes feed the richer review flow.
            </p>
            <p>
              Use the Add screen when the capture needs a photo, a voice note,
              or a more guided form.
            </p>
            <Button asChild variant="glass" className="w-fit">
              <Link href={ROUTES.PATIENT.DASHBOARD}>Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

    </main>
  );
}
