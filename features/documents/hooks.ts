"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import {
  listDocumentEntriesByPatient,
  listPendingDocumentEntriesByPatient,
} from "./actions";
import { documentFormSchema, type DocumentFormValues } from "./validation";

const documentDefaultValues = {
  patientId: "",
  title: "",
  fileName: "",
  filePath: "",
  contentType: "",
  sizeBytes: "",
  category: "other",
  status: "pending",
  source: "",
  summary: "",
};

export function useDocumentForm(
  defaultValues?: Partial<DocumentFormValues>
) {
  return useForm<DocumentFormValues>({
    defaultValues: {
      ...documentDefaultValues,
      ...defaultValues,
    } as any,
    mode: "onSubmit",
  });
}

export function useDocumentRecordsQuery(patientId?: string) {
  return useQuery({
    queryKey: ["documents", patientId ?? ""],
    queryFn: () => listDocumentEntriesByPatient(patientId ?? ""),
    enabled: Boolean(patientId),
  });
}

export function usePendingDocumentRecordsQuery(patientId?: string) {
  return useQuery({
    queryKey: ["documents", patientId ?? "", "pending"],
    queryFn: () =>
      listPendingDocumentEntriesByPatient(patientId ?? ""),
    enabled: Boolean(patientId),
  });
}
