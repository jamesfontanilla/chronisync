import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SymptomForm } from "@/components/forms/SymptomForm";
import { EmptyState } from "@/components/common/EmptyState";
import { Activity } from "lucide-react";

export default function SymptomsPage() {
  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Patient record"
        title="Symptoms"
        description="Track active and resolving symptoms so clinicians can read the story at a glance."
        level={1}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <SymptomForm />

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Symptom notes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
              <p>Focus on the most disruptive symptom first.</p>
              <p>Keep the status current so improving symptoms do not look active forever.</p>
            </CardContent>
          </Card>

          <EmptyState
            icon={<Activity size={24} />}
            eyebrow="Timeline"
            title="No symptom timeline is open."
            description="Symptom logs will appear here once entries are saved for the patient."
          />
        </div>
      </section>
    </main>
  );
}
