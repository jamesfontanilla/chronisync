"use client";

import { useContext } from "react";

import { AuthContext, type AuthContextValue } from "@/providers/AuthProvider";

const fallbackAuthContext: AuthContextValue = {
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => {
    throw new Error("Auth is not available yet.");
  },
  register: async () => {
    throw new Error("Auth is not available yet.");
  },
  sendPasswordReset: async () => {},
  signOut: async () => {},
  refreshRole: () => {},
  setRole: () => {},
};

export function useAuth() {
  return useContext(AuthContext) ?? fallbackAuthContext;
}
