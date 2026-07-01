"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, RefreshCcw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { PhotoPreview } from "./PhotoPreview";
import type {
  FoodPhotoRecord,
  FoodPhotoMealType,
  FoodPhotoStatus,
} from "@/features/food-photo/types";
import { humanize } from "@/lib/utils";

export interface ConfirmMealPayload {
  mealType: FoodPhotoMealType;
  mealLabel: string;
  portionLabel?: string;
  notes?: string;
  status: FoodPhotoStatus;
}

export interface ConfirmMealSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: FoodPhotoRecord;
  side?: "bottom" | "right" | "left" | "top";
  isSaving?: boolean;
  onConfirm?: (payload: ConfirmMealPayload) => void | Promise<void>;
  onSaveDraft?: (payload: ConfirmMealPayload) => void | Promise<void>;
  onRetake?: () => void | Promise<void>;
}

function buildPayload(
  mealType: FoodPhotoMealType,
  mealLabel: string,
  portionLabel: string,
  notes: string,
  status: FoodPhotoStatus,
): ConfirmMealPayload {
  return {
    mealType,
    mealLabel: mealLabel.trim(),
    ...(portionLabel.trim() ? { portionLabel: portionLabel.trim() } : {}),
    ...(notes.trim() ? { notes: notes.trim() } : {}),
    status,
  };
}

export function ConfirmMealSheet({
  open,
  onOpenChange,
  record,
  side = "bottom",
  isSaving = false,
  onConfirm,
  onSaveDraft,
  onRetake,
}: ConfirmMealSheetProps) {
  const [mealLabel, setMealLabel] = useState(record.mealLabel);
  const [mealType, setMealType] = useState(record.mealType);
  const [portionLabel, setPortionLabel] = useState(record.portionLabel ?? "");
  const [notes, setNotes] = useState(record.notes ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  const busy = isSaving || isWorking;

  useEffect(() => {
    if (!open) {
      return;
    }

    setMealLabel(record.mealLabel);
    setMealType(record.mealType);
    setPortionLabel(record.portionLabel ?? "");
    setNotes(record.notes ?? "");
    setErrorMessage(null);
  }, [open, record]);

  const previewRecord = useMemo(
    () => ({
      ...record,
      mealType,
      mealLabel,
      ...(portionLabel.trim() ? { portionLabel } : {}),
      ...(notes.trim() ? { notes } : {}),
    }),
    [record, mealLabel, mealType, portionLabel, notes],
  );

  const submit = async (
    callback?: (payload: ConfirmMealPayload) => void | Promise<void>,
    status: FoodPhotoStatus = "confirmed",
  ) => {
    if (!callback) {
      onOpenChange(false);
      return;
    }

    setIsWorking(true);
    setErrorMessage(null);

    try {
      await callback(
        buildPayload(mealType, mealLabel, portionLabel, notes, status),
      );
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not save this meal yet.",
      );
    } finally {
      setIsWorking(false);
    }
  };

  const handleRetake = async () => {
    setIsWorking(true);
    setErrorMessage(null);

    try {
      await onRetake?.();
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not reopen the camera.",
      );
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className="max-h-[92vh] overflow-y-auto sm:max-w-2xl"
      >
        <SheetHeader>
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[color:var(--ui-border)] bg-[linear-gradient(135deg,rgba(25,163,154,0.12),rgba(11,101,116,0.04))] text-[color:var(--ui-accent)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="grid gap-1">
              <SheetTitle>Confirm meal</SheetTitle>
              <SheetDescription>
                {record.source === "manual"
                  ? "This meal was entered manually because the photo path was unclear. Review the text details before saving it."
                  : "Review the captured meal, make small edits, and confirm the entry for the patient timeline."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="grid gap-5">
          {record.source === "manual" ? (
            <div className="rounded-[1.5rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] px-4 py-3 text-sm leading-6 text-[color:var(--ui-muted)]">
              No photo was captured for this record. The text fields below are
              the source of truth for the draft.
            </div>
          ) : null}

          <PhotoPreview record={previewRecord} />

          <Separator />

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="meal-type">Meal type</Label>
              <Select
                value={mealType}
                onValueChange={(value) =>
                  setMealType(value as FoodPhotoMealType)
                }
                disabled={busy}
              >
                <SelectTrigger id="meal-type">
                  <SelectValue placeholder="Select a meal type" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "breakfast",
                    "lunch",
                    "dinner",
                    "snack",
                    "drink",
                    "other",
                  ].map((value) => (
                    <SelectItem key={value} value={value}>
                      {humanize(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="meal-label">Meal label</Label>
              <Input
                id="meal-label"
                value={mealLabel}
                onChange={(event) => setMealLabel(event.target.value)}
                disabled={busy}
                placeholder="Chicken adobo with rice"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="portion-label">Portion</Label>
              <Input
                id="portion-label"
                value={portionLabel}
                onChange={(event) => setPortionLabel(event.target.value)}
                disabled={busy}
                placeholder="1 plate"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={busy}
                placeholder="Add portion details, sauces, or other context."
              />
            </div>
          </div>

          {errorMessage ? (
            <div className="rounded-[1.5rem] border border-[color:var(--ui-warning)] bg-[color:var(--ui-warning-soft)] p-4 text-sm leading-6 text-[color:var(--ui-warning)]">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <SheetFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleRetake}
            disabled={busy}
          >
            <RefreshCcw className="h-4 w-4" />
            Retake photo
          </Button>
          {onSaveDraft ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => submit(onSaveDraft, "draft")}
              disabled={busy}
            >
              Save draft
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={() => submit(onConfirm, "confirmed")}
            disabled={busy}
          >
            <Check className="h-4 w-4" />
            Confirm meal
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
