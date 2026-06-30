import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Gauge,
  ShieldAlert,
  Workflow,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ROUTES } from "@/config/route";
import { humanize } from "@/lib/utils";

const ruleGroups = {
  vital: [
    {
      title: "Blood pressure",
      threshold: "140/90 mmHg",
      severity: "warning",
      cadence: "Every reading",
      lastTriggered: "Today, 08:14",
    },
    {
      title: "Glucose",
      threshold: "126 mg/dL fasting",
      severity: "warning",
      cadence: "Every reading",
      lastTriggered: "Today, 07:41",
    },
  ],
  medication: [
    {
      title: "Adherence",
      threshold: "Less than 75%",
      severity: "critical",
      cadence: "Daily",
      lastTriggered: "Today, 06:32",
    },
    {
      title: "Refill window",
      threshold: "7 days remaining",
      severity: "info",
      cadence: "Daily",
      lastTriggered: "Yesterday, 16:20",
    },
  ],
  alerts: [
    {
      title: "Acknowledgment SLA",
      threshold: "4 hours",
      severity: "critical",
      cadence: "Realtime",
      lastTriggered: "Today, 05:54",
    },
    {
      title: "Document review",
      threshold: "24 hours",
      severity: "warning",
      cadence: "Hourly",
      lastTriggered: "Today, 08:01",
    },
  ],
} as const;

type RuleItem = {
  title: string;
  threshold: string;
  severity: "critical" | "warning" | "info";
  cadence: string;
  lastTriggered: string;
};

function severityVariant(severity: RuleItem["severity"]) {
  switch (severity) {
    case "critical":
      return "destructive" as const;
    case "warning":
      return "glass" as const;
    case "info":
    default:
      return "secondary" as const;
  }
}

function RuleCard({ title, threshold, severity, cadence, lastTriggered }: RuleItem) {
  const Icon =
    severity === "critical" ? ShieldAlert : severity === "warning" ? AlertTriangle : Gauge;

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg">{title}</CardTitle>
          <span className="inline-grid h-11 w-11 place-items-center rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]">
            <Icon size={18} />
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={severityVariant(severity)}>{humanize(severity)}</Badge>
          <Badge variant="outline">{cadence}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm leading-7 text-[color:var(--ui-muted)]">
        <div>Threshold: {threshold}</div>
        <div>Last triggered: {lastTriggered}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminRulesPage() {
  const totalRules =
    ruleGroups.vital.length + ruleGroups.medication.length + ruleGroups.alerts.length;

  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Administrator console"
        title="Rules"
        description="Shape the clinical automation layer by category, then move through the thresholds that keep alerts predictable."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={ROUTES.ADMIN.DASHBOARD}>Dashboard</Link>
            </Button>
            <Button variant="glass">Publish changes</Button>
          </>
        }
        level={1}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">{totalRules}</CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">active rules</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">{ruleGroups.vital.length}</CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">vital rules</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">{ruleGroups.medication.length}</CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">medication rules</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">{ruleGroups.alerts.length}</CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">alert rules</p>
          </CardHeader>
        </Card>
      </section>

      <Tabs defaultValue="vitals" className="grid gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="medication">Medication</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals">
          <section className="grid gap-4 md:grid-cols-2">
            {ruleGroups.vital.map((rule) => (
              <RuleCard key={rule.title} {...rule} />
            ))}
          </section>
        </TabsContent>

        <TabsContent value="medication">
          <section className="grid gap-4 md:grid-cols-2">
            {ruleGroups.medication.map((rule) => (
              <RuleCard key={rule.title} {...rule} />
            ))}
          </section>
        </TabsContent>

        <TabsContent value="alerts">
          <section className="grid gap-4 md:grid-cols-2">
            {ruleGroups.alerts.map((rule) => (
              <RuleCard key={rule.title} {...rule} />
            ))}
          </section>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader className="gap-2">
          <CardTitle>Automation notes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              <Workflow className="mr-1 inline h-3.5 w-3.5" />
              Workflow controlled
            </Badge>
            <Badge variant="glass">
              <Activity className="mr-1 inline h-3.5 w-3.5" />
              Realtime monitoring
            </Badge>
          </div>
          <p>
            Critical thresholds should be reviewed before any live publish step
            is finalized.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
