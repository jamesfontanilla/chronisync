# Interview Findings

These notes are a draft synthesis of the product themes reflected in the current
ChroniSync scope. They are not verbatim interview transcripts.

## Key Themes

### 1. Patients want clarity, not more data

- They need to know what changed.
- They want a calm place to see next steps.
- They respond better to a short summary than to raw logs.

### 2. Physicians want fewer queues

- The important work is triage, not hunting for data.
- Alerts, documents, and summaries should converge in one review flow.
- Manual review must stay fast enough for daily use.

### 3. Admins want control without noise

- Access, user health, and rule settings should be visible in one place.
- The system should show what needs review before changes are published.

### 4. AI is useful when it is bounded

- Extraction is valuable when it produces structured fields the team can trust.
- Summaries are most useful when they are short and easy to verify.
- Review-before-publish remains essential.

### 5. Notifications need to be actionable

- A notification should explain what happened and what to do next.
- Notification feeds should favor recency and severity.

## Product Implications

- Keep the UI role-aware.
- Prefer short cards and queue views over dense dashboards.
- Make review states obvious.
- Preserve a clear audit trail for high-risk changes.

## Draft Success Criteria

- A new patient can understand the current state in under a minute.
- A physician can review the most urgent queue items without leaving the dashboard.
- An admin can verify system health and access posture quickly.

## Notes for Future Research

- Validate how often alerts should be surfaced versus grouped.
- Check whether physicians want summary drafts automatically generated or only
  on demand.
- Confirm which notifications should be pushed and which should remain in-app.
