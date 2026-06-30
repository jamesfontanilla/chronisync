import Link from "next/link";
import {
  UserRound,
  ShieldCheck,
  UserCog,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { ROUTES } from "@/config/route";
import { humanize } from "@/lib/utils";

const users = [
  {
    name: "Anna Cruz",
    email: "anna.cruz@example.com",
    role: "patient",
    status: "active",
    verified: true,
    lastLogin: "Today, 08:34",
  },
  {
    name: "Jon Reyes",
    email: "jon.reyes@example.com",
    role: "patient",
    status: "active",
    verified: true,
    lastLogin: "Today, 07:52",
  },
  {
    name: "Dr. Mia Santos",
    email: "mia.santos@example.com",
    role: "physician",
    status: "active",
    verified: true,
    lastLogin: "Today, 06:48",
  },
  {
    name: "Admin Console",
    email: "admin@chronisync.app",
    role: "admin",
    status: "suspended",
    verified: true,
    lastLogin: "2 days ago",
  },
] as const;

function roleVariant(role: string) {
  switch (role) {
    case "physician":
      return "glass" as const;
    case "admin":
      return "destructive" as const;
    case "patient":
    default:
      return "secondary" as const;
  }
}

function statusVariant(status: string) {
  switch (status) {
    case "active":
      return "default" as const;
    case "pending":
      return "glass" as const;
    case "suspended":
    default:
      return "destructive" as const;
  }
}

export default function AdminUsersPage() {
  const patients = users.filter((user) => user.role === "patient").length;
  const physicians = users.filter((user) => user.role === "physician").length;
  const admins = users.filter((user) => user.role === "admin").length;

  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Administrator console"
        title="Users"
        description="Review the current account list, then move through role assignments, verification, and access issues."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={ROUTES.ADMIN.DASHBOARD}>Dashboard</Link>
            </Button>
            <Button variant="glass">Invite user</Button>
          </>
        }
        level={1}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div className="grid gap-2">
              <p className="m-0 text-sm text-[color:var(--ui-muted)]">Patients</p>
              <CardTitle className="text-3xl">{patients}</CardTitle>
            </div>
            <UserRound className="text-[color:var(--ui-accent)]" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div className="grid gap-2">
              <p className="m-0 text-sm text-[color:var(--ui-muted)]">Physicians</p>
              <CardTitle className="text-3xl">{physicians}</CardTitle>
            </div>
            <ShieldCheck className="text-[color:var(--ui-accent)]" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div className="grid gap-2">
              <p className="m-0 text-sm text-[color:var(--ui-muted)]">Admins</p>
              <CardTitle className="text-3xl">{admins}</CardTitle>
            </div>
            <UserCog className="text-[color:var(--ui-accent)]" />
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader className="gap-2">
          <CardTitle>Account directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Seeded user directory for the admin console.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Last login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.email}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleVariant(user.role)}>{humanize(user.role)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(user.status)}>
                      {humanize(user.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.verified ? (
                      <Badge variant="glass">Verified</Badge>
                    ) : (
                      <Badge variant="outline">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-[color:var(--ui-muted)]">
                    {user.lastLogin}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-2">
          <CardTitle>Access notes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">SSO enabled</Badge>
            <Badge variant="glass">2FA required for admins</Badge>
            <Badge variant="outline">Verification audits daily</Badge>
          </div>
          <p>
            Users with suspended status should be reviewed before their access is
            restored.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
