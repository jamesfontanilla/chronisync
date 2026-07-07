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
import {
  createMedicationRecord,
} from "@/features/medications/actions";
import { useMedicationForm } from "@/features/medications/hooks";
import type { MedicationFormValues } from "@/features/medications/validation";

const controlClassName =
  "flex h-11 w-full rounded-full border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] px-4 py-2 text-sm text-[color:var(--ui-text)] shadow-sm outline-none transition-colors placeholder:text-[color:var(--ui-muted)] focus-visible:border-[color:var(--ui-accent)] focus-visible:ring-2 focus-visible:ring-[color:var(--ui-accent-soft)] disabled:cursor-not-allowed disabled:opacity-50";

const selectOptions = {
  route: [
    { value: "", label: "Select route" },
    { value: "oral", label: "Oral" },
    { value: "topical", label: "Topical" },
    { value: "inhaled", label: "Inhaled" },
    { value: "injection", label: "Injection" },
    { value: "intravenous", label: "Intravenous" },
    { value: "subcutaneous", label: "Subcutaneous" },
    { value: "rectal", label: "Rectal" },
    { value: "other", label: "Other" },
  ],
  frequency: [
    { value: "once_daily", label: "Once daily" },
    { value: "twice_daily", label: "Twice daily" },
    { value: "three_times_daily", label: "Three times daily" },
    { value: "every_other_day", label: "Every other day" },
    { value: "weekly", label: "Weekly" },
    { value: "as_needed", label: "As needed" },
    { value: "custom", label: "Custom" },
  ],
  status: [
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "completed", label: "Completed" },
    { value: "discontinued", label: "Discontinued" },
  ],
  recordedByRole: [
    { value: "patient", label: "Patient" },
    { value: "caregiver", label: "Caregiver" },
    { value: "clinician", label: "Clinician" },
  ],
} as const;

export interface MedicationFormProps {
  defaultValues?: Partial<MedicationFormValues>;
}

export function MedicationForm({ defaultValues }: MedicationFormProps) {
  const form = useMedicationForm(defaultValues);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = form.handleSubmit(async (values) => {
    setMessage(null);

    try {
      await createMedicationRecord(values);
      form.reset();
      setMessage("Medication saved.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not save this medication yet."
      );
    }
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-[color:var(--ui-border)] bg-[linear-gradient(135deg,rgba(25,163,154,0.08),rgba(11,101,116,0.02))]">
        <CardTitle>Medication entry</CardTitle>
        <CardDescription>
          Capture the most important medication details and keep the record
          ready for patient review.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5 p-6">
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input id="patientId" {...form.register("patientId")} />
              {form.formState.errors.patientId ? (
                <span className="text-sm text-[color:var(--ui-warning)]">
                  {form.formState.errors.patientId.message}
                </span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <Label htmlFor="name">Medication name</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name ? (
                <span className="text-sm text-[color:var(--ui-warning)]">
                  {form.formState.errors.name.message}
                </span>
              ) : null}
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input id="dosage" {...form.register("dosage")} />
              {form.formState.errors.dosage ? (
                <span className="text-sm text-[color:var(--ui-warning)]">
                  {form.formState.errors.dosage.message}
                </span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <Label htmlFor="route">Route</Label>
              <select
                id="route"
                className={controlClassName}
                {...form.register("route")}
              >
                {selectOptions.route.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
              <Label htmlFor="customFrequency">Custom frequency</Label>
              <Input
                id="customFrequency"
                placeholder="For example, every 8 hours"
                {...form.register("customFrequency")}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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

            <label className="grid gap-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" {...form.register("startDate")} />
            </label>
          </div>

          <label className="grid gap-2">
            <Label htmlFor="recordedByRole">Logged by</Label>
            <select
              id="recordedByRole"
              className={controlClassName}
              {...form.register("recordedByRole")}
            >
              {selectOptions.recordedByRole.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <Label htmlFor="endDate">End date</Label>
            <Input id="endDate" type="date" {...form.register("endDate")} />
          </label>

          <label className="grid gap-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Add patient-friendly instructions."
              {...form.register("instructions")}
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
              {form.formState.isSubmitting ? "Saving..." : "Save medication"}
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
