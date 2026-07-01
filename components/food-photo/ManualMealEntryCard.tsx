"use client";

import { useState, type FormEvent } from "react";
import { PencilRuler, Save } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createFoodPhotoRecordAction } from "@/features/food-photo/actions";
import type {
  FoodPhotoCreateInput,
  FoodPhotoMealType,
} from "@/features/food-photo/types";
import { foodPhotoManualFormSchema } from "@/features/food-photo/validation";
import { humanize } from "@/lib/utils";

const mealTypeOptions: Array<{ value: FoodPhotoMealType; label: string }> = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
  { value: "drink", label: "Drink" },
  { value: "other", label: "Other" },
];

interface ManualMealEntryCardProps {
  patientId?: string;
}

export function ManualMealEntryCard({
  patientId = "demo-patient",
}: ManualMealEntryCardProps) {
  const [mealType, setMealType] = useState<FoodPhotoMealType>("other");
  const [mealLabel, setMealLabel] = useState("");
  const [portionLabel, setPortionLabel] = useState("");
  const [estimatedCalories, setEstimatedCalories] = useState("");
  const [estimatedCarbsG, setEstimatedCarbsG] = useState("");
  const [estimatedProteinG, setEstimatedProteinG] = useState("");
  const [estimatedFatG, setEstimatedFatG] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setMealType("other");
    setMealLabel("");
    setPortionLabel("");
    setEstimatedCalories("");
    setEstimatedCarbsG("");
    setEstimatedProteinG("");
    setEstimatedFatG("");
    setNotes("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    const parsed = foodPhotoManualFormSchema.safeParse({
      patientId,
      mealType,
      mealLabel,
      portionLabel,
      estimatedCalories,
      estimatedCarbsG,
      estimatedProteinG,
      estimatedFatG,
      notes,
    });

    if (!parsed.success) {
      setErrorMessage(
        parsed.error.issues[0]?.message ?? "Please check the manual entry fields."
      );
      return;
    }

    setIsSaving(true);

    try {
      const recordInput: FoodPhotoCreateInput = {
        patientId: parsed.data.patientId,
        mealType: parsed.data.mealType,
        mealLabel: parsed.data.mealLabel,
        imageName: `manual-entry-${Date.now()}.txt`,
        source: "manual" as const,
        status: "draft" as const,
        ...(parsed.data.portionLabel
          ? { portionLabel: parsed.data.portionLabel }
          : {}),
        ...(parsed.data.estimatedCalories !== undefined
          ? { estimatedCalories: parsed.data.estimatedCalories }
          : {}),
        ...(parsed.data.estimatedCarbsG !== undefined
          ? { estimatedCarbsG: parsed.data.estimatedCarbsG }
          : {}),
        ...(parsed.data.estimatedProteinG !== undefined
          ? { estimatedProteinG: parsed.data.estimatedProteinG }
          : {}),
        ...(parsed.data.estimatedFatG !== undefined
          ? { estimatedFatG: parsed.data.estimatedFatG }
          : {}),
        ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
      };

      await createFoodPhotoRecordAction(recordInput);

      resetForm();
      setMessage("Manual meal draft saved.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not save the manual meal yet."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-[color:var(--ui-border)] bg-[linear-gradient(135deg,rgba(25,163,154,0.08),rgba(11,101,116,0.02))]">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]">
            <PencilRuler className="h-5 w-5" />
          </div>
          <div className="grid gap-2">
            <CardTitle>Manual fallback</CardTitle>
            <CardDescription>
              Use this form when the camera capture is unclear. It saves a
              regular draft so the log can keep moving.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-5 p-6">
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
          <span>{humanize(mealType)}</span>
          <span>Draft-first</span>
          <span>{patientId}</span>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <Label htmlFor="manual-meal-label">Meal label</Label>
              <Input
                id="manual-meal-label"
                value={mealLabel}
                onChange={(event) => setMealLabel(event.target.value)}
                disabled={isSaving}
                placeholder="Chicken adobo with rice"
              />
            </label>

            <label className="grid gap-2">
              <Label htmlFor="manual-meal-type">Meal type</Label>
              <Select
                value={mealType}
                onValueChange={(value) => setMealType(value as FoodPhotoMealType)}
                disabled={isSaving}
              >
                <SelectTrigger id="manual-meal-type">
                  <SelectValue placeholder="Select a meal type" />
                </SelectTrigger>
                <SelectContent>
                  {mealTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>

          <label className="grid gap-2">
            <Label htmlFor="manual-portion-label">Portion</Label>
            <Input
              id="manual-portion-label"
              value={portionLabel}
              onChange={(event) => setPortionLabel(event.target.value)}
              disabled={isSaving}
              placeholder="1 plate"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-2">
              <Label htmlFor="manual-calories">Calories</Label>
              <Input
                id="manual-calories"
                type="number"
                min={0}
                value={estimatedCalories}
                onChange={(event) => setEstimatedCalories(event.target.value)}
                disabled={isSaving}
                placeholder="Optional"
              />
            </label>

            <label className="grid gap-2">
              <Label htmlFor="manual-carbs">Carbs (g)</Label>
              <Input
                id="manual-carbs"
                type="number"
                min={0}
                step="0.1"
                value={estimatedCarbsG}
                onChange={(event) => setEstimatedCarbsG(event.target.value)}
                disabled={isSaving}
                placeholder="Optional"
              />
            </label>

            <label className="grid gap-2">
              <Label htmlFor="manual-protein">Protein (g)</Label>
              <Input
                id="manual-protein"
                type="number"
                min={0}
                step="0.1"
                value={estimatedProteinG}
                onChange={(event) => setEstimatedProteinG(event.target.value)}
                disabled={isSaving}
                placeholder="Optional"
              />
            </label>

            <label className="grid gap-2">
              <Label htmlFor="manual-fat">Fat (g)</Label>
              <Input
                id="manual-fat"
                type="number"
                min={0}
                step="0.1"
                value={estimatedFatG}
                onChange={(event) => setEstimatedFatG(event.target.value)}
                disabled={isSaving}
                placeholder="Optional"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <Label htmlFor="manual-notes">Notes</Label>
            <Textarea
              id="manual-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={isSaving}
              placeholder="Add anything the photo could not capture."
            />
          </label>

          {errorMessage ? (
            <p className="m-0 rounded-[1.5rem] border border-[color:var(--ui-warning)] bg-[color:var(--ui-warning-soft)] px-4 py-3 text-sm leading-6 text-[color:var(--ui-warning)]">
              {errorMessage}
            </p>
          ) : null}

          {message ? (
            <p className="m-0 rounded-[1.5rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] px-4 py-3 text-sm leading-6 text-[color:var(--ui-text)]">
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save manual draft"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setMessage(null);
                setErrorMessage(null);
                resetForm();
              }}
              disabled={isSaving}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
