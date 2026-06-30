import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AllergyForm } from "@/components/forms/AllergyForm";
import { EmptyState } from "@/components/common/EmptyState";
import { ShieldCheck } from "lucide-react";

export default function AllergiesPage() {
  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Patient record"
        title="Allergies"
        description="Keep allergy warnings visible so clinicians can review them quickly before prescribing or treating."
        level={1}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <AllergyForm />

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Allergy safety notes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
              <p>Capture the most severe reaction first so it stays visible.</p>
              <p>Keep status updated when an allergy has resolved or changed.</p>
            </CardContent>
          </Card>

          <EmptyState
            icon={<ShieldCheck size={24} />}
            eyebrow="Monitoring"
            title="No allergy alerts are open."
            description="Use this section to highlight active allergy risks for the care team."
          />
        </div>
      </section>
    </main>
  );
}
