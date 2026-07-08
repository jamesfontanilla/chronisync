"use client";

import { useState, type FormEvent } from "react";
import { NotebookPen, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createDiaryEntryAction } from "@/features/diary/actions";
import { diaryEntryFormSchema } from "@/features/diary/validation";
import type { DiaryCreateInput } from "@/features/diary/types";

interface AddWrittenEntryDialogProps {
  patientId?: string;
}

export function AddWrittenEntryDialog({
  patientId = "demo-patient",
}: AddWrittenEntryDialogProps) {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const parsed = diaryEntryFormSchema.safeParse({
      patientId,
      recordedByRole: "patient",
      type: "note",
      title,
      content,
      source: "manual",
      syncState: "queued",
      recordedAt: new Date().toISOString(),
    });

    if (!parsed.success) {
      setErrorMessage(
        parsed.error.issues[0]?.message ?? "Please check the entry fields."
      );
      return;
    }

    setIsSaving(true);

    try {
      const entryInput: DiaryCreateInput = {
        patientId: parsed.data.patientId,
        recordedByRole: parsed.data.recordedByRole,
        type: parsed.data.type,
        title: parsed.data.title,
        content: parsed.data.content,
        source: parsed.data.source,
        syncState: parsed.data.syncState,
        recordedAt: new Date(parsed.data.recordedAt),
      };

      await createDiaryEntryAction(entryInput);
      await queryClient.invalidateQueries({ queryKey: ["diary-entries"] });

      resetForm();
      setOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not save the written entry yet."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <NotebookPen className="h-4 w-4" />
          Add written entry
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a written entry</DialogTitle>
          <DialogDescription>
            Jot down a note in your own words. It saves straight to your diary
            timeline.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <Label htmlFor="written-entry-title">Title</Label>
            <Input
              id="written-entry-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isSaving}
              placeholder="How I'm feeling today"
            />
          </label>

          <label className="grid gap-2">
            <Label htmlFor="written-entry-content">Note</Label>
            <Textarea
              id="written-entry-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              disabled={isSaving}
              placeholder="Write anything worth remembering for your next check-in."
              rows={5}
            />
          </label>

          {errorMessage ? (
            <p className="m-0 rounded-[1.5rem] border border-[color:var(--ui-warning)] bg-[color:var(--ui-warning-soft)] px-4 py-3 text-sm leading-6 text-[color:var(--ui-warning)]">
              {errorMessage}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
