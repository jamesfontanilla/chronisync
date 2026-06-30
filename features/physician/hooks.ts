/**
 * =============================================================================
 * ChroniSync
 * Physician Feature Hooks
 * =============================================================================
 */

"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/config/route";
import type { PhysicianPanel, PhysicianWorkspaceQuery } from "./validation";
import {
  buildPhysicianDemoWorkspaceSnapshot,
  getPhysicianWorkspaceSnapshot,
  type PhysicianWorkspaceSnapshot,
} from "./service";

export function usePhysicianWorkspaceQuery(
  physicianId?: string
) {
  return useQuery<PhysicianWorkspaceSnapshot>({
    queryKey: ["physician-workspace", physicianId ?? "demo"],
    queryFn: () => getPhysicianWorkspaceSnapshot(physicianId),
    placeholderData: buildPhysicianDemoWorkspaceSnapshot(physicianId),
    staleTime: 60_000,
  });
}

export function usePhysicianPatientCardsQuery(
  physicianId?: string
) {
  const query = usePhysicianWorkspaceQuery(physicianId);

  return useMemo(() => ({
    ...query,
    data: query.data?.patientCards ?? [],
  }), [query]);
}

export function usePhysicianAlertsQuery(
  physicianId?: string
) {
  const query = usePhysicianWorkspaceQuery(physicianId);

  return useMemo(() => ({
    ...query,
    data: query.data?.alerts ?? [],
  }), [query]);
}

export function usePhysicianDocumentsQuery(
  physicianId?: string
) {
  const query = usePhysicianWorkspaceQuery(physicianId);

  return useMemo(() => ({
    ...query,
    data: query.data?.documents ?? [],
  }), [query]);
}

export function usePhysicianSummariesQuery(
  physicianId?: string
) {
  const query = usePhysicianWorkspaceQuery(physicianId);

  return useMemo(() => ({
    ...query,
    data: query.data?.summaries ?? [],
  }), [query]);
}

export function usePhysicianPanelTabs(
  activePanel?: PhysicianPanel
) {
  return useMemo(
    () => [
      {
        label: "Dashboard",
        href: ROUTES.PHYSICIAN.DASHBOARD,
        active: activePanel === "dashboard",
      },
      {
        label: "Patients",
        href: ROUTES.PHYSICIAN.PATIENTS,
        active: activePanel === "patients",
      },
      {
        label: "Alerts",
        href: ROUTES.PHYSICIAN.ALERTS,
        active: activePanel === "alerts",
      },
      {
        label: "Documents",
        href: ROUTES.PHYSICIAN.DOCUMENTS,
        active: activePanel === "documents",
      },
      {
        label: "Summaries",
        href: ROUTES.PHYSICIAN.SUMMARIES,
        active: activePanel === "summaries",
      },
      {
        label: "Treatment",
        href: ROUTES.PHYSICIAN.TREATMENT,
        active: activePanel === "treatment",
      },
      {
        label: "Settings",
        href: ROUTES.PHYSICIAN.SETTINGS,
        active: activePanel === "settings",
      },
    ],
    [activePanel]
  );
}

export function usePhysicianWorkspaceQueryParams(
  params: PhysicianWorkspaceQuery
): PhysicianWorkspaceQuery {
  return params;
}
