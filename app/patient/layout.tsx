import type { ReactNode } from "react";

import { BottomNav } from "@/components/patient-mobile/BottomNav";

export default function PatientLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="patient-layout"
      style={{
        paddingBottom: "calc(7.5rem + env(safe-area-inset-bottom))",
      }}
    >
      {children}
      <BottomNav />
    </div>
  );
}
