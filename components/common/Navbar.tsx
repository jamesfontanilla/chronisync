"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  LogIn,
  Menu,
  MoonStar,
  Sparkles,
  SunMedium,
  UserPlus,
} from "lucide-react";

import { APP_CONFIG } from "@/config/app";
import { ROUTES } from "@/config/route";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
];

function normalizeHash(href: string): string {
  if (!href.includes("#")) {
    return "";
  }

  return href.slice(href.indexOf("#"));
}

function isActiveNavbarLink(
  pathname: string,
  currentHash: string,
  href: string
): boolean {
  const hash = normalizeHash(href);

  if (hash) {
    if (pathname !== ROUTES.HOME) {
      return false;
    }

    if (!currentHash) {
      return hash === "#overview";
    }

    return currentHash === hash;
  }

  if (href === ROUTES.HOME) {
    return pathname === ROUTES.HOME && !currentHash;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar({
  className,
  links = defaultLinks,
  actions,
}: NavbarProps) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentHash(window.location.hash);

    const updateHash = () => {
      setCurrentHash(window.location.hash);
    };

    window.addEventListener("hashchange", updateHash);

    return () => {
      window.removeEventListener("hashchange", updateHash);
    };
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, currentHash]);

  const isDark = mounted && resolvedTheme === "dark";

  const handleNavLinkClick = (href: string) => {
    setCurrentHash(normalizeHash(href));
    setMenuOpen(false);
  };

  const renderAuthActions = () =>
    actions ?? (
      <>
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="navbar__button navbar__button--ghost navbar__button--auth w-full justify-center"
        >
          <LogIn size={16} aria-hidden="true" />
          <span>Sign in</span>
        </Link>
        <Link
          href={ROUTES.AUTH.REGISTER}
          className="navbar__button navbar__button--solid navbar__button--auth w-full justify-center"
        >
          <UserPlus size={16} aria-hidden="true" />
          <span>Create account</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </>
    );

  return (
    <header className={cn("navbar", className)}>
      <Link href={ROUTES.HOME} className="navbar__brand" aria-label={APP_CONFIG.name}>
        <span className="navbar__mark" aria-hidden="true">
          <Sparkles size={16} />
        </span>

        <span className="navbar__brand-copy">
          <strong>{APP_CONFIG.shortName}</strong>
        </span>
      </Link>

      <div className="navbar__bar">
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

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="navbar__menu-trigger"
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="navbar-mobile-menu"
            >
              <Menu size={18} />
            </button>
          </SheetTrigger>

          <SheetContent id="navbar-mobile-menu" side="right">
            <SheetHeader>
              <SheetTitle className="sr-only">Menu</SheetTitle>
            </SheetHeader>

            <nav className="mt-2 grid gap-1.5" aria-label="Primary">
              {links.map((link) => {
                const active = isActiveNavbarLink(pathname, currentHash, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => handleNavLinkClick(link.href)}
                    className={cn(
                      "flex min-h-[2.9rem] items-center rounded-2xl border px-4 font-semibold transition-colors",
                      active
                        ? "border-[color:rgba(11,101,116,0.18)] bg-[linear-gradient(135deg,rgba(25,163,154,0.24),rgba(25,163,154,0.12))] text-[color:var(--ui-accent)]"
                        : "border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] text-[color:var(--ui-text)]"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 grid gap-2 border-t border-[color:var(--ui-border)] pt-6">
              {renderAuthActions()}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <style jsx>{`
        .navbar {
          position: sticky;
          top: 1rem;
          z-index: 25;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          width: min(1280px, calc(100% - 1rem));
          margin: 1rem auto 0;
          padding: 0.7rem 0.85rem;
          border-radius: var(--ui-radius-xl);
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

        .navbar__bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .navbar__button--auth {
          min-height: 2.7rem;
          padding: 0 0.95rem;
          font-size: 0.92rem;
        }

        .navbar__button--auth svg {
          flex-shrink: 0;
        }

        .navbar__button {
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

        .navbar__button:hover {
          transform: translateY(-1px);
        }

        .navbar__button--ghost {
          color: var(--ui-text);
          border-color: rgba(15, 76, 89, 0.18);
          background: rgba(255, 255, 255, 0.18);
        }

        .navbar__button--solid {
          color: #1a1a1a;
          background: linear-gradient(
            135deg,
            var(--ui-accent-fill),
            var(--ui-accent-fill-strong)
          );
          box-shadow:
            0 16px 30px rgba(0, 0, 0, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .navbar__theme {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.75rem;
          height: 2.75rem;
          border-radius: 999px;
          border: 1px solid var(--ui-border);
          color: var(--ui-accent);
          background: rgba(255, 255, 255, 0.08);
          transition:
            transform 180ms ease,
            background-color 180ms ease,
            border-color 180ms ease;
        }

        .navbar__theme:hover {
          transform: translateY(-1px);
        }

        .navbar__menu-trigger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.75rem;
          height: 2.75rem;
          border-radius: 999px;
          border: 1px solid var(--ui-border);
          background: rgba(255, 255, 255, 0.08);
          color: var(--ui-text);
          transition:
            transform 180ms ease,
            background-color 180ms ease;
        }

        .navbar__menu-trigger:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </header>
  );
}
