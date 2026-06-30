"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  listDocumentEntriesByPatient,
  listPendingDocumentEntriesByPatient,
} from "./actions";
import { documentFormSchema, type DocumentFormValues } from "./validation";

type DocumentFormInput = z.input<typeof documentFormSchema>;

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
  const mergedDefaults: DocumentFormInput = {
    ...documentDefaultValues,
    ...defaultValues,
  } as DocumentFormInput;

  return useForm<DocumentFormInput, object, DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: mergedDefaults,
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
