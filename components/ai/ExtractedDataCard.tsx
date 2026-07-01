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
import { ConfidenceBadge } from "./ConfidenceBadge";
import { formatAiConfidence } from "@/features/ai/validation";
import {
  AI_DRAFT_DISCLAIMER,
  getAiMetadataRecord,
  getAiMetadataNumber,
  getAiMetadataString,
} from "@/lib/ai/metadata";
import { humanize } from "@/lib/utils";
import type { DocumentExtractionDraft } from "@/lib/ai/extract";

export interface ExtractedDataCardProps {
  draft: DocumentExtractionDraft;
  actions?: ReactNode;
  className?: string;
}

function sectionTitle(title: string): ReactNode {
  return (
    <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
      {title}
    </div>
  );
}

export function ExtractedDataCard({
  draft,
  actions,
  className,
}: ExtractedDataCardProps) {
  const aiDisclaimer =
    getAiMetadataString(draft.metadata, "aiDisclaimer") ?? AI_DRAFT_DISCLAIMER;
  const traceability = getAiMetadataRecord(draft.metadata, "traceability");
  const context = traceability
    ? getAiMetadataRecord(traceability, "context")
    : undefined;
  const patientId = getAiMetadataString(context, "patientId");
  const physicianName = getAiMetadataString(context, "physicianName");
  const sourceUrl = getAiMetadataString(context, "sourceUrl");
  const sourceTextLength = getAiMetadataNumber(traceability, "sourceTextLength");

  return (
    <Card className={className}>
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-xl">{draft.title}</CardTitle>
            <Badge variant="glass">{humanize(draft.category)}</Badge>
            <ConfidenceBadge confidence={draft.confidence} />
            <Badge variant={draft.needsReview ? "destructive" : "secondary"}>
              {draft.needsReview ? "Needs review" : "Ready"}
            </Badge>
          </div>
          <CardDescription>
            {draft.documentTitle ?? draft.fileName ?? "Extracted document"}
            {draft.patientId ? ` | Patient ${draft.patientId}` : ""}
          </CardDescription>
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </CardHeader>

      <CardContent className="grid gap-4">
        <p className="m-0 whitespace-pre-line text-sm leading-7 text-[color:var(--ui-text)]">
          {draft.summary}
        </p>

        <div className="grid gap-4 rounded-[1.5rem] border border-[color:var(--ui-border)] bg-[linear-gradient(135deg,rgba(25,163,154,0.08),rgba(11,101,116,0.03))] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="glass">AI extraction draft</Badge>
            <Badge variant={draft.needsReview ? "destructive" : "secondary"}>
              {draft.needsReview ? "Review required" : "Ready for review"}
            </Badge>
          </div>
          <p className="m-0 text-sm leading-7 text-[color:var(--ui-muted)]">
            {aiDisclaimer}
          </p>

          {traceability ? (
            <div className="grid gap-3">
              <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
                Source map
              </div>
              <div className="flex flex-wrap gap-2">
                {draft.documentId ? (
                  <Badge variant="outline">{draft.documentId}</Badge>
                ) : null}
                {draft.fileName ? (
                  <Badge variant="secondary">{draft.fileName}</Badge>
                ) : null}
                {draft.fileType ? (
                  <Badge variant="glass">{draft.fileType}</Badge>
                ) : null}
                {draft.categoryHint ? (
                  <Badge variant="outline">{humanize(draft.categoryHint)}</Badge>
                ) : null}
                <Badge variant="secondary">
                  {sourceTextLength ?? draft.sourceTextLength} source characters
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-[color:var(--ui-muted)]">
                {patientId ? <span>Patient: {patientId}</span> : null}
                {physicianName ? <span>Physician: {physicianName}</span> : null}
                {sourceUrl ? <span>Source: {sourceUrl}</span> : null}
              </div>
            </div>
          ) : null}
        </div>

        <section className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-3 rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4">
            {sectionTitle("Source context")}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{draft.patientId}</Badge>
              {draft.documentId ? (
                <Badge variant="outline">{draft.documentId}</Badge>
              ) : null}
              {draft.fileType ? (
                <Badge variant="outline">{draft.fileType}</Badge>
              ) : null}
              {draft.categoryHint ? (
                <Badge variant="glass">{humanize(draft.categoryHint)}</Badge>
              ) : null}
            </div>
            <div className="text-sm leading-7 text-[color:var(--ui-muted)]">
              <div>Source text length: {draft.sourceTextLength} characters</div>
              {draft.physicianName ? (
                <div>Physician: {draft.physicianName}</div>
              ) : null}
              {draft.sourceUrl ? <div>Source URL: {draft.sourceUrl}</div> : null}
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4">
            {sectionTitle("Confidence")}
            <div className="text-sm leading-7 text-[color:var(--ui-muted)]">
              <div>{formatAiConfidence(draft.confidence)} confidence score</div>
              <div>
                {draft.needsReview
                  ? "Physician review is recommended before publishing."
                  : "The extracted data is ready for workflow review."}
              </div>
            </div>
            {draft.notes ? (
              <div className="grid gap-2">
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
                  Notes
                </div>
                <p className="m-0 text-sm leading-7 text-[color:var(--ui-muted)]">
                  {draft.notes}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        {draft.highlights.length > 0 ? (
          <>
            <Separator />
            <section className="grid gap-2">
              {sectionTitle("Highlights")}
              <ul className="m-0 grid gap-2 pl-5 text-sm leading-6 text-[color:var(--ui-muted)]">
                {draft.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </>
        ) : null}

        {draft.labValues.length > 0 ? (
          <>
            <Separator />
            <section className="grid gap-3">
              {sectionTitle("Lab values")}
              <div className="grid gap-3 md:grid-cols-2">
                {draft.labValues.map((value) => (
                  <article
                    key={`${value.name}-${value.value}`}
                    className="grid gap-2 rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{value.name}</Badge>
                      <span className="text-sm font-semibold text-[color:var(--ui-text)]">
                        {value.value}
                        {value.unit ? ` ${value.unit}` : ""}
                      </span>
                    </div>
                    {value.referenceRange ? (
                      <div className="text-sm text-[color:var(--ui-muted)]">
                        Reference: {value.referenceRange}
                      </div>
                    ) : null}
                    {value.interpretation ? (
                      <div className="text-sm leading-6 text-[color:var(--ui-muted)]">
                        {value.interpretation}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {draft.medications.length > 0 ? (
          <>
            <Separator />
            <section className="grid gap-3">
              {sectionTitle("Medication mentions")}
              <div className="grid gap-2">
                {draft.medications.map((medication) => (
                  <div
                    key={medication.name}
                    className="flex flex-wrap items-center gap-2 rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] p-4"
                  >
                    <Badge variant="glass">{medication.name}</Badge>
                    {medication.dosage ? <span>{medication.dosage}</span> : null}
                    {medication.frequency ? <span>{medication.frequency}</span> : null}
                    {medication.route ? <span>{medication.route}</span> : null}
                    {medication.notes ? (
                      <span className="text-[color:var(--ui-muted)]">
                        {medication.notes}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {(draft.diagnosisLabels.length > 0 ||
          draft.physicianNames.length > 0 ||
          draft.dates.length > 0) ? (
          <>
            <Separator />
            <section className="grid gap-3">
              {sectionTitle("Detected details")}
              <div className="flex flex-wrap gap-2">
                {draft.diagnosisLabels.map((label) => (
                  <Badge key={label} variant="outline">
                    {label}
                  </Badge>
                ))}
                {draft.physicianNames.map((name) => (
                  <Badge key={name} variant="secondary">
                    {name}
                  </Badge>
                ))}
                {draft.dates.map((date) => (
                  <Badge key={`${date.label}-${date.value}`} variant="glass">
                    {date.label}: {date.value}
                  </Badge>
                ))}
              </div>
            </section>
          </>
        ) : null}

        <Separator />

        <div className="flex flex-wrap gap-3 text-sm text-[color:var(--ui-muted)]">
          <span>Confidence {formatAiConfidence(draft.confidence)}</span>
          <span>{draft.sourceTextLength} source characters</span>
          <span>Generated draft for patient {draft.patientId}</span>
        </div>
      </CardContent>
    </Card>
  );
}
