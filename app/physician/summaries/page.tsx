"use client";

import Link from "next/link";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { SummaryPreview } from "@/components/ai/SummaryPreview";
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
import { formatDateTime } from "@/lib/utils";

export default function PhysicianSummariesPage() {
  const { data } = usePhysicianWorkspaceQuery();
  const workspace = data ?? buildPhysicianDemoWorkspaceSnapshot();

  const draftCount = workspace.summaries.filter((summary) =>
    ["draft", "pending_review"].includes(summary.status)
  ).length;

  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Physician workspace"
        title="Summaries"
        description="Review AI-assisted visit summaries and manual drafts before they are published."
        meta={<span>Updated {formatDateTime(workspace.generatedAt)}</span>}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={ROUTES.PHYSICIAN.DASHBOARD}>Dashboard</Link>
            </Button>
            <Button asChild variant="glass">
              <Link href={ROUTES.PHYSICIAN.DOCUMENTS}>Documents</Link>
            </Button>
          </>
        }
        level={1}
      />

      <Card>
        <CardHeader className="gap-2">
          <CardTitle>Summary queue</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="secondary">{workspace.summaries.length} total</Badge>
          <Badge variant="glass">{draftCount} waiting review</Badge>
          <Badge variant="outline">
            {workspace.summaries.filter((summary) => summary.status === "approved").length} approved
          </Badge>
        </CardContent>
      </Card>

      <section className="grid gap-4">
        {workspace.summaries.length > 0 ? (
          workspace.summaries.map((summary) => (
            <SummaryPreview key={summary.id} summary={summary} />
          ))
        ) : (
          <EmptyState
            title="No summaries available."
            description="Once the physician workspace has visit notes or AI drafts, they will appear here."
          />
        )}
      </section>
    </main>
  );
}
