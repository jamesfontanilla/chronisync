"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { listDiseaseRecordsByPatient } from "./actions";
import { diseaseFormSchema, type DiseaseFormValues } from "./validation";

type DiseaseFormInput = z.input<typeof diseaseFormSchema>;

const diseaseDefaultValues = {
  patientId: "",
  name: "",
  icd10Code: "",
  severity: "",
  status: "suspected",
  isChronic: false,
  notes: "",
};

export function useDiseaseForm(
  defaultValues?: Partial<DiseaseFormValues>
) {
  const mergedDefaults: DiseaseFormInput = {
    ...diseaseDefaultValues,
    ...defaultValues,
  } as DiseaseFormInput;

  return useForm<DiseaseFormInput, object, DiseaseFormValues>({
    resolver: zodResolver(diseaseFormSchema),
    defaultValues: mergedDefaults,
    mode: "onSubmit",
  });
}

export function useDiseaseRecordsQuery(patientId?: string) {
  return useQuery({
    queryKey: ["diseases", patientId ?? ""],
    queryFn: () => listDiseaseRecordsByPatient(patientId ?? ""),
    enabled: Boolean(patientId),
  });
}
