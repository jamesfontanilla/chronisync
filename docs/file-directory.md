chronisync/
│
├── README.md
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── next.config.ts
├── middleware.ts
├── .gitignore
├── .env.example
├── .env.local
│
├── requirements.md
├── design.md
├── architecture.md
├── roadmap.md
├── api.md
│
├── firebase.json
├── .firebaserc
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
│
├── app/
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   │
│   ├── auth/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── page.tsx
│   │
│   ├── patient/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   │
│   │   ├── medications/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   │
│   │   ├── allergies/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   │
│   │   ├── vitals/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   │
│   │   ├── symptoms/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   │
│   │   ├── diseases/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   │
│   │   ├── documents/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   │
│   │   ├── appointments/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   │
│   │   ├── treatment-plan/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   │
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── physician/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   ├── patients/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   ├── alerts/
│   │   │   └── page.tsx
│   │   ├── documents/
│   │   │   └── page.tsx
│   │   ├── summaries/
│   │   │   └── page.tsx
│   │   ├── treatment/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── admin/
│   │   ├── dashboard/page.tsx
│   │   ├── users/page.tsx
│   │   ├── rules/page.tsx
│   │   └── settings/page.tsx
│   │
│   └── api/
│       ├── gemini/route.ts
│       ├── upload/route.ts
│       ├── alerts/route.ts
│       ├── summary/route.ts
│       └── webhooks/route.ts
│
├── components/
│   │
│   ├── common/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── PageHeader.tsx
│   │   └── EmptyState.tsx
│   │
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── toast.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── select.tsx
│   │   ├── avatar.tsx
│   │   ├── separator.tsx
│   │   ├── scroll-area.tsx
│   │   └── popover.tsx
│   │
│   ├── dashboard/
│   │   ├── MetricCard.tsx
│   │   ├── PatientCard.tsx
│   │   ├── TrendCard.tsx
│   │   ├── AlertCard.tsx
│   │   └── SummaryCard.tsx
│   │
│   ├── charts/
│   │   ├── BloodPressureChart.tsx
│   │   ├── GlucoseChart.tsx
│   │   ├── HeartRateChart.tsx
│   │   ├── WeightChart.tsx
│   │   └── MedicationChart.tsx
│   │
│   ├── forms/
│   │   ├── MedicationForm.tsx
│   │   ├── AllergyForm.tsx
│   │   ├── VitalForm.tsx
│   │   ├── SymptomForm.tsx
│   │   ├── TreatmentForm.tsx
│   │   └── UploadForm.tsx
│   │
│   └── ai/
│       ├── ExtractedDataCard.tsx
│       ├── SummaryPreview.tsx
│       └── ConfidenceBadge.tsx
│
├── config/
│   ├── app.ts
│   ├── routes.ts
│   ├── roles.ts
│   ├── firebase.ts
│   └── constants.ts
│
├── features/
│   ├── authentication/
│   ├── dashboard/
│   ├── medications/
│   ├── allergies/
│   ├── vitals/
│   ├── symptoms/
│   ├── diseases/
│   ├── documents/
│   ├── physician/
│   ├── alerts/
│   ├── ai/
│   └── notifications/
│       (each contains actions.ts, service.ts, validation.ts, hooks.ts, types.ts where applicable)
│
├── hooks/
│   ├── useAuth.ts
│   ├── useDashboard.ts
│   ├── usePatient.ts
│   ├── useVitals.ts
│   ├── useAlerts.ts
│   └── useDocuments.ts
│
├── providers/
│   ├── AuthProvider.tsx
│   ├── ThemeProvider.tsx
│   └── QueryProvider.tsx
│
├── context/
│   ├── ThemeContext.tsx
│   └── NotificationContext.tsx
│
├── lib/
│   ├── firebase/
│   │   ├── client.ts
│   │   ├── admin.ts
│   │   ├── auth.ts
│   │   ├── firestore.ts
│   │   └── storage.ts
│   │
│   ├── ai/
│   │   ├── prompts.ts
│   │   ├── extract.ts
│   │   └── summarize.ts
│   │
│   ├── auth/
│   │   ├── roles.ts
│   │   ├── permissions.ts
│   │   └── guards.ts
│   │
│   ├── rules/
│   │   ├── bloodPressure.ts
│   │   ├── glucose.ts
│   │   ├── adherence.ts
│   │   ├── alerts.ts
│   │   └── engine.ts
│   │
│   ├── logger.ts
│   └── utils.ts
│
├── services/
│   ├── medication.service.ts
│   ├── allergy.service.ts
│   ├── vital.service.ts
│   ├── symptom.service.ts
│   ├── document.service.ts
│   ├── alert.service.ts
│   └── summary.service.ts
│
├── schemas/
│   ├── auth.ts
│   ├── patient.ts
│   ├── medication.ts
│   ├── allergy.ts
│   ├── vital.ts
│   ├── symptom.ts
│   └── disease.ts
│
├── types/
│   ├── user.ts
│   ├── patient.ts
│   ├── physician.ts
│   ├── medication.ts
│   ├── allergy.ts
│   ├── vital.ts
│   ├── symptom.ts
│   ├── disease.ts
│   ├── alert.ts
│   ├── summary.ts
│   └── document.ts
│
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   ├── icons/
│   ├── images/
│   └── mock/
│
├── scripts/
│   ├── generateMockData.ts
│   ├── seed.ts
│   ├── seedPatients.ts
│   └── seedDoctors.ts
│
├── tests/
│   ├── unit/
│   │   ├── auth.test.ts
│   │   ├── medication.test.ts
│   │   └── rules.test.ts
│   ├── integration/
│   │   ├── firestore.test.ts
│   │   └── authentication.test.ts
│   └── e2e/
│       ├── login.spec.ts
│       ├── patient-dashboard.spec.ts
│       └── physician-dashboard.spec.ts
│
├── docs/
│   ├── database/
│   │   ├── firestore-schema.md
│   │   └── collections.md
│   ├── deployment.md
│   ├── personas.md
│   ├── interview-findings.md
│   ├── user-journeys.md
│   ├── api-reference.md
│   ├── presentation-outline.md
│   └── screenshots/
│
└── functions/          (Optional, after MVP)
    ├── src/
    ├── package.json
    └── tsconfig.json