/**
 * =============================================================================
 * ChroniSync — Demo Mode
 * Hardcoded seed accounts for offline / no-Firebase development.
 *
 * Credentials:
 *   Patient   →  patient@demo.com  /  Demo1234!
 *   Physician →  doctor@demo.com   /  Demo1234!
 * =============================================================================
 */

import type { User as FirebaseUser } from "firebase/auth";

import type { UserRole } from "@/lib/auth/roles";

/* -------------------------------------------------------------------------- */
/*                           Demo mode flag                                   */
/* -------------------------------------------------------------------------- */

export const IS_DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";

/* -------------------------------------------------------------------------- */
/*                           Account type                                     */
/* -------------------------------------------------------------------------- */

export interface DemoAccount {
  email: string;
  password: string;
  role: UserRole;
  user: FirebaseUser;
}

/* -------------------------------------------------------------------------- */
/*                     Mock FirebaseUser factory                              */
/* -------------------------------------------------------------------------- */

function makeDemoUser(
  uid: string,
  email: string,
  displayName: string
): FirebaseUser {
  const now = new Date().toISOString();

  return {
    uid,
    email,
    displayName,
    emailVerified: true,
    isAnonymous: false,
    phoneNumber: null,
    photoURL: null,
    providerData: [
      {
        providerId: "password",
        uid: email,
        displayName,
        email,
        phoneNumber: null,
        photoURL: null,
      },
    ],
    refreshToken: "demo-refresh-token",
    tenantId: null,
    metadata: {
      creationTime: "2025-01-01T00:00:00.000Z",
      lastSignInTime: now,
    },
    getIdToken: async () => "demo-id-token",
    getIdTokenResult: async () =>
      ({
        token: "demo-id-token",
        claims: {},
        authTime: now,
        issuedAtTime: now,
        expirationTime: now,
        signInProvider: "password",
        signInSecondFactor: null,
      } as never),
    reload: async () => {},
    toJSON: () => ({ uid, email, displayName }),
    delete: async () => {},
    providerId: "firebase",
  } as unknown as FirebaseUser;
}

/* -------------------------------------------------------------------------- */
/*                          Seed accounts                                     */
/* -------------------------------------------------------------------------- */

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "patient@demo.com",
    password: "Demo1234!",
    role: "patient",
    user: makeDemoUser(
      "demo-patient-001",
      "patient@demo.com",
      "Demo Patient"
    ),
  },
  {
    email: "doctor@demo.com",
    password: "Demo1234!",
    role: "physician",
    user: makeDemoUser(
      "demo-doctor-001",
      "doctor@demo.com",
      "Dr. Demo"
    ),
  },
];

/* -------------------------------------------------------------------------- */
/*                          Lookup helpers                                    */
/* -------------------------------------------------------------------------- */

/**
 * Returns a matching demo account, or undefined if credentials are wrong.
 * Role is NOT validated here — the caller may override it from the form.
 */
export function findDemoAccount(
  email: string,
  password: string
): DemoAccount | undefined {
  return DEMO_ACCOUNTS.find(
    (acc) =>
      acc.email.toLowerCase() === email.toLowerCase() &&
      acc.password === password
  );
}
