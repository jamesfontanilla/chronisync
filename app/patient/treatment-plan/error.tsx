"use client";

import { Button } from "@/components/ui/button";

export default function TreatmentPlanError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-[60vh] place-items-center p-4 sm:p-6 lg:p-8">
      <section className="grid max-w-2xl gap-4 rounded-[2rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-6 text-center shadow-[0_30px_90px_rgba(9,30,36,0.14)]">
        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--ui-accent)]">
          Treatment plan
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-[-0.05em]">
          We could not load this section.
        </h1>
        <p className="text-sm leading-7 text-[color:var(--ui-muted)]">
          {error.message}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
        </div>
      </section>
    </main>
  );
}
