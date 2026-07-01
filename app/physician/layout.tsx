import type { ReactNode } from "react";

import { AccountMenu } from "@/components/common/AccountMenu";

export default function PhysicianLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="physician-layout grid gap-4"
      style={{
        paddingTop: "1rem",
        paddingBottom: "1rem",
      }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end">
          <AccountMenu />
        </div>
      </div>

      {children}
    </div>
  );
}
