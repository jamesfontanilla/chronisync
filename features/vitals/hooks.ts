"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import {
  listVitalRecordsByPatient,
  listVitalRecordsByType,
} from "./actions";
import { vitalFormSchema, type VitalFormValues } from "./validation";

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
  return useForm<VitalFormValues>({
    defaultValues: {
      ...vitalDefaultValues,
      ...defaultValues,
    } as any,
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
