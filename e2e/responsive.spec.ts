import { test, expect } from './fixtures';

test('keeps the primary chat controls usable on a phone', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile-only coverage');
  await page.getByRole('button', { name: 'Open chat with sam@example.com' }).click();
  await expect(page.getByPlaceholder('Type a message')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
});
