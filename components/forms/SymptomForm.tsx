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
import { createSymptomRecord } from "@/features/symptoms/actions";
import { useSymptomForm } from "@/features/symptoms/hooks";
import type { SymptomFormValues } from "@/features/symptoms/validation";

const controlClassName =
  "flex h-11 w-full rounded-full border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] px-4 py-2 text-sm text-[color:var(--ui-text)] shadow-sm outline-none transition-colors placeholder:text-[color:var(--ui-muted)] focus-visible:border-[color:var(--ui-accent)] focus-visible:ring-2 focus-visible:ring-[color:var(--ui-accent-soft)] disabled:cursor-not-allowed disabled:opacity-50";

const selectOptions = {
  severity: [
    { value: "mild", label: "Mild" },
    { value: "moderate", label: "Moderate" },
    { value: "severe", label: "Severe" },
  ],
  frequency: [
    { value: "", label: "Select frequency" },
    { value: "once", label: "Once" },
    { value: "intermittent", label: "Intermittent" },
    { value: "daily", label: "Daily" },
    { value: "constant", label: "Constant" },
  ],
  status: [
    { value: "active", label: "Active" },
    { value: "improving", label: "Improving" },
    { value: "resolved", label: "Resolved" },
    { value: "worsening", label: "Worsening" },
  ],
} as const;

export interface SymptomFormProps {
  defaultValues?: Partial<SymptomFormValues>;
}

export function SymptomForm({ defaultValues }: SymptomFormProps) {
  const form = useSymptomForm(defaultValues);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = form.handleSubmit(async (values) => {
    setMessage(null);

    try {
      await createSymptomRecord(values);
      form.reset();
      setMessage("Symptom saved.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not save this symptom yet."
      );
    }
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-[color:var(--ui-border)] bg-[linear-gradient(135deg,rgba(25,163,154,0.08),rgba(11,101,116,0.02))]">
        <CardTitle>Symptom entry</CardTitle>
        <CardDescription>
          Capture how the symptom presents right now so future changes are
          easier to spot.
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
              <Label htmlFor="name">Symptom name</Label>
              <Input id="name" {...form.register("name")} />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2">
              <Label htmlFor="severity">Severity</Label>
              <select
                id="severity"
                className={controlClassName}
                {...form.register("severity")}
              >
                {selectOptions.severity.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <select
                id="frequency"
                className={controlClassName}
                {...form.register("frequency")}
              >
                {selectOptions.frequency.map((option) => (
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what the patient is feeling."
              {...form.register("description")}
            />
          </label>

          <label className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional clinical notes."
              {...form.register("notes")}
            />
          </label>

          {message ? (
            <p className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] px-4 py-3 text-sm text-[color:var(--ui-text)]">
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save symptom"}
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
