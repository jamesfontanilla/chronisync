import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AI_DRAFT_DISCLAIMER,
  getAiMetadataRecord,
  getAiMetadataNumber,
  getAiMetadataString,
} from "@/lib/ai/metadata";
import { formatDateTime, humanize } from "@/lib/utils";
import type { Summary } from "@/types/summary";

export interface SummaryPreviewProps {
  summary: Summary;
  actions?: ReactNode;
  className?: string;
}

export function SummaryPreview({
  summary,
  actions,
  className,
}: SummaryPreviewProps) {
  const aiDisclaimer =
    getAiMetadataString(summary.metadata, "aiDisclaimer") ??
    (summary.source === "ai" ? AI_DRAFT_DISCLAIMER : undefined);
  const traceability = getAiMetadataRecord(summary.metadata, "traceability");
  const sourceCounts = traceability
    ? getAiMetadataRecord(traceability, "sourceCounts")
    : undefined;
  const context = traceability
    ? getAiMetadataRecord(traceability, "context")
    : undefined;
  const showAiReview = Boolean(aiDisclaimer || traceability);
  const sourceLabel = summary.source === "ai" ? "AI" : humanize(summary.source);
  const patientComplaintsCount = getAiMetadataNumber(
    sourceCounts,
    "patientComplaints"
  );
  const physicianNotesCount = getAiMetadataNumber(sourceCounts, "physicianNotes");
  const medicationChangesCount = getAiMetadataNumber(
    sourceCounts,
    "medicationChanges"
  );
  const followUpScheduleCount = getAiMetadataNumber(
    sourceCounts,
    "followUpSchedule"
  );
  const vitalHighlightsCount = getAiMetadataNumber(
    sourceCounts,
    "vitalHighlights"
  );
  const documentHighlightsCount = getAiMetadataNumber(
    sourceCounts,
    "documentHighlights"
  );
  const patientName = getAiMetadataString(context, "patientName");
  const physicianName = getAiMetadataString(context, "physicianName");
  const encounterId = getAiMetadataString(context, "encounterId");
  const sourceNotesLength = getAiMetadataNumber(traceability, "sourceNotesLength");

  return (
    <Card className={className}>
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-xl">{summary.title}</CardTitle>
            <Badge variant="secondary">{humanize(summary.status)}</Badge>
            <Badge variant="glass">{sourceLabel}</Badge>
          </div>
          <CardDescription>
            {summary.type === "visit" ? "Visit summary" : humanize(summary.type)}
            {summary.model ? ` | ${summary.model}` : ""}
          </CardDescription>
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </CardHeader>

      <CardContent className="grid gap-4">
        <p className="m-0 whitespace-pre-line text-sm leading-7 text-[color:var(--ui-text)]">
          {summary.content}
        </p>

        {summary.highlights && summary.highlights.length > 0 ? (
          <>
            <Separator />
            <div className="grid gap-2">
              <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
                Highlights
              </div>
              <ul className="m-0 grid gap-2 pl-5 text-sm leading-6 text-[color:var(--ui-muted)]">
                {summary.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </>
        ) : null}

        {summary.recommendations && summary.recommendations.length > 0 ? (
          <>
            <Separator />
            <div className="grid gap-2">
              <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
                Follow-up
              </div>
              <ul className="m-0 grid gap-2 pl-5 text-sm leading-6 text-[color:var(--ui-muted)]">
                {summary.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </>
        ) : null}

        {showAiReview ? (
          <>
            <Separator />
            <div className="grid gap-4 rounded-[1.5rem] border border-[color:var(--ui-border)] bg-[linear-gradient(135deg,rgba(25,163,154,0.08),rgba(11,101,116,0.03))] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="glass">AI-generated draft</Badge>
                <Badge variant="outline">Review source data before publishing</Badge>
              </div>
              <p className="m-0 text-sm leading-7 text-[color:var(--ui-muted)]">
                {aiDisclaimer ?? AI_DRAFT_DISCLAIMER}
              </p>

              {traceability ? (
                <div className="grid gap-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
                    Source map
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {patientComplaintsCount !== undefined ? (
                      <Badge variant="secondary">
                        {patientComplaintsCount} complaints
                      </Badge>
                    ) : null}
                    {physicianNotesCount !== undefined ? (
                      <Badge variant="secondary">
                        {physicianNotesCount} physician notes
                      </Badge>
                    ) : null}
                    {medicationChangesCount !== undefined ? (
                      <Badge variant="secondary">
                        {medicationChangesCount} medication changes
                      </Badge>
                    ) : null}
                    {followUpScheduleCount !== undefined ? (
                      <Badge variant="secondary">
                        {followUpScheduleCount} follow-up items
                      </Badge>
                    ) : null}
                    {vitalHighlightsCount !== undefined ? (
                      <Badge variant="secondary">
                        {vitalHighlightsCount} vital highlights
                      </Badge>
                    ) : null}
                    {documentHighlightsCount !== undefined ? (
                      <Badge variant="secondary">
                        {documentHighlightsCount} document highlights
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-[color:var(--ui-muted)]">
                    {patientName ? <span>Patient: {patientName}</span> : null}
                    {physicianName ? <span>Physician: {physicianName}</span> : null}
                    {encounterId ? <span>Encounter: {encounterId}</span> : null}
                    {sourceNotesLength !== undefined ? (
                      <span>{sourceNotesLength} source note characters</span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        <Separator />

        <div className="flex flex-wrap gap-3 text-sm text-[color:var(--ui-muted)]">
          <span>Generated by {summary.generatedBy ?? "ChroniSync AI"}</span>
          <span>Updated {formatDateTime(summary.updatedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
