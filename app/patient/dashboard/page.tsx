import { DashboardWorkspace } from "@/components/patient-mobile/DashboardWorkspace";
import { defaultDashboardSnapshot } from "@/features/dashboard/service";
import { formatDateTime } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <main className="grid gap-4 p-4 sm:p-6 lg:p-8">
      <DashboardWorkspace
        metrics={defaultDashboardSnapshot.metrics}
        generatedAtLabel={formatDateTime(defaultDashboardSnapshot.generatedAt)}
      />
    </main>
  );
}
