import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VitalForm } from "@/components/forms/VitalForm";
import { BloodPressureChart } from "@/components/charts/BloodPressureChart";
import { GlucoseChart } from "@/components/charts/GlucoseChart";
import { HeartRateChart } from "@/components/charts/HeartRateChart";
import { WeightChart } from "@/components/charts/WeightChart";

export default function VitalsPage() {
  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Patient record"
        title="Vitals"
        description="Log vital signs and watch the trends that matter most for long-term care."
        level={1}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <VitalForm />

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Reading guidance</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
              <p>Record the reading as close to the measurement time as possible.</p>
              <p>The chart will infer the correct unit from the selected vital type.</p>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <BloodPressureChart />
            <GlucoseChart />
            <HeartRateChart />
            <WeightChart />
          </div>
        </div>
      </section>
    </main>
  );
}
