/**
 * =============================================================================
 * ChroniSync
 * Firebase Admin SDK Initialization
 * Server-side only
 * =============================================================================
 */

import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
  type AppOptions,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

export interface AdminConfig {
  projectId: string;

  clientEmail: string;

  privateKey: string;

  storageBucket: string | undefined;
}

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

function normalizePrivateKey(value: string): string {
  return value.replace(/\\n/g, "\n");
}

export function getAdminConfig(): AdminConfig {
  const projectId =
    readEnv("FIREBASE_PROJECT_ID") ??
    readEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  const clientEmail = readEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = readEnv("FIREBASE_PRIVATE_KEY");
  const storageBucket =
    readEnv("FIREBASE_STORAGE_BUCKET") ??
    readEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin SDK is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }

  return {
    projectId,
    clientEmail,
    privateKey: normalizePrivateKey(privateKey),
    storageBucket,
  };
}

let cachedAdminApp: App | null = null;

export function getAdminApp(): App {
  if (cachedAdminApp) {
    return cachedAdminApp;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    const existingApp = existingApps[0];
    if (existingApp) {
      cachedAdminApp = existingApp;
      return existingApp;
    }
  }

  const config = getAdminConfig();
  const options: AppOptions = {
    credential: cert({
      projectId: config.projectId,
      clientEmail: config.clientEmail,
      privateKey: config.privateKey,
    }),
  };

  if (config.storageBucket) {
    options.storageBucket = config.storageBucket;
  }

  cachedAdminApp = initializeApp(options);
  return cachedAdminApp;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminStorage() {
  return getStorage(getAdminApp());
}
