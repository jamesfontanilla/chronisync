/**
 * =============================================================================
 * ChroniSync
 * Firebase Authentication Service
 * =============================================================================
 */

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
  type Unsubscribe,
} from "firebase/auth";

import { auth } from "@/lib/firebase/client";
import type {
  LoginCredentials,
  RegisterCredentials,
} from "@/types/user";

/* -------------------------------------------------------------------------- */
/*                            Register Account                                */
/* -------------------------------------------------------------------------- */

export async function registerUser(
  credentials: RegisterCredentials
): Promise<FirebaseUser> {
  const { email, password, fullName } = credentials;

  const result = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await updateProfile(result.user, {
    displayName: fullName,
  });

  await sendEmailVerification(result.user);

  return result.user;
}

/* -------------------------------------------------------------------------- */
/*                               Sign In                                      */
/* -------------------------------------------------------------------------- */

export async function loginUser(
  credentials: LoginCredentials
): Promise<FirebaseUser> {
  const { email, password } = credentials;

  const result = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return result.user;
}

/* -------------------------------------------------------------------------- */
/*                              Sign Out                                      */
/* -------------------------------------------------------------------------- */

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/* -------------------------------------------------------------------------- */
/*                          Password Reset                                    */
/* -------------------------------------------------------------------------- */

export async function resetPassword(
  email: string
): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/* -------------------------------------------------------------------------- */
/*                        Authentication State                                */
/* -------------------------------------------------------------------------- */

export function observeAuthState(
  callback: (user: FirebaseUser | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/* -------------------------------------------------------------------------- */
/*                              Current User                                  */
/* -------------------------------------------------------------------------- */

export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}