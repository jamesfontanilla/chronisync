import { HeartPulse, ShieldCheck, Activity, ClipboardList } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TrendCard } from "@/components/dashboard/TrendCard";
import { defaultDashboardSnapshot } from "@/features/dashboard/service";

const metricIcons = [Activity, ShieldCheck, HeartPulse, ClipboardList] as const;

export default function DashboardPage() {
  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Patient workspace"
        title="Dashboard"
        description="Review the latest care signals, trends, and unresolved items from one calm landing page."
        level={1}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {defaultDashboardSnapshot.metrics.map((metric, index) => {
          const Icon = metricIcons[index % metricIcons.length]!;

          return (
            <MetricCard
              key={metric.label}
              metric={metric}
              icon={<Icon size={18} />}
            />
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {defaultDashboardSnapshot.trends.map((series) => (
          <TrendCard key={series.title} series={series} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Workspace summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
            <p>
              The dashboard is intentionally compact so the most recent clinical
              state is visible before the patient scrolls anywhere else.
            </p>
            <p>
              The snapshot shown here is seeded data until the live queries are
              connected.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated at</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-[color:var(--ui-muted)]">
            <p>{defaultDashboardSnapshot.generatedAt.toLocaleString()}</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
