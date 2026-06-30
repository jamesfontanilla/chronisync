import Link from "next/link";
import type { ReactNode } from "react";
import { Mail, Sparkles } from "lucide-react";

import { APP_CONFIG } from "@/config/app";
import { ROUTES } from "@/config/route";
import { cn } from "@/lib/utils";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterProps {
  className?: string;
  links?: readonly FooterLink[];
  note?: ReactNode;
}

const defaultLinks: readonly FooterLink[] = [
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
  {
    label: "Reset password",
    href: ROUTES.AUTH.FORGOT_PASSWORD,
  },
];

export function Footer({
  className,
  links = defaultLinks,
  note = "AI stays limited to low-risk support. People stay in charge of clinical decisions.",
}: FooterProps) {
  return (
    <footer className={cn("footer", className)}>
      <div className="footer__brand">
        <span className="footer__mark" aria-hidden="true">
          <Sparkles size={16} />
        </span>

        <div className="footer__brand-copy">
          <strong>{APP_CONFIG.name}</strong>
          <p>{APP_CONFIG.description}</p>
        </div>
      </div>

      <div className="footer__links" aria-label="Footer links">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="footer__link">
            {link.label}
          </Link>
        ))}
      </div>

      <div className="footer__meta">
        <p>{note}</p>
        <a href={`mailto:${APP_CONFIG.supportEmail}`} className="footer__mail">
          <Mail size={16} />
          {APP_CONFIG.supportEmail}
        </a>
        <span className="footer__version">v{APP_CONFIG.version}</span>
      </div>

      <style jsx>{`
        .footer {
          display: grid;
          gap: 1rem;
          padding: clamp(1.1rem, 2vw, 1.5rem);
          border-radius: var(--ui-radius-xl);
          border: 1px solid var(--ui-border);
          background: var(--ui-surface);
          box-shadow: var(--ui-shadow);
          backdrop-filter: blur(20px);
        }

        .footer__brand {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
        }

        .footer__mark {
          display: inline-grid;
          place-items: center;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 999px;
          color: var(--ui-accent);
          background: var(--ui-accent-soft);
          border: 1px solid var(--ui-border);
          flex: none;
        }

        .footer__brand-copy {
          display: grid;
          gap: 0.25rem;
        }

        .footer__brand-copy strong {
          font-family: var(--font-display);
          font-size: 1.05rem;
          letter-spacing: -0.03em;
        }

        .footer__brand-copy p,
        .footer__meta p {
          margin: 0;
          color: var(--ui-muted);
          line-height: 1.65;
        }

        .footer__links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .footer__link {
          padding: 0.55rem 0.85rem;
          border-radius: 999px;
          border: 1px solid var(--ui-border);
          color: var(--ui-accent);
          background: rgba(255, 255, 255, 0.08);
          transition:
            transform 180ms ease,
            background-color 180ms ease,
            border-color 180ms ease;
        }

        .footer__link:hover {
          transform: translateY(-1px);
          border-color: rgba(25, 163, 154, 0.28);
          background: rgba(255, 255, 255, 0.14);
        }

        .footer__meta {
          display: grid;
          gap: 0.65rem;
          padding-top: 0.25rem;
          border-top: 1px solid var(--ui-border);
        }

        .footer__mail {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--ui-accent);
          font-weight: 700;
          width: fit-content;
        }

        .footer__version {
          color: var(--ui-muted);
          font-size: 0.9rem;
        }
      `}</style>
    </footer>
  );
}
