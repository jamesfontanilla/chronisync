"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  listActiveMedicationRecordsByPatient,
  listMedicationRecordsByPatient,
} from "./actions";
import {
  medicationFormSchema,
  type MedicationFormValues,
} from "./validation";

type MedicationFormInput = z.input<typeof medicationFormSchema>;

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
  const mergedDefaults: MedicationFormInput = {
    ...medicationDefaultValues,
    ...defaultValues,
  } as MedicationFormInput;

  return useForm<MedicationFormInput, object, MedicationFormValues>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: mergedDefaults,
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
