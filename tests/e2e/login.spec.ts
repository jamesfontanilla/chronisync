import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

test("login page keeps the sign-in portal copy and redirect flow", async () => {
  const source = await readFile(
    join(process.cwd(), "app/auth/login/page.tsx"),
    "utf8"
  );

  assert.match(source, /Welcome back\./);
  assert.match(source, /Choose the portal you want to enter/);
  assert.match(source, /Signing in\.\.\./);
  assert.match(source, /useLoginForm/);
  assert.match(source, /getRedirectPathForRole/);
});
