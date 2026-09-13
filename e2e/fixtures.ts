import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => localStorage.setItem('muhabet-e2e-session', 'signed-in'));
    await page.goto('/chat');
    await expect(page.getByRole('button', { name: 'Open chat with sam@example.com' })).toBeVisible();
    await use(page);
  },
});
export { expect };
