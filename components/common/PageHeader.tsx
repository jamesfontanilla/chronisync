 "use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
  align?: "left" | "center";
  level?: 1 | 2 | 3;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
  className,
  align = "left",
  level = 2,
}: PageHeaderProps) {
  const headingClassName = "page-header__title";

  return (
    <section
      className={cn(
        "page-header",
        align === "center" && "page-header--center",
        className
      )}
    >
      {(eyebrow || meta) && (
        <div className="page-header__top">
          {eyebrow ? <span className="page-header__eyebrow">{eyebrow}</span> : null}
          {meta ? <div className="page-header__meta">{meta}</div> : null}
        </div>
      )}

      {level === 1 ? (
        <h1 className={headingClassName}>{title}</h1>
      ) : level === 3 ? (
        <h3 className={headingClassName}>{title}</h3>
      ) : (
        <h2 className={headingClassName}>{title}</h2>
      )}

      {description ? <p className="page-header__description">{description}</p> : null}
      {actions ? <div className="page-header__actions">{actions}</div> : null}

      <style jsx>{`
        .page-header {
          display: grid;
          gap: 0.9rem;
        }

        .page-header--center {
          justify-items: center;
          text-align: center;
        }

        .page-header__top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .page-header__eyebrow {
          font-size: 0.78rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--ui-accent);
        }

        .page-header__meta {
          color: var(--ui-muted);
          font-size: 0.92rem;
        }

        .page-header__title {
          margin: 0;
          max-width: 14ch;
          font-family: var(--font-display);
          font-size: clamp(2.1rem, 5vw, 4.2rem);
          line-height: 0.98;
          letter-spacing: -0.06em;
        }

        .page-header__description {
          margin: 0;
          max-width: 62ch;
          color: var(--ui-muted);
          line-height: 1.75;
          font-size: 1.03rem;
        }

        .page-header__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 0.35rem;
        }
      `}</style>
    </section>
  );
}
