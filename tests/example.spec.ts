import { test, expect } from '@playwright/test';
test.describe("Playwright report tests", () => {

  test('has title', async ({ page }) => {
    await page.goto('https://playwright.dev/');

    await page.pause();
    // Expect a title "to contain" a substring.
    await expect(page).not.toHaveTitle(/Playwright/);
  });

  test('get started link', async ({ page }) => {
    await page.goto('https://playwright.dev/');

    // Click the get started link.
    await page.getByRole('link', { name: 'Get started' }).click();

    // Expects page to have a heading with the name of Installation.
    await expect(page.getByRole('heading', { name: 'Installation' })).not.toBeVisible();
  });

})