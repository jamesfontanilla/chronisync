"use client";

import { useMemo } from "react";

import {
  buildDashboardSnapshot,
  type DashboardSnapshot,
  type DashboardSnapshotInput,
} from "./service";

export function useDashboardSnapshot(
  input?: DashboardSnapshotInput
): DashboardSnapshot {
  return useMemo(
    () => buildDashboardSnapshot(input),
    [input]
  );
}
