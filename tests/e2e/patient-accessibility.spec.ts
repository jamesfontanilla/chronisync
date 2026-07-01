import { expect, test } from "@playwright/test";

test("patient add page exposes keyboard-friendly quick log actions", async ({
  page,
}) => {
  await page.goto("/patient/add");

  await expect(page.getByRole("heading", { name: "Add" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Voice-first logging" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Caregiver support" })
  ).toBeVisible();

  await expect(page.getByRole("link", { name: "Open vitals form" })).toHaveCount(
    3
  );
  await expect(page.getByRole("link", { name: "Open medications" })).toHaveAttribute(
    "href",
    "/patient/medications"
  );
  await expect(page.getByRole("link", { name: "Start voice log" })).toHaveAttribute(
    "href",
    "/patient/diary"
  );
  await expect(
    page.getByRole("link", { name: "Open caregiver support" })
  ).toHaveAttribute("href", "/patient/partners");

  await page.getByRole("link", { name: "Start voice log" }).press("Enter");
  await expect(page.getByRole("heading", { name: "Voice-first logging" })).toBeVisible();
});

test("patient accessibility fallbacks remain reachable by keyboard", async ({
  page,
}) => {
  await page.goto("/patient/add");

  await page.getByRole("link", { name: "Open caregiver support", exact: true }).click();

  await page.goto("/patient/dashboard");
  await page.getByRole("button", { name: "Detailed view" }).press("Space");
  await expect(page.getByRole("button", { name: "Detailed view" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(page.getByRole("heading", { name: "Blood pressure" })).toBeVisible();
});
