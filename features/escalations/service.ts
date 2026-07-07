/**
 * =============================================================================
 * ChroniSync
 * Escalation Planning Service
 * =============================================================================
 */

import {
  createClinicalAlertInput,
  type ClinicalRuleFinding,
} from "@/lib/rules/alerts";
import type { AlertLevel } from "@/types/alert";

import type {
  NotificationCreateInput,
  NotificationType,
} from "@/features/notifications/types";

export type EscalationChannel = "app" | "push" | "sms";

export type EscalationRecipientType =
  | "physician"
  | "caregiver";

export interface EscalationRecipient {
  recipientId: string;
  recipientType: EscalationRecipientType;
  channel: EscalationChannel;
  label?: string;
}

export interface EscalationContext {
  patientId: string;
  patientLabel?: string;
  physicianId?: string;
  physicianLabel?: string;
  caregiverRecipients?: EscalationRecipient[];
  source?: string;
}

export interface EscalationPlan {
  finding: ClinicalRuleFinding;
  alertInput: ReturnType<typeof createClinicalAlertInput>;
  notifications: NotificationCreateInput[];
  recipients: EscalationRecipient[];
}

function getNotificationType(level: AlertLevel): NotificationType {
  switch (level) {
    case "critical":
      return "error";
    case "warning":
      return "warning";
    case "info":
    default:
      return "info";
  }
}

function getEscalationChannels(level: AlertLevel): EscalationChannel[] {
  if (level === "critical") {
    return ["app", "push", "sms"];
  }

  return ["app"];
}

function getEscalationLink(recipientType: EscalationRecipientType): string {
  return recipientType === "physician"
    ? "/physician/dashboard"
    : "/patient/dashboard";
}

function buildRecipientLabel(
  context: EscalationContext,
  recipient: EscalationRecipient
): string {
  if (recipient.label) {
    return recipient.label;
  }

  if (recipient.recipientType === "physician") {
    return context.physicianLabel ?? "Physician";
  }

  return "Caregiver";
}

function shouldEscalateFinding(finding: ClinicalRuleFinding): boolean {
  return finding.level !== "info" || finding.family === "interaction";
}

export function buildEscalationRecipients(
  context: EscalationContext
): EscalationRecipient[] {
  const recipients: EscalationRecipient[] = [];

  if (context.physicianId) {
    recipients.push({
      recipientId: context.physicianId,
      recipientType: "physician",
      channel: "app",
      ...(context.physicianLabel ? { label: context.physicianLabel } : {}),
    });
  }

  if (context.caregiverRecipients?.length) {
    recipients.push(...context.caregiverRecipients);
  }

  const uniqueRecipients = new Map<string, EscalationRecipient>();

  for (const recipient of recipients) {
    uniqueRecipients.set(
      `${recipient.recipientType}:${recipient.recipientId}`,
      recipient
    );
  }

  return [...uniqueRecipients.values()];
}

export async function resolveEscalationRecipientsByPatient(
  context: EscalationContext
): Promise<EscalationRecipient[]> {
  const { listActiveCaregiversByPatient } = await import(
    "@/features/caregivers/service"
  );
  const caregiverRecords =
    await listActiveCaregiversByPatient(context.patientId).catch(
      () => [] as Awaited<ReturnType<typeof listActiveCaregiversByPatient>>
    );
  const caregiverRecipients = caregiverRecords
    .filter((caregiver) => caregiver.permissions.includes("receive_alerts"))
    .map<EscalationRecipient>((caregiver) => ({
      recipientId: caregiver.id,
      recipientType: "caregiver",
      channel: caregiver.phoneNumber ? "sms" : "app",
      label: caregiver.fullName,
    }));

  return buildEscalationRecipients({
    ...context,
    ...(caregiverRecipients.length
      ? { caregiverRecipients }
      : context.caregiverRecipients
        ? { caregiverRecipients: context.caregiverRecipients }
        : {}),
  });
}

export function buildEscalationPlan(
  finding: ClinicalRuleFinding,
  context: EscalationContext
): EscalationPlan | null {
  if (!shouldEscalateFinding(finding)) {
    return null;
  }

  const recipients = buildEscalationRecipients(context);

  if (recipients.length === 0) {
    return {
      finding,
      alertInput: createClinicalAlertInput(finding),
      notifications: [],
      recipients: [],
    };
  }

  const alertInput = createClinicalAlertInput(finding);
  const notificationType = getNotificationType(finding.level);
  const channels = getEscalationChannels(finding.level);
  const patientDescriptor = context.patientLabel ?? context.patientId;

  const notifications = recipients.map<NotificationCreateInput>((recipient) => {
    const recipientLabel = buildRecipientLabel(context, recipient);

    return {
      recipientId: recipient.recipientId,
      title:
        finding.level === "critical"
          ? `Critical review needed: ${finding.title}`
          : `Review needed: ${finding.title}`,
      message: `${patientDescriptor} needs attention: ${finding.message}`,
      type: notificationType,
      status: "unread",
      source: finding.ruleId,
      link: getEscalationLink(recipient.recipientType),
      metadata: {
        patientId: context.patientId,
        ...(context.patientLabel ? { patientLabel: context.patientLabel } : {}),
        ...(context.physicianId ? { physicianId: context.physicianId } : {}),
        ...(context.physicianLabel ? { physicianLabel: context.physicianLabel } : {}),
        recipientLabel,
        recipientType: recipient.recipientType,
        recipientChannel: recipient.channel,
        deliveryChannels: channels,
        alertFamily: finding.family ?? "guideline",
        ruleId: finding.ruleId,
        metric: finding.metric,
        level: finding.level,
        actualValue: finding.actualValue,
        threshold: finding.threshold,
        recommendation: finding.recommendation,
      },
    };
  });

  return {
    finding,
    alertInput,
    notifications,
    recipients,
  };
}

export function buildEscalationPlans(
  findings: ClinicalRuleFinding[],
  context: EscalationContext
): EscalationPlan[] {
  return findings
    .map((finding) => buildEscalationPlan(finding, context))
    .filter((plan): plan is EscalationPlan => plan !== null);
}
