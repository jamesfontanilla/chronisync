import {
  buildDashboardSnapshot,
  type DashboardSnapshot,
  type DashboardSnapshotInput,
} from "./service";

export async function refreshDashboardSnapshot(
  input?: DashboardSnapshotInput
): Promise<DashboardSnapshot> {
  return buildDashboardSnapshot(input);
}
