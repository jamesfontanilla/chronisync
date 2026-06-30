# Collections

This file gives a practical view of the current Firestore collections and the
parts of the app that rely on each one.

## Core Collections

| Collection | Purpose | Main Consumers |
| --- | --- | --- |
| `users` | Authentication profile and shared account data. | `lib/auth/*`, `providers/AuthProvider.tsx`, seed scripts |
| `patients` | Patient profile and panel data. | `features/physician/*`, patient pages, seed scripts |
| `physicians` | Physician profile and panel data. | `features/physician/*`, admin views, seed scripts |
| `medications` | Medication management records. | `services/medication.service.ts`, patient/physician pages |
| `allergies` | Allergy tracking records. | `services/allergy.service.ts`, patient/physician pages |
| `vitals` | Blood pressure, glucose, and other measurements. | `services/vital.service.ts`, dashboard hooks, patient pages |
| `symptoms` | Symptom logs and status history. | `services/symptom.service.ts`, patient pages |
| `diseases` | Chronic and acute condition records. | `services/disease.service.ts`, patient pages |
| `alerts` | Clinical, manual, and rules-engine alerts. | `features/alerts/*`, physician dashboard, API routes |
| `documents` | Uploaded documents and extraction metadata. | `services/document.service.ts`, AI routes, physician pages |
| `summaries` | Visit, document, and care summaries. | `services/summary.service.ts`, AI routes, physician pages |
| `notifications` | User-facing event feed. | `features/notifications/*`, global context, future UI |
| `treatmentPlans` | Reserved for treatment planning. | Future work |
| `appointments` | Reserved for scheduling workflows. | Future work |

## Ownership Model

- `users` is the root identity record.
- `patients` and `physicians` are role-specific views that extend the account
  data.
- The clinical collections are written by service modules rather than directly
  by pages.
- API routes are the preferred boundary for file uploads, AI work, and webhook
  ingestion.

## Read Patterns

- Single-record reads use `getDocument` in the service layer.
- Panel-style reads use `queryDocuments` plus `whereEquals`.
- Most list views sort or filter in the feature service instead of in the page.

## Write Patterns

- Create operations build a timestamped record first, then persist it.
- Update operations load the current record, merge updates, and refresh
  `updatedAt`.
- Delete operations remove the document by ID and revalidate the relevant UI.

## Seed Coverage

The current seed scripts target:

- one physician profile
- two patient profiles
- supporting admin and account records
- representative medication, alert, summary, and document data

That gives the UI a realistic starting state without requiring live production
data.
