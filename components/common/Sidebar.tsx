import Link from "next/link";
import type { ReactNode } from "react";
import {
  ChevronRight,
  HeartPulse,
  KeyRound,
  LayoutDashboard,
  LogIn,
  ShieldCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import { APP_CONFIG } from "@/config/app";
import { ROUTES } from "@/config/route";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  href: string;
  description?: ReactNode;
  icon?: LucideIcon;
}

export interface SidebarSection {
  title: string;
  items: readonly SidebarItem[];
}

export interface SidebarProps {
  title?: ReactNode;
  description?: ReactNode;
  sections?: readonly SidebarSection[];
  footer?: ReactNode;
  className?: string;
}

const defaultSections: readonly SidebarSection[] = [
  {
    title: "Start here",
    items: [
      {
        label: "Sign in",
        href: ROUTES.AUTH.LOGIN,
        description: "Return to your saved portal.",
        icon: LogIn,
      },
      {
        label: "Create account",
        href: ROUTES.AUTH.REGISTER,
        description: "Choose a role and continue.",
        icon: UserPlus,
      },
      {
        label: "Reset password",
        href: ROUTES.AUTH.FORGOT_PASSWORD,
        description: "Recover access in a few steps.",
        icon: KeyRound,
      },
    ],
  },
  {
    title: "Shell view",
    items: [
      {
        label: "Home",
        href: ROUTES.HOME,
        description: "Landing page and shell overview.",
        icon: ShieldCheck,
      },
      {
        label: "Shared care",
        href: ROUTES.AUTH.LOGIN,
        description: "Patient and physician roles share one design language.",
        icon: HeartPulse,
      },
      {
        label: "Workspace",
        href: ROUTES.AUTH.REGISTER,
        description: "The premium shell continues after auth.",
        icon: LayoutDashboard,
      },
    ],
  },
];

export function Sidebar({
  title = "Portal map",
  description = "Public entry points for the first visit, the return visit, and account recovery.",
  sections = defaultSections,
  footer,
  className,
}: SidebarProps) {
  return (
    <aside className={cn("sidebar", className)}>
      <div className="sidebar__intro">
        <div className="sidebar__eyebrow">Navigation</div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="sidebar__sections">
        {sections.map((section) => (
          <section key={section.title} className="sidebar__section">
            <h3>{section.title}</h3>

            <div className="sidebar__items">
              {section.items.map((item) => {
                const ItemIcon = item.icon;

                return (
                  <Link key={item.href + item.label} href={item.href} className="sidebar__item">
                    <span className="sidebar__icon" aria-hidden="true">
                      {ItemIcon ? <ItemIcon size={16} /> : <ChevronRight size={16} />}
                    </span>

                    <span className="sidebar__copy">
                      <strong>{item.label}</strong>
                      {item.description ? <small>{item.description}</small> : null}
                    </span>

                    <ChevronRight size={14} className="sidebar__chevron" />
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="sidebar__footer">
        {footer ?? (
          <p>
            Need help? Contact{" "}
            <a href={`mailto:${APP_CONFIG.supportEmail}`}>
              {APP_CONFIG.supportEmail}
            </a>
            .
          </p>
        )}
      </div>

      <style jsx>{`
        .sidebar {
          position: sticky;
          top: 6.25rem;
          align-self: start;
          display: grid;
          gap: 1rem;
          padding: clamp(1.1rem, 2vw, 1.5rem);
          border-radius: var(--ui-radius-xl);
          border: 1px solid var(--ui-border);
          background: var(--ui-surface);
          box-shadow: var(--ui-shadow);
          backdrop-filter: blur(20px);
        }

        .sidebar__intro {
          display: grid;
          gap: 0.45rem;
        }

        .sidebar__eyebrow {
          font-size: 0.78rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--ui-accent);
        }

        .sidebar__intro h2,
        .sidebar__section h3 {
          margin: 0;
          font-family: var(--font-display);
          letter-spacing: -0.03em;
        }

        .sidebar__intro h2 {
          font-size: 1.5rem;
        }

        .sidebar__intro p {
          margin: 0;
          color: var(--ui-muted);
          line-height: 1.7;
        }

        .sidebar__sections {
          display: grid;
          gap: 1rem;
        }

        .sidebar__section {
          display: grid;
          gap: 0.7rem;
        }

        .sidebar__section h3 {
          font-size: 0.95rem;
        }

        .sidebar__items {
          display: grid;
          gap: 0.55rem;
        }

        .sidebar__item {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 0.85rem;
          align-items: start;
          padding: 0.85rem;
          border-radius: var(--ui-radius-md);
          border: 1px solid var(--ui-border);
          background: rgba(255, 255, 255, 0.08);
          transition:
            transform 180ms ease,
            background-color 180ms ease,
            border-color 180ms ease;
        }

        .sidebar__item:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(25, 163, 154, 0.28);
        }

        .sidebar__icon {
          display: inline-grid;
          place-items: center;
          width: 2rem;
          height: 2rem;
          border-radius: 999px;
          background: var(--ui-accent-soft);
          color: var(--ui-accent);
        }

        .sidebar__copy {
          min-width: 0;
          display: grid;
          gap: 0.25rem;
        }

        .sidebar__copy strong {
          font-size: 0.98rem;
          line-height: 1.3;
        }

        .sidebar__copy small {
          color: var(--ui-muted);
          line-height: 1.55;
        }

        .sidebar__chevron {
          color: var(--ui-muted);
          margin-top: 0.2rem;
        }

        .sidebar__footer {
          padding-top: 0.25rem;
          border-top: 1px solid var(--ui-border);
          color: var(--ui-muted);
          line-height: 1.7;
        }

        .sidebar__footer a {
          color: var(--ui-accent);
          font-weight: 700;
        }

        @media (max-width: 1120px) {
          .sidebar {
            position: static;
          }
        }
      `}</style>
    </aside>
  );
}
