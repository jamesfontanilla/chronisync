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
import { createVitalRecord } from "@/features/vitals/actions";
import { useVitalForm } from "@/features/vitals/hooks";
import type { VitalFormValues } from "@/features/vitals/validation";

const controlClassName =
  "flex h-11 w-full rounded-full border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] px-4 py-2 text-sm text-[color:var(--ui-text)] shadow-sm outline-none transition-colors placeholder:text-[color:var(--ui-muted)] focus-visible:border-[color:var(--ui-accent)] focus-visible:ring-2 focus-visible:ring-[color:var(--ui-accent-soft)] disabled:cursor-not-allowed disabled:opacity-50";

const typeOptions = [
  { value: "blood_pressure", label: "Blood pressure" },
  { value: "heart_rate", label: "Heart rate" },
  { value: "blood_glucose", label: "Blood glucose" },
  { value: "weight", label: "Weight" },
  { value: "temperature", label: "Temperature" },
  { value: "oxygen_saturation", label: "Oxygen saturation" },
] as const;

const sourceOptions = [
  { value: "", label: "Select source" },
  { value: "manual", label: "Manual" },
  { value: "device", label: "Device" },
  { value: "imported", label: "Imported" },
] as const;

const numericLabels: Record<
  Exclude<VitalFormValues["type"], "blood_pressure">,
  { label: string; placeholder: string }
> = {
  heart_rate: { label: "Heart rate", placeholder: "For example, 72" },
  blood_glucose: { label: "Blood glucose", placeholder: "For example, 108" },
  weight: { label: "Weight", placeholder: "For example, 70" },
  temperature: { label: "Temperature", placeholder: "For example, 36.7" },
  oxygen_saturation: { label: "Oxygen saturation", placeholder: "For example, 98" },
};

export interface VitalFormProps {
  defaultValues?: Partial<VitalFormValues>;
}

export function VitalForm({ defaultValues }: VitalFormProps) {
  const form = useVitalForm(defaultValues);
  const [message, setMessage] = useState<string | null>(null);
  const selectedType = form.watch("type");
  const isBloodPressure = selectedType === "blood_pressure";

  const valueField = isBloodPressure
    ? null
    : numericLabels[
        selectedType as Exclude<
          VitalFormValues["type"],
          "blood_pressure"
        >
      ];

  const onSubmit = form.handleSubmit(async (values) => {
    setMessage(null);

    try {
      await createVitalRecord(values);
      form.reset();
      setMessage("Vital sign saved.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not save this vital sign yet."
      );
    }
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-[color:var(--ui-border)] bg-[linear-gradient(135deg,rgba(25,163,154,0.08),rgba(11,101,116,0.02))]">
        <CardTitle>Vital sign entry</CardTitle>
        <CardDescription>
          Capture one reading at a time and keep the trend history easy to
          interpret.
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
              <Label htmlFor="recordedAt">Recorded at</Label>
              <Input
                id="recordedAt"
                type="date"
                {...form.register("recordedAt")}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className={controlClassName}
                {...form.register("type")}
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <Label htmlFor="source">Source</Label>
              <select
                id="source"
                className={controlClassName}
                {...form.register("source")}
              >
                {sourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isBloodPressure ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <Label htmlFor="systolic">Systolic</Label>
                <Input
                  id="systolic"
                  type="number"
                  placeholder="For example, 120"
                  {...form.register("systolic")}
                />
              </label>

              <label className="grid gap-2">
                <Label htmlFor="diastolic">Diastolic</Label>
                <Input
                  id="diastolic"
                  type="number"
                  placeholder="For example, 80"
                  {...form.register("diastolic")}
                />
              </label>
            </div>
          ) : null}

          {!isBloodPressure && valueField ? (
            <label className="grid gap-2">
              <Label htmlFor="value">{valueField.label}</Label>
              <Input
                id="value"
                type="number"
                placeholder={valueField.placeholder}
                {...form.register("value")}
              />
            </label>
          ) : null}

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
              {form.formState.isSubmitting ? "Saving..." : "Save vital"}
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
