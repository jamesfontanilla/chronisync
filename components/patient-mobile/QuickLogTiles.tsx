import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Droplets,
  FileText,
  Footprints,
  HeartPulse,
  Mic,
  Pill,
  ScanSearch,
  Salad,
  Scale,
  Smartphone,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type QuickLogTile = {
  title: string;
  description: string;
  icon: typeof Droplets;
  tone: string;
  href: string;
  cta: string;
  buttonVariant?: "default" | "secondary" | "glass";
};

const quickLogTiles: QuickLogTile[] = [
  {
    title: "Glucose",
    description: "Fast blood sugar logging with room for context.",
    icon: Droplets,
    tone: "from-cyan-500/20 to-transparent",
    href: "/patient/vitals?type=blood_glucose",
    cta: "Open vitals form",
  },
  {
    title: "Pressure",
    description: "Record systolic and diastolic in one calm step.",
    icon: HeartPulse,
    tone: "from-blue-500/20 to-transparent",
    href: "/patient/vitals?type=blood_pressure",
    cta: "Open vitals form",
  },
  {
    title: "Weight",
    description: "Track morning trends and fluid swings over time.",
    icon: Scale,
    tone: "from-emerald-500/20 to-transparent",
    href: "/patient/vitals?type=weight",
    cta: "Open vitals form",
  },
  {
    title: "Medication",
    description: "Mark taken or missed without opening a full form.",
    icon: Pill,
    tone: "from-violet-500/20 to-transparent",
    href: "/patient/medications",
    cta: "Open medications",
  },
  {
    title: "Diet",
    description: "Capture meal notes or photo-assisted estimates.",
    icon: Salad,
    tone: "from-amber-500/20 to-transparent",
    href: "/patient/add#manual-entry",
    cta: "Open manual entry",
  },
  {
    title: "Exercise",
    description: "Quickly log walks, routines, and movement bursts.",
    icon: Footprints,
    tone: "from-rose-500/20 to-transparent",
    href: "/patient/diary",
    cta: "Open diary",
  },
];

const shortcuts = [
  {
    title: "Voice Log",
    description: "Speak the note first, then review the draft in the diary.",
    icon: Mic,
    href: "/patient/diary",
    cta: "Start voice log",
    buttonVariant: "default" as const,
  },
  {
    title: "Sync Device",
    description: "Pull in meter or CGM readings.",
    icon: Smartphone,
    href: "/patient/vitals",
    cta: "Open vitals",
  },
  {
    title: "Food Photo AI",
    description: "Draft a meal estimate from a photo.",
    icon: Camera,
    href: "/patient/add#meal-photo-preview",
    cta: "Review photo draft",
  },
  {
    title: "Lab Results",
    description: "Add A1C and other review values.",
    icon: FileText,
    href: "/patient/documents",
    cta: "Open documents",
  },
  {
    title: "Search Diary",
    description: "Find a prior entry or correction.",
    icon: ScanSearch,
    href: "/patient/diary",
    cta: "Open diary",
  },
];

export interface QuickLogTilesProps {
  className?: string;
  showShortcuts?: boolean;
  showQuickCapture?: boolean;
}

export function QuickLogTiles({
  className,
  showShortcuts = true,
  showQuickCapture = true,
}: QuickLogTilesProps) {
  return (
    <section className={className}>
      <Card className="overflow-hidden">
        {showQuickCapture ? (
          <CardHeader className="gap-2">
            <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--ui-muted)]">
              Quick capture
            </div>
            <CardTitle className="text-2xl">Log from the shortest path.</CardTitle>
            <p className="m-0 text-sm leading-7 text-[color:var(--ui-muted)]">
              The quick-log row keeps the most common actions visible so the
              patient can capture a moment without diving through menus. Every
              tile and shortcut now opens a real page or anchor with keyboard and
              touch-friendly buttons.
            </p>
          </CardHeader>
        ) : null}
        <CardContent className={showQuickCapture ? "grid gap-4" : "grid gap-4 pt-6"}>
          {showQuickCapture ? (
            <div className="grid grid-cols-2 gap-2" role="list" aria-label="Quick log actions">
              {quickLogTiles.map((tile) => {
                const Icon = tile.icon;

                return (
                  <article
                    key={tile.title}
                    className="grid grid-cols-1 gap-2 rounded-[1.15rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-3 shadow-[0_10px_30px_rgba(9,30,36,0.08)]"
                    role="listitem"
                  >
                    <div
                      className={`grid h-9 w-9 place-items-center rounded-xl border border-[color:var(--ui-border)] bg-gradient-to-br ${tile.tone} text-[color:var(--ui-accent)]`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="grid min-w-0 gap-0.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="m-0 text-sm font-semibold">{tile.title}</h3>
                        <Badge variant="outline" className="px-2 py-0.5">
                          Quick log
                        </Badge>
                      </div>
                      <p className="m-0 text-xs leading-5 text-[color:var(--ui-muted)]">
                        {tile.description}
                      </p>
                    </div>
                    <Button
                      asChild
                      variant="secondary"
                      className="h-auto min-h-9 w-full justify-between whitespace-normal rounded-[0.9rem] px-3 py-2 text-left text-sm"
                    >
                      <Link href={tile.href}>
                        <span className="min-w-0 break-words">{tile.cta}</span>
                        <ArrowRight className="shrink-0" size={14} />
                      </Link>
                    </Button>
                  </article>
                );
              })}
            </div>
          ) : null}

          {showShortcuts ? (
            <div className="grid gap-3">
              <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--ui-muted)]">
                Shortcuts
              </div>
              <div className="grid gap-2 lg:grid-cols-2" role="list" aria-label="Quick log shortcuts">
                {shortcuts.map((shortcut) => {
                  const Icon = shortcut.icon;

                  return (
                    <article
                      key={shortcut.title}
                      className="grid gap-2 rounded-[1rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] p-3"
                      role="listitem"
                    >
                      <div className="flex items-start gap-2">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[color:var(--ui-border)] bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]">
                          <Icon size={16} />
                        </span>
                        <div className="grid gap-0.5">
                          <div className="text-sm font-medium">{shortcut.title}</div>
                          <p className="m-0 text-xs leading-5 text-[color:var(--ui-muted)]">
                            {shortcut.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        asChild
                        variant={shortcut.buttonVariant ?? "glass"}
                        className="h-auto min-h-9 w-full justify-between rounded-[0.9rem] px-3 py-2 text-left text-sm"
                      >
                        <Link href={shortcut.href}>
                          <span className="min-w-0 break-words">{shortcut.cta}</span>
                          <ArrowRight className="shrink-0" size={14} />
                        </Link>
                      </Button>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
