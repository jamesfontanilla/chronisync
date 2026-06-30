import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { ROUTES } from "@/config/route";
import { EmptyState } from "@/components/common/EmptyState";

export default function NotFound() {
  return (
    <main className="not-found-shell">
      <div className="not-found-card">
        <EmptyState
          icon={TriangleAlert}
          eyebrow="404"
          title="We could not find that page."
          description="The route may have moved, been mistyped, or is not part of the current shell yet. Head back home or sign in to continue."
          primaryAction={
            <Link href={ROUTES.HOME} className="not-found-primary">
              Return home
            </Link>
          }
          secondaryAction={
            <Link href={ROUTES.AUTH.LOGIN} className="not-found-secondary">
              Sign in
            </Link>
          }
        />
      </div>

      <style jsx>{`
        .not-found-shell {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 1.25rem;
        }

        .not-found-card {
          width: min(720px, 100%);
        }

        .not-found-primary,
        .not-found-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 3rem;
          padding: 0 1.15rem;
          border-radius: 999px;
          font-weight: 700;
          transition:
            transform 180ms ease,
            background-color 180ms ease,
            border-color 180ms ease;
        }

        .not-found-primary {
          color: #f8f7f1;
          background: linear-gradient(135deg, var(--ui-accent), var(--ui-accent-strong));
          box-shadow: 0 16px 30px rgba(11, 76, 89, 0.2);
        }

        .not-found-secondary {
          color: var(--ui-accent);
          border: 1px solid var(--ui-border);
          background: rgba(255, 255, 255, 0.1);
        }

        .not-found-primary:hover,
        .not-found-secondary:hover {
          transform: translateY(-1px);
        }

        .not-found-secondary:hover {
          background: var(--ui-surface);
        }
      `}</style>
    </main>
  );
}
