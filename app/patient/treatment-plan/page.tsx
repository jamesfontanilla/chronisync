import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { ClipboardList } from "lucide-react";

import { TreatmentForm } from "@/components/forms/TreatmentForm";

export default function TreatmentPlanPage() {
  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Patient record"
        title="Treatment plan"
        description="Keep the current plan readable, review-ready, and easy to update during the next visit."
        level={1}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <TreatmentForm />

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Treatment notes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
              <p>Summarize the plan before final edits so nothing gets lost in the handoff.</p>
              <p>Use the follow-up date to keep the next visit visible to the patient.</p>
            </CardContent>
          </Card>

          <EmptyState
            icon={<ClipboardList size={24} />}
            eyebrow="Draft"
            title="No treatment draft is open."
            description="The saved draft and final plan will appear here once the patient has an active treatment plan."
          />
        </div>
      </section>
    </main>
  );
}
