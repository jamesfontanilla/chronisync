"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  LogIn,
  MoonStar,
  Sparkles,
  SunMedium,
  UserPlus,
} from "lucide-react";

import { APP_CONFIG } from "@/config/app";
import { ROUTES } from "@/config/route";
import { cn } from "@/lib/utils";

export interface NavbarLink {
  label: string;
  href: string;
}

export interface NavbarProps {
  className?: string;
  links?: readonly NavbarLink[];
  actions?: ReactNode;
}

const defaultLinks: readonly NavbarLink[] = [
  {
    label: "Home",
    href: ROUTES.HOME,
  },
  {
    label: "Sign in",
    href: ROUTES.AUTH.LOGIN,
  },
  {
    label: "Create account",
    href: ROUTES.AUTH.REGISTER,
  },
];

export function Navbar({
  className,
  links = defaultLinks,
  actions,
}: NavbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className={cn("navbar", className)}>
      <Link href={ROUTES.HOME} className="navbar__brand" aria-label={APP_CONFIG.name}>
        <span className="navbar__mark" aria-hidden="true">
          <Sparkles size={16} />
        </span>

        <span className="navbar__brand-copy">
          <strong>{APP_CONFIG.shortName}</strong>
          <small>Glassmorphism UI</small>
        </span>
      </Link>

      <nav className="navbar__links" aria-label="Primary">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="navbar__link">
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="navbar__actions">
        {actions ?? (
          <div className="navbar__auth" aria-label="Authentication actions">
            <span className="navbar__auth-badge">Access</span>
            <div className="navbar__auth-buttons">
              <Link
                href={ROUTES.AUTH.LOGIN}
                className="navbar__button navbar__button--ghost navbar__button--auth"
              >
                <LogIn size={16} aria-hidden="true" />
                <span>Sign in</span>
              </Link>
              <Link
                href={ROUTES.AUTH.REGISTER}
                className="navbar__button navbar__button--solid navbar__button--auth"
              >
                <UserPlus size={16} aria-hidden="true" />
                <span>Create account</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}

        <button
          type="button"
          className="navbar__theme"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={
            isDark ? "Switch to light theme" : "Switch to dark theme"
          }
        >
          {mounted && isDark ? <SunMedium size={16} /> : <MoonStar size={16} />}
        </button>
      </div>

      <style jsx>{`
        .navbar {
          position: sticky;
          top: 1rem;
          z-index: 25;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 1rem;
          width: min(1240px, calc(100% - 2rem));
          margin: 1rem auto 0;
          padding: 1rem 1.15rem;
          border-radius: 999px;
          border: 1px solid var(--ui-border);
          background: var(--ui-surface);
          box-shadow: var(--ui-shadow);
          backdrop-filter: blur(20px);
        }

        .navbar__brand {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }

        .navbar__mark {
          display: inline-grid;
          place-items: center;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 999px;
          color: var(--ui-accent);
          background: var(--ui-accent-soft);
          border: 1px solid var(--ui-border);
        }

        .navbar__brand-copy {
          min-width: 0;
        }

        .navbar__brand-copy strong {
          display: block;
          font-size: 1rem;
          line-height: 1.2;
          font-family: var(--font-display);
          letter-spacing: -0.03em;
        }

        .navbar__brand-copy small {
          display: block;
          margin-top: 0.12rem;
          color: var(--ui-muted);
          font-size: 0.78rem;
        }

        .navbar__links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          flex-wrap: wrap;
        }

        .navbar__link {
          padding: 0.7rem 1rem;
          border-radius: 999px;
          color: var(--ui-text);
          font-weight: 600;
          border: 1px solid transparent;
          transition:
            color 180ms ease,
            background-color 180ms ease,
            border-color 180ms ease;
        }

        .navbar__link:hover {
          color: var(--ui-text);
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--ui-border);
        }

        .navbar__actions {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .navbar__auth {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.4rem 0.45rem 0.4rem 0.55rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.18),
            rgba(255, 255, 255, 0.08)
          );
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.32),
            0 10px 24px rgba(15, 38, 43, 0.06);
          backdrop-filter: blur(16px);
        }

        .navbar__auth-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 2.5rem;
          padding: 0 0.75rem;
          border-radius: 999px;
          color: var(--ui-accent);
          background: rgba(255, 255, 255, 0.1);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .navbar__auth-buttons {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .navbar__button--auth {
          min-height: 2.75rem;
          padding: 0 0.95rem;
          font-size: 0.95rem;
        }

        .navbar__button--auth svg {
          flex-shrink: 0;
        }

        .navbar__button,
        .navbar__theme {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 3rem;
          padding: 0 1rem;
          border-radius: 999px;
          border: 1px solid transparent;
          transition:
            transform 180ms ease,
            background-color 180ms ease,
            border-color 180ms ease;
        }

        .navbar__button:hover,
        .navbar__theme:hover {
          transform: translateY(-1px);
        }

        .navbar__button--ghost {
          color: var(--ui-text);
          border-color: rgba(15, 76, 89, 0.18);
          background: rgba(255, 255, 255, 0.14);
        }

        .navbar__button--solid {
          color: #f8f7f1;
          background: linear-gradient(
            135deg,
            var(--ui-accent),
            var(--ui-accent-strong)
          );
          box-shadow:
            0 16px 30px rgba(11, 76, 89, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .navbar__theme {
          width: 3rem;
          padding: 0;
          color: var(--ui-accent);
          border-color: var(--ui-border);
          background: rgba(255, 255, 255, 0.08);
        }

        @media (max-width: 920px) {
          .navbar {
            grid-template-columns: 1fr;
            border-radius: var(--ui-radius-xl);
            width: min(1240px, calc(100% - 1rem));
          }

          .navbar__actions {
            width: 100%;
            justify-content: flex-start;
          }

          .navbar__auth {
            width: 100%;
            justify-content: space-between;
          }

          .navbar__links,
          .navbar__actions {
            justify-content: flex-start;
          }
        }

        @media (max-width: 640px) {
          .navbar__links {
            display: none;
          }

          .navbar__actions {
            gap: 0.55rem;
          }

          .navbar__auth {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
            gap: 0.55rem;
            padding: 0.55rem;
          }

          .navbar__auth-badge {
            width: 100%;
            min-height: 2.25rem;
            justify-content: center;
          }

          .navbar__auth-buttons {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }

          .navbar__button--auth {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </header>
  );
}
