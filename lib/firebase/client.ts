/**
 * =============================================================================
 * ChroniSync
 * Firebase Client SDK Initialization
 * =============================================================================
 */

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import type { FirebaseOptions } from "firebase/app";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env["NEXT_PUBLIC_FIREBASE_API_KEY"]!,
  authDomain: process.env["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"]!,
  projectId: process.env["NEXT_PUBLIC_FIREBASE_PROJECT_ID"]!,
  storageBucket: process.env["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"]!,
  messagingSenderId:
    process.env["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"]!,
  appId: process.env["NEXT_PUBLIC_FIREBASE_APP_ID"]!,
};

const measurementId =
  process.env["NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"];

if (measurementId) {
  firebaseConfig.measurementId = measurementId;
}

/**
 * Initialize Firebase only once.
 */
const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

/**
 * Firebase services.
 */
export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);

export default app;
