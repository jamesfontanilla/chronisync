"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createDocumentEntry } from "@/features/documents/actions";
import { useDocumentForm } from "@/features/documents/hooks";
import type { DocumentFormValues } from "@/features/documents/validation";

const controlClassName =
  "flex h-11 w-full rounded-full border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] px-4 py-2 text-sm text-[color:var(--ui-text)] shadow-sm outline-none transition-colors placeholder:text-[color:var(--ui-muted)] focus-visible:border-[color:var(--ui-accent)] focus-visible:ring-2 focus-visible:ring-[color:var(--ui-accent-soft)] disabled:cursor-not-allowed disabled:opacity-50";

const selectOptions = {
  category: [
    { value: "lab_result", label: "Lab result" },
    { value: "prescription", label: "Prescription" },
    { value: "imaging", label: "Imaging" },
    { value: "referral", label: "Referral" },
    { value: "discharge_summary", label: "Discharge summary" },
    { value: "consultation_note", label: "Consultation note" },
    { value: "other", label: "Other" },
  ],
  status: [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "review_required", label: "Review required" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ],
  source: [
    { value: "", label: "Select source" },
    { value: "patient_upload", label: "Patient upload" },
    { value: "physician_upload", label: "Physician upload" },
    { value: "system", label: "System" },
  ],
} as const;

export interface UploadFormProps {
  defaultValues?: Partial<DocumentFormValues>;
}

export function UploadForm({ defaultValues }: UploadFormProps) {
  const form = useDocumentForm(defaultValues);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = form.handleSubmit(async (values) => {
    setMessage(null);

    try {
      await createDocumentEntry(values);
      form.reset();
      setMessage("Document saved.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not save this document yet."
      );
    }
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-[color:var(--ui-border)] bg-[linear-gradient(135deg,rgba(25,163,154,0.08),rgba(11,101,116,0.02))]">
        <CardTitle>Document upload</CardTitle>
        <CardDescription>
          Save the file metadata first so review and extraction can happen in a
          predictable order.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5 p-6">
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input id="patientId" {...form.register("patientId")} />
            </label>

            <label className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...form.register("title")} />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <Label htmlFor="fileName">File name</Label>
              <Input id="fileName" {...form.register("fileName")} />
            </label>

            <label className="grid gap-2">
              <Label htmlFor="filePath">File path</Label>
              <Input id="filePath" {...form.register("filePath")} />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <Label htmlFor="contentType">Content type</Label>
              <Input id="contentType" {...form.register("contentType")} />
            </label>

            <label className="grid gap-2">
              <Label htmlFor="sizeBytes">Size in bytes</Label>
              <Input
                id="sizeBytes"
                type="number"
                placeholder="102400"
                {...form.register("sizeBytes")}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className={controlClassName}
                {...form.register("category")}
              >
                {selectOptions.category.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className={controlClassName}
                {...form.register("status")}
              >
                {selectOptions.status.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <Label htmlFor="source">Source</Label>
            <select
              id="source"
              className={controlClassName}
              {...form.register("source")}
            >
              {selectOptions.source.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              placeholder="Optional short summary of the file."
              {...form.register("summary")}
            />
          </label>

          {message ? (
            <p className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] px-4 py-3 text-sm text-[color:var(--ui-text)]">
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save document"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
