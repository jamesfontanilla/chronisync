"use client";

import { useId, useRef, type ChangeEvent } from "react";
import { Camera, ImagePlus, RotateCcw } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface PhotoCaptureProps {
  title?: string;
  description?: string;
  previewUrl?: string;
  previewAlt?: string;
  accept?: string;
  capture?: "user" | "environment";
  disabled?: boolean;
  className?: string;
  onCapture?: (file: File) => void | Promise<void>;
  onClear?: () => void | Promise<void>;
}

const controlClassName =
  "inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] px-4 text-sm font-semibold text-[color:var(--ui-text)] transition hover:-translate-y-0.5 hover:bg-[color:var(--ui-surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ui-bg)] disabled:pointer-events-none disabled:opacity-50";

export function PhotoCapture({
  title = "Capture meal photo",
  description = "Use the camera on your device or upload a photo from the gallery.",
  previewUrl,
  previewAlt = "Meal preview",
  accept = "image/*",
  capture = "environment",
  disabled = false,
  className,
  onCapture,
  onClear,
}: PhotoCaptureProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    await onCapture?.(file);
  };

  const handleClear = async () => {
    await onClear?.();
  };

  return (
    <Card className={className}>
      <CardHeader className="gap-2">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5">
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept={accept}
          capture={capture}
          className="sr-only"
          onChange={handleChange}
          disabled={disabled}
        />

        <button
          type="button"
          onClick={openFilePicker}
          disabled={disabled}
          className="group relative overflow-hidden rounded-[1.75rem] border border-dashed border-[color:var(--ui-border)] bg-[linear-gradient(135deg,rgba(25,163,154,0.08),rgba(11,101,116,0.03))] p-5 text-left transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {previewUrl ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.25rem]">
              <Image
                src={previewUrl}
                alt={previewAlt}
                fill
                sizes="100vw"
                unoptimized
                className="object-cover"
              />
            </div>
          ) : (
            <div className="grid aspect-[4/3] place-items-center rounded-[1.25rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)]">
              <div className="grid place-items-center gap-3 text-center text-[color:var(--ui-muted)]">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]">
                  <ImagePlus className="h-6 w-6" />
                </div>
                <div className="grid gap-1">
                  <span className="text-sm font-semibold text-[color:var(--ui-text)]">
                    Tap to add a photo
                  </span>
                  <span className="text-xs">
                    The camera opens with the rear lens on mobile devices.
                  </span>
                </div>
              </div>
            </div>
          )}
        </button>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={openFilePicker}
            disabled={disabled}
          >
            <Camera className="h-4 w-4" />
            Capture photo
          </Button>
          {previewUrl && onClear ? (
            <Button
              type="button"
              variant="secondary"
              onClick={handleClear}
              disabled={disabled}
            >
              <RotateCcw className="h-4 w-4" />
              Remove
            </Button>
          ) : null}
          <label htmlFor={inputId} className={controlClassName}>
            <span className="inline-flex items-center gap-2">
              <ImagePlus className="h-4 w-4" />
              Choose file
            </span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
