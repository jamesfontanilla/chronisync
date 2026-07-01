"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { ROUTES } from "@/config/route";
import { useAuth } from "@/hooks/useAuth";
import { getRedirectPathForRole } from "@/lib/auth/guards";
import {
  getRoleHomePath,
  normalizeRole,
  type UserRole,
} from "@/lib/auth/roles";
import {
  authCallbackSchema,
  type AuthCallbackData,
} from "@/features/authentication/validation";

const pageCardStyle = {
  borderRadius: "28px",
  padding: "clamp(1.4rem, 3vw, 2.2rem)",
  background: "rgba(255, 255, 255, 0.84)",
  border: "1px solid rgba(8, 35, 43, 0.1)",
  boxShadow: "0 24px 60px rgba(9, 30, 36, 0.12)",
  backdropFilter: "blur(14px)",
} as const;

const headingStyle = {
  margin: 0,
  fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
  lineHeight: 1.05,
  letterSpacing: "-0.04em",
  color: "#08232b",
} as const;

const subtitleStyle = {
  margin: "0.75rem 0 0",
  color: "#4d6670",
  lineHeight: 1.65,
} as const;

const actionLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "48px",
  borderRadius: "16px",
  padding: "0 1rem",
  fontSize: "1rem",
  fontWeight: 700,
  textDecoration: "none",
  color: "#f8f7f1",
  background: "linear-gradient(135deg, #0b4c59, #19a39a)",
  boxShadow: "0 16px 30px rgba(11, 76, 89, 0.25)",
} as const;

const quietLinkStyle = {
  color: "#0b6574",
  fontWeight: 700,
  textDecoration: "none",
} as const;

const statusPillStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.45rem",
  marginTop: "1rem",
  padding: "0.55rem 0.8rem",
  borderRadius: "999px",
  background: "rgba(11, 76, 89, 0.08)",
  border: "1px solid rgba(11, 76, 89, 0.12)",
  fontSize: "0.88rem",
  color: "#0b6574",
} as const;

function isSafeInternalPath(pathname: string | undefined): boolean {
  return Boolean(pathname && pathname.startsWith("/") && !pathname.startsWith("//"));
}

function getStatusMessage(
  data: AuthCallbackData,
  role: UserRole | null
) {
  switch (data.status) {
    case "reset-sent":
      return {
        eyebrow: "Reset email sent",
        title: "Check your inbox.",
        body:
          data.email ??
          "We sent a password reset link. Use it to create a new password, then come back to sign in.",
        ctaLabel: "Back to sign in",
        target: ROUTES.AUTH.LOGIN,
      };
    case "verification-sent":
      return {
        eyebrow: "Verification in progress",
        title: "Verify your email next.",
        body:
          data.email ??
          "Your account is ready. Open the verification email we just sent, then continue into your dashboard.",
        ctaLabel: role ? "Go to dashboard" : "Back to sign in",
        target: role ? getRoleHomePath(role) : ROUTES.AUTH.LOGIN,
      };
    case "registered":
      return {
        eyebrow: "Account created",
        title: "Welcome to ChroniSync.",
        body:
          data.email ??
          "Your account has been created and your role has been saved for the correct portal.",
        ctaLabel: role ? "Open dashboard" : "Back to sign in",
        target: role ? getRoleHomePath(role) : ROUTES.AUTH.LOGIN,
      };
    case "error":
      return {
        eyebrow: "Action needed",
        title: "Something needs another try.",
        body:
          data.message ??
          "We could not finish the authentication step. Please return to sign in and try again.",
        ctaLabel: "Back to sign in",
        target: ROUTES.AUTH.LOGIN,
      };
    case "signed-in":
    default:
      return {
        eyebrow: "Signed in",
        title: "Taking you to your workspace.",
        body:
          data.message ??
          "Your session is ready. We are routing you to the right dashboard now.",
        ctaLabel: role ? "Continue" : "Back to sign in",
        target: role ? getRoleHomePath(role) : ROUTES.AUTH.LOGIN,
      };
  }
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, isLoading } = useAuth();

  const parsed = useMemo(() => {
    const result = authCallbackSchema.safeParse({
      status: searchParams.get("status") ?? undefined,
      role: searchParams.get("role") ?? undefined,
      email: searchParams.get("email") ?? undefined,
      next: searchParams.get("next") ?? undefined,
      message: searchParams.get("message") ?? undefined,
    });

    return result.success ? result.data : {};
  }, [searchParams]);

  const resolvedRole = normalizeRole(parsed.role) ?? role;
  const isReturnToSigninFlow =
    parsed.status === "reset-sent" || parsed.status === "verification-sent";

  const targetPath = useMemo(() => {
    const fallback = resolvedRole
      ? getRedirectPathForRole(resolvedRole)
      : ROUTES.AUTH.LOGIN;

    if (!parsed.status || parsed.status === "error") {
      return fallback;
    }

    if (parsed.status === "reset-sent") {
      return ROUTES.AUTH.LOGIN;
    }

    if (parsed.status === "verification-sent" || parsed.status === "registered" || parsed.status === "signed-in") {
      const nextPath = parsed.next;
      if (typeof nextPath === "string" && isSafeInternalPath(nextPath)) {
        return nextPath;
      }

      return fallback;
    }

    return fallback;
  }, [parsed.next, parsed.status, resolvedRole]);

  const statusView = getStatusMessage(
    parsed,
    resolvedRole
  );

  useEffect(() => {
    if (isLoading && !isReturnToSigninFlow) {
      return;
    }

    const delayMs = isReturnToSigninFlow ? 1800 : 1100;
    const timeoutId = window.setTimeout(() => {
      router.replace(targetPath);
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [isLoading, isReturnToSigninFlow, router, targetPath]);

  return (
    <article style={pageCardStyle}>
      <header>
        <p
          style={{
            margin: 0,
            fontSize: "0.78rem",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "#0b6574",
          }}
        >
          Authentication Callback
        </p>
        <h2 style={headingStyle}>{statusView.title}</h2>
        <p style={subtitleStyle}>{statusView.body}</p>

        <div style={statusPillStyle}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#19a39a",
              boxShadow: "0 0 0 6px rgba(25, 163, 154, 0.14)",
            }}
          />
          {statusView.eyebrow}
        </div>
      </header>

      <div
        className="auth-actions"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.9rem",
          marginTop: "1.5rem",
        }}
      >
        <Link href={statusView.target} style={actionLinkStyle}>
          {statusView.ctaLabel}
        </Link>

        <Link href={ROUTES.AUTH.LOGIN} style={quietLinkStyle}>
          Return to sign in
        </Link>
      </div>

      <p
        style={{
          margin: "1.2rem 0 0",
          color: "#4d6670",
          lineHeight: 1.6,
        }}
      >
        The redirect is automatic, but the button is here if you want to move
        sooner.
      </p>
    </article>
  );
}
