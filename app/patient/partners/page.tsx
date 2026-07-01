import Link from "next/link";
import {
  MessageSquareMore,
  ShieldCheck,
  UserRound,
  UserRoundPlus,
} from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/config/route";
import {
  getCaregiverAccessTierDescription,
  getCaregiverAccessTierLabel,
} from "@/lib/privacy/policy";
import { getInitials, humanize } from "@/lib/utils";

const partners = [
  {
    name: "Dr. Mia Santos",
    role: "physician",
    status: "active",
    accessTier: "read_only",
    accessSummary: "review + summaries",
    email: "mia.santos@example.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
  },
  {
    name: "Marco Cruz",
    role: "caregiver",
    status: "active",
    accessTier: "log_on_behalf_of",
    accessSummary: "log on behalf",
    email: "marco.cruz@example.com",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
  },
] as const;

function PartnerCard({
  name,
  role,
  status,
  accessTier,
  accessSummary,
  email,
  avatar,
}: (typeof partners)[number]) {
  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl">{name}</CardTitle>
              <Badge variant="secondary">{humanize(role)}</Badge>
              <Badge variant="glass">{humanize(status)}</Badge>
            </div>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">{email}</p>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">
              {getCaregiverAccessTierDescription(accessTier)}
            </p>
          </div>
        </div>
        <div className="grid justify-items-end gap-2">
          <Badge variant="outline">{getCaregiverAccessTierLabel(accessTier)}</Badge>
          <span className="text-xs text-[color:var(--ui-muted)]">
            {accessSummary}
          </span>
        </div>
      </CardHeader>
    </Card>
  );
}

export default function PatientPartnersPage() {
  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Patient workspace"
        title="Partners"
        description="Keep physicians and caregivers close enough to help, but clear about what each can see."
        actions={
          <Button asChild variant="glass">
            <Link href={ROUTES.PATIENT.SETTINGS}>Manage access</Link>
          </Button>
        }
        level={1}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div className="grid gap-2">
              <p className="m-0 text-sm text-[color:var(--ui-muted)]">Partners</p>
              <CardTitle className="text-3xl">{partners.length}</CardTitle>
            </div>
            <UserRound className="text-[color:var(--ui-accent)]" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div className="grid gap-2">
              <p className="m-0 text-sm text-[color:var(--ui-muted)]">
                Active access
              </p>
              <CardTitle className="text-3xl">2</CardTitle>
            </div>
            <ShieldCheck className="text-[color:var(--ui-accent)]" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div className="grid gap-2">
              <p className="m-0 text-sm text-[color:var(--ui-muted)]">
                Pending invites
              </p>
              <CardTitle className="text-3xl">1</CardTitle>
            </div>
            <UserRoundPlus className="text-[color:var(--ui-accent)]" />
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4">
        {partners.map((partner) => (
          <PartnerCard key={partner.email} {...partner} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card>
          <CardHeader className="gap-2">
            <CardTitle>Permission model</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 text-[color:var(--ui-accent)]" size={18} />
              <p className="m-0">
                Read-only access lets a partner review trends, entries, and
                alerts without changing the record.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquareMore
                className="mt-1 text-[color:var(--ui-accent)]"
                size={18}
              />
              <p className="m-0">
                Log-on-behalf-of access is reserved for the people the patient
                explicitly invites to help with logging.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-2">
            <CardTitle>Pending items</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
            <p className="m-0">
              One caregiver invite is waiting for confirmation before it can
              read or add diary entries.
            </p>
            <Button asChild variant="secondary" className="w-fit">
              <Link href={ROUTES.PATIENT.SETTINGS}>Review invitations</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

    </main>
  );
}
