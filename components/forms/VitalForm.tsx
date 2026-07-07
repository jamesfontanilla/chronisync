"use client";

import { useState, useEffect } from "react";

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
import { useAuth } from "@/hooks/useAuth";

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

const recordedByRoleOptions = [
  { value: "patient", label: "Patient" },
  { value: "caregiver", label: "Caregiver" },
  { value: "clinician", label: "Clinician" },
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
  const { user } = useAuth();
  const form = useVitalForm(defaultValues);
  const [message, setMessage] = useState<string | null>(null);
  const [isGeneratingDemoData, setIsGeneratingDemoData] = useState(false);
  const selectedType = form.watch("type");
  const isBloodPressure = selectedType === "blood_pressure";

  // Pre-populate/set values dynamically when defaultValues change (like patientId or type query parameter)
  useEffect(() => {
    if (defaultValues) {
      if (defaultValues.patientId) {
        form.setValue("patientId", defaultValues.patientId);
      }
      if (defaultValues.type) {
        form.setValue("type", defaultValues.type);
      }
    }
  }, [defaultValues?.patientId, defaultValues?.type, form]);

  const valueField = isBloodPressure
    ? null
    : numericLabels[
        selectedType as Exclude<
          VitalFormValues["type"],
          "blood_pressure"
        >
      ];

  const handleGenerateDemoData = async () => {
    const patientId = form.getValues("patientId") || user?.uid || "";
    if (!patientId) {
      setMessage("Please enter or ensure there is a Patient ID first.");
      return;
    }

    setIsGeneratingDemoData(true);
    setMessage("Generating demo trend data...");

    try {
      const now = new Date();
      const recordsToCreate = [];

      for (let i = 13; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split("T")[0];

        // Blood Pressure (stable first, then rises)
        let systolic = 120 + Math.floor(Math.random() * 5); // 120-124
        let diastolic = 80 + Math.floor(Math.random() * 3) - 1; // 79-81
        if (i === 3) { systolic = 130; diastolic = 84; }
        else if (i === 2) { systolic = 135; diastolic = 86; }
        else if (i === 1) { systolic = 138; diastolic = 88; }
        else if (i === 0) { systolic = 142; diastolic = 90; }

        recordsToCreate.push({
          patientId,
          recordedByRole: "patient" as const,
          type: "blood_pressure" as const,
          systolic: String(systolic),
          diastolic: String(diastolic),
          recordedAt: dateStr,
          source: "device" as const,
          notes: i === 0 ? "Blood pressure elevated above normal thresholds." : "Routine measurement.",
        });

        // Glucose (stable first, then rises)
        let glucose = 100 + Math.floor(Math.random() * 10); // 100-109
        if (i === 3) { glucose = 125; }
        else if (i === 2) { glucose = 140; }
        else if (i === 1) { glucose = 155; }
        else if (i === 0) { glucose = 172; }

        recordsToCreate.push({
          patientId,
          recordedByRole: "patient" as const,
          type: "blood_glucose" as const,
          value: String(glucose),
          recordedAt: dateStr,
          source: "device" as const,
          notes: i === 0 ? "Glucose trending upward over past week." : "Fasting blood sugar check.",
        });

        // Heart Rate (handful across window, stable)
        if (i % 3 === 0) {
          const hr = 70 + Math.floor(Math.random() * 8); // 70-77
          recordsToCreate.push({
            patientId,
            recordedByRole: "patient" as const,
            type: "heart_rate" as const,
            value: String(hr),
            recordedAt: dateStr,
            source: "device" as const,
            notes: "Resting heart rate.",
          });
        }

        // Weight (handful across window, stable)
        if (i % 3 === 0) {
          const wt = 78.0 + (Math.floor(Math.random() * 5) / 10); // 78.0 - 78.4
          recordsToCreate.push({
            patientId,
            recordedByRole: "patient" as const,
            type: "weight" as const,
            value: String(wt),
            recordedAt: dateStr,
            source: "device" as const,
            notes: "Morning weight check.",
          });
        }
      }

      for (const record of recordsToCreate) {
        await createVitalRecord(record as any);
      }

      setMessage("Demo vital signs successfully generated!");
      window.location.reload();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not generate the demo data."
      );
    } finally {
      setIsGeneratingDemoData(false);
    }
  };

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

          <label className="grid gap-2">
            <Label htmlFor="recordedByRole">Logged by</Label>
            <select
              id="recordedByRole"
              className={controlClassName}
              {...form.register("recordedByRole")}
            >
              {recordedByRoleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

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
            <Button type="submit" disabled={form.formState.isSubmitting || isGeneratingDemoData}>
              {form.formState.isSubmitting ? "Saving..." : "Save vital"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => form.reset()}
              disabled={form.formState.isSubmitting || isGeneratingDemoData}
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateDemoData}
              disabled={form.formState.isSubmitting || isGeneratingDemoData}
            >
              {isGeneratingDemoData ? "Generating..." : "Generate Demo Data"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
