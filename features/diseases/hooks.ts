"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { listDiseaseRecordsByPatient } from "./actions";
import { diseaseFormSchema, type DiseaseFormValues } from "./validation";

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
  return useForm<DiseaseFormValues>({
    defaultValues: {
      ...diseaseDefaultValues,
      ...defaultValues,
    } as any,
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
