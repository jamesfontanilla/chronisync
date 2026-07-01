import { expect, test } from "@playwright/test";

test("patient dashboard keeps the simple summary and detailed charts", async ({
  page,
}) => {
  await page.goto("/patient/dashboard");

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Review the latest care signals in a simple view first, then switch to detailed charts when you want the full trend story.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Simple view" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Simple view" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(
    page.getByRole("link", { name: "Voice log", exact: true })
  ).toHaveAttribute(
    "href",
    "/patient/add#voice-first"
  );
  await expect(
    page.getByRole("link", { name: "Open caregiver support", exact: true })
  ).toHaveAttribute("href", "/patient/partners");

  await expect(page.getByText("Open records", { exact: true })).toBeVisible();
  await expect(page.getByText("Unread alerts", { exact: true })).toBeVisible();
  await expect(page.getByText("Stable vitals", { exact: true })).toBeVisible();
  await expect(page.getByText("Pending uploads", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Detailed view" }).press("Space");

  await expect(page.getByRole("button", { name: "Detailed view" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(page.getByRole("heading", { name: "Blood pressure" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Glucose" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Workspace summary" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Generated at" })).toBeVisible();
});
