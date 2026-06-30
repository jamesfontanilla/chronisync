"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  listActiveAllergyRecordsByPatient,
  listAllergyRecordsByPatient,
} from "./actions";
import { allergyFormSchema, type AllergyFormValues } from "./validation";

type AllergyFormInput = z.input<typeof allergyFormSchema>;

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
  const mergedDefaults: AllergyFormInput = {
    ...allergyDefaultValues,
    ...defaultValues,
  } as AllergyFormInput;

  return useForm<AllergyFormInput, object, AllergyFormValues>({
    resolver: zodResolver(allergyFormSchema),
    defaultValues: mergedDefaults,
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
