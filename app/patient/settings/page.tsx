"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/route";
import {
  describeExportRetentionWindow,
  getCaregiverAccessTierLabel,
  getPrivacyScopeRetentionLabel,
} from "@/lib/privacy/policy";
import {
  getConsentScopeGroupDescription,
  getConsentScopeGroupLabel,
} from "@/lib/consent/scopes";

export default function SettingsPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Patient workspace"
        title="Settings"
        description="Keep the profile, display, and notification preferences in one calm place."
        level={1}
      />

      <section className="grid gap-6 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
            <p>Name, contact information, and account details belong here.</p>
            <Button asChild variant="secondary" className="w-fit">
              <Link href={ROUTES.PATIENT.MORE}>Edit profile</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
            <p>Medication reminders, follow-up alerts, and document updates can be tuned here.</p>
            <Button asChild variant="secondary" className="w-fit">
              <Link href={ROUTES.PATIENT.DASHBOARD}>Manage alerts</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Display</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
            <p>Keep the interface easy to read, especially on smaller screens.</p>
            <Button
              type="button"
              variant="secondary"
              className="w-fit"
              aria-pressed={isDark}
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              {isDark ? "Light theme" : "Dark theme"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy & retention</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
            <p>
              {getCaregiverAccessTierLabel("read_only")} access stays separate
              from {getCaregiverAccessTierLabel("log_on_behalf_of")} support,
              and consent groups are split by purpose.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {describeExportRetentionWindow()}
              </Badge>
              <Badge variant="glass">Audit trail attached</Badge>
              <Badge variant="outline">Scoped sharing</Badge>
            </div>
            <p>
              {getConsentScopeGroupLabel("clinical")} data stays separate from{" "}
              {getConsentScopeGroupDescription("support")} and{" "}
              {getConsentScopeGroupLabel("sharing")} flows, with{" "}
              {getConsentScopeGroupLabel("emergency")} reserved for break-glass
              access.
            </p>
            <p>
              Export packets inherit {getPrivacyScopeRetentionLabel("export_records")}
              , while caregiver support stays tied to the active invite.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
