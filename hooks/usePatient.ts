"use client";

import { useQuery } from "@tanstack/react-query";

import { COLLECTIONS } from "@/config/firebase";
import { getDocument } from "@/lib/firebase/firestore";
import type { Patient } from "@/types/patient";

export function usePatient(patientId?: string) {
  return useQuery<Patient | null>({
    queryKey: ["patients", patientId ?? ""],
    queryFn: async () => {
      if (!patientId) {
        return null;
      }

      try {
        return await getDocument<Patient>(COLLECTIONS.PATIENTS, patientId);
      } catch {
        return null;
      }
    },
    enabled: Boolean(patientId),
    staleTime: 45_000,
    placeholderData: null,
  });
}
