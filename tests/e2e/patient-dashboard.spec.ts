import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

test("patient dashboard keeps the seeded summary layout", async () => {
  const source = await readFile(
    join(process.cwd(), "app/patient/dashboard/page.tsx"),
    "utf8"
  );

  assert.match(source, /Patient workspace/);
  assert.match(source, /Review the latest care signals/);
  assert.match(source, /defaultDashboardSnapshot/);
  assert.match(source, /MetricCard/);
  assert.match(source, /TrendCard/);
  assert.match(source, /Workspace summary/);
});
