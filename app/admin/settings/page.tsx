import Link from "next/link";
import {
  Cpu,
  Link2,
  LockKeyhole,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ROUTES } from "@/config/route";

const settingsGroups = {
  general: [
    {
      title: "Platform branding",
      detail: "Glassmorphism shell, shared across all roles.",
      icon: Settings2,
    },
    {
      title: "Retention window",
      detail: "30 days for transient uploads, permanent for medical records.",
      icon: ShieldCheck,
    },
  ],
  security: [
    {
      title: "Access policy",
      detail: "Role-based access with physician and admin separation.",
      icon: LockKeyhole,
    },
    {
      title: "Session posture",
      detail: "Short-lived sessions with verification prompts for sensitive actions.",
      icon: ShieldCheck,
    },
  ],
  integrations: [
    {
      title: "Firebase",
      detail: "Firestore, Auth, and Storage are the core data services.",
      icon: Link2,
    },
    {
      title: "AI services",
      detail: "Gemini-backed extraction and summarization are routed through the API layer.",
      icon: Cpu,
    },
  ],
} as const;

type SettingItem = {
  title: string;
  detail: string;
  icon: LucideIcon;
};

function SettingCard({ title, detail, icon: Icon }: SettingItem) {
  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg">{title}</CardTitle>
          <span className="inline-grid h-11 w-11 place-items-center rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]">
            <Icon size={18} />
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
        <p className="m-0">{detail}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminSettingsPage() {
  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Administrator console"
        title="Settings"
        description="Adjust the platform shell, access posture, and integration notes that keep the admin workspace aligned."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={ROUTES.ADMIN.DASHBOARD}>Dashboard</Link>
            </Button>
            <Button variant="glass">Save draft</Button>
          </>
        }
        level={1}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">4</CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">setting groups</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">2FA</CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">required for admins</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">30d</CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">upload retention</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">AI</CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">review before publish</p>
          </CardHeader>
        </Card>
      </section>

      <Tabs defaultValue="general" className="grid gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <section className="grid gap-4 md:grid-cols-2">
            {settingsGroups.general.map((item) => (
              <SettingCard key={item.title} {...item} />
            ))}
          </section>
          <Card className="mt-4">
            <CardHeader className="gap-2">
              <CardTitle>Workspace notes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Brand locked</Badge>
                <Badge variant="glass">Default theme enabled</Badge>
                <Badge variant="outline">Shared shell across roles</Badge>
              </div>
              <p>
                This is where the admin workspace would coordinate environment
                defaults, site copy, and release-specific banners.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <section className="grid gap-4 md:grid-cols-2">
            {settingsGroups.security.map((item) => (
              <SettingCard key={item.title} {...item} />
            ))}
          </section>
        </TabsContent>

        <TabsContent value="integrations">
          <section className="grid gap-4 md:grid-cols-2">
            {settingsGroups.integrations.map((item) => (
              <SettingCard key={item.title} {...item} />
            ))}
          </section>
          <Card className="mt-4">
            <CardHeader className="gap-2">
              <CardTitle>Integration posture</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
              <p>
                API routes are split by workflow so storage, AI generation, and
                clinical updates remain isolated.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Gemini route</Badge>
                <Badge variant="glass">Firebase upload</Badge>
                <Badge variant="outline">Webhook ingress</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
