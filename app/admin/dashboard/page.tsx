import Link from "next/link";
import {
  Activity,
  BellRing,
  Database,
  ShieldCheck,
  Users,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/config/route";

const metrics = [
  {
    label: "Total users",
    value: "1,248",
    detail: "58 new this week",
    icon: Users,
  },
  {
    label: "Physicians",
    value: "84",
    detail: "72 active clinicians",
    icon: ShieldCheck,
  },
  {
    label: "Open alerts",
    value: "17",
    detail: "4 critical items",
    icon: BellRing,
  },
  {
    label: "Sync health",
    value: "99.8%",
    detail: "Last check 2 minutes ago",
    icon: Activity,
  },
] as const;

const queueItems = [
  {
    title: "User approvals",
    count: "12",
    detail: "New accounts awaiting review",
  },
  {
    title: "Rule updates",
    count: "4",
    detail: "Clinical thresholds pending publish",
  },
  {
    title: "Document review",
    count: "9",
    detail: "Uploads waiting on the admin queue",
  },
] as const;

export default function AdminDashboardPage() {
  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Administrator console"
        title="Dashboard"
        description="Monitor the platform at a glance, then route into the users, rules, or settings views for deeper control."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={ROUTES.ADMIN.USERS}>Users</Link>
            </Button>
            <Button asChild variant="glass">
              <Link href={ROUTES.ADMIN.RULES}>Rules</Link>
            </Button>
          </>
        }
        level={1}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label}>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div className="grid gap-2">
                  <p className="m-0 text-sm text-[color:var(--ui-muted)]">
                    {metric.label}
                  </p>
                  <CardTitle className="text-3xl">{metric.value}</CardTitle>
                </div>
                <span className="inline-grid h-11 w-11 place-items-center rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]">
                  <Icon size={18} />
                </span>
              </CardHeader>
              <CardContent className="pt-0 text-sm leading-6 text-[color:var(--ui-muted)]">
                {metric.detail}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Tabs defaultValue="overview" className="grid gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="queues">Queues</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <section className="grid gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader className="gap-2">
                <CardTitle>Platform snapshot</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
                <p>
                  The administrator view keeps the highest-level platform
                  signals in one place so access issues, rule changes, and
                  service disruptions are easy to spot.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Identity healthy</Badge>
                  <Badge variant="glass">Firestore connected</Badge>
                  <Badge variant="outline">AI queue under threshold</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-2">
                <CardTitle>System status</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
                <div>API latency: 142 ms</div>
                <div>Storage bucket: healthy</div>
                <div>Webhook relay: active</div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="queues">
          <Card>
            <CardHeader className="gap-2">
              <CardTitle>Admin queues</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Queue</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead className="hidden md:table-cell">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueItems.map((item) => (
                    <TableRow key={item.title}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.count}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-[color:var(--ui-muted)]">
                        {item.detail}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardHeader className="gap-2">
                <CardTitle>Access control</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
                <p>Role-gated routes are enforced for patients, physicians, and admins.</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">RBAC</Badge>
                  <Badge variant="glass">Session checks</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-2">
                <CardTitle>Audit trail</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
                <p>Critical changes are surfaced for review before being pushed live.</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Changes tracked</Badge>
                  <Badge variant="secondary">Alerts logged</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-2">
                <CardTitle>Storage health</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
                <p>Uploads and document metadata are available for the clinical queues.</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="glass">Firebase Storage</Badge>
                  <Badge variant="outline">Signed URLs</Badge>
                  <Badge variant="secondary">30-day retention</Badge>
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>
      </Tabs>
    </main>
  );
}
