"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import {
  listActiveAllergyRecordsByPatient,
  listAllergyRecordsByPatient,
} from "./actions";
import { allergyFormSchema, type AllergyFormValues } from "./validation";

const allergyDefaultValues = {
  patientId: "",
  allergen: "",
  type: "drug",
  severity: "mild",
  status: "active",
  reaction: "",
  notes: "",
};

export function useAllergyForm(
  defaultValues?: Partial<AllergyFormValues>
) {
  return useForm<AllergyFormValues>({
    defaultValues: {
      ...allergyDefaultValues,
      ...defaultValues,
    } as any,
    mode: "onSubmit",
  });
}

export function useAllergyRecordsQuery(patientId?: string) {
  return useQuery({
    queryKey: ["allergies", patientId ?? ""],
    queryFn: () => listAllergyRecordsByPatient(patientId ?? ""),
    enabled: Boolean(patientId),
  });
}

export function useActiveAllergyRecordsQuery(patientId?: string) {
  return useQuery({
    queryKey: ["allergies", patientId ?? "", "active"],
    queryFn: () => listActiveAllergyRecordsByPatient(patientId ?? ""),
    enabled: Boolean(patientId),
  });
}
