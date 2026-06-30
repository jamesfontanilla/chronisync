import { ShieldCheck } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DiseasesPage() {
  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Patient record"
        title="Diseases"
        description="Keep chronic conditions organized so related symptoms and trends remain easy to follow."
        level={1}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Disease tracking</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
            <p>Record the condition name, status, and any related severity detail.</p>
            <p>Use this section to anchor symptoms and treatment notes to a single diagnosis.</p>
          </CardContent>
        </Card>

        <EmptyState
          icon={<ShieldCheck size={24} />}
          eyebrow="Condition list"
          title="No disease records are open."
          description="Disease entries will appear here once the patient has conditions on file."
        />
      </section>
    </main>
  );
}
