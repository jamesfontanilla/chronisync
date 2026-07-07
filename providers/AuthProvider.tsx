"use client";

import {
  createContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User as FirebaseUser } from "firebase/auth";

import {
  getRoleCookie,
  persistRole,
  type UserRole,
} from "@/lib/auth/roles";
import { observeAuthState } from "@/lib/firebase/auth";
import type {
  ForgotPasswordFormData,
  LoginFormData,
  RegisterFormData,
} from "@/features/authentication/validation";
import {
  requestPasswordReset,
  registerWithRole,
  signInWithRole,
  signOutCurrentUser,
} from "@/features/authentication/service";
import { IS_DEMO_MODE, findDemoAccount } from "@/lib/demo/accounts";

export interface AuthContextValue {
  user: FirebaseUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (values: LoginFormData) => Promise<FirebaseUser>;
  register: (values: RegisterFormData) => Promise<FirebaseUser>;
  sendPasswordReset: (
    values: ForgotPasswordFormData | string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshRole: () => void;
  setRole: (role: UserRole | null) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRoleState] = useState<UserRole | null>(() =>
    getRoleCookie()
  );
  const [isLoading, setIsLoading] = useState(true);

  /**
   * When demo mode is active and a seed user is logged in, we block the
   * Firebase onAuthStateChanged observer from overwriting our mock user.
   */
  const demoAuthActive = useRef(false);

  useEffect(() => {
    const unsubscribe = observeAuthState((nextUser) => {
      // In demo mode with an active session, ignore Firebase state updates.
      if (demoAuthActive.current) return;

      setUser(nextUser);
      setIsLoading(false);

      if (!nextUser) {
        setRoleState(getRoleCookie());
      }
    });

    return unsubscribe;
  }, []);

  function setRole(roleValue: UserRole | null) {
    persistRole(roleValue);
    setRoleState(roleValue);
  }

  function refreshRole() {
    setRoleState(getRoleCookie());
  }

  async function signIn(values: LoginFormData): Promise<FirebaseUser> {
    // ── Demo mode bypass ──────────────────────────────────────────────────
    if (IS_DEMO_MODE) {
      const demoAccount = findDemoAccount(values.email, values.password);

      if (!demoAccount) {
        throw new Error(
          "Demo mode: invalid credentials.\n" +
          "Try patient@demo.com or doctor@demo.com with password Demo1234!"
        );
      }

      demoAuthActive.current = true;
      setUser(demoAccount.user);
      setRole(values.role);
      return demoAccount.user;
    }
    // ── Real Firebase ─────────────────────────────────────────────────────
    const result = await signInWithRole(values);
    setRole(values.role);
    return result.user;
  }

  async function register(values: RegisterFormData): Promise<FirebaseUser> {
    if (IS_DEMO_MODE) {
      throw new Error(
        "Registration is disabled in demo mode. " +
        "Use the preset seed accounts instead."
      );
    }

    const result = await registerWithRole(values);
    setRole(values.role);
    return result.user;
  }

  async function sendPasswordReset(
    values: ForgotPasswordFormData | string
  ): Promise<void> {
    if (IS_DEMO_MODE) return; // no-op in demo mode

    const email = typeof values === "string" ? values : values.email;
    await requestPasswordReset(email);
  }

  async function signOut(): Promise<void> {
    if (IS_DEMO_MODE && demoAuthActive.current) {
      demoAuthActive.current = false;
      setUser(null);
      setRole(null);
      return;
    }

    await signOutCurrentUser();
    setUser(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: Boolean(user),
        isLoading,
        signIn,
        register,
        sendPasswordReset,
        signOut,
        refreshRole,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
