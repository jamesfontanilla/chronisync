"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  listActiveSymptomRecordsByPatient,
  listSymptomRecordsByPatient,
} from "./actions";
import { symptomFormSchema, type SymptomFormValues } from "./validation";

type SymptomFormInput = z.input<typeof symptomFormSchema>;

const symptomDefaultValues = {
  patientId: "",
  name: "",
  severity: "mild",
  frequency: "",
  status: "active",
  description: "",
  notes: "",
};

export function useSymptomForm(
  defaultValues?: Partial<SymptomFormValues>
) {
  const mergedDefaults: SymptomFormInput = {
    ...symptomDefaultValues,
    ...defaultValues,
  } as SymptomFormInput;

  return useForm<SymptomFormInput, object, SymptomFormValues>({
    resolver: zodResolver(symptomFormSchema),
    defaultValues: mergedDefaults,
    mode: "onSubmit",
  });
}

export function useSymptomRecordsQuery(patientId?: string) {
  return useQuery({
    queryKey: ["symptoms", patientId ?? ""],
    queryFn: () => listSymptomRecordsByPatient(patientId ?? ""),
    enabled: Boolean(patientId),
  });
}

export function useActiveSymptomRecordsQuery(patientId?: string) {
  return useQuery({
    queryKey: ["symptoms", patientId ?? "", "active"],
    queryFn: () => listActiveSymptomRecordsByPatient(patientId ?? ""),
    enabled: Boolean(patientId),
  });
}
