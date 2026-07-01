"use client";

import { cn } from "@/lib/utils";

export type DiaryFilterValue =
  | "all"
  | "vitals"
  | "medication"
  | "lifestyle"
  | "notes"
  | "queued";

export interface DiaryFiltersProps {
  value: DiaryFilterValue;
  onValueChange: (value: DiaryFilterValue) => void;
  className?: string;
}

const FILTER_OPTIONS: Array<{
  value: DiaryFilterValue;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "vitals", label: "Vitals" },
  { value: "medication", label: "Medication" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "notes", label: "Notes" },
  { value: "queued", label: "Queued" },
];

export function DiaryFilters({
  value,
  onValueChange,
  className,
}: DiaryFiltersProps) {
  return (
    <div className={cn("grid gap-3", className)}>
      <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--ui-muted)]">
        Filter diary
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTER_OPTIONS.map((option) => {
          const active = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onValueChange(option.value)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
                active
                  ? "border-[color:var(--ui-accent)] bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)] shadow-sm"
                  : "border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] text-[color:var(--ui-muted)] hover:border-[color:var(--ui-accent)] hover:text-[color:var(--ui-accent)]"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
