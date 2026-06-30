# Deployment

This project is a Next.js app with Firebase-backed data services and a small set
of server routes for AI, uploads, alerts, summaries, and webhooks.

## Local Setup

1. Install dependencies with `pnpm install`.
2. Create `.env.local` from `.env.example`.
3. Add the Firebase client and admin variables.
4. Start the app with `pnpm dev`.

Useful verification commands:

```bash
pnpm typecheck
pnpm build
pnpm lint
```

## Environment Variables

### Client-side Firebase

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` optional

### Firebase Admin

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_STORAGE_BUCKET` optional

### Feature Flags

- `ENABLE_NOTIFICATIONS`
- Any AI provider keys used by the Gemini route

## Firebase Preparation

1. Create the Firebase project.
2. Enable Authentication, Firestore, and Storage.
3. Apply `firestore.rules`, `firestore.indexes.json`, and `storage.rules`.
4. Seed the local or staging database with `pnpm seed` as needed.

## Build and Release

1. Run `pnpm typecheck`.
2. Run `pnpm build`.
3. Deploy Firebase resources with `pnpm firebase:deploy`.
4. Deploy the Next.js app to the target hosting platform.

## Operational Notes

- The app expects the Firestore schema defined in `docs/database/firestore-schema.md`.
- The AI and upload routes require server-side Firebase Admin credentials.
- Revalidate paths after writes so the role-based dashboards pick up the latest
  state.
- For local development, emulator-backed Firebase is recommended when available.

## Production Checklist

- Confirm `pnpm build` succeeds.
- Confirm Firebase indexes are present.
- Confirm storage and Firestore security rules are deployed.
- Confirm the `.env.local` values are not committed.
- Confirm seed scripts are not wired into production startup.
