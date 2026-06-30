"use client";

import {
  createContext,
  useEffect,
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

  useEffect(() => {
    const unsubscribe = observeAuthState((nextUser) => {
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
    const result = await signInWithRole(values);
    setRole(values.role);
    return result.user;
  }

  async function register(values: RegisterFormData): Promise<FirebaseUser> {
    const result = await registerWithRole(values);
    setRole(values.role);
    return result.user;
  }

  async function sendPasswordReset(
    values: ForgotPasswordFormData | string
  ): Promise<void> {
    const email = typeof values === "string" ? values : values.email;
    await requestPasswordReset(email);
  }

  async function signOut(): Promise<void> {
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
