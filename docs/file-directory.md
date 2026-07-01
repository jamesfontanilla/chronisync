# Chronisync File Directory

This document does two jobs:
- compares the chronic disease platform PDF with the current repo
- groups the project into file-generation phases

## PDF Evaluation

- `overview.md` at the project root is the canonical long-form spec. The PDF and the markdown overview are effectively the same product vision, but the overview is easier to map back to code and file generation.
- The spec is a polished, mobile-first chronic disease platform centered on diabetes, hypertension, CKD, and COPD, with daily logging, AI-assisted capture, physician summaries, offline behavior, interoperability, and caregiver support.
- The current repo already covers the strongest web-app pieces: authentication, patient and physician portals, an admin area, Firebase plumbing, rules, AI summaries, alerting, docs, seeds, and tests.
- The biggest gaps versus the spec are the mobile-first diary loop, quick-add flows, food-photo capture, caregiver and on-behalf-of flows, offline sync, device/CGM sync, export-heavy reporting, and the more explicit consent/provenance surfaces.

## Build vs Demo Legend

- `build` means the file or flow is expected to behave like real product code and should survive deployment.
- `demo` means the file can be seeded, scripted, or otherwise illustrative, but it must say so clearly in docs and UI.
- `hybrid` means the screen is real code with seeded data or partial backend wiring until the live integration lands.

## Phase 0 - Product brief and docs

```text
chronisync/
|-- overview.md
`-- docs/
    |-- api-reference.md
    |-- database/
    |   |-- collections.md
    |   `-- firestore-schema.md
    |-- deployment.md
    |-- design.md
    |-- interview-findings.md
    |-- personas.md
    |-- presentation-outline.md
    |-- requirements.md
    |-- screenshots/
    `-- user-journeys.md
```

This phase captures the source brief, supporting analysis, and the written product references that define scope before code generation starts. Treat it as `build` for the spec, and `demo` only for screenshots or presentation assets.

## Phase 1 - Foundation and app shell

```text
chronisync/
|-- .env.example
|-- .env.local
|-- .firebaserc
|-- .gitattributes
|-- .gitignore
|-- eslint.config.mjs
|-- firebase.json
|-- firestore.indexes.json
|-- firestore.rules
|-- LICENSE
|-- middleware.ts
|-- next-env.d.ts
|-- next.config.ts
|-- package.json
|-- pnpm-lock.yaml
|-- pnpm-workspace.yaml
|-- README.md
|-- storage.rules
|-- tsconfig.json
|-- app/
|   |-- globals.css
|   |-- layout.tsx
|   |-- loading.tsx
|   |-- not-found.tsx
|   `-- page.tsx
|-- config/
|   |-- app.ts
|   |-- constants.ts
|   |-- firebase.ts
|   `-- route.ts
|-- providers/
|   |-- QueryProvider.tsx
|   `-- ThemeProvider.tsx
```

This phase establishes the repo skeleton, global routing, and the base Next.js shell. It is `build` work, not demo scaffolding.

## Phase 2 - Authentication and access control

```text
chronisync/
|-- config/
|   `-- roles.ts
|-- lib/
|   `-- auth/
|       |-- guards.ts
|       |-- permissions.ts
|       `-- roles.ts
|-- providers/
|   `-- AuthProvider.tsx
|-- hooks/
|   `-- useAuth.ts
|-- schemas/
|   `-- auth.ts
|-- features/
|   `-- authentication/
|       |-- hooks.ts
|       |-- service.ts
|       `-- validation.ts
|-- app/
|   `-- auth/
|       |-- layout.tsx
|       |-- callback/
|       |   `-- page.tsx
|       |-- forgot-password/
|       |   `-- page.tsx
|       |-- login/
|       |   `-- page.tsx
|       `-- register/
|           `-- page.tsx
```

This phase adds role-aware access control, auth state, and the public auth screens. The screens are `build`, while the callback flow can still be emulator-friendly in local/demo environments.

## Phase 3 - Shared UI and presentation layer

```text
chronisync/
|-- components/
|   |-- common/
|   |   |-- EmptyState.tsx
|   |   |-- Footer.tsx
|   |   |-- Navbar.tsx
|   |   |-- PageHeader.tsx
|   |   `-- Sidebar.tsx
|   |-- ui/
|   |   |-- avatar.tsx
|   |   |-- badge.tsx
|   |   |-- button.tsx
|   |   |-- card.tsx
|   |   |-- dialog.tsx
|   |   |-- dropdown-menu.tsx
|   |   |-- input.tsx
|   |   |-- label.tsx
|   |   |-- popover.tsx
|   |   |-- scroll-area.tsx
|   |   |-- select.tsx
|   |   |-- separator.tsx
|   |   |-- sheet.tsx
|   |   |-- table.tsx
|   |   |-- tabs.tsx
|   |   |-- textarea.tsx
|   |   `-- toast.tsx
|   |-- dashboard/
|   |   |-- AlertCard.tsx
|   |   |-- MetricCard.tsx
|   |   |-- PatientCard.tsx
|   |   `-- TrendCard.tsx
|   |-- charts/
|   |   |-- BloodPressureChart.tsx
|   |   |-- GlucoseChart.tsx
|   |   |-- HeartRateChart.tsx
|   |   |-- MedicationChart.tsx
|   |   `-- WeightChart.tsx
|   `-- forms/
|       |-- AllergyForm.tsx
|       |-- MedicationForm.tsx
|       |-- SymptomForm.tsx
|       |-- TreatmentForm.tsx
|       |-- UploadForm.tsx
|       `-- VitalForm.tsx
|-- features/
|   `-- dashboard/
|       |-- actions.ts
|       |-- hooks.ts
|       `-- service.ts
|-- hooks/
|   `-- useDashboard.ts
```

This phase provides the shared visual system, dashboard cards, charts, forms, and the summary dashboard slice. The visual shell is `build`; seeded values are acceptable where live queries are not connected yet.

## Phase 4 - Core data contracts and Firebase plumbing

```text
chronisync/
|-- lib/
|   |-- constants.ts
|   |-- logger.ts
|   |-- utils.ts
|   `-- firebase/
|       |-- admin.ts
|       |-- auth.ts
|       |-- client.ts
|       |-- firestore.ts
|       `-- storage.ts
|-- types/
|   |-- alert.ts
|   |-- allergy.ts
|   |-- disease.ts
|   |-- document.ts
|   |-- medication.ts
|   |-- patient.ts
|   |-- physician.ts
|   |-- summary.ts
|   |-- symptom.ts
|   |-- user.ts
|   `-- vital.ts
|-- schemas/
|   |-- allergy.ts
|   |-- disease.ts
|   |-- document.ts
|   |-- medication.ts
|   |-- patient.ts
|   |-- symptom.ts
|   `-- vital.ts
```

This phase defines the shared data shapes and the Firebase client, admin, auth, Firestore, and storage adapters. This is core `build` infrastructure.

## Phase 5 - Clinical services, rules, and alert slices

```text
chronisync/
|-- services/
|   |-- alert.service.ts
|   |-- allergy.service.ts
|   |-- document.service.ts
|   |-- medication.service.ts
|   |-- summary.service.ts
|   |-- symptom.service.ts
|   `-- vital.service.ts
|-- lib/
|   `-- rules/
|       |-- adherence.ts
|       |-- alerts.ts
|       |-- bloodPressure.ts
|       |-- engine.ts
|       `-- glucose.ts
|-- hooks/
|   `-- useAlerts.ts
|-- features/
|   |-- alerts/
|   |   |-- actions.ts
|   |   |-- hooks.ts
|   |   |-- service.ts
|   |   |-- types.ts
|   |   `-- validation.ts
|   |-- allergies/
|   |   |-- actions.ts
|   |   |-- hooks.ts
|   |   |-- service.ts
|   |   |-- types.ts
|   |   `-- validation.ts
|   |-- diseases/
|   |   |-- actions.ts
|   |   |-- hooks.ts
|   |   |-- service.ts
|   |   |-- types.ts
|   |   `-- validation.ts
|   |-- documents/
|   |   |-- actions.ts
|   |   |-- hooks.ts
|   |   |-- service.ts
|   |   |-- types.ts
|   |   `-- validation.ts
|   |-- medications/
|   |   |-- actions.ts
|   |   |-- hooks.ts
|   |   |-- service.ts
|   |   |-- types.ts
|   |   `-- validation.ts
|   |-- symptoms/
|   |   |-- actions.ts
|   |   |-- hooks.ts
|   |   |-- service.ts
|   |   |-- types.ts
|   |   `-- validation.ts
|   `-- vitals/
|       |-- actions.ts
|       |-- hooks.ts
|       |-- service.ts
|       |-- types.ts
|       `-- validation.ts
```

This phase captures the clinical logic for medication, allergy, symptom, vital, document, and alert workflows, plus the first rules engine. The rules should be `build` logic even when backed by seeded test data.

## Phase 6 - AI pipeline

```text
chronisync/
|-- lib/
|   `-- ai/
|       |-- extract.ts
|       |-- prompts.ts
|       `-- summarize.ts
|-- features/
|   `-- ai/
|       |-- actions.ts
|       |-- hooks.ts
|       |-- service.ts
|       `-- validation.ts
|-- components/
|   `-- ai/
|       |-- ConfidenceBadge.tsx
|       |-- ExtractedDataCard.tsx
|       `-- SummaryPreview.tsx
```

This phase holds the AI extraction and summarization layer that the patient and physician flows consume. The prompts and metadata should be `build`; the generated examples in docs remain `demo`.

## Phase 7 - Patient portal and self-management

```text
chronisync/
|-- app/
|   `-- patient/
|       |-- allergies/
|       |   |-- error.tsx
|       |   |-- loading.tsx
|       |   `-- page.tsx
|       |-- appointments/
|       |   |-- error.tsx
|       |   |-- loading.tsx
|       |   `-- page.tsx
|       |-- dashboard/
|       |   |-- error.tsx
|       |   |-- loading.tsx
|       |   `-- page.tsx
|       |-- diseases/
|       |   |-- error.tsx
|       |   |-- loading.tsx
|       |   `-- page.tsx
|       |-- documents/
|       |   |-- error.tsx
|       |   |-- loading.tsx
|       |   `-- page.tsx
|       |-- medications/
|       |   |-- error.tsx
|       |   |-- loading.tsx
|       |   `-- page.tsx
|       |-- settings/
|       |   `-- page.tsx
|       |-- symptoms/
|       |   |-- error.tsx
|       |   |-- loading.tsx
|       |   `-- page.tsx
|       |-- treatment-plan/
|       |   |-- error.tsx
|       |   |-- loading.tsx
|       |   `-- page.tsx
|       `-- vitals/
|           |-- error.tsx
|           |-- loading.tsx
|           `-- page.tsx
|-- hooks/
|   |-- useDocuments.ts
|   |-- usePatient.ts
|   `-- useVitals.ts
```

This phase is the patient-facing workspace with its existing route-level loading and error states, plus the patient-oriented hooks. Pages can be `hybrid` if they still lean on seeded snapshots during development.

## Phase 8 - Physician portal and review workflow

```text
chronisync/
|-- app/
|   `-- physician/
|       |-- alerts/
|       |   `-- page.tsx
|       |-- dashboard/
|       |   |-- error.tsx
|       |   |-- loading.tsx
|       |   `-- page.tsx
|       |-- documents/
|       |   `-- page.tsx
|       |-- patients/
|       |   |-- error.tsx
|       |   |-- loading.tsx
|       |   `-- page.tsx
|       |-- settings/
|       |   `-- page.tsx
|       |-- summaries/
|       |   `-- page.tsx
|       `-- treatment/
|           `-- page.tsx
|-- features/
|   `-- physician/
|       |-- actions.ts
|       |-- hooks.ts
|       |-- service.ts
|       `-- validation.ts
```

This phase exposes the physician watchlist, alerts, summaries, documents, and treatment review surfaces. It reuses the shared dashboard and AI presentation components from earlier phases and should read as `build`, even if the data source is seeded in demo mode.

## Phase 9 - Admin, context, notifications, and API surface

```text
chronisync/
|-- app/
|   |-- admin/
|   |   |-- dashboard/
|   |   |   `-- page.tsx
|   |   |-- rules/
|   |   |   `-- page.tsx
|   |   |-- settings/
|   |   |   `-- page.tsx
|   |   `-- users/
|   |       `-- page.tsx
|   `-- api/
|       |-- alerts/
|       |   `-- route.ts
|       |-- gemini/
|       |   `-- route.ts
|       |-- summary/
|       |   `-- route.ts
|       |-- upload/
|       |   `-- route.ts
|       `-- webhooks/
|           `-- route.ts
|-- context/
|   |-- NotificationContext.tsx
|   `-- ThemeContext.tsx
|-- features/
|   `-- notifications/
|       |-- actions.ts
|       |-- hooks.ts
|       |-- service.ts
|       `-- types.ts
```

This phase owns the admin console, app-wide contexts, notifications, and the API routes that glue the product together. Treat the routes as `build`; any mock responses must be clearly labeled as fallback behavior.

## Phase 10 - Scripts, docs, tests, and verification

```text
chronisync/
|-- scripts/
|   |-- generateMockData.ts
|   |-- seed-core.ts
|   |-- seed.ts
|   |-- seedDoctors.ts
|   `-- seedPatients.ts
|-- tests/
|   |-- unit/
|   |   |-- auth.test.ts
|   |   |-- medication.test.ts
|   |   `-- rules.test.ts
|   |-- integration/
|   |   |-- authentication.test.ts
|   |   `-- firestore.test.ts
|   `-- e2e/
|       |-- login.spec.ts
|       |-- patient-dashboard.spec.ts
|       `-- physician-dashboard.spec.ts
|-- playwright.config.ts
```

This phase covers the repeatable safety net: seed data, unit tests, integration tests, real-browser E2E, and the Playwright config. The longer prose docs live in Phase 0. This is where the `demo` path is validated against the `build` path.

## Phase 11 - Mobile diary and quick capture

```text
chronisync/
|-- app/
|   `-- patient/
|       |-- add/
|       |   `-- page.tsx
|       |-- diary/
|       |   |-- error.tsx
|       |   |-- loading.tsx
|       |   `-- page.tsx
|       |-- more/
|       |   `-- page.tsx
|       `-- partners/
|           `-- page.tsx
|-- components/
|   `-- patient-mobile/
|       |-- BottomNav.tsx
|       |-- DiaryFilters.tsx
|       `-- QuickLogTiles.tsx
|-- features/
|   |-- diary/
|   |   |-- actions.ts
|   |   |-- hooks.ts
|   |   |-- service.ts
|   |   |-- types.ts
|   |   `-- validation.ts
|   `-- food-photo/
|       |-- actions.ts
|       |-- hooks.ts
|       |-- service.ts
|       |-- types.ts
|       `-- validation.ts
```

This phase follows the overview's bottom-tab navigation and daily logging loop, including the Add action, diary view, partners view, and photo-based meal entry. It is `hybrid`: the shell is real, but seeded data and fallback forms are expected during development.

## Phase 12 - Offline-first Web Sync

```text
chronisync/
|-- lib/
|   `-- offline/
|       |-- queue.ts
|       |-- storage.ts
|       `-- sync.ts
|-- features/
|   |-- device-sync/
|   |   |-- actions.ts
|   |   |-- hooks.ts
|   |   |-- service.ts
|   |   |-- types.ts
|   |   `-- validation.ts
|   `-- offline-sync/
|       |-- actions.ts
|       |-- hooks.ts
|       |-- service.ts
|       |-- types.ts
|       `-- validation.ts
```

This phase covers browser-local queueing, reconnect-driven flushes, optimistic updates, and web-friendly device sync adapters. In the web app, "device-sync" means imported data, vendor-backed sync, or browser APIs where supported, not always-on native device access. This is `build` work with `demo`-safe fallbacks.

## Phase 13 - Caregiver, consent, export, and compliance

```text
chronisync/
|-- features/
|   |-- caregivers/
|   |   |-- actions.ts
|   |   |-- hooks.ts
|   |   |-- service.ts
|   |   |-- types.ts
|   |   `-- validation.ts
|   |-- consent/
|   |   |-- actions.ts
|   |   |-- hooks.ts
|   |   |-- service.ts
|   |   |-- types.ts
|   |   `-- validation.ts
|   `-- exports/
|       |-- actions.ts
|       |-- hooks.ts
|       |-- service.ts
|       |-- types.ts
|       `-- validation.ts
|-- lib/
|   `-- privacy/
|       |-- consent.ts
|       |-- policy.ts
|       `-- provenance.ts
```

This phase covers caregiver roles, explicit consent scopes, report exports, and the provenance layer that keeps AI outputs auditable. These pieces should be `build`-grade because they encode product policy, not just demo copy.

## Phase 14 - Future mobile support helpers

```text
chronisync/
|-- components/
|   `-- food-photo/
|       |-- ConfirmMealSheet.tsx
|       |-- PhotoCapture.tsx
|       `-- PhotoPreview.tsx
|-- features/
|   `-- provenance/
|       |-- actions.ts
|       |-- hooks.ts
|       |-- service.ts
|       |-- types.ts
|       `-- validation.ts
|-- lib/
|   `-- consent/
|       |-- scopes.ts
|       `-- validators.ts
```

These helpers are not in the repo yet. They round out the food-photo confirm/edit step and the consent/provenance mechanics that the overview calls out explicitly.

## Ignored Or Generated

- `.next/`
- `node_modules/`
- `test-results/`
- `tmp/`
- `tsconfig.tsbuildinfo`
