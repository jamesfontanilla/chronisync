"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";

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

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const optionalText = z.preprocess(
  emptyToUndefined,
  z.string().trim().optional()
);

const treatmentFormSchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID is required."),
  title: z.string().trim().min(1, "Plan title is required."),
  summary: z.string().trim().min(1, "Summary is required."),
  medications: optionalText,
  followUpAt: optionalText,
  notes: optionalText,
});

type TreatmentFormValues = z.infer<typeof treatmentFormSchema>;

const defaultValues = {
  patientId: "",
  title: "",
  summary: "",
  medications: "",
  followUpAt: "",
  notes: "",
};

export interface TreatmentFormProps {
  defaultValues?: Partial<TreatmentFormValues>;
}

export function TreatmentForm({ defaultValues: providedValues }: TreatmentFormProps) {
  const form = useForm<TreatmentFormValues>({
    defaultValues: {
      ...defaultValues,
      ...providedValues,
    } as any,
    mode: "onSubmit",
  });
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = form.handleSubmit(async () => {
    setMessage(null);
    setMessage("Treatment draft prepared.");
    form.reset();
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-[color:var(--ui-border)] bg-[linear-gradient(135deg,rgba(25,163,154,0.08),rgba(11,101,116,0.02))]">
        <CardTitle>Treatment draft</CardTitle>
        <CardDescription>
          Capture the latest plan details before the physician finalizes the
          visit record.
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
              <Label htmlFor="title">Plan title</Label>
              <Input id="title" {...form.register("title")} />
            </label>
          </div>

          <label className="grid gap-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              placeholder="Summarize the current care plan."
              {...form.register("summary")}
            />
          </label>

          <label className="grid gap-2">
            <Label htmlFor="medications">Medication changes</Label>
            <Textarea
              id="medications"
              placeholder="Describe medication adjustments or confirmations."
              {...form.register("medications")}
            />
          </label>

          <label className="grid gap-2">
            <Label htmlFor="followUpAt">Follow-up date</Label>
            <Input
              id="followUpAt"
              type="date"
              {...form.register("followUpAt")}
            />
          </label>

          <label className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional physician notes."
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
              {form.formState.isSubmitting ? "Saving..." : "Save draft"}
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
