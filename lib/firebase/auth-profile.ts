import type { User as FirebaseUser } from "firebase/auth";

import { COLLECTIONS } from "@/config/firebase";
import type { RegisterCredentials } from "@/types/user";

interface AuthProfileUser
  extends Pick<
    FirebaseUser,
    "uid" | "email" | "displayName" | "photoURL" | "emailVerified"
  > {}

export interface BaseProfileData {
  id: string;
  email: string;
  fullName: string;
  role: RegisterCredentials["role"];
  status: "active";
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleProfileData {
  collectionName: typeof COLLECTIONS.PATIENTS | typeof COLLECTIONS.PHYSICIANS;
  data: BaseProfileData & Record<string, unknown>;
}

export function buildUserProfileData(
  authUser: AuthProfileUser,
  credentials: RegisterCredentials
): BaseProfileData {
  const now = new Date();

  return {
    id: authUser.uid,
    email: authUser.email ?? credentials.email,
    fullName: credentials.fullName,
    role: credentials.role,
    status: "active" as const,
    emailVerified: authUser.emailVerified,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildRoleProfileData(
  authUser: AuthProfileUser,
  credentials: RegisterCredentials
): RoleProfileData {
  const baseProfile = buildUserProfileData(authUser, credentials);

  if (credentials.role === "physician") {
    return {
      collectionName: COLLECTIONS.PHYSICIANS,
      data: {
        ...baseProfile,
        licenseNumber: "",
        specialty: "Other",
        availability: "offline" as const,
      },
    };
  }

  const now = new Date();

  return {
    collectionName: COLLECTIONS.PATIENTS,
    data: {
      ...baseProfile,
      dateOfBirth: new Date("2000-01-01T00:00:00.000Z"),
      biologicalSex: "female" as const,
      bloodType: "O+" as const,
      heightCm: 160,
      weightKg: 64,
      chronicConditions: [],
      emergencyContact: {
        fullName: "",
        relationship: "",
        phoneNumber: "",
      },
      physicianId: "",
      fhirPatientId: `Patient/${authUser.uid}`,
      openmrsPatientId: `patient-${authUser.uid}`,
      preferredInteropStandard: "fhir" as const,
      interop: {
        primaryStandard: "fhir" as const,
        mappingStatus: "unmapped" as const,
        lastMappedAt: now,
        externalIds: {
          demoDatasetId: authUser.uid,
        },
        references: [],
      },
      phoneNumber: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: "en",
      lastLoginAt: now,
    },
  };
}
