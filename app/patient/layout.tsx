"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AccountMenu } from "@/components/common/AccountMenu";
import { BottomNav } from "@/components/patient-mobile/BottomNav";
import { ROUTES } from "@/config/route";

export default function PatientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname === ROUTES.PATIENT.DASHBOARD;

  return (
    <div
      className="patient-layout grid gap-4"
      style={{
        paddingTop: "1rem",
        paddingBottom: "calc(7.5rem + env(safe-area-inset-bottom))",
      }}
    >
      {!isDashboard ? (
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end">
            <AccountMenu compact />
          </div>
        </div>
      ) : null}

      {children}

      <BottomNav />
    </div>
  );
}
