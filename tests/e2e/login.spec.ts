import { expect, test } from "@playwright/test";

test("login page keeps the sign-in portal copy and redirect flow", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "A softer shell for shared chronic care." })
  ).toBeVisible();

  const primaryNav = page.getByRole("navigation", { name: "Primary" });
  const signInLink = primaryNav.getByRole("link", { name: "Sign in" });
  await expect(signInLink).toHaveAttribute(
    "href",
    "/auth/login"
  );

  await page.goto("/auth/login");
  await expect(page).toHaveURL(/\/auth\/login$/);

  await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible();
  await expect(
    page.getByText(
      "Choose the portal you want to enter, then continue to your patient or physician workspace."
    )
  ).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Role" })).toHaveValue("patient");
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Forgot your password?" })).toHaveAttribute(
    "href",
    "/auth/forgot-password"
  );
  await expect(page.getByRole("link", { name: "Create one here" })).toHaveAttribute(
    "href",
    "/auth/register"
  );
});
