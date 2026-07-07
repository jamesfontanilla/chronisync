import assert from "node:assert/strict";
import test from "node:test";

import { buildPatientDashboardSnapshot } from "../../features/dashboard/service";

test("buildPatientDashboardSnapshot uses zero values when there is no data", () => {
  const snapshot = buildPatientDashboardSnapshot();

  assert.equal(snapshot.metrics[0]?.value, "0");
  assert.equal(snapshot.metrics[1]?.value, "0");
  assert.equal(snapshot.metrics[2]?.value, "0");
  assert.equal(snapshot.metrics[3]?.value, "0");
});
