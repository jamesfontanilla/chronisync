"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/config/route";
import { usePhysicianWorkspaceQuery } from "@/features/physician/hooks";
import { buildPhysicianDemoWorkspaceSnapshot } from "@/features/physician/service";
import { formatDateTime, humanize } from "@/lib/utils";
import type { Document as ClinicalDocument } from "@/types/document";

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`;
}

function sortDocuments(documents: ClinicalDocument[]) {
  return [...documents].sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
  );
}

export default function PhysicianDocumentsPage() {
  const { data } = usePhysicianWorkspaceQuery();
  const workspace = data ?? buildPhysicianDemoWorkspaceSnapshot();
  const documents = sortDocuments(workspace.documents);
  const pendingCount = documents.filter((document) =>
    ["pending", "processing", "review_required"].includes(document.status)
  ).length;

  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Physician workspace"
        title="Documents"
        description="Review new uploads, extracted text, and document status before approving each item."
        meta={<span>Updated {formatDateTime(workspace.generatedAt)}</span>}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={ROUTES.PHYSICIAN.DASHBOARD}>Dashboard</Link>
            </Button>
            <Button asChild variant="glass">
              <Link href={ROUTES.PHYSICIAN.SUMMARIES}>Summaries</Link>
            </Button>
          </>
        }
        level={1}
      />

      <Card>
        <CardHeader className="gap-2">
          <CardTitle>Document queue</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="secondary">{documents.length} documents</Badge>
          <Badge variant="glass">{pendingCount} pending review</Badge>
          <Badge variant="outline">
            {documents.filter((document) => document.status === "approved").length} approved
          </Badge>
        </CardContent>
      </Card>

      <section className="grid gap-4">
        {documents.length > 0 ? (
          documents.map((document) => (
            <Card key={document.id}>
              <CardHeader className="gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl">{document.title}</CardTitle>
                  <Badge variant="secondary">{humanize(document.status)}</Badge>
                  <Badge variant="glass">{humanize(document.category)}</Badge>
                </div>
                <p className="m-0 text-sm leading-6 text-[color:var(--ui-muted)]">
                  Patient: {document.patientId} | File: {document.fileName}
                </p>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm leading-7 text-[color:var(--ui-muted)]">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{formatBytes(document.sizeBytes)}</Badge>
                  <Badge variant="outline">{document.contentType}</Badge>
                  <Badge variant="outline">
                    {formatDateTime(document.createdAt)}
                  </Badge>
                </div>

                <p className="m-0">
                  {document.summary ?? "No short summary is available yet."}
                </p>

                {document.extractedText ? (
                  <div className="grid gap-2 rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
                      Extracted text
                    </div>
                    <p className="m-0 text-[color:var(--ui-text)]">
                      {document.extractedText}
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  {document.downloadUrl ? (
                    <a
                      href={document.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full border border-[color:var(--ui-border)] bg-[color:var(--ui-accent-soft)] px-4 py-2 font-semibold text-[color:var(--ui-accent)]"
                    >
                      Open file
                    </a>
                  ) : null}
                  <span>Updated {formatDateTime(document.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={FileText}
            title="No documents queued."
            description="Document uploads will appear here once the physician workspace has files to review."
          />
        )}
      </section>
    </main>
  );
}
