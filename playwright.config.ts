import { defineConfig, devices } from "@playwright/test";

const playwrightBaseURL =
  process.env["PLAYWRIGHT_BASE_URL"] ?? "http://127.0.0.1:3000";
const isCI = Boolean(process.env["CI"]);

const webServer = process.env["PLAYWRIGHT_BASE_URL"]
  ? undefined
  : {
      command: "pnpm exec next dev -H 127.0.0.1 -p 3000",
      url: playwrightBaseURL,
      reuseExistingServer: !isCI,
      timeout: 180_000,
    };

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  fullyParallel: true,
  retries: isCI ? 2 : 0,
  reporter: isCI ? "line" : "list",
  use: {
    baseURL: playwrightBaseURL,
    trace: "on-first-retry",
  },
  ...(webServer ? { webServer } : {}),
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
