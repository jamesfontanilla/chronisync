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
import { createAllergyRecord } from "@/features/allergies/actions";
import { useAllergyForm } from "@/features/allergies/hooks";
import type { AllergyFormValues } from "@/features/allergies/validation";

const controlClassName =
  "flex h-11 w-full rounded-full border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] px-4 py-2 text-sm text-[color:var(--ui-text)] shadow-sm outline-none transition-colors placeholder:text-[color:var(--ui-muted)] focus-visible:border-[color:var(--ui-accent)] focus-visible:ring-2 focus-visible:ring-[color:var(--ui-accent-soft)] disabled:cursor-not-allowed disabled:opacity-50";

const selectOptions = {
  type: [
    { value: "drug", label: "Drug" },
    { value: "food", label: "Food" },
    { value: "environmental", label: "Environmental" },
    { value: "latex", label: "Latex" },
    { value: "other", label: "Other" },
  ],
  severity: [
    { value: "mild", label: "Mild" },
    { value: "moderate", label: "Moderate" },
    { value: "severe", label: "Severe" },
    { value: "anaphylaxis", label: "Anaphylaxis" },
  ],
  status: [
    { value: "active", label: "Active" },
    { value: "resolved", label: "Resolved" },
  ],
} as const;

export interface AllergyFormProps {
  defaultValues?: Partial<AllergyFormValues>;
}

export function AllergyForm({ defaultValues }: AllergyFormProps) {
  const form = useAllergyForm(defaultValues);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = form.handleSubmit(async (values) => {
    setMessage(null);

    try {
      await createAllergyRecord(values);
      form.reset();
      setMessage("Allergy saved.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not save this allergy yet."
      );
    }
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-[color:var(--ui-border)] bg-[linear-gradient(135deg,rgba(25,163,154,0.08),rgba(11,101,116,0.02))]">
        <CardTitle>Allergy entry</CardTitle>
        <CardDescription>
          Record the allergen, severity, and current status for quick review
          during care visits.
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
              <Label htmlFor="allergen">Allergen</Label>
              <Input id="allergen" {...form.register("allergen")} />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className={controlClassName}
                {...form.register("type")}
              >
                {selectOptions.type.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

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
            <Label htmlFor="reaction">Reaction</Label>
            <Input
              id="reaction"
              placeholder="For example, hives or shortness of breath"
              {...form.register("reaction")}
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
              {form.formState.isSubmitting ? "Saving..." : "Save allergy"}
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
