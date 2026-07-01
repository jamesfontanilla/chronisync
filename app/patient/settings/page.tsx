import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
            <Button variant="secondary" className="w-fit">
              Edit profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
            <p>Medication reminders, follow-up alerts, and document updates can be tuned here.</p>
            <Button variant="secondary" className="w-fit">
              Manage alerts
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Display</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
            <p>Keep the interface easy to read, especially on smaller screens.</p>
            <Button variant="secondary" className="w-fit">
              Theme settings
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
