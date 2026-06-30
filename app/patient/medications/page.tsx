import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicationForm } from "@/components/forms/MedicationForm";
import { MedicationChart } from "@/components/charts/MedicationChart";

const sampleMedicationData = [
  { label: "Mon", adherence: 92, refills: 4 },
  { label: "Tue", adherence: 88, refills: 4 },
  { label: "Wed", adherence: 94, refills: 3 },
  { label: "Thu", adherence: 90, refills: 3 },
  { label: "Fri", adherence: 96, refills: 2 },
  { label: "Sat", adherence: 91, refills: 2 },
  { label: "Sun", adherence: 97, refills: 1 },
] as const;

export default function MedicationsPage() {
  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Patient record"
        title="Medications"
        description="Track prescriptions, dosing instructions, and weekly medication behavior from one place."
        level={1}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <MedicationForm />

        <div className="grid gap-6">
          <MedicationChart data={sampleMedicationData} />

          <Card>
            <CardHeader>
              <CardTitle>What to review next</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
              <p>Check the start and end dates before confirming a regimen.</p>
              <p>
                Keep the frequency aligned with the clinical instruction so
                the adherence chart stays meaningful.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
