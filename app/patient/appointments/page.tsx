import { CalendarDays } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AppointmentsPage() {
  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Patient record"
        title="Appointments"
        description="Keep the upcoming care schedule visible even before full scheduling tools arrive."
        level={1}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Next steps</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
            <p>Reserve this space for the next follow-up, referral, or monitoring check-in.</p>
            <p>When scheduling lands, this route can become the patient-facing appointment timeline.</p>
          </CardContent>
        </Card>

        <EmptyState
          icon={CalendarDays}
          eyebrow="Timeline"
          title="No appointments are scheduled yet."
          description="Appointment cards will appear here once this route is wired to the scheduling flow."
        />
      </section>
    </main>
  );
}
