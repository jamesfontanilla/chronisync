"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Camera, CircleCheckBig, Loader2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmMealSheet } from "./ConfirmMealSheet";
import { PhotoCapture } from "./PhotoCapture";
import { createFoodPhotoRecordAction } from "@/features/food-photo/actions";
import {
  buildFoodPhotoRecord,
  type FoodPhotoMealType,
} from "@/features/food-photo/service";
import {
  foodPhotoAnalysisDraftSchema,
  type FoodPhotoAnalysisDraft,
} from "@/features/ai/validation";
import { humanize } from "@/lib/utils";

interface MealPhotoCaptureCardProps {
  patientId?: string;
}

function sanitizeFileName(value: string): string {
  return value
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function deriveMealLabel(file: File): string {
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const cleaned = baseName.replace(/[-_]+/g, " ").trim();
  return cleaned ? humanize(cleaned) : "Meal photo";
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Failed to extract base64 data."));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
  });
}


async function analyzeMealPhoto(
  imageBase64: string,
  patientId: string,
  fileName: string,
  mimeType: string,
  mealLabelHint: string,
) {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workflow: "food_photo_analysis",
      input: {
        patientId,
        fileName,
        mimeType,
        imageBase64,
        mealLabelHint,
      },
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "We could not analyze the meal photo yet.");
  }

  const body = (await response.json().catch(() => null)) as {
    draft?: unknown;
  } | null;

  return foodPhotoAnalysisDraftSchema.parse(body?.draft);
}

export function MealPhotoCaptureCard({
  patientId = "demo-patient",
}: MealPhotoCaptureCardProps) {
  const previewUrlRef = useRef<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [analysis, setAnalysis] = useState<FoodPhotoAnalysisDraft | null>(null);
  const [open, setOpen] = useState(false);
  const [mealType, setMealType] = useState<FoodPhotoMealType>("other");
  const [mealLabel, setMealLabel] = useState("Meal photo");
  const [portionLabel, setPortionLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const previewRecord = useMemo(() => {
    if (!selectedFile || !previewUrl) {
      return null;
    }

    const sourceRecord = analysis
      ? {
          mealType: analysis.mealType,
          mealLabel: analysis.mealLabel,
          ...(analysis.portionLabel
            ? { portionLabel: analysis.portionLabel }
            : {}),
          confidence: analysis.confidence,
          estimatedCalories: analysis.estimatedCalories,
          estimatedCarbsG: analysis.estimatedCarbsG,
          estimatedProteinG: analysis.estimatedProteinG,
          estimatedFatG: analysis.estimatedFatG,
          ...(analysis.notes ? { notes: analysis.notes } : {}),
          ...(analysis.suggestedEdits.length
            ? { suggestedEdits: analysis.suggestedEdits }
            : {}),
        }
      : {
          mealType,
          mealLabel,
          ...(portionLabel.trim() ? { portionLabel: portionLabel.trim() } : {}),
        };

    return buildFoodPhotoRecord({
      patientId,
      mealType: sourceRecord.mealType,
      mealLabel: sourceRecord.mealLabel,
      imageName: selectedFile.name || "meal-photo.jpg",
      imageUrl: previewUrl,
      source: "photo",
      status: "needs_review",
      ...(sourceRecord.portionLabel
        ? { portionLabel: sourceRecord.portionLabel }
        : {}),
      ...(analysis?.confidence !== undefined
        ? { confidence: analysis.confidence }
        : {}),
      ...(analysis?.estimatedCalories !== undefined
        ? { estimatedCalories: analysis.estimatedCalories }
        : {}),
      ...(analysis?.estimatedCarbsG !== undefined
        ? { estimatedCarbsG: analysis.estimatedCarbsG }
        : {}),
      ...(analysis?.estimatedProteinG !== undefined
        ? { estimatedProteinG: analysis.estimatedProteinG }
        : {}),
      ...(analysis?.estimatedFatG !== undefined
        ? { estimatedFatG: analysis.estimatedFatG }
        : {}),
      ...(analysis?.notes ? { notes: analysis.notes } : {}),
      ...(analysis?.suggestedEdits?.length
        ? { suggestedEdits: analysis.suggestedEdits }
        : {}),
      ...(!analysis && notes.trim() ? { notes: notes.trim() } : {}),
    });
  }, [
    analysis,
    mealLabel,
    mealType,
    notes,
    patientId,
    portionLabel,
    previewUrl,
    selectedFile,
  ]);

  const clearSelection = async () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setSelectedFile(null);
    setPreviewUrl(undefined);
    setAnalysis(null);
    setOpen(false);
    setMealType("other");
    setMealLabel("Meal photo");
    setPortionLabel("");
    setNotes("");
    setIsAnalyzing(false);
    setIsSaving(false);
  };

  const handleCapture = async (file: File) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsAnalyzing(true);
    setOpen(false);

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextPreviewUrl;

    setSelectedFile(file);
    setPreviewUrl(nextPreviewUrl);

    try {
      const base64 = await fileToBase64(file);

      const draft = await analyzeMealPhoto(
        base64,
        patientId,
        file.name,
        file.type || "image/jpeg",
        deriveMealLabel(file),
      );

      setAnalysis(draft);
      setMealLabel(draft.mealLabel);
      setMealType(draft.mealType);
      setPortionLabel(draft.portionLabel ?? "");
      setNotes(draft.notes ?? "");
    } catch (error) {
      const fallbackMealLabel = deriveMealLabel(file);

      setAnalysis(null);
      setMealLabel(fallbackMealLabel);
      setMealType("other");
      setPortionLabel("");
      setNotes("");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not analyze the meal photo yet.",
      );
    } finally {
      setIsAnalyzing(false);
      setOpen(true);
    }
  };

  const handleSubmit = async (payload: {
    mealType: FoodPhotoMealType;
    mealLabel: string;
    portionLabel?: string;
    notes?: string;
    status: "draft" | "confirmed";
  }) => {
    if (!selectedFile) {
      throw new Error("Please capture a photo before saving.");
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const fileName = sanitizeFileName(selectedFile.name || "meal-photo.jpg");

      const recordInput = {
        patientId,
        mealType: payload.mealType,
        mealLabel: payload.mealLabel,
        imageName: fileName,
        imageUrl: "",
        source: "photo",
        status: payload.status,
        ...(previewRecord?.confidence !== undefined
          ? { confidence: previewRecord.confidence }
          : {}),
        ...(previewRecord?.estimatedCalories !== undefined
          ? { estimatedCalories: previewRecord.estimatedCalories }
          : {}),
        ...(previewRecord?.estimatedCarbsG !== undefined
          ? { estimatedCarbsG: previewRecord.estimatedCarbsG }
          : {}),
        ...(previewRecord?.estimatedProteinG !== undefined
          ? { estimatedProteinG: previewRecord.estimatedProteinG }
          : {}),
        ...(previewRecord?.estimatedFatG !== undefined
          ? { estimatedFatG: previewRecord.estimatedFatG }
          : {}),
        ...(previewRecord?.suggestedEdits?.length
          ? { suggestedEdits: previewRecord.suggestedEdits }
          : {}),
        ...(payload.portionLabel ? { portionLabel: payload.portionLabel } : {}),
        ...(payload.notes ? { notes: payload.notes } : {}),
        capturedAt: new Date(),
      } satisfies Parameters<typeof createFoodPhotoRecordAction>[0];

      await createFoodPhotoRecordAction(recordInput);

      await clearSelection();
      setSuccessMessage(
        payload.status === "confirmed"
          ? "Meal photo saved."
          : "Meal photo draft saved.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not save the meal photo yet.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card id="meal-photo-capture" className="overflow-hidden">
      <CardHeader className="gap-3 border-b border-[color:var(--ui-border)] bg-[linear-gradient(135deg,rgba(25,163,154,0.08),rgba(11,101,116,0.03))]">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]">
            <Camera size={18} />
          </div>
          <div className="grid gap-2">
            <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--ui-muted)]">
              Photo first
            </div>
            <CardTitle className="text-2xl">Capture meal photo</CardTitle>
            <CardDescription>
              Take a photo and let AI estimate nutrition. No uploads until you
              save.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-5 p-6">
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
          <Badge variant="glass">Camera ready</Badge>
          <Badge variant="outline">Draft first</Badge>
          <Badge variant="secondary">{patientId}</Badge>
        </div>

        <PhotoCapture
          title="Take a meal photo"
          description="Use the rear camera on mobile or upload from the gallery."
          {...(previewUrl ? { previewUrl } : {})}
          previewAlt={previewRecord?.mealLabel ?? "Meal photo preview"}
          onCapture={handleCapture}
          onClear={clearSelection}
          disabled={isAnalyzing || isSaving}
          className="border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] shadow-none"
        />

        {isAnalyzing ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] px-4 py-2 text-sm text-[color:var(--ui-muted)]">
            <Loader2 className="h-4 w-4 animate-spin text-[color:var(--ui-accent)]" />
            Analyzing the meal photo...
          </div>
        ) : null}

        <div className="grid gap-3 rounded-[1.5rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4 text-sm leading-6 text-[color:var(--ui-muted)]">
          <div className="flex items-center gap-2 font-semibold text-[color:var(--ui-text)]">
            <Sparkles className="h-4 w-4 text-[color:var(--ui-accent)]" />
            What happens next
          </div>
          <p className="m-0">
            The photo is analyzed directly using AI – no image is stored until
            you decide to save the record.
          </p>
          <p className="m-0">
            If the capture is unclear, you can switch straight to the manual
            entry fallback instead.
          </p>
          <Button asChild variant="secondary" className="w-fit">
            <Link href="#manual-entry">Open manual fallback</Link>
          </Button>
        </div>

        {successMessage ? (
          <div className="rounded-[1.5rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] px-4 py-3 text-sm leading-6 text-[color:var(--ui-text)]">
            <span className="inline-flex items-center gap-2">
              <CircleCheckBig className="h-4 w-4 text-[color:var(--ui-accent)]" />
              {successMessage}
            </span>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-[1.5rem] border border-[color:var(--ui-warning)] bg-[color:var(--ui-warning-soft)] px-4 py-3 text-sm leading-6 text-[color:var(--ui-warning)]">
            {errorMessage}
          </div>
        ) : null}
      </CardContent>

      {previewRecord ? (
        <ConfirmMealSheet
          open={open}
          onOpenChange={setOpen}
          record={previewRecord}
          isSaving={isSaving}
          onConfirm={(payload) =>
            handleSubmit({ ...payload, status: "confirmed" })
          }
          onSaveDraft={(payload) =>
            handleSubmit({ ...payload, status: "draft" })
          }
          onRetake={clearSelection}
        />
      ) : null}
    </Card>
  );
}