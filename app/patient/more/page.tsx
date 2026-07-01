import Link from "next/link";
import {
  Download,
  Goal,
  Globe,
  HeartPulse,
  Laptop,
  MenuSquare,
  Settings2,
  ShieldCheck,
  Stethoscope,
  TabletSmartphone,
} from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/config/route";

const settingsGroups = [
  {
    title: "Reports",
    description: "Export a polished PDF or spreadsheet for offline review.",
    icon: Download,
    badges: ["PDF", "Excel", "Shareable"],
  },
  {
    title: "Connections",
    description: "Keep CGM, devices, and physician links visible.",
    icon: TabletSmartphone,
    badges: ["Sync device", "CGM", "Care team"],
  },
  {
    title: "Preferences",
    description: "Units, language, and a calmer display for the dashboard.",
    icon: Settings2,
    badges: ["Units", "Language", "Display"],
  },
  {
    title: "Goals",
    description: "Daily routines, BG plans, and favorite food notes.",
    icon: Goal,
    badges: ["Routine", "BG plan", "Favorite foods"],
  },
  {
    title: "Medication",
    description: "Reminders, refill windows, and prescription history.",
    icon: HeartPulse,
    badges: ["Reminders", "Refills", "History"],
  },
  {
    title: "Profile",
    description: "Keep account details and sharing permissions current.",
    icon: ShieldCheck,
    badges: ["Profile", "Access", "Consent"],
  },
] as const;

export default function PatientMorePage() {
  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Patient workspace"
        title="More"
        description="The settings hub keeps exports, device sync, and care preferences in one place."
        actions={
          <Button asChild variant="glass">
            <Link href={ROUTES.PATIENT.SETTINGS}>Open settings</Link>
          </Button>
        }
        level={1}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">Offline</CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">
              Logging still works when connectivity drops.
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">PDF</CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">
              Reports can be exported for visits or sharing.
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">CGM</CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">
              Device sync stays visible instead of hidden.
            </p>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {settingsGroups.map((group) => {
          const Icon = group.icon;

          return (
            <Card key={group.title}>
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-xl">{group.title}</CardTitle>
                  <span className="inline-grid h-11 w-11 place-items-center rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]">
                    <Icon size={18} />
                  </span>
                </div>
                <p className="m-0 text-sm leading-6 text-[color:var(--ui-muted)]">
                  {group.description}
                </p>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 pt-0">
                {group.badges.map((badge) => (
                  <Badge key={badge} variant="outline">
                    {badge}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        <Card>
          <CardHeader className="gap-2">
            <CardTitle>Common actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {[
              "Export the latest summary for a doctor visit.",
              "Review CGM and device sync before the next log session.",
              "Adjust the goal and routine notes so the dashboard stays relevant.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
                <MenuSquare className="mt-1 text-[color:var(--ui-accent)]" size={18} />
                <p className="m-0">{item}</p>
              </div>
            ))}
            <Button asChild variant="secondary" className="w-fit">
              <Link href={ROUTES.PATIENT.DASHBOARD}>Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-2">
            <CardTitle>Why this page exists</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
            <div className="flex items-start gap-3">
              <Laptop className="mt-1 text-[color:var(--ui-accent)]" size={18} />
              <p className="m-0">
                The more page keeps the patient shell calm by gathering the
                settings that do not need daily attention.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="mt-1 text-[color:var(--ui-accent)]" size={18} />
              <p className="m-0">
                It is also a nice place to surface the app-wide sync and export
                story without crowding the dashboard.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Stethoscope className="mt-1 text-[color:var(--ui-accent)]" size={18} />
              <p className="m-0">
                Care settings stay separate from clinical logs so the review
                workflow remains easy to scan.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

    </main>
  );
}
