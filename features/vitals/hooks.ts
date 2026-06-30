"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  listVitalRecordsByPatient,
  listVitalRecordsByType,
} from "./actions";
import { vitalFormSchema, type VitalFormValues } from "./validation";

type VitalFormInput = z.input<typeof vitalFormSchema>;

const vitalDefaultValues = {
  patientId: "",
  type: "blood_pressure",
  systolic: "",
  diastolic: "",
  recordedAt: "",
  source: "",
  notes: "",
};

export function useVitalForm(
  defaultValues?: Partial<VitalFormValues>
) {
  const mergedDefaults: VitalFormInput = {
    ...vitalDefaultValues,
    ...defaultValues,
  } as VitalFormInput;

  return useForm<VitalFormInput, object, VitalFormValues>({
    resolver: zodResolver(vitalFormSchema),
    defaultValues: mergedDefaults,
    mode: "onSubmit",
  });
}

export function useVitalRecordsQuery(patientId?: string) {
  return useQuery({
    queryKey: ["vitals", patientId ?? ""],
    queryFn: () => listVitalRecordsByPatient(patientId ?? ""),
    enabled: Boolean(patientId),
  });
}

export function useVitalRecordsByTypeQuery(
  patientId?: string,
  type?: VitalFormValues["type"]
) {
  return useQuery({
    queryKey: ["vitals", patientId ?? "", type ?? "all"],
    queryFn: () =>
      listVitalRecordsByType(patientId ?? "", type ?? "blood_pressure"),
    enabled: Boolean(patientId && type),
  });
}
