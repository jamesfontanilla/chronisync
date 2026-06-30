import assert from "node:assert/strict";
import test from "node:test";

import { ROUTES } from "@/config/route";
import { getAuthRedirectPath } from "@/lib/auth/guards";
import {
  clearRoleCookie,
  getRoleCookie,
  persistRole,
  ROLE_STORAGE_KEY,
  ROLES,
  setRoleCookie,
} from "@/lib/auth/roles";

type BrowserHarness = {
  cookies: Map<string, string>;
  localStorage: Map<string, string>;
  cleanup: () => void;
};

function installBrowserHarness(): BrowserHarness {
  const cookies = new Map<string, string>();
  const localStorage = new Map<string, string>();

  const document = {
    get cookie() {
      return Array.from(cookies.entries())
        .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
        .join("; ");
    },
    set cookie(value: string) {
      const [firstPart = "", ...rest] = value.split(";");
      const [name = "", ...rawValueParts] = firstPart.split("=");
      const rawValue = rawValueParts.join("=");
      const maxAgeIsZero = rest.some((part) => part.trim() === "Max-Age=0");

      if (!name) {
        return;
      }

      if (maxAgeIsZero || rawValue === "") {
        cookies.delete(name);
        return;
      }

      cookies.set(name, decodeURIComponent(rawValue));
    },
  } as const;

  const window = {
    location: {
      protocol: "https:",
    },
    localStorage: {
      getItem(key: string) {
        return localStorage.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        localStorage.set(key, value);
      },
      removeItem(key: string) {
        localStorage.delete(key);
      },
      clear() {
        localStorage.clear();
      },
    },
  } as const;

  Object.defineProperty(globalThis, "window", {
    value: window,
    configurable: true,
    writable: true,
  });

  Object.defineProperty(globalThis, "document", {
    value: document,
    configurable: true,
    writable: true,
  });

  return {
    cookies,
    localStorage,
    cleanup() {
      Reflect.deleteProperty(globalThis, "window");
      Reflect.deleteProperty(globalThis, "document");
    },
  };
}

test("role persistence round-trips through browser storage", () => {
  const harness = installBrowserHarness();

  try {
    clearRoleCookie();
    assert.equal(getRoleCookie(), null);

    setRoleCookie(ROLES.PHYSICIAN);
    assert.equal(getRoleCookie(), ROLES.PHYSICIAN);
    assert.equal(harness.localStorage.get(ROLE_STORAGE_KEY), ROLES.PHYSICIAN);
    assert.ok(harness.cookies.size > 0);

    persistRole(null);
    assert.equal(getRoleCookie(), null);
    assert.equal(harness.localStorage.get(ROLE_STORAGE_KEY), undefined);
    assert.equal(harness.cookies.size, 0);
  } finally {
    harness.cleanup();
  }
});

test("redirect helpers send users to the expected destination", () => {
  assert.equal(
    getAuthRedirectPath(ROUTES.AUTH.LOGIN, ROLES.ADMIN),
    ROUTES.ADMIN.DASHBOARD
  );
  assert.equal(
    getAuthRedirectPath(ROUTES.PATIENT.DASHBOARD, null),
    ROUTES.AUTH.LOGIN
  );
  assert.equal(
    getAuthRedirectPath(ROUTES.PHYSICIAN.DASHBOARD, ROLES.PHYSICIAN),
    null
  );
});
