import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

test("physician dashboard keeps the review queue layout", async () => {
  const source = await readFile(
    join(process.cwd(), "app/physician/dashboard/page.tsx"),
    "utf8"
  );

  assert.match(source, /Physician workspace/);
  assert.match(source, /Open alerts/);
  assert.match(source, /Patient watchlist/);
  assert.match(source, /Latest summaries/);
  assert.match(source, /usePhysicianWorkspaceQuery/);
  assert.match(source, /SummaryPreview/);
});
