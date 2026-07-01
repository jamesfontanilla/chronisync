"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/config/route";
import { persistRole } from "@/lib/auth/roles";
import { logoutUser } from "@/lib/firebase/auth";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    void logoutUser().catch(() => undefined);
    persistRole(null);
    router.replace(ROUTES.AUTH.LOGIN);
  }, [router]);

  return (
    <main
      style={{
        display: "grid",
        minHeight: "48vh",
        placeItems: "center",
        padding: "1.5rem",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "28rem",
          borderRadius: "1.75rem",
          border: "1px solid var(--ui-border)",
          background: "var(--ui-surface-strong)",
          boxShadow: "var(--ui-shadow)",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.78rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--ui-accent)",
          }}
        >
          Session control
        </p>
        <h1
          style={{
            margin: "0.75rem 0 0",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            lineHeight: 1,
            letterSpacing: "-0.05em",
          }}
        >
          Signing you out
        </h1>
        <p
          style={{
            margin: "0.9rem 0 0",
            color: "var(--ui-muted)",
            lineHeight: 1.7,
          }}
        >
          We&apos;re clearing the active session and sending you back to sign in.
        </p>
      </section>
    </main>
  );
}
