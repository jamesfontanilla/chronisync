import { expect, test } from "@playwright/test";

test("physician dashboard keeps the review queue layout", async ({ page }) => {
  await page.goto("/physician/dashboard");

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("A compact view of panel health, open alerts, and the latest care summaries.")).toBeVisible();

  await expect(page.getByRole("link", { name: "Patients" })).toHaveAttribute(
    "href",
    "/physician/patients"
  );
  await expect(page.getByRole("link", { name: "Alerts" })).toHaveAttribute(
    "href",
    "/physician/alerts"
  );

  await expect(page.getByRole("heading", { name: "Patient watchlist" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Open alerts" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Latest summaries" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Panel snapshot" })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Anna Cruz", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Jon Reyes", exact: true })).toBeVisible();
  await expect(page.getByText("Medication Adherence Alert")).toBeVisible();
  await expect(page.getByText("High Blood Pressure Alert")).toBeVisible();
});
