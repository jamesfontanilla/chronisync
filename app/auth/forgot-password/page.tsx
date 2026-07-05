"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/config/route";
import { useAuth } from "@/hooks/useAuth";
import { getRedirectPathForRole } from "@/lib/auth/guards";
import { useForgotPasswordForm } from "@/features/authentication/hooks";

const pageCardStyle = {
  borderRadius: "28px",
  padding: "clamp(1.4rem, 3vw, 2.2rem)",
  background: "#ffffff",
  border: "1px solid rgba(10, 10, 10, 0.1)",
  boxShadow: "0 24px 60px rgba(0, 0, 0, 0.12)",
} as const;

const headingStyle = {
  margin: 0,
  fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
  lineHeight: 1.05,
  letterSpacing: "-0.04em",
  color: "#1a1a1a",
} as const;

const subtitleStyle = {
  margin: "0.75rem 0 0",
  color: "#5c5c63",
  lineHeight: 1.65,
} as const;

const formStyle = {
  display: "grid",
  gap: "1rem",
  marginTop: "1.5rem",
} as const;

const labelStyle = {
  display: "grid",
  gap: "0.45rem",
  fontSize: "0.92rem",
  fontWeight: 600,
  color: "#1a1a1a",
} as const;

const inputStyle = {
  width: "100%",
  borderRadius: "16px",
  border: "1px solid rgba(10, 10, 10, 0.14)",
  background: "#fff",
  padding: "0.9rem 1rem",
  fontSize: "1rem",
  color: "#1a1a1a",
  outline: "none",
} as const;

const helperRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  flexWrap: "wrap",
} as const;

const primaryButtonStyle = {
  border: 0,
  borderRadius: "16px",
  padding: "0.95rem 1.2rem",
  fontSize: "1rem",
  fontWeight: 700,
  cursor: "pointer",
  color: "#1a1a1a",
  background: "linear-gradient(135deg, #22c55e, #4ade80)",
  boxShadow: "0 16px 30px rgba(0, 0, 0, 0.18)",
} as const;

const secondaryLinkStyle = {
  color: "#15803d",
  fontWeight: 700,
  textDecoration: "none",
} as const;

const errorStyle = {
  borderRadius: "14px",
  padding: "0.9rem 1rem",
  background: "rgba(180, 35, 35, 0.08)",
  color: "#9b1c1c",
  border: "1px solid rgba(180, 35, 35, 0.18)",
  lineHeight: 1.5,
} as const;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { user, role, isLoading, sendPasswordReset } = useAuth();
  const form = useForgotPasswordForm();
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user && role) {
      router.replace(getRedirectPathForRole(role));
    }
  }, [isLoading, role, router, user]);

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await sendPasswordReset(values.email);
      router.replace(
        `${ROUTES.AUTH.CALLBACK}?status=reset-sent&email=${encodeURIComponent(values.email)}`
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not send the reset email right now."
      );
    }
  });

  return (
    <article style={pageCardStyle}>
      <header>
        <p
          style={{
            margin: 0,
            fontSize: "0.78rem",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "#15803d",
          }}
        >
          Reset Access
        </p>
        <h2 style={headingStyle}>Recover your account safely.</h2>
        <p style={subtitleStyle}>
          We&apos;ll send a password reset link to the email address on file.
        </p>
      </header>

      <form style={formStyle} onSubmit={onSubmit}>
        <label style={labelStyle}>
          Email
          <input
            {...form.register("email")}
            type="email"
            placeholder="name@example.com"
            style={inputStyle}
          />
          {form.formState.errors.email ? (
            <span style={{ color: "#b42318", fontWeight: 500 }}>
              {form.formState.errors.email.message}
            </span>
          ) : null}
        </label>

        {submitError ? <div style={errorStyle}>{submitError}</div> : null}

        <div className="auth-actions" style={helperRowStyle}>
          <Link href={ROUTES.AUTH.LOGIN} style={secondaryLinkStyle}>
            Back to sign in
          </Link>

          <button
            type="submit"
            style={primaryButtonStyle}
            disabled={form.formState.isSubmitting || isLoading}
          >
            {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </div>
      </form>

      <p
        style={{
          margin: "1.2rem 0 0",
          color: "#5c5c63",
          lineHeight: 1.6,
        }}
      >
        If the email matches an account, the reset link arrives within a
        few minutes.
      </p>
    </article>
  );
}
