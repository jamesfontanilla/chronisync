"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

export { toast };

export function Toaster() {
  return (
    <SonnerToaster
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-[1.5rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] text-[color:var(--ui-text)] shadow-[0_30px_90px_rgba(9,30,36,0.14)] backdrop-blur-xl",
          title: "font-semibold tracking-[-0.02em]",
          description: "text-[color:var(--ui-muted)]",
          closeButton:
            "border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] text-[color:var(--ui-muted)]",
          actionButton:
            "bg-[linear-gradient(135deg,var(--ui-accent),var(--ui-accent-strong))] text-white",
          cancelButton:
            "border border-[color:var(--ui-border)] bg-transparent text-[color:var(--ui-text)]",
        },
      }}
    />
  );
}
