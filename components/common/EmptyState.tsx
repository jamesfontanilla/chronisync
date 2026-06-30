import type { ReactNode } from "react";
import { Sparkles, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: LucideIcon;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Sparkles,
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <section className={cn("empty-state", className)}>
      <div className="empty-state__icon" aria-hidden="true">
        <Icon size={24} />
      </div>

      <div className="empty-state__content">
        {eyebrow ? <span className="empty-state__eyebrow">{eyebrow}</span> : null}
        <h2 className="empty-state__title">{title}</h2>
        {description ? (
          <p className="empty-state__description">{description}</p>
        ) : null}
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="empty-state__actions">
          {primaryAction}
          {secondaryAction}
        </div>
      )}

      <style jsx>{`
        .empty-state {
          display: grid;
          justify-items: center;
          gap: 1rem;
          padding: clamp(1.4rem, 3vw, 2rem);
          border-radius: var(--ui-radius-xl);
          border: 1px dashed var(--ui-border);
          background:
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.12),
              rgba(255, 255, 255, 0.04)
            ),
            var(--ui-surface-strong);
          box-shadow: var(--ui-shadow);
          text-align: center;
        }

        .empty-state__icon {
          display: inline-grid;
          place-items: center;
          width: 4rem;
          height: 4rem;
          border-radius: 999px;
          color: var(--ui-accent);
          background: var(--ui-accent-soft);
          border: 1px solid var(--ui-border);
        }

        .empty-state__content {
          display: grid;
          gap: 0.65rem;
        }

        .empty-state__eyebrow {
          font-size: 0.78rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--ui-accent);
        }

        .empty-state__title {
          margin: 0;
          font-family: var(--font-display);
          font-size: clamp(1.5rem, 3vw, 2.2rem);
          line-height: 1.05;
          letter-spacing: -0.05em;
        }

        .empty-state__description {
          margin: 0 auto;
          max-width: 48ch;
          color: var(--ui-muted);
          line-height: 1.7;
        }

        .empty-state__actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
        }
      `}</style>
    </section>
  );
}
