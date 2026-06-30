"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/route";

export default function PhysicianDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <EmptyState
        icon={TriangleAlert}
        eyebrow="Workspace error"
        title="The physician dashboard could not load."
        description={error.message}
        primaryAction={
          <Button onClick={reset}>Try again</Button>
        }
        secondaryAction={
          <Button asChild variant="secondary">
            <Link href={ROUTES.HOME}>Back home</Link>
          </Button>
        }
      />
    </main>
  );
}
