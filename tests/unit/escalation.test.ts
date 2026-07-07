import assert from "node:assert/strict";
import test from "node:test";

import {
  buildEscalationPlan,
  buildEscalationPlans,
} from "@/features/escalations/service";

const criticalFinding = {
  patientId: "patient-demo-1",
  physicianId: "physician-demo-1",
  family: "guideline" as const,
  ruleId: "blood_pressure.trend.30d",
  title: "Persistently High Blood Pressure Alert",
  message: "The blood pressure window is staying elevated.",
  level: "critical" as const,
  metric: "blood_pressure",
  threshold: "140/90 mmHg",
  actualValue: "152/98 mmHg",
  recommendation: "Review blood pressure management today.",
};

test("escalation plans route critical findings to physician and caregiver recipients", () => {
  const plan = buildEscalationPlan(criticalFinding, {
    patientId: "patient-demo-1",
    patientLabel: "Anna Cruz",
    physicianId: "physician-demo-1",
    physicianLabel: "Dr. Santos",
    caregiverRecipients: [
      {
        recipientId: "caregiver-1",
        recipientType: "caregiver",
        channel: "sms",
        label: "Marco Cruz",
      },
    ],
  });

  assert.ok(plan);
  assert.equal(plan.notifications.length, 2);
  assert.equal(plan.recipients.length, 2);
  assert.equal(plan.alertInput.status, "open");
  assert.equal(plan.notifications[0]?.type, "error");
  assert.equal(plan.notifications[0]?.metadata?.["deliveryChannels"] instanceof Array, true);
});

test("non-urgent findings do not create escalation plans", () => {
  const plans = buildEscalationPlans(
    [
      {
        ...criticalFinding,
        level: "info" as const,
      },
    ],
    {
      patientId: "patient-demo-1",
      physicianId: "physician-demo-1",
    }
  );

  assert.equal(plans.length, 0);
});
