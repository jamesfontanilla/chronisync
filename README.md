# ChroniSync

ChroniSync is a web-based chronic disease monitoring platform for patients,
physicians, and administrators. It combines role-based workflows, Firebase-backed
data services, explainable AI assistance, and rule-driven clinical alerts to help
teams coordinate care in one browser-based workspace.

This project was developed for SparkFest 2026.

## Project Name

ChroniSync

## Project Brief

ChroniSync helps manage chronic disease care across patient and physician roles.
The platform supports:

- patient logging for medications, symptoms, vitals, documents, and daily check-ins
- physician review dashboards for patient panels, alerts, summaries, and treatment planning
- secure authentication and role-based routing
- AI-assisted document extraction and visit summarization
- rule-based alerting for thresholds, adherence, and clinical signals
- privacy, consent, export, and caregiver-oriented workflows

The app is built as a responsive Next.js web application and is designed to work
well in the browser on desktop and mobile devices.

## Team

- Team name: [Edit this later]
- Members:
  - [Edit this later]
  - [Edit this later]
  - [Edit this later]

## Google Technologies Used

ChroniSync uses the following Google technologies:

- Gemini API for AI extraction and summarization features
- Firebase Authentication for sign-in, registration, password reset, and session flows
- Cloud Firestore for structured clinical and portal data
- Firebase Storage for uploaded patient documents and files
- Firebase Admin SDK for secure server-side access
- Google Cloud infrastructure through Firebase-backed services

## Core Features

- Role-based access for patients, physicians, and administrators
- Patient dashboard, diary, vitals, medications, symptoms, allergies, and documents
- Physician dashboard, patient panel, alerts, summaries, treatment, and settings
- AI document extraction and care summary generation
- Rule engine for blood pressure, glucose, adherence, and alert evaluation
- Consent, provenance, export, and privacy-oriented workflows
- Responsive UI built for a browser-first experience

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Firebase
- Google Gemini API
- Tailwind CSS
- shadcn/ui-style component patterns
- TanStack Query
- React Hook Form
- Zod

## Repository Layout

- `app/` - route-level screens and layouts
- `components/` - shared UI and dashboard components
- `context/` - application context providers
- `features/` - domain service, validation, action, and hook layers
- `hooks/` - reusable React hooks
- `lib/` - Firebase, auth, AI, rules, logging, and utilities
- `providers/` - app-wide React providers
- `schemas/` - schema definitions for data validation
- `services/` - feature services
- `types/` - shared TypeScript types
- `tests/` - unit, integration, and E2E tests
- `scripts/` - seed and mock-data scripts
- `docs/` - deployment, schema, presentation, and implementation docs

## Getting Started

### Prerequisites

- Node.js 22 or newer
- pnpm
- A Firebase project
- A Gemini API key

### Install Dependencies

```bash
pnpm install
```

### Environment Setup

Create a `.env.local` file from `.env.example` and fill in your Firebase and Gemini
values.

The most important environment values are:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `GEMINI_API_KEY`

### Run the App

```bash
pnpm dev
```

The development server runs at `http://localhost:3000`.

## Useful Scripts

- `pnpm dev` - start the development server
- `pnpm build` - create a production build
- `pnpm start` - start the production server
- `pnpm lint` - run ESLint
- `pnpm typecheck` - run TypeScript checks
- `pnpm check` - run lint and typecheck
- `pnpm test:e2e` - run Playwright end-to-end tests
- `pnpm firebase:emulators` - start Firebase emulators
- `pnpm firebase:deploy` - deploy Firebase rules and indexes
- `pnpm seed` - seed the database
- `pnpm seed:patients` - seed patient data only
- `pnpm seed:doctors` - seed physician data only

## Deployment

### Vercel

Use Vercel to deploy the Next.js application. Add the production values from
`.env.local` into the Vercel project environment variables before deploying.

### Firebase

Use Firebase for authentication, Firestore, and Storage. Deploy the Firebase
resources with the Firebase CLI after confirming the project alias in
`.firebaserc`.

### Production Checklist

- Confirm the production domain is set in `NEXT_PUBLIC_APP_URL`
- Confirm Firebase Auth is enabled and the authorized domains are updated
- Confirm Firestore rules and indexes are deployed
- Confirm Storage rules are deployed
- Confirm all server-side Firebase Admin credentials are present in the host
- Confirm Gemini API credentials are present in the host
- Confirm seed scripts are not wired into production startup

## Testing

Before releasing, run:

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm test:e2e
```

## Notes

- AI output is intended for review and assistance, not diagnosis.
- The platform is designed for browser use first, with mobile-friendly layouts.
- Demo or seeded data should be clearly labeled when used outside production.
- Keep sensitive keys out of version control.
