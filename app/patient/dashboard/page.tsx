import { PageHeader } from "@/components/common/PageHeader";
import { DashboardWorkspace } from "@/components/patient-mobile/DashboardWorkspace";
import { defaultDashboardSnapshot } from "@/features/dashboard/service";
import { formatDateTime } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Patient workspace"
        title="Dashboard"
        description="Review the latest care signals in a simple view first, then switch to detailed charts when you want the full trend story."
        level={1}
      />
      <DashboardWorkspace
        metrics={defaultDashboardSnapshot.metrics}
        trends={defaultDashboardSnapshot.trends}
        generatedAtLabel={formatDateTime(defaultDashboardSnapshot.generatedAt)}
      />
    </main>
  );
}
