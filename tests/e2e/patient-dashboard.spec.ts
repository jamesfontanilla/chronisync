import { expect, test } from "@playwright/test";

test("patient dashboard keeps the seeded summary layout", async ({ page }) => {
  await page.goto("/patient/dashboard");

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(
    page.getByText(
      "Review the latest care signals, trends, and unresolved items from one calm landing page."
    )
  ).toBeVisible();

  await expect(page.getByText("Open records")).toBeVisible();
  await expect(page.getByText("Unread alerts")).toBeVisible();
  await expect(page.getByText("Stable vitals")).toBeVisible();
  await expect(page.getByText("Pending uploads")).toBeVisible();

  await expect(page.getByRole("heading", { name: "Workspace summary" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Blood pressure" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Glucose" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Generated at" })).toBeVisible();
});
