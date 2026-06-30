"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import {
  listActiveMedicationRecordsByPatient,
  listMedicationRecordsByPatient,
} from "./actions";
import {
  medicationFormSchema,
  type MedicationFormValues,
} from "./validation";

const medicationDefaultValues = {
  patientId: "",
  name: "",
  dosage: "",
  route: undefined,
  frequency: "once_daily",
  customFrequency: "",
  status: "active",
  startDate: "",
  endDate: "",
  instructions: "",
  notes: "",
};

export function useMedicationForm(
  defaultValues?: Partial<MedicationFormValues>
) {
  return useForm<MedicationFormValues>({
    defaultValues: {
      ...medicationDefaultValues,
      ...defaultValues,
    } as any,
    mode: "onSubmit",
  });
}

export function useMedicationRecordsQuery(patientId?: string) {
  return useQuery({
    queryKey: ["medications", patientId ?? ""],
    queryFn: () =>
      listMedicationRecordsByPatient(patientId ?? ""),
    enabled: Boolean(patientId),
  });
}

export function useActiveMedicationRecordsQuery(patientId?: string) {
  return useQuery({
    queryKey: ["medications", patientId ?? "", "active"],
    queryFn: () =>
      listActiveMedicationRecordsByPatient(patientId ?? ""),
    enabled: Boolean(patientId),
  });
}
